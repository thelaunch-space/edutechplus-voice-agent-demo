// VoiceAgent.jsx
// Purpose: Runs a single Vapi voice interaction step and signals completion back to the JourneyManager.
import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

export default function VoiceAgent({ script, systemPrompt, onComplete }) {
    const vapiRef = useRef(null);
    const timeoutRef = useRef(null);
    const [status, setStatus] = useState('initializing');
    const completedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);
    const initializingRef = useRef(false);
    const stopPromiseRef = useRef(Promise.resolve());

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

        const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

        if (!publicKey || publicKey === 'your_vapi_public_key_here') {
            console.error('VAPI_PUBLIC_KEY not configured in .env');
            setStatus('error');
            return;
        }

        // Prevent multiple initializations
        if (initializingRef.current) {
            return;
        }
        initializingRef.current = true;

        // #region agent log
        debugIngest('VoiceAgent.jsx:19', 'Vapi initialization starting', { hasPublicKey: !!publicKey }, 'run1', 'A');
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

        let cancelled = false;

        // StrictMode/HMR can remount quickly. Ensure any prior call teardown finishes
        // before creating a new Daily call object (prevents "Duplicate DailyIframe instances").
        (async () => {
            try {
                await stopPromiseRef.current;
            } catch {
                // Ignore stop errors; we just want to avoid overlapping instances.
            }
            if (cancelled) return;

            // Clean up any existing instance first (best-effort)
            if (vapiRef.current) {
                try {
                    stopPromiseRef.current = vapiRef.current.stop().catch(() => {});
                    await stopPromiseRef.current;
                } catch {
                    // Ignore errors during cleanup
                }
                vapiRef.current = null;
            }

            // Initialize Vapi.
            // NOTE: The Vapi constructor in @vapi-ai/web expects the public key string only.
            // Passing an options object here can break internal URL construction (e.g. "/[object Object]/call/web").
            const vapi = new Vapi(publicKey);
            vapiRef.current = vapi;
            completedRef.current = false;

        // #region agent log
            debugIngest(
                'VoiceAgent.jsx:35',
                'Vapi instance created',
                { availableMethods: Object.keys(vapi).filter((k) => typeof vapi[k] === 'function') },
                'run1',
                'E'
            );
        // #endregion

        const handleComplete = () => {
            if (completedRef.current) return;
            completedRef.current = true;

            console.log('Voice interaction complete');
            setStatus('completed');

            // Stop Vapi (async) and avoid overlapping instances.
            if (vapiRef.current) {
                stopPromiseRef.current = vapiRef.current.stop().catch(() => {});
            }

            // Clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Trigger completion callback using ref to avoid dependency issues
            setTimeout(() => {
                Promise.resolve(stopPromiseRef.current).finally(() => {
                    onCompleteRef.current();
                });
            }, 500);
        };

        // Listen for function call from assistant
        vapi.on('call-start', () => {
            console.log('Call started');
            // #region agent log
            debugIngest('VoiceAgent.jsx:55', 'call-start event fired', {}, 'run1', 'A');
            // #endregion
            setStatus('listening');
        });

        vapi.on('call-end', () => {
            console.log('Call ended');
            // #region agent log
            debugIngest('VoiceAgent.jsx:61', 'call-end event fired', {}, 'run1', 'A');
            // #endregion
        });

        // #region agent log
        // Log all possible user speech events (Hypothesis A, B)
        const userSpeechEvents = ['user-speech-start', 'user-speech-end', 'transcription', 'user-message', 'utterance', 'user-transcription', 'speech-start', 'speech-end', 'audio-input', 'audio-input-start', 'audio-input-end'];
        userSpeechEvents.forEach(eventName => {
            vapi.on(eventName, (data) => {
                debugIngest('VoiceAgent.jsx:68', `User speech event: ${eventName}`, { eventName, data: JSON.stringify(data) }, 'run1', 'A');
            });
        });
        // #endregion

        vapi.on('message', (message) => {
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
                    handleComplete();
                }
            }
            // Backward compatibility: also check for 'function-call' format
            else if (message.type === 'function-call' && message.functionCall?.name === 'completeInteraction') {
                // #region agent log
                debugIngest('VoiceAgent.jsx:83', 'completeInteraction function called (legacy format)', {}, 'run1', 'A');
                // #endregion
                handleComplete();
            }
        });

        vapi.on('error', (error) => {
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
        });

        // #region agent log
        // Listen to ALL events using a wildcard approach (Hypothesis E)
        // Try to access all possible event names from Vapi instance
        const allPossibleEvents = ['*', 'all', 'any'];
        allPossibleEvents.forEach(eventName => {
            try {
                vapi.on(eventName, (data) => {
                    debugIngest('VoiceAgent.jsx:100', `Wildcard event: ${eventName}`, { eventName, data: JSON.stringify(data) }, 'run1', 'E');
                });
            } catch (e) {
                // Ignore if event doesn't exist
            }
        });
        // #endregion

        // Safety timeout: Force completion after 30 seconds
        timeoutRef.current = setTimeout(() => {
            console.warn('Voice interaction timeout - forcing completion');
            // #region agent log
            debugIngest('VoiceAgent.jsx:145', '30 second timeout triggered', { elapsed: 30000 }, 'run1', 'A');
            // #endregion
            handleComplete();
        }, 30000);

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
                handleComplete();
            });
        })();

        return () => {
            cancelled = true;
            initializingRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (vapiRef.current) {
                try {
                    stopPromiseRef.current = vapiRef.current.stop().catch(() => {});
                } catch (e) {
                    // Ignore errors during cleanup
                }
                vapiRef.current = null;
            }
        };
    }, [script, systemPrompt]);

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
