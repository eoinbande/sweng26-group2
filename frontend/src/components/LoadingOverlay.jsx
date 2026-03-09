import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hourglass } from 'ldrs'
import 'ldrs/react/Hourglass.css'
import '../index.css';

// loading overlay component for transitioning between pages
function LoadingOverlay({ onComplete, isLoading = false, minDisplayTime = 2000 }) {
    const navigate = useNavigate();

    const phrases = [
        "Quantexing...",
        "Did you know? Procrastination is just your brain's way of saying 'I need a break!'",
        "Breaking down your goal...",
        "Creating actionable steps...",
        "Organizing your journey...",
        "Crafting your plan..."
    ];

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(() =>
        Math.floor(Math.random() * phrases.length)
    );
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [isShrinking, setIsShrinking] = useState(false);
    const [isPhraseVisible, setIsPhraseVisible] = useState(true);
    
    // minimum display time (e.g., 2 seconds) to avoid flicker
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);

    useEffect(() => {
        // register hourglass spinner
        hourglass.register();

        // fade in text after initial mount
        const fadeInTimer = setTimeout(() => {
            setIsTextVisible(true);
        }, 100);

        // set minimum time elapsed
        const minTimeTimer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, minDisplayTime);

        // cycle through phrases with fade transition
        const cycleInterval = setInterval(() => {
            // fade out
            setIsPhraseVisible(false);
            // change phrase after fade out, then fade in
            setTimeout(() => {
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
                setIsPhraseVisible(true);
            }, 400);
        }, 2500);

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(minTimeTimer);
            clearInterval(cycleInterval);
        };
    }, [phrases.length, minDisplayTime]);

    // Handle completion logic: wait for isLoading to be false AND minTimeElapsed
    useEffect(() => {
        if (!isLoading && minTimeElapsed) {
            // fade out text
            setIsTextVisible(false);

            // start shrinking animation
            const shrinkTimer = setTimeout(() => {
                setIsShrinking(true);
            }, 500); // Wait for text fade out

            // notify parent that loading is complete
            const completeTimer = setTimeout(() => {
                onComplete?.();
            }, 1700); // 500ms + 1200ms transition

            return () => {
                clearTimeout(shrinkTimer);
                clearTimeout(completeTimer);
            };
        }
    }, [isLoading, minTimeElapsed, onComplete]);
    

    return (
        <>
            {/* blue overlay - positioned fixed, shrinks to reveal content */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '480px',
                height: isShrinking ? '75dvh' : '100dvh',
                background: 'var(--accent-blue)',
                padding: 'var(--space-xxl)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: isShrinking ? '0 0 var(--radius-xxl) var(--radius-xxl)' : '0',
                boxShadow: isShrinking ? 'var(--shadow-float)' : 'none',
                overflow: 'hidden',
                zIndex: 9999,
                transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* back button - goes back to create goal */}
                <button
                    onClick={() => navigate('/create-goal')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--space-lg)',
                        transition: 'transform 0.2s',
                        alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* spinner - fixed at center of viewport */}
                <div style={{
                    position: 'fixed',
                    top: '45%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: isTextVisible && !isShrinking ? 1 : 0,
                    transition: 'opacity 0.5s ease-out',
                    zIndex: 201,
                }}>
                
                <l-hourglass
                    size="90"
                    bg-opacity="0.3"
                    speed="1.75" 
                    color="black" 
                ></l-hourglass>



                {/* <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(28, 28, 30, 0.15)',
                        borderTop: '3px solid var(--text-main)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} /> */}
                </div>

                {/* cycling phrase - positioned below spinner, expands downward */}
                <div style={{
                    position: 'fixed',
                    top: 'calc(50% + 50px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    maxWidth: '400px',
                    opacity: isTextVisible && !isShrinking ? 1 : 0,
                    transition: 'opacity 0.5s ease-out',
                    zIndex: 201,
                }}>
                    <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '24px',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                        textAlign: 'center',
                        opacity: isPhraseVisible ? 1 : 0,
                        transition: 'opacity 0.4s ease-in-out',
                        margin: 0,
                    }}>
                        {phrases[currentPhraseIndex]}
                    </p>
                </div>
            </div>

            {/* inline styles for keyframe animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulseText {
                    0%, 100% { opacity: 0.7; }
                    50% { opacity: 1; }
                }
            `}</style>
        </>
    );
}

export default LoadingOverlay;
