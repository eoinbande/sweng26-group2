import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import '../index.css';

dayjs.extend(relativeTime);

const UpcomingTasks = ({ onReady }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const scrollRef = useRef(null);
    const [showTopFade, setShowTopFade] = useState(false);
    const [showBottomFade, setShowBottomFade] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const updateFades = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const threshold = 5;
        setShowTopFade(el.scrollTop > threshold);
        setShowBottomFade(el.scrollTop + el.clientHeight < el.scrollHeight - threshold);
    }, []);

    useEffect(() => {
        updateFades();
    }, [updateFades, tasks]);

    useEffect(() => {
        if (!user) return;
        const fetchTasks = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/schedule/${user.id}/upcoming-tasks?days=15`);
                if (res.ok) {
                    const json = await res.json();
                    
                    // Map backend tasks to frontend structure
                    const mappedTasks = json.tasks.map(t => {
                        const dueDate = t.due_date ? dayjs(t.due_date) : null;
                        let dueText = null;
                        let urgencyLevel = 'normal'; // normal, urgent (red), warning (orange)

                        if (dueDate) {
                            const now = dayjs().startOf('day');
                            const target = dueDate.startOf('day');
                            const diffDays = target.diff(now, 'day');

                            if (diffDays < 0) {
                                // Overdue
                                dueText = target.format('D MMM');
                                urgencyLevel = 'urgent';
                            } else if (diffDays === 0) {
                                dueText = 'Today';
                                urgencyLevel = 'urgent';
                            } else if (diffDays === 1) {
                                dueText = 'Tomorrow';
                                urgencyLevel = 'urgent';
                            } else if (diffDays < 7) {
                                dueText = target.format('dddd'); // Day name
                                urgencyLevel = 'warning';
                            } else {
                                dueText = target.format('D MMM');
                                urgencyLevel = 'normal';
                            }
                        }

                        return {
                            title: t.description,
                            due: dueText,
                            urgencyLevel,
                            id: t.task_id || t.ai_id,
                            goalId: t.goal_id,
                            goalTitle: t.goal_title
                        };
                    });
                    
                    setTasks(mappedTasks);
                }
            } catch (err) {
                console.error("Error fetching upcoming tasks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [user]);

    // step 1: expand the container after tasks load
    // step 2: fade in items after expansion finishes
    // step 3: notify parent the full sequence is done
    useEffect(() => {
        if (!loading) {
            const expandTimer = requestAnimationFrame(() => setExpanded(true));
            const itemsTimer = setTimeout(() => setShowItems(true), 300);
            const readyTimer = setTimeout(() => onReady && onReady(), 450);
            return () => { cancelAnimationFrame(expandTimer); clearTimeout(itemsTimer); clearTimeout(readyTimer); };
        }
    }, [loading]);

    const getBadgeColor = (level) => {
        switch(level) {
            case 'urgent': return 'var(--accent-red-soft)';
            case 'warning': return 'var(--red)';
            default: return 'var(--accent-blue, #6B8DB0)';
        }
    };

    return (
        <div className={`home-upcoming-tasks${expanded ? ' home-upcoming-tasks--expanded' : ''}`}>
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
                        borderRadius: 'var(--radius-lg)',
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
                            {!loading && tasks.length === 0 ? (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-sans)',
                                    textAlign: 'center',
                                    padding: '0 var(--space-md)'
                                }}>
                                    No upcoming tasks!
                                </div>
                            ) : showItems ? (
                                <ul style={{ listStyle: 'none' }}>
                                    {tasks.map((task, index) => (
                                        <li key={index} className="task-item task-item-animate"
                                            onClick={() => task.goalId && navigate(`/goal/${task.goalId}`, {
                                                state: {
                                                    goalId: task.goalId,
                                                    goalTitle: task.goalTitle || "Loading...",
                                                    from: 'home'
                                                }
                                            })}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => setHoveredIndex(null)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                animationDelay: `${index * 0.07}s`,
                                            }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {/* arrow icon with hover effect */}
                                                <div 
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: hoveredIndex === index ? 'var(--red)' : '#1A1A1A',
                                                        transition: 'color 0.2s',
                                                    }}
                                                >
                                                    <ArrowUpRight size={20} strokeWidth={2.5} />
                                                </div>

                                                <span className="task-title" 
                                                    style={{
                                                        color: hoveredIndex === index ? 'var(--red)' : 'var(--text-main)',
                                                        fontWeight: '400',
                                                        transition: 'color 0.2s',
                                                    }}
                                                >
                                                    {task.title}
                                                </span>
                                            </div>

                                            {task.due && (
                                                <span className="task-due-badge" style={{
                                                    backgroundColor: getBadgeColor(task.urgencyLevel),
                                                    color: 'white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                }}>
                                                    {task.due}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
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
