import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const CreateGoalCard = () => {
    const navigate = useNavigate();

    return (
        <div className="card home-create-goal" style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '480px',
            boxShadow: 'var(--shadow-md)',
            border: 'none',
            borderRadius: 'var(--radius-xxl)',
        }}>
            <div>
                <h3>
                    Create a new Goal
                </h3>
                <p>
                    Break it down, step <br /> by step.
                </p>
            </div>

            <button className="interactive create-goal-btn" onClick={() => navigate('/create-goal')}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                <Plus style={{ width: '45%', height: '45%' }} color="#1A1A1A" />
            </button>
        </div>
    );
};

export default CreateGoalCard;
