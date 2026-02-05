import React, { useEffect, useState } from 'react';
import '../index.css';

const Loading = ({ onLoadingComplete }) => {
    const phrases = [
        "Loading your goals...",
        "Putting order to your ideas...",
        "Seeing how far you've come...",
        "Organizing your dreams...",
        "Mapping your journey..."
    ];

    // pick a random phrase each time the component mounts
    const [phrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onLoadingComplete && onLoadingComplete();
        }, 2000); // 2 seconds loading time

        return () => clearTimeout(timer);
    }, [onLoadingComplete]);

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-lg)'
        }}>
            {/*circle*/}
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid rgba(255, 185, 46, 0.2)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>

            {/*loading text*/}
            <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                color: 'var(--text-secondary)',
                animation: 'fadeInOut 1.5s ease-in-out infinite'
            }}>
                {phrase}
            </p>

            {/* animations */}
            <style>{`
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes fadeInOut {
                    0%, 100% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default Loading;
