import React from 'react';
import { ArrowUpLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../index.css';

function Feedback() {
    const navigate = useNavigate();
    const location = useLocation();

    const subtask = location.state?.subtask;
    const taskTitle = location.state?.taskTitle;
    const returnTo = location.state?.returnTo || '/goals';
    const tasks = location.state?.tasks;
    const goal = location.state?.goal;

    const handleBack = () => {
        navigate(returnTo, {
            state: {
                tasks: tasks,
                goal: goal,
            }
        });
    };

    return (
        <div style={{
            maxWidth: '480px',
            margin: '0 auto',
            minHeight: '100dvh',
            backgroundColor: 'var(--bg-color)',
            padding: 'var(--space-md)',
            paddingTop: '24px',
        }}>
            <button
                onClick={handleBack}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    marginBottom: 'var(--space-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-main)',
                    fontSize: '15px',
                    fontWeight: 500,
                }}
            >
                <ArrowUpLeft size={24} strokeWidth={2.5} />
                Back to goal
            </button>

            <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: 'var(--space-sm)',
            }}>
                Feedback
            </h1>

            {taskTitle && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                    Task: {taskTitle}
                </p>
            )}
            {subtask && (
                <p style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 500, marginBottom: 'var(--space-lg)' }}>
                    Subtask: {subtask.title}
                </p>
            )}

            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: 'var(--space-lg)',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
            }}>
                <p>Feedback page coming soon.</p>
            </div>

            <BottomNav />
        </div>
    );
}

export default Feedback;
