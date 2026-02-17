import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateScrollPicker } from 'react-date-wheel-picker';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import { supabase, isDemoMode } from '../supabase_client';
import '../index.css';

// mocked ai response for demo
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

function GoalAddDate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [manualGoal, setManualGoal] = useState('');
    const [dateValue, setDateValue] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const pickerRef = useRef(null);
    const dateValueRef = useRef('');
    const navigatingRef = useRef(false);

    // goal text passed from CreateGoal
    const goalText = location.state?.goalText || '';

    // fade in content on mount
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // fade out then navigate back
    const handleBack = () => {
        setIsFadingOut(true);
        setTimeout(() => {
            navigate('/create-goal', {
                state: { originalPrompt: goalText },
            });
        }, 500);
    };

    // format date from picker as MM/DD/YYYY
    const handleDateChange = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const formatted = `${mm}/${dd}/${yyyy}`;
        setDateValue(formatted);
        dateValueRef.current = formatted;
    };

    // "Let AI decide" - skip date input and proceed with goal submission
    const handleLetAIDecide = async () => {
        // Set a special flag or empty date so ReviewPlan knows to use AI's date
        dateValueRef.current = 'AI_DECIDE';
        await handleGoalSubmit();
    };

    // "Skip deadline" - explicitly set date to null and proceed with goal submission
    const handleSkipDeadline = async () => {
        dateValueRef.current = null; // Explicitly set to null
        await handleGoalSubmit();
    };

    // goal submission - fade out, expand, then navigate to review
    const handleGoalSubmit = async () => {
        if (navigatingRef.current) return;
        navigatingRef.current = true;
        // step 1: fade out content
        setIsFading(true);
        // step 2: expand blue card to fill screen
        setTimeout(() => setIsExpanding(true), 400);

        // // in demo mode, use mocked data
        // if (isDemoMode) {
        //     setTimeout(() => {
        //         navigate('/review-plan', {
        //             state: {
        //                 goal: goalText,
        //                 showLoading: true,
        //                 previewData: MOCK_PREVIEW,
        //                 userId: 'demo-user-001',
        //                 originalPrompt: goalText,
        //                 dueDate: dateValueRef.current,
        //             },
        //         });
        //     }, 1400);
        //     return;
        // }

        // get authenticated user
        let user;
        try {
            const { data } = await supabase.auth.getUser();
            user = data?.user;
        } catch (err) {
            console.error('Supabase auth error:', err);
        }
        if (!user) {
            alert('You must be logged in to create a goal.');
            navigatingRef.current = false;
            navigate('/login');
            return;
        }

        // call backend for ai-generated plan
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    title: goalText,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert('Failed to get AI plan. Check console.');
                navigatingRef.current = false;
                setIsFading(false);
                setIsExpanding(false);
                return;
            }
            setTimeout(() => {
                    navigate('/review-plan', {
                        state: {
                            goal: goalText,
                            showLoading: true,
                            previewData: data,
                            userId: user.id,
                            originalPrompt: goalText,
                            dueDate: dateValueRef.current, // Will be empty string if not set
                        },
                    });
            }, 1400);
        } catch (err) {
            console.error('Network error:', err);
            alert('Network error. Is the backend running?');
            navigatingRef.current = false;
            setIsFading(false);
            setIsExpanding(false);
        }
    };

    // close picker when clicking outside
    useEffect(() => {
        if (!showPicker) return;
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

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
                display: 'flex',
                flexDirection: 'column',
                transition: 'height 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), border-radius 0.3s ease-out',
            }}>
                {/* back button - always visible */}
                <button
                    onClick={handleBack}
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

                {/* title */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(30px, 5vh, 40px)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    alignSelf: 'center',
                    opacity: (isFadingOut || isFading) ? 0 : (contentVisible ? 1 : 0),
                    transform: (isFadingOut || isFading) ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.1s',
                }}>
                    When's your<br />deadline?
                </h1>

                {/* date input / picker morph container */}
                <div
                    ref={pickerRef}
                    onClick={() => { if (!showPicker) setShowPicker(true); }}
                    style={{
                        marginTop: 'var(--space-xl)',
                        opacity: (isFadingOut || isFading) ? 0 : (contentVisible ? 1 : 0),
                        transform: (isFadingOut || isFading) ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                        maxWidth: showPicker ? '95%' : '90%',
                        width: '100%',
                        alignSelf: 'center',
                        cursor: showPicker ? 'default' : 'pointer',
                        backgroundColor: showPicker ? 'white' : 'var(--blue-soft)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '0',
                        boxShadow: showPicker ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                    }}
                >
                    {/* collapsed: input bar label */}
                    <div style={{
                        maxHeight: showPicker ? '0px' : '80px',
                        opacity: showPicker ? 0 : 1,
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
                    }}>
                        <InputBar
                            placeholder="MM/DD/YYYY"
                            value={dateValue}
                            onChange={() => {}}
                            onSubmit={() => { 
                                if (dateValueRef.current) {
                                    handleGoalSubmit(); 
                                } else {
                                    alert('Please select a date first, or use "Skip deadline" or "Let AI decide"');
                                }
                            }}
                            variant="auth"
                            borderRadius="var(--radius-xl)"
                            backgroundColor="transparent"
                            padding="22px"
                            fontSize="20px"
                            readOnly
                        />
                    </div>

                    {/* expanded: date wheel picker */}
                    <div className="date-picker-wrapper" style={{
                        maxHeight: showPicker ? '200px' : '0px',
                        opacity: showPicker ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease 0.1s',
                        fontFamily: 'var(--font-sans)',
                    }}>
                        <DateScrollPicker
                            onDateChange={handleDateChange}
                            startYear={2025}
                            defaultYear={new Date().getFullYear()}
                            defaultMonth={new Date().getMonth()}
                            defaultDay={new Date().getDate()}
                            itemHeight={40}
                            visibleRows={3}
                            dateTimeFormatOptions={{ month: 'short' }}
                            highlightOverlayStyle={{
                                borderTop: '1px solid #ccc',
                                borderBottom: '1px solid #ccc',
                                background: 'transparent',
                                borderRadius: 0,
                                boxShadow: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* skip / let ai decide buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'center',
                    marginTop: 'var(--space-lg)',
                    opacity: (isFadingOut || isFading) ? 0 : (contentVisible ? 1 : 0),
                    transform: (isFadingOut || isFading) ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),
                    transition: 'all 0.4s ease-out 0.3s',
                }}>
                    <button
                        onClick={handleSkipDeadline}
                        style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-main)',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '12px 32px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        Skip deadline
                    </button>
                    <button
                        onClick={handleLetAIDecide}
                        style={{
                            backgroundColor: 'var(--text-main)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '12px 32px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        Let AI decide
                    </button>
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
                {/* 'or' divider */}
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

                {/* manual input */}
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
                                console.log('Manual goal:', manualGoal);
                                setManualGoal('');
                            }
                        }}
                        variant="auth"
                        padding="18px 20px"
                        borderRadius="var(--radius-xl)"
                    />
                </div>
            </div>

            {/* bottom nav */}
            <BottomNav />
        </div>
    );
}

export default GoalAddDate;
