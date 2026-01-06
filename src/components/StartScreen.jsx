// StartScreen.jsx
// Purpose: A simple "Tap to Begin" gate so the student starts when ready (and to satisfy browser user-gesture requirements for audio).
import React from 'react';

export default function StartScreen({ onStart }) {
    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '24px',
                textAlign: 'center',
            }}
        >
            <div style={{ maxWidth: 520, width: '100%' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎧</div>
                <h1 style={{ fontSize: 28, lineHeight: 1.2, marginBottom: 12, fontWeight: 700 }}>
                    Welcome to Math Mate
                </h1>
                <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
                    When you’re ready, tap Begin. Math Mate will ask you a quick question, then we’ll watch the first video.
                </p>
                <button
                    onClick={onStart}
                    style={{
                        width: '100%',
                        padding: '14px 18px',
                        fontSize: 18,
                        backgroundColor: 'white',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontWeight: 700,
                    }}
                >
                    Begin
                </button>
                <p style={{ fontSize: 12, opacity: 0.85, marginTop: 12 }}>
                    Tip: Use headphones and make sure your microphone is on.
                </p>
            </div>
        </div>
    );
}

