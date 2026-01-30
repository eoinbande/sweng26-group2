import React from 'react';
import { Target, Calendar, Home, BarChart2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const BottomNav = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'rgba(248, 248, 244, 0.95)', // Semi-transparent matching bg
            backdropFilter: 'blur(10px)',
            padding: 'var(--space-md) var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            zIndex: 100
        }}>
            <NavIcon icon={<Target size={24} />} label="Goals" onClick={() => navigate('/goals')} />
            <NavIcon icon={<Calendar size={24} />} label="Schedule" onClick={() => navigate('/schedule')} />

            {/* Floating Home Button */}
            <div onClick={() => navigate('/')} style={{
                marginTop: '-30px', // Pull up
                backgroundColor: 'var(--primary)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 184, 76, 0.4)',
                cursor: 'pointer'
            }}>
                <Home size={28} color="#1A1A1A" fill="#1A1A1A" />
            </div>

            <NavIcon icon={<BarChart2 size={24} />} label="Progress" onClick={() => navigate('/progress')} />
            <NavIcon icon={<User size={24} />} label="Profile" onClick={() => navigate('/profile')} />
        </div>
    );
};

const NavIcon = ({ icon, label, onClick }) => (
    <div onClick={onClick} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        color: '#8E8E93'
    }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: '500' }}>{label}</span>
    </div>
);

export default BottomNav;
