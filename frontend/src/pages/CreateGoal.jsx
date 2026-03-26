import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mic, ArrowUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import { supabase } from '../supabase_client';
import '../styles/CreateGoal.css';
import '../index.css';

function CreateGoal() {
    const navigate = useNavigate();
    const location = useLocation();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#BFD1E5';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    // restore the prompt if coming back from ReviewPlan via Discard
    const restoredPrompt = location.state?.originalPrompt || '';

    const [message, setMessage] = useState(restoredPrompt);
    const [manualGoal, setManualGoal] = useState('');
    const [isFading, setIsFading] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [userId, setUserId] = useState(null);

    // fetch user id on mount
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUserId(data.user.id);
            }
        };
        getUser();
    }, []);

    // fade in content on mount
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // handle goal submission - fades out content then navigates to review plan
    const handleGoalSubmit = (goalText) => {
        if (!userId) {
            console.error("No user ID found, cannot submit goal");
            // Optionally redirect to login or show error
            return;
        }

        console.log('Goal submitted:', goalText);

        // fade out all content
        setIsFading(true);
        // setShowOverlay(true);

        // navigate after fade completes
        setTimeout(() => {
            navigate('/goal-add-date', {
                state: {
                    goalText: goalText,
                    originalPrompt: restoredPrompt || goalText,
                },
            });
        }, 500);
    };

    return (
        <div className="create-goal-page">
            {/* blue section */}
            <div className="cg-blue-card" style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-xxl)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* back button - always visible */}
                <button
                    className="cg-back-btn"
                    onClick={() => navigate('/home')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-start',
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
                    fontWeight: '600',
                    lineHeight: '1.2',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.1s',
                }}>
                    Let's build<br />your goal.
                </h1>
                <p className="cg-subtitle" style={{
                    fontFamily: 'var(--font-sans)',
                    color: 'var(--text-main)',
                    opacity: isFading ? 0 : (contentVisible ? 0.8 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.15s',
                }}>
                    Tell us where you want to go, we'll<br />show you how to get there
                </p>

                {/* ai suggested buttons - fades out first */}
                <div className="cg-suggestions" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignContent: 'flex-start',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.2s',
                }}>
                    <button
                        className="cg-suggestion-btn"
                        onClick={() => handleGoalSubmit('Create a new bank account.')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            fontFamily: 'var(--font-sans)',
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
                        className="cg-suggestion-btn"
                        onClick={() => handleGoalSubmit('Help me get an A in Probability I.')}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            fontFamily: 'var(--font-sans)',
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

                {/* ai input */}
                <div className="cg-ai-input" style={{
                    flexShrink: 0,
                    marginTop: 'auto',
                    opacity: isFading ? 0 : (contentVisible ? 1 : 0),
                    transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.25s',
                }}>
                    <InputBar
                        className="cg-input-bar"
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onSubmit={() => {
                            if (message.trim()) {
                                handleGoalSubmit(message);
                                setMessage('');
                            }
                        }}
                        icon={<ArrowUp size={20} color="white" strokeWidth={2.5} />} // icon={<Mic size={18} color="white" />}
                        buttonStyle="dark"
                        variant="auth"
                    />
                </div>
            </div>

            {/* bottom nav */}
            <BottomNav />

            {/* overlay removed to make card transition feel continuous */}
            {/* <div style={{...}} /> */}
        </div>
    );
}

export default CreateGoal;
