import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase_client';
import dayjs from 'dayjs';
import '../index.css';

const CATEGORY_STYLES = {
    'Health': { color: 'var(--accent-green)', categoryColor: '#3D6B33' },
    'Personal': { color: 'var(--accent-pink)', categoryColor: '#C0504D' },
    'Work': { color: 'var(--accent-blue)', categoryColor: '#4A6D8C' },
    'Education': { color: 'var(--accent-pink)', categoryColor: '#C0504D' },
    'Finance': { color: 'var(--accent-blue)', categoryColor: '#4A6D8C' },
    'default': { color: 'var(--primary)', categoryColor: '#A07518' }
};

const GoalsGrid = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) {
                    setLoading(false);
                    return;
                }

                // Get goals for this month ( next 30 days is what the endpoint does
                const res = await fetch(`${import.meta.env.VITE_API_URL}/schedule/${user.id}/upcoming-goals?days=30`);
                if (res.ok) {
                    const json = await res.json();
                    
                    const mappedGoals = json.goals.map((g, index) => {
                        const style = CATEGORY_STYLES[g.category] || CATEGORY_STYLES.default;
                        
                        return {
                            id: g.goal_id,
                            title: g.title,
                            date: dayjs(g.goal_due_date).format('D MMM'),
                            category: g.category,
                            color: style.color,
                            categoryColor: style.categoryColor
                        };
                    });
                    
                    setGoals(mappedGoals);
                }
            } catch (err) {
                console.error("Error fetching goals:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    return (
        <div className="home-goals-grid">
            <h4>{currentMonth}'s goals</h4>

            <div className="goals-scroll">
                {!loading && goals.length === 0 ? (
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
                    goals.map((goal, index) => (
                        <div key={index} className="goal-grid-card goal-card" onClick={() => navigate(`/goal/${goal.id}`)} style={{
                            backgroundColor: goal.color,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: 'var(--shadow-sm)',
                            flexShrink: 0
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
