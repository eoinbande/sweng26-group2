import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import '../index.css';

const UpcomingTasks = () => {
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
        <div style={{
            marginBottom: 'var(--space-md)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
        }}>
            <h4 style={{ fontSize: '18px', marginBottom: 'var(--space-sm)' }}>Upcoming Tasks</h4>

            <div className="card" style={{
                position: 'relative',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                border: 'none',
                height: '100%'
            }}>

                {/* Blue Decorative Background Shape */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'var(--accent-blue)',
                    borderRadius: 'var(--radius-md)',
                    transform: 'rotate(-1deg) scale(1.02)',
                    zIndex: 0,
                    boxShadow: 'var(--shadow-sm)'
                }}></div>

                {/* White Scrollable Container */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-md)',
                    boxShadow: 'var(--shadow-md)',
                    height: '100%',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <ul style={{ listStyle: 'none' }}>
                        {tasks.map((task, index) => (
                            <li key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '8px',
                                    padding: '4px 0',
                                    borderRadius: '8px',
                                    // Removed 'interactive' class and hover effect from whole row
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Simple Arrow Icon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1A1A1A'
                                    }}>
                                        <ArrowUpRight size={20} strokeWidth={2.5} />
                                    </div>

                                    <span style={{
                                        fontSize: '15px',
                                        color: task.urgent ? 'var(--accent-red-soft)' : 'var(--text-main)',
                                        fontWeight: '400'
                                    }}>
                                        {task.title}
                                    </span>
                                </div>

                                {task.due && (
                                    <span style={{
                                        backgroundColor: task.urgent ? 'var(--accent-red-soft)' : '#E0E0E0',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {task.due}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UpcomingTasks;
