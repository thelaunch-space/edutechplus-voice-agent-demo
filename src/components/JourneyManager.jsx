// JourneyManager.jsx
// Purpose: Orchestrates the learning journey as a strict step-by-step flow (voice -> content -> voice...).
import { useState } from 'react';
import { LEARNING_JOURNEY } from '../learningJourney';
import VoiceAgent from './VoiceAgent';
import VideoPlayer from './VideoPlayer';
import AppletFrame from './AppletFrame';
import StartScreen from './StartScreen';

export default function JourneyManager() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    const currentStep = LEARNING_JOURNEY[currentStepIndex];
    const isComplete = currentStepIndex >= LEARNING_JOURNEY.length;

    const handleStepComplete = () => {
        console.log(`Step ${currentStepIndex} complete:`, currentStep?.id);

        const nextIndex = currentStepIndex + 1;

        if (nextIndex >= LEARNING_JOURNEY.length) {
            console.log('Journey complete!');
        }

        setCurrentStepIndex(nextIndex);
    };

    if (!hasStarted) {
        return <StartScreen onStart={() => setHasStarted(true)} />;
    }

    if (isComplete) {
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
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>
                    Congratulations!
                </h1>
                <p style={{ fontSize: '18px', opacity: 0.9 }}>
                    You've completed the Fractions Learning Journey!
                </p>
                <button
                    onClick={() => {
                        setHasStarted(false);
                        setCurrentStepIndex(0);
                    }}
                    style={{
                        marginTop: '32px',
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Start Over
                </button>
            </div>
        );
    }

    // Render current step
    switch (currentStep.type) {
        case 'voice':
            return (
                <VoiceAgent
                    key={currentStep.id}
                    script={currentStep.script}
                    systemPrompt={currentStep.systemPrompt}
                    onComplete={handleStepComplete}
                />
            );

        case 'video':
            return (
                <VideoPlayer
                    key={currentStep.id}
                    src={currentStep.src}
                    onComplete={handleStepComplete}
                />
            );

        case 'applet':
            return (
                <AppletFrame
                    key={currentStep.id}
                    src={currentStep.src}
                    onComplete={handleStepComplete}
                />
            );

        default:
            return (
                <div style={{
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                }}>
                    Unknown step type: {currentStep.type}
                </div>
            );
    }
}
