// VideoPlayer.jsx
// Purpose: Plays a video step and advances the journey on end; handles autoplay restrictions with a user-initiated play button.
import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer({ src, onComplete }) {
    const videoRef = useRef(null);
    const [showPlayButton, setShowPlayButton] = useState(false);
    const onCompleteRef = useRef(onComplete);

    // Update onComplete ref when it changes
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            console.log('Video ended:', src);
            onCompleteRef.current();
        };

        video.addEventListener('ended', handleEnded);

        // Auto-play the video
        video.play().catch(err => {
            console.warn('Video autoplay failed:', err);
            // Show play button if autoplay fails
            setShowPlayButton(true);
        });

        return () => {
            video.removeEventListener('ended', handleEnded);
        };
    }, [src]);

    const handlePlayClick = () => {
        const video = videoRef.current;
        if (video) {
            video.play()
                .then(() => {
                    setShowPlayButton(false);
                })
                .catch(err => {
                    console.error('Failed to play video:', err);
                });
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            position: 'relative'
        }}>
            <video
                ref={videoRef}
                src={src}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }}
                controls
                playsInline
            />
            {showPlayButton && (
                <button
                    onClick={handlePlayClick}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px 40px',
                        fontSize: '24px',
                        backgroundColor: 'rgba(102, 126, 234, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        zIndex: 10
                    }}
                >
                    ▶ Play Video
                </button>
            )}
        </div>
    );
}
