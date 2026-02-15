import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { TaskCard } from '../components/TaskCard';
import { InputBar } from '../components/InputBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { isDemoMode } from '../supabase_client';
import '../index.css';

function ReviewPlan() {
    const navigate = useNavigate();
    const location = useLocation();
    const [contentVisible, setContentVisible] = useState(false);
    const [showLoading, setShowLoading] = useState(location.state?.showLoading || false);
    const [saving, setSaving] = useState(false);

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
    const previewData = location.state?.previewData;
    const userId = location.state?.userId;
    const goalTitle = location.state?.goal || '';
    const originalPrompt = location.state?.originalPrompt || goalTitle;
    const goalId = previewData?.goal_id;

    // Parse tasks from the preview response (new linear structure)
    const tasks = React.useMemo(() => {
        if (!previewData?.tasks) return [];
        return previewData.tasks.map(t => ({
            id: t.ai_id,
            title: t.description,
            dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '',
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
        // In demo mode, just navigate to goals
        if (isDemoMode) {
            navigate('/goals');
            return;
        }

        setSaving(true);
        try {
            // "Accept" the plan for the goal ID we already have
            const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tasks: previewData.tasks // Send back the tasks (potentially modified if we added editing)
                })
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
        if (!isDemoMode && goalId) {
            try {
                // Delete the goal that was created for preview
                await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}`, {
                    method: 'DELETE',
                });
                console.log('Discarded goal deleted:', goalId);
            } catch (err) {
                console.error('Error deleting discarded goal:', err);
            }
        }
        navigate('/create-goal', { state: { originalPrompt } });
    };

    // fade in content after mount (or after loading overlay completes)
    useEffect(() => {
        // if loading overlay is showing, wait for it to complete before fading in content
        if (showLoading) return;

        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, [showLoading]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-color)',
        }}>
            {/* blue section - starts at final size (seamless from LoadingOverlay) */}
            <div style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: showLoading ? 'none' : 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                height: '75vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Back button */}
                <button
                    onClick={handleDiscard}
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

                {/* title - fades in after loading overlay completes */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '36px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-lg)',
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
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    justifyContent: 'center',
                    marginTop: 'var(--space-lg)',
                    opacity: contentVisible ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.3s',
                }}>
                    <button
                        onClick={handleAccept}
                        disabled={saving}
                        style={{
                            backgroundColor: 'var(--primary)',
                            color: 'var(--text-main)',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '12px 32px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: saving ? 'wait' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            opacity: saving ? 0.7 : 1,
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
                        onClick={handleDiscard}
                        style={{
                            backgroundColor: 'var(--accent-red-soft)',
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
            <div style={{
                padding: 'var(--space-lg)',
                paddingBottom: '100px',
                backgroundColor: 'var(--bg-color)',
            }}>
                <InputBar
                    placeholder="Feedback to AI..."
                    onSubmit={(value) => console.log('Feedback submitted:', value)}
                    variant="auth"
                    borderRadius="var(--radius-xl)"
                />
                
            </div>

            <BottomNav />

            {/* loading overlay - shown when navigating from CreateGoal */}
            {showLoading && (
                <LoadingOverlay onComplete={() => setShowLoading(false)} />
            )}
        </div>
    );
}

export default ReviewPlan;