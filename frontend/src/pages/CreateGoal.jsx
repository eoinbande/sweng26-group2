import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import '../index.css';

function CreateGoal() {
    const navigate = useNavigate();
    const location = useLocation();

    // Restore the prompt if coming back from ReviewPlan via Discard
    const restoredPrompt = location.state?.originalPrompt || '';

    const [message, setMessage] = useState(restoredPrompt);
    const [manualGoal, setManualGoal] = useState('');
    const [isFading, setIsFading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    // fade in content on mount
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // handle goal submission - fades out content then navigates to date selection
    const handleGoalSubmit = (goalText) => {
        console.log('Goal submitted:', goalText);

        // fade out all content
        setIsFading(true);

        // navigate after fade completes
        setTimeout(() => {
            navigate('/goal-add-date', {
                state: {
                    goalText,
                    originalPrompt: goalText,
                },
            });
        }, 500);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'var(--bg-color)',
        }}>
            {/* blue section */}
            <div style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '66vh',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* back button - always visible */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-start',
                        marginBottom: 'var(--space-lg)',
                        opacity: 1,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* title and subtitle - fades out first */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(30px, 5vh, 40px)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.1s',
                }}>
                    Let's build<br />your goal.
                </h1>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(14px, 2vh, 16px)',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : (contentVisible ? 0.8 : 0),
                    marginBottom: 'var(--space-xl)',
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.15s',
                }}>
                    Tell us where you want to go, we'll<br />show you how to get there
                </p>

                {/* ai suggested buttons - fades out first */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    flexWrap: 'wrap',
                    flex: 1,
                    minHeight: 0,
                    alignContent: 'flex-start',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.2s',
                }}>
                    <button
                        onClick={() => handleGoalSubmit('Create a new bank account.')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'clamp(12px, 2.2vh, 18px) 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            textAlign: 'left',
                            boxShadow: '0 2px 8px rgba(107, 141, 176, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.8) 0%, rgba(139, 169, 201, 0.8) 100%)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 141, 176, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 141, 176, 0.3)';
                        }}
                    >
                        Create a new bank account.
                    </button>
                    <button
                        onClick={() => handleGoalSubmit('Help me get an A in Probability I.')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'clamp(12px, 2.2vh, 18px) 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            textAlign: 'left',
                            boxShadow: '0 2px 8px rgba(107, 141, 176, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.8) 0%, rgba(139, 169, 201, 0.8) 100%)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 141, 176, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 141, 176, 0.3)';
                        }}
                    >
                        Help me get an A in Probability I.
                    </button>
                </div>

                {/* ai input*/}
                <div style={{
                    flexShrink: 0,
                    marginTop: 'auto',
                    paddingBottom: 'var(--space-xl)',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.25s',
                }}>
                    <InputBar
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onSubmit={() => {
                            if (message.trim()) {
                                handleGoalSubmit(message);
                                setMessage('');
                            }
                        }}
                        icon={<Mic size={18} color="white" />}
                        buttonStyle="dark"
                        variant="auth"
                        padding="18px 20px"
                        borderRadius="var(--radius-xl)"
                    />
                </div>
            </div>

            {/* bottom section */}
            <div style={{
                position: 'absolute',
                top: '66vh',
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-color)',
            }}>
                {/* 'or' divider*/}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '20px',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                    }}>
                        or
                    </p>
                </div>

                {/* manual input*/}
                <div style={{
                    padding: '0 var(--space-lg)',
                    paddingBottom: '150px',
                }}>
                    <InputBar
                        placeholder="Manually create your goal..."
                        value={manualGoal}
                        onChange={(e) => setManualGoal(e.target.value)}
                        onSubmit={() => {
                            if (manualGoal.trim()) {
                                handleGoalSubmit(manualGoal);
                                setManualGoal('');
                            }
                        }}
                        variant="auth"
                        padding="18px 20px"
                        borderRadius="var(--radius-xl)"
                    />
                </div>
            </div>

            {/* bottom nav*/}
            <BottomNav />
        </div>
    );
}

export default CreateGoal;
