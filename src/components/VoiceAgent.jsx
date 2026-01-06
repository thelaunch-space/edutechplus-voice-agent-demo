// VoiceAgent.jsx
// Purpose: Runs a single Vapi voice interaction step and signals completion back to the JourneyManager.
import { useEffect, useRef, useState } from 'react';
import { getVapi } from '../vapi/vapi';

export default function VoiceAgent({ script, systemPrompt, onComplete }) {
    const timeoutRef = useRef(null);
    const [status, setStatus] = useState('initializing');
    const [isConnecting, setIsConnecting] = useState(true);
    const completedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    const waitingForSpeechEndRef = useRef(false);

    // Update onComplete ref when it changes
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const isDev = import.meta.env.DEV;
        const debugIngest = (location, message, data, runId = 'run1', hypothesisId = 'A') => {
            // This was added for local debugging; avoid noisy/blocked requests on deployed demos (e.g., Netlify HTTPS).
            if (!isDev) return;
            fetch('http://127.0.0.1:7247/ingest/4a295955-3812-4007-8188-57f5b1e6bc35', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    message,
                    data,
                    timestamp: Date.now(),
                    sessionId: 'debug-session',
                    runId,
                    hypothesisId
                })
            }).catch(() => {});
        };

        const vapi = getVapi();

        if (!vapi) {
            console.error('Failed to get Vapi instance');
            setStatus('error');
            setIsConnecting(false);
            return;
        }

        completedRef.current = false;
        waitingForSpeechEndRef.current = false;
        setIsConnecting(true);

        // #region agent log
        debugIngest('VoiceAgent.jsx:19', 'Vapi initialization starting', {}, 'run1', 'A');
        // #endregion

        // Check microphone permissions (Hypothesis D)
        // #region agent log
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(() => {
                debugIngest('VoiceAgent.jsx:25', 'Microphone permission granted', {}, 'run1', 'D');
            })
            .catch((err) => {
                debugIngest('VoiceAgent.jsx:29', 'Microphone permission denied', { error: err.message }, 'run1', 'D');
            });
        // #endregion

        const finishInteraction = () => {
            if (completedRef.current) return;
            completedRef.current = true;

            console.log('Voice interaction complete - stopping Vapi');
            setStatus('completed');

            // Clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Stop Vapi (async) and avoid overlapping instances.
            vapi.stop().catch(() => {});

            // Trigger completion callback using ref to avoid dependency issues
            // Wait a small amount of time to ensure Vapi cleanup has started
            setTimeout(() => {
                console.log('Vapi cleanup finished - calling onComplete');
                onCompleteRef.current();
            }, 100);
        };

        const handleToolCall = () => {
            if (completedRef.current || waitingForSpeechEndRef.current) return;
            
            console.log('Tool call received - waiting for speech to end');
            waitingForSpeechEndRef.current = true;
            // We don't call finishInteraction() yet.
            // We wait for the 'speech-end' event.
            // But we set a failsafe timeout in case speech-end never fires.
            setTimeout(() => {
                if (!completedRef.current) {
                    console.warn('Speech end timeout - forcing completion');
                    finishInteraction();
                }
            }, 5000); // 5s failsafe
        };

        // Listen for function call from assistant
        const onCallStart = () => {
            console.log('Call started');
            // #region agent log
            debugIngest('VoiceAgent.jsx:55', 'call-start event fired', {}, 'run1', 'A');
            // #endregion
            setIsConnecting(false);
            setStatus('listening');
        };

        const onCallEnd = () => {
            console.log('Call ended');
            // #region agent log
            debugIngest('VoiceAgent.jsx:61', 'call-end event fired', {}, 'run1', 'A');
            // #endregion
        };

        const onSpeechEnd = () => {
            console.log('Speech ended');
            if (waitingForSpeechEndRef.current) {
                console.log('Speech ended while waiting - finishing interaction');
                finishInteraction();
            }
        };

        const onMessage = (message) => {
            console.log('Vapi message:', message);
            // #region agent log
            debugIngest(
                'VoiceAgent.jsx:77',
                'message event received',
                {
                    messageType: message?.type,
                    messageRole: message?.role,
                    hasFunctionCall: !!message?.functionCall,
                    fullMessage: JSON.stringify(message)
                },
                'run1',
                'B'
            );
            // #endregion

            // Check if assistant called the completion function
            // Vapi uses 'tool-calls' type with toolCalls array
            if (message.type === 'tool-calls') {
                const hasCompleteInteraction = message.toolCalls?.some(
                    call => call.function?.name === 'completeInteraction'
                );
                if (hasCompleteInteraction) {
                    // #region agent log
                    debugIngest('VoiceAgent.jsx:83', 'completeInteraction function called', {}, 'run1', 'A');
                    // #endregion
                    handleToolCall();
                }
            }
            // Backward compatibility: also check for 'function-call' format
            else if (message.type === 'function-call' && message.functionCall?.name === 'completeInteraction') {
                // #region agent log
                debugIngest('VoiceAgent.jsx:83', 'completeInteraction function called (legacy format)', {}, 'run1', 'A');
                // #endregion
                handleToolCall();
            }
        };

        const onError = (error) => {
            console.error('Vapi error:', error);
            // #region agent log
            debugIngest(
                'VoiceAgent.jsx:error',
                'Vapi error event',
                {
                    errorType: error?.type,
                    stage: error?.stage,
                    message: error?.error?.message || error?.message || String(error)
                },
                'post-fix-1',
                'A'
            );
            // #endregion
            setStatus('error');
            setIsConnecting(false);
        };

        // Attach event listeners
        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);

        // Safety timeout: Force completion after 45 seconds
        timeoutRef.current = setTimeout(() => {
            console.warn('Voice interaction timeout - forcing completion');
            // #region agent log
            debugIngest('VoiceAgent.jsx:145', '45 second timeout triggered', { elapsed: 45000 }, 'run1', 'A');
            // #endregion
            finishInteraction();
        }, 45000);

        // Start the call
        const vapiConfig = {
            model: {
                provider: 'openai',
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    }
                ],
                functions: [
                    {
                        name: 'completeInteraction',
                        description: 'Call this function immediately after you finish responding to the student to move to the next activity.',
                        parameters: {
                            type: 'object',
                            properties: {}
                        }
                    }
                ]
            },
            voice: {
                provider: 'openai',
                voiceId: 'alloy'
            },
            firstMessage: script
        };

        // #region agent log
            debugIngest('VoiceAgent.jsx:125', 'Vapi start called with config', { config: JSON.stringify(vapiConfig) }, 'run1', 'C');
        // #endregion

        vapi.start(vapiConfig)
            .then(() => {
                // #region agent log
                debugIngest('VoiceAgent.jsx:130', 'Vapi start successful', {}, 'run1', 'C');
                // #endregion
            })
            .catch(err => {
                console.error('Failed to start Vapi:', err);
                // #region agent log
                debugIngest('VoiceAgent.jsx:135', 'Vapi start failed', { error: err?.message || String(err) }, 'run1', 'C');
                // #endregion
                setStatus('error');
                setIsConnecting(false);
                finishInteraction();
            });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            
            // Remove event listeners
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            
            vapi.stop().catch(() => {});
        };
    }, [script, systemPrompt]);

    if (isConnecting) {
        return (
             <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    animation: 'spin 1s ease-in-out infinite',
                    marginBottom: '20px'
                }} />
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: '500',
                    opacity: 0.9
                }}>
                    Connecting to Math Mate...
                </h2>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px'
                }}>
                    🎙️
                </div>

                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '16px',
                    fontWeight: '600'
                }}>
                    Math Mate is speaking...
                </h2>

                <p style={{
                    fontSize: '16px',
                    opacity: 0.9,
                    marginBottom: '24px'
                }}>
                    {script}
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    opacity: 0.8
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: status === 'listening' ? '#4ade80' : status === 'error' ? '#ef4444' : '#fbbf24',
                        animation: status === 'listening' ? 'pulse 2s infinite' : 'none'
                    }} />
                    <span>
                        {status === 'initializing' && 'Connecting...'}
                        {status === 'listening' && 'Listening...'}
                        {status === 'completed' && 'Moving to next activity...'}
                        {status === 'error' && 'Connection error - continuing...'}
                    </span>
                </div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
