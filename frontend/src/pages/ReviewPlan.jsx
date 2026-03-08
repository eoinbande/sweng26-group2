import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { TaskCard } from '../components/TaskCard';
import { InputBar } from '../components/InputBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { isDemoMode } from '../supabase_client';
import '../styles/CreateGoal.css';
import '../index.css';

function ReviewPlan() {
    const navigate = useNavigate();
    const location = useLocation();

    // content visibility states
    const [contentVisible, setContentVisible] = useState(false);
    const [showLoading, setShowLoading] = useState(location.state?.showLoading || false);

    const [saving, setSaving] = useState(false);
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    // Scroll-based fade visibility
    const scrollRef = useRef(null);
    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(false);

    const updateFades = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const threshold = 5; // px tolerance
        setShowTopFade(el.scrollTop > threshold);
        setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
    }, []);

    // Data from CreateGoal (preview only, not saved yet)
    // We use a state for previewData so we can fetch it if it wasn't passed (e.g. from GoalAddDate)
    const [previewData, setPreviewData] = useState(location.state?.previewData || null);
    const userId = location.state?.userId;
    const goalTitle = location.state?.goal || '';
    const originalPrompt = location.state?.originalPrompt || goalTitle;
    const goalId = previewData?.goal_id;

    // If we don't have previewData but we have a goalTitle, fetch it now
    useEffect(() => {
        // If we already have data, just ensure loading is off after a moment
        if (previewData) {
            if (showLoading) {
                // If we came with loading=true but data exists (shouldn't happen with new flow, but mostly for safety)
                const t = setTimeout(() => setShowLoading(false), 500);
                return () => clearTimeout(t);
            }
            return;
        }

        // If no data and no goal info, we can't do anything
        if (!goalTitle || !userId) return;

        // Fetch from backend
        const fetchPlan = async () => {
            try {
                // In demo mode we might want mock data
                if (isDemoMode) {
                    console.log("Demo mode: generating mock plan...");
                    // Simulate delay
                    await new Promise(r => setTimeout(r, 2000));
                    
                    setPreviewData({
                        goal_id: "mock-goal-id",
                        tasks: [
                            { ai_id: "t1", description: "Mock Task 1", order: 1, status: "not_started" },
                            { ai_id: "t2", description: "Mock Task 2", order: 2, status: "not_started" }
                        ]
                    });
                    setShowLoading(false);
                    return;
                }

                const res = await fetch(`${import.meta.env.VITE_API_URL}/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        title: goalTitle,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Failed to fetch plan');

                setPreviewData(data);
                setShowLoading(false);
            } catch (err) {
                console.error(err);
                alert("Failed to generate plan. Please try again.");
                navigate('/create-goal');
                setShowLoading(false);
            }
        };

        fetchPlan();
    }, [goalTitle, userId, previewData]); 

    // parse tasks from the preview response (includes subtasks for later use)
    const tasks = React.useMemo(() => {
        if (!previewData?.tasks) return [];
        return previewData.tasks.map(t => ({
            id: t.ai_id,
            title: t.description,
            order: t.order,
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
            subtasks: (t.subtasks || []).map(s => ({
                id: s.ai_id,
                title: s.description,
                order: s.order,
                dueDate: s.due_date ? new Date(s.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
            })),
        }));
    }, [previewData]);

    // Re-check fades when content becomes visible or tasks change
    useEffect(() => {
        if (contentVisible) {
            // Small delay so cards have rendered
            const t = setTimeout(updateFades, 600);
            return () => clearTimeout(t);
        }
    }, [contentVisible, tasks, updateFades]);

    // Accept: save the goal to Supabase via POST /goals/{id}/accept
    const handleAccept = async () => {
        // Get the due date from location state (passed from GoalAddDate), might be null
        const dueDate = location.state?.dueDate;
        
        // - If dueDate is empty string, send null (skip deadline)
        // - If dueDate is 'AI_DECIDE' => don't send anything (use AI's date from mock)
        // - Otherwise => send the actual date
        let dateToSend;
        if (dueDate === 'AI_DECIDE') {
            dateToSend = undefined; // Don't include in request (will use the existant one that AI gave)
        } else if (!dueDate || dueDate === '') {
            dateToSend = null; // Explicitly null
        } else {
            dateToSend = dueDate; // User-selected date
        }

        if (isDemoMode) {
            navigate('/goals');
            return;
        }

        setSaving(true);
        try {
            // "Accept" the plan for the goal ID we already have

            const requestBody = {
                tasks: previewData.tasks,
            };
            
            // Only add due_date if it's not undefined
            if (dateToSend !== undefined) {
                requestBody.due_date = dateToSend;
            }
            
            const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();
            console.log('Goal saved:', data);

            if (!res.ok) {
                console.error('Save error:', data);
                alert('Failed to save goal.');
                setSaving(false);
                return;
            }

            navigate('/goals');
        } catch (err) {
            console.error('Network error saving goal:', err);
            alert('Network error. Is the backend running?');
            setSaving(false);
        }
    };

    // Discard: delete the temporary goal and go back to CreateGoal
    const handleDiscard = async () => {

        const from = location.state?.originalFrom || location.state?.from;  // Get where we came from
    
        if (from === 'detail') {
            // Came from GoalDetail or Review (aka iterative feedback) → go back to GoalDetail;
            navigate(`/goal/${goalId}`, {
                state: { goalId }
            });
        } else {
            // Came from CreateGoal or default → go to CreateGoal
            navigate('/create-goal', { 
                state: { originalPrompt } 
            });
        }
    };
    

    // Feedback submisison
    const handleSubmitFeedback = async (text) => {
    const val = text || feedbackText; // handle value from InputBar or state
    if (!val.trim()) return;

    if (isDemoMode) {
        console.log('Demo mode - feedback:', feedbackText);
        return;
    }

    setSubmittingFeedback(true);
    setShowLoading(true); // Show loading overlay while processing feedback

    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: feedbackText })
        });

        const data = await res.json();
        console.log('Feedback response:', data);

        if (!res.ok) {
            console.error('Failed to process feedback:', data);
            alert('Failed to process feedback. Check console.');
            setSubmittingFeedback(false);
            setShowLoading(false);
            return;
        }

        setFeedbackText('');

        // Update the preview data with new tasks from feedback
        // Navigate to ReviewPlan again with updated data and loading overlay
        navigate('/review-plan', {
            replace: true,
            state: {
                goal: goalTitle,
                showLoading: true,
                previewData: {
                    ...previewData,
                    tasks: data.tasks,  // Updated tasks from AI
                },
                userId,
                originalPrompt,
                dueDate: location.state?.dueDate,
                originalFrom: location.state?.originalFrom || location.state?.from, // Preserve original source (detail vs create) for discard logic
            },
        });

        setSubmittingFeedback(false);

    } catch (err) {
        console.error('Network error:', err);
        alert('Network error. Is the backend running?');
        setSubmittingFeedback(false);
        setShowLoading(false);
    }
    };
        

    // fade in content after mount (or after loading overlay completes)
    useEffect(() => {
        // if loading overlay is showing, wait for it to complete before fading in content
        if (showLoading) return;

        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, [showLoading]);


    useEffect(() => {
        if (location.state?.previewData) {
            // If the tasks in state change, ensure we show the loading if requested
            if (location.state.showLoading) {
                setShowLoading(true);
                setContentVisible(false); // Hide content while loading overlay shows
            }
        }
    }, [location.state]);

    return (
        <div className="create-goal-page review-plan">
            {/* blue section - starts at final size (seamless from LoadingOverlay) */}
            <div className="cg-blue-card" style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-xxl)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: showLoading ? 'none' : 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* back button */}
                <button
                    className="cg-back-btn"
                    onClick={handleDiscard}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                        alignSelf: 'flex-start',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* title - fades in after loading overlay completes */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    opacity: contentVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease-out',
                }}>
                    How do you feel<br />about these?
                </h1>
                

                {/* task cards container wrapper with fade effects */}
                <div style={{
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                    opacity: contentVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.2s',
                    overflow: 'visible',
                }}>
                    {/* scrollable task cards */}
                    <div
                        ref={scrollRef}
                        onScroll={updateFades}
                        style={{
                            height: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-md)',
                            paddingLeft: '40px',
                            paddingRight: 'var(--space-md)',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* task cards - populated from backend response */}
                        {tasks.map((task, index) => (
                            <div
                                key={index}
                                style={{
                                    opacity: contentVisible ? 1 : 0,
                                    transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
                                    transition: `all 0.5s ease-out ${0.3 + index * 0.1}s`,
                                    width: '100%',
                                    maxWidth: '400px',
                                }}
                            >
                                <TaskCard
                                    title={task.title}
                                    dueDate={task.dueDate}
                                    order={task.order}
                                    subtasks={task.subtasks}
                                    variant="review"
                                    onEdit={() => console.log("Edit clicked")}
                                    onConfirm={() => console.log("Confirmed:", task.title)}
                                    onDeny={() => console.log("Denied:", task.title)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* top fade overlay - hidden when scrolled to top */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(to bottom, var(--accent-blue) 0%, transparent 100%)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        opacity: showTopFade ? 1 : 0,
                        transition: 'opacity 0.25s ease',
                    }} />

                    {/* bottom fade overlay - hidden when scrolled to bottom */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '30px',
                        background: 'linear-gradient(to top, var(--accent-blue) 0%, transparent 100%)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        opacity: showBottomFade ? 1 : 0,
                        transition: 'opacity 0.25s ease',
                    }} />
                </div>

                {/* accept/discard - fades in with content */}
                <div className="cg-accept-discard" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: contentVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.3s',
                }}>
                    <button
                        className="cg-action-btn"
                        onClick={handleAccept}
                        disabled={saving}
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-main)',
                            border: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontWeight: '500',
                            cursor: saving ? 'wait' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: saving ? 0.7 : 1,
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
                        {saving ? 'Saving...' : 'Accept'}
                    </button>
                    <button
                        className="cg-action-btn"
                        onClick={handleDiscard}
                        style={{
                            backgroundColor: 'var(--accent-red-soft)',
                            color: 'white',
                            border: 'none',
                            fontFamily: 'var(--font-sans)',
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
                        Discard
                    </button>
                </div>
            </div>

            {/* bottom section - feedback input */}
            <div className="cg-bottom" style={{
                justifyContent: 'center',
            }}>
                <div className="cg-manual-input">
                    <InputBar
                        className="cg-input-bar"
                        placeholder="Feedback to AI..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        onSubmit={() => handleSubmitFeedback(feedbackText)}
                        variant="auth"
                        disabled={submittingFeedback}
                    />
                </div>
            </div>

            <BottomNav />

            {/* loading overlay - shown when navigating from CreateGoal */}
            {showLoading && (
                <LoadingOverlay 
                    onComplete={() => setShowLoading(false)} 
                    isLoading={!previewData}
                />
            )}
        </div>
    );
}

export default ReviewPlan;