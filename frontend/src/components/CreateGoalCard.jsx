import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const CreateGoalCard = () => {
    const navigate = useNavigate();

    return (
        <div className="card interactive" onClick={() => navigate('/create-goal')} style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '38px 24px',
            maxWidth: '480px',
            margin: 'var(--space-md)',
            boxShadow: 'var(--shadow-md)',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--radius-xl)',
        }}>
            <div>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>
                    Create a new Goal
                </h3>
                <p style={{ fontSize: '14px', }}>
                    Break it down, step <br /> by step.
                </p>
            </div>

            <button style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-blue)', // Updated to use variable
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                flexShrink: 0,
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                <Plus size={36} color="#1A1A1A" />
            </button>
        </div>
    );
};

export default CreateGoalCard;
