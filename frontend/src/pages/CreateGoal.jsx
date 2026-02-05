import React, { useState } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import '../index.css';

function CreateGoal() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [manualGoal, setManualGoal] = useState('');
    const [isFading, setIsFading] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);

    // handle goal submission - triggers transition to loading
    const handleGoalSubmit = (goalText) => {
        console.log('Goal submitted:', goalText);

        // step 1: fade out the text inside the blue card
        setIsFading(true);

        // step 2: after text fades, start expanding the blue card
        setTimeout(() => {
            setIsExpanding(true);
        }, 400);

        // step 3: navigate after expansion completes
        setTimeout(() => {
            navigate('/response-loading', { state: { goal: goalText } });
        }, 1800);
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
            {/* blue section - 66% of screen, expands to full */}
            <div style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: isExpanding ? '0' : '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: isExpanding ? '100vh' : '66vh',
                zIndex: 200,
                transition: 'height 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), border-radius 0.3s ease-out',
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
                        marginBottom: 'var(--space-lg)',
                        transition: 'transform 0.2s',
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
                    fontSize: '40px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : 1,
                    transform: isFading ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.4s ease-out',
                }}>
                    Let's build<br />your goal.
                </h1>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '16px',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : 0.8,
                    marginBottom: 'var(--space-xl)',
                    transform: isFading ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.4s ease-out 0.05s',
                }}>
                    Tell us where you want to go, we'll<br />show you how to get there
                </p>

                {/* ai suggested buttons - fades out first */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--space-lg)',
                    opacity: isFading ? 0 : 1,
                    transform: isFading ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.4s ease-out 0.1s',
                }}>
                    <button
                        onClick={() => handleGoalSubmit('Create a new bank account.')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: '18px 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '140px',
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
                            padding: '18px 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '140px',
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
                    position: 'absolute',
                    bottom: '80px',
                    left: 'var(--space-lg)',
                    right: 'var(--space-lg)',
                    opacity: isFading ? 0 : 1,
                    transform: isFading ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.4s ease-out 0.15s',
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
                        padding="12px 14px"
                        borderRadius="var(--radius-lg)"
                    />
                </div>
            </div>

            {/* bottom section - positioned below blue card (34% of screen) */}
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
                {/* 'or' divider - centered in the space between card and input */}
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

                {/* manual input - fixed above bottom nav */}
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
                        borderRadius="var(--radius-xl)"
                    />
                </div>
            </div>

            {/* bottom nav - stays visible until covered */}
            <BottomNav />
        </div>
    );
}

export default CreateGoal;
