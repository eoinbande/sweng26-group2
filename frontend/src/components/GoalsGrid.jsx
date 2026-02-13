import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const GoalsGrid = () => {
    const navigate = useNavigate();

    const goals = [
        { title: 'Master the piano', date: '27 Jan', category: 'Creative', color: 'var(--accent-pink)', categoryColor: '#C0504D' },
        { title: 'Create a bank account', date: '1 May', category: 'Financial', color: 'var(--accent-blue)', categoryColor: '#4A6D8C' },
        { title: 'Run a marathon', date: '15 Mar', category: 'Fitness', color: 'var(--accent-green)', categoryColor: '#3D6B33' },
        { title: 'Learn to cook', date: '10 Feb', category: 'Lifestyle', color: 'var(--primary)', categoryColor: '#A07518' },
        { title: 'Read 12 books', date: '31 Dec', category: 'Education', color: 'var(--accent-pink)', categoryColor: '#C0504D' },
        { title: 'Travel to Japan', date: '20 Aug', category: 'Travel', color: 'var(--accent-blue)', categoryColor: '#4A6D8C' },
    ];

    return (
        <div style={{ marginBottom: 'var(--space-md)' }}>
            <h4 style={{ fontSize: '18px', marginBottom: 'var(--space-sm)' }}>January's goals</h4>

            <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                overflowX: 'auto',
                padding: 'var(--space-md) 24px',
                margin: '0 -24px',
            }}>
                {goals.map((goal, index) => (
                    <div key={index} className="goal-grid-card" onClick={() => navigate('/goal-detail')} style={{
                        backgroundColor: goal.color,
                        borderRadius: '36px',
                        minWidth: '160px',
                        maxWidth: '160px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0
                    }}>
                        <h5 style={{
                            fontSize: '16px',
                            fontFamily: 'var(--font-serif)',
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
                            <span style={{
                                fontSize: '13px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 'var(--font-weight-medium)',
                            }}>{goal.date}</span>
                            <span style={{
                                fontSize: '11px',
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 'var(--font-weight-medium)',
                                color: goal.categoryColor,
                                backgroundColor: 'rgba(255,255,255,0.7)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-pill)',
                            }}>{goal.category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoalsGrid;
