import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoals } from '../contexts/GoalsContext';
import dayjs from 'dayjs';
import '../index.css';

const CARD_COLORS = [
    'var(--pink)',
    'var(--blue)',
    'var(--accent-green)',
    'var(--yellow-soft)'
];

const GoalsGrid = ({ visible = true }) => {
    const navigate = useNavigate();
    const { goals, loading } = useGoals();
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    // derive upcoming goals (due within 30 days) from cached goals
    const upcomingGoals = useMemo(() => {
        const now = dayjs().startOf('day');
        const cutoff = now.add(30, 'day');
        return goals
            .filter(g => {
                if (!g.dueDate) return false;
                const due = dayjs(g.dueDate);
                return due.isAfter(now.subtract(1, 'day')) && due.isBefore(cutoff);
            })
            .map((g, index) => ({
                id: g.id,
                title: g.title,
                date: g.dateFormatted,
                category: g.category,
                color: CARD_COLORS[index % CARD_COLORS.length],
            }));
    }, [goals]);

    return (
        <div className={`home-goals-grid${visible ? ' home-goals-grid--visible' : ''}`}>
            <h4>{currentMonth}'s goals</h4>

            <div className="goals-scroll">
                {!loading && upcomingGoals.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)'
                    }}>
                        No upcoming goals!
                    </div>
                ) : (
                    upcomingGoals.map((goal, index) => (
                        <div key={goal.id} className="goal-grid-card goal-card" onClick={() => navigate(`/goal/${goal.id}`, { state: { goalTitle: goal.title } })} style={{
                            backgroundColor: goal.color,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-sm)',
                            flexShrink: 0,
                            cursor: 'pointer'
                        }}>
                            <h5 style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 'var(--font-weight-semibold)',
                                lineHeight: '1.3',
                                marginBottom: 'var(--space-sm)',
                            }}>{goal.title}</h5>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 'var(--space-sm)',
                            }}>
                                <span className="goal-date" style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 'var(--font-weight-medium)',
                                }}>{goal.date}</span>
                                {goal.category && (
                                    <span className="goal-category" style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: goal.categoryColor,
                                        backgroundColor: 'rgba(255,255,255,0.7)',
                                        borderRadius: 'var(--radius-pill)',
                                    }}>{goal.category}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GoalsGrid;
