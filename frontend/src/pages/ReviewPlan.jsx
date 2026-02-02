import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { TaskCard } from '../components/TaskCard';
import { InputBar } from '../components/InputBar';
import '../index.css';

function ReviewPlan() {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // trigger expansion animation after delay to show transition from creategoal size
    useEffect(() => {
        const timer = setTimeout(() => setIsExpanded(true), 400);
        return () => clearTimeout(timer);
    }, []);

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
            {/* blue section - starts at creategoal size, then expands */}
            <div style={{
                backgroundColor: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
                height: isExpanded ? '75vh' : 'auto',
                maxHeight: isExpanded ? '75vh' : '280px',
                transition: 'all 0.6s ease-out',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Back button */}
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

                {/* Title */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '36px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-lg)',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                }}>
                    How you feel<br />about these?
                </h1>

                {/* task cards container - scrollable, fades in with expansion */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)',
                    paddingRight: 'var(--space-sm)',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.2s',
                }}>
                    {/* Placeholder TaskCards - replace with actual data later */}
                    <TaskCard
                        title="Learn the keyboard layout"
                        dueDate="Tomorrow"
                        onEdit={() => console.log("Edit clicked")}
                    />
                    <TaskCard
                        title="Learn the keyboard layout"
                        dueDate="3 days left"
                        onEdit={() => console.log("Edit clicked")}
                    />
                    <TaskCard
                        title="Learn the keyboard layout"
                        dueDate="5 days left"
                        onEdit={() => console.log("Edit clicked")}
                    />
                    <TaskCard
                        title="Learn the keyboard layout"
                        dueDate="5 days left"
                        onEdit={() => console.log("Edit clicked")}
                    />
                </div>

                {/* accept/discard - fades in with expansion */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    justifyContent: 'center',
                    marginTop: 'var(--space-lg)',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'opacity 0.4s ease-out 0.3s',
                }}>
                    <button style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-main)',
                        border: 'none',
                        borderRadius: 'var(--radius-pill)',
                        padding: '12px 32px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}>
                        Accept
                    </button>
                    <button style={{
                        backgroundColor: 'var(--accent-red-soft)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-pill)',
                        padding: '12px 32px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '16px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}>
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
                />
            </div>

            <BottomNav />
        </div>
    );
}

export default ReviewPlan;