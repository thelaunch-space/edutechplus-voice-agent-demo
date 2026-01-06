import { useEffect, useRef } from 'react';

export default function AppletFrame({ src, onComplete }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleMessage = (event) => {
            // Security: In production, verify event.origin
            if (event.data && event.data.type === 'ASSET_COMPLETE') {
                console.log('Applet completed:', src);
                onComplete();
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [src, onComplete]);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            overflow: 'hidden'
        }}>
            <iframe
                ref={iframeRef}
                src={src}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                title="Interactive Applet"
            />
        </div>
    );
}
