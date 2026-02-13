import React, { useState } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import { supabase, isDemoMode } from '../supabase_client';
import '../index.css';

const MOCK_PREVIEW = {
    ai_generated: true,
    goal_data: {
        description: 'Demo goal plan',
        nodes: [
            { id: 1, task: 'Research the topic thoroughly', est_time: 30 },
            { id: 2, task: 'Create an action plan', est_time: 20 },
            { id: 3, task: 'Start working on first milestone', est_time: 45 },
            { id: 4, task: 'Review and adjust progress', est_time: 15 },
        ],
    },
};

function CreateGoal() {
    const navigate = useNavigate();
    const location = useLocation();

    // Restore the prompt if coming back from ReviewPlan via Discard
    const restoredPrompt = location.state?.originalPrompt || '';

    const [message, setMessage] = useState(restoredPrompt);
    const [manualGoal, setManualGoal] = useState('');
    const [isFading, setIsFading] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);

    // handle goal submission - calls preview endpoint (does NOT save)
    const handleGoalSubmit = async (goalText) => {
        console.log('Goal submitted:', goalText);

        // step 1: fade out the text inside the blue card
        setIsFading(true);

        // step 2: after text fades, start expanding the blue card
        setTimeout(() => {
            setIsExpanding(true);
        }, 400);

        // In demo mode, skip backend and navigate with mock data
        if (isDemoMode) {
            setTimeout(() => {
                navigate('/review-plan', {
                    state: {
                        goal: goalText,
                        showLoading: true,
                        previewData: MOCK_PREVIEW,
                        userId: 'demo-user-001',
                        originalPrompt: goalText,
                    },
                });
            }, 1400);
            return;
        }

        // get the logged-in user
        let user;
        try {
            const { data } = await supabase.auth.getUser();
            user = data?.user;
        } catch (err) {
            console.error('Supabase auth error:', err);
        }
        if (!user) {
            alert('You must be logged in to create a goal.');
            navigate('/login');
            return;
        }

        // call preview endpoint (does NOT save to DB)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    title: goalText,
                    description: goalText,
                    generate_plan: true
                })
            });

            const data = await res.json();
            console.log('Preview response:', data);

            if (!res.ok) {
                console.error('Preview error:', data);
                alert('Failed to get AI plan. Check console.');
                return;
            }

            // step 3: navigate after expansion completes
            setTimeout(() => {
                if (data.ai_generated) {
                    navigate('/review-plan', {
                        state: {
                            goal: goalText,
                            showLoading: true,
                            previewData: data,
                            userId: user.id,
                            originalPrompt: goalText
                        }
                    });
                } else {
                    // No AI match — go to goals page
                    navigate('/goals');
                }
            }, 1400);
        } catch (err) {
            console.error('Network error:', err);
            alert('Network error. Is the backend running?');
        }
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
                    opacity: isFading ? 0 : 1,
                    transform: isFading ? 'translateY(-20px)' : 'translateY(0)',
                    transition: 'all 0.4s ease-out',
                }}>
                    Let's build<br />your goal.
                </h1>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'clamp(14px, 2vh, 16px)',
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
                    flex: 1,
                    minHeight: 0,
                    alignContent: 'flex-start',
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
