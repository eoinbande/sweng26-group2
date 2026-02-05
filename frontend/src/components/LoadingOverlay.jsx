import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

// loading overlay component for transitioning between pages
function LoadingOverlay({ onComplete }) {
    const navigate = useNavigate();

    const phrases = [
        "Quantexing...",
        "Breaking down your goal...",
        "Creating actionable steps...",
        "Organizing your journey...",
        "Crafting your plan..."
    ];

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [isTextVisible, setIsTextVisible] = useState(false);
    const [isShrinking, setIsShrinking] = useState(false);

    useEffect(() => {
        // fade in text after initial mount
        const fadeInTimer = setTimeout(() => {
            setIsTextVisible(true);
        }, 100);

        // cycle through phrases
        const cycleInterval = setInterval(() => {
            setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 1500);

        // start shrinking animation after showing phrases
        const shrinkTimer = setTimeout(() => {
            setIsTextVisible(false);
        }, 3500);

        // begin card shrink
        const transitionTimer = setTimeout(() => {
            setIsShrinking(true);
        }, 4000);

        // notify parent that loading is complete
        const completeTimer = setTimeout(() => {
            onComplete?.();
        }, 5500);

        return () => {
            clearTimeout(fadeInTimer);
            clearInterval(cycleInterval);
            clearTimeout(shrinkTimer);
            clearTimeout(transitionTimer);
            clearTimeout(completeTimer);
        };
    }, [phrases.length, onComplete]);

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
                height: isShrinking ? '75vh' : '100vh',
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: isShrinking ? '0 0 var(--radius-xxl) var(--radius-xxl)' : '0',
                boxShadow: isShrinking ? 'var(--shadow-float)' : 'none',
                overflow: 'hidden',
                zIndex: 200,
                transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}>
                {/* back button - goes back to create goal */}
                <button
                    onClick={() => navigate('/create-goal')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--space-md)',
                        transition: 'transform 0.2s',
                        alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* title - same position as ReviewPlan, fades in when shrinking */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '36px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-lg)',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    opacity: isShrinking ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.3s',
                }}>
                    How do you feel<br />about these?
                </h1>

                {/* centered loading content - fixed to center of viewport */}
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: isTextVisible && !isShrinking
                        ? 'translate(-50%, -50%)'
                        : 'translate(-50%, calc(-50% + 10px))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: isTextVisible && !isShrinking ? 1 : 0,
                    transition: 'all 0.5s ease-out',
                    zIndex: 201,
                }}>
                    {/* spinning circle */}
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(28, 28, 30, 0.15)',
                        borderTop: '3px solid var(--text-main)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: 'var(--space-lg)',
                    }} />

                    {/* cycling phrase */}
                    <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '24px',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                        textAlign: 'center',
                        animation: 'pulseText 1.5s ease-in-out infinite',
                    }}>
                        {phrases[currentPhraseIndex]}
                    </p>
                </div>
            </div>
        </>
    );
}

export default LoadingOverlay;
