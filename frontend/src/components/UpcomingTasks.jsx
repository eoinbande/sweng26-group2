import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import '../index.css';

const UpcomingTasks = () => {
    const scrollRef = useRef(null);
    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(false);

    const updateFades = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const threshold = 5;
        setShowTopFade(el.scrollTop > threshold);
        setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
    }, []);

    useEffect(() => {
        updateFades();
    }, [updateFades]);

    const tasks = [
        { title: 'Learn basic piano chords', due: '3 days', urgent: true },
        { title: 'Call bank', due: null },
        { title: 'Start personal journal', due: '2 days', urgent: true },
        { title: 'Networks revision topic 2', due: null },
        { title: 'Brainstorm erasmus', due: null },
        { title: 'Create homepage mockup', due: null },
        { title: 'Buy groceries', due: null },
        { title: 'Call Mom', due: 'Tonight', urgent: false },
    ];

    return (
        <div className="home-upcoming-tasks">
            <h4>Upcoming Tasks</h4>

            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
            }}>

                {/* blue card behind (slanted) */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'var(--accent-blue)',
                    borderRadius: 'var(--radius-lg)',
                    transform: 'rotate(-5deg)',
                    zIndex: 0,
                    boxShadow: 'var(--shadow-sm)',
                }}></div>

                {/* blue front card */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: 'var(--accent-blue)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-sm)',
                    boxShadow: 'var(--shadow-md)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    {/* white inner container for the list */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-md)',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* scrollable list */}
                        <div
                            ref={scrollRef}
                            onScroll={updateFades}
                            style={{
                                padding: 'var(--space-md)',
                                height: '100%',
                                overflowY: 'auto',
                            }}
                        >
                            <ul style={{ listStyle: 'none' }}>
                                {tasks.map((task, index) => (
                                    <li key={index} className="task-item"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {/* simple arrow icon */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#1A1A1A'
                                            }}>
                                                <ArrowUpRight size={20} strokeWidth={2.5} />
                                            </div>

                                            <span className="task-title" style={{
                                                color: task.urgent ? 'var(--accent-red-soft)' : 'var(--text-main)',
                                                fontWeight: '400'
                                            }}>
                                                {task.title}
                                            </span>
                                        </div>

                                        {task.due && (
                                            <span className="task-due-badge" style={{
                                                backgroundColor: task.urgent ? 'var(--accent-red-soft)' : '#E0E0E0',
                                                color: 'white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            }}>
                                                {task.due}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* top fade overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '30px',
                            background: 'linear-gradient(to bottom, white 0%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            opacity: showTopFade ? 1 : 0,
                            transition: 'opacity 0.25s ease',
                        }} />

                        {/* bottom fade overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '30px',
                            background: 'linear-gradient(to top, white 0%, transparent 100%)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            opacity: showBottomFade ? 1 : 0,
                            transition: 'opacity 0.25s ease',
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingTasks;
