import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const GoalsGrid = () => {
    const navigate = useNavigate();

    const goals = [
        { color: 'var(--accent-pink)' },
        { color: 'var(--accent-blue)' },
        { color: 'var(--accent-green)' },
        { color: 'var(--primary)' },
        { color: 'var(--accent-pink)' },
        { color: 'var(--accent-blue)' },
    ];

    return (
        <div style={{ marginBottom: '0px', overflow: 'hidden' }}>
            <h4 style={{ fontSize: '20px', marginBottom: 'var(--space-sm)' }}>January's goals</h4>

            <div style={{
                display: 'flex',
                gap: 'var(--space-md)',
                overflowX: 'auto',
                padding: 'var(--space-md)', // Added full padding to allow hover growth
                margin: '-16px', // Negative margin to compensate layout
                marginBottom: '0px'
            }}>
                {goals.map((goal, index) => (
                    <div key={index} className="interactive" onClick={() => navigate('/goal-detail')} style={{
                        backgroundColor: goal.color,
                        borderRadius: '20px',
                        minWidth: '100px',
                        height: '80px',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0
                    }}>
                        {/* Shapes simulating content */}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            opacity: 0.8
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            width: '40%',
                            height: '6px',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            opacity: 0.8
                        }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoalsGrid;
