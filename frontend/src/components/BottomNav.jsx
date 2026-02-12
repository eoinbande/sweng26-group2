import React from 'react';
import { Target, Calendar, BarChart2, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

/* Custom filled house icon with fully rounded corners */
const HomeIcon = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1A1A1A" xmlns="http://www.w3.org/2000/svg" style={{ display: 'flex' }}>
        <path d="M12 3Q13.5 3 15.75 5L20.5 9Q21.5 10 21.5 11.5V18Q21.5 22 17.75 22H15.25Q13.75 22 13.75 20V18Q13.75 15 12 15Q10.25 15 10.25 18V20Q10.25 22 8.75 22H6.25Q2.5 22 2.5 18V11.5Q2.5 10 3.5 9L8.25 5Q10.5 3 12 3Z" />
    </svg>
);

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'rgba(248, 248, 244, 0.97)',
            backdropFilter: 'blur(12px)',
            padding: '10px var(--space-lg) 14px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            zIndex: 100,
        }}>
            <NavIcon icon={<Target size={24} />} label="Goals" active={currentPath === '/goals'} onClick={() => navigate('/goals')} />
            <NavIcon icon={<Calendar size={24} />} label="Schedule" active={currentPath === '/schedule'} onClick={() => navigate('/schedule')} />

            {/* Floating Home Button */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                marginBottom: '0px',
            }} onClick={() => navigate('/')}>
                <div style={{
                    backgroundColor: 'var(--primary)',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255, 185, 46, 0.4)',
                    marginTop: '-28px',
                }}>
                    <HomeIcon  />
                </div>
            </div>

            <NavIcon icon={<BarChart2 size={24} />} label="Progress" active={currentPath === '/progress'} onClick={() => navigate('/progress')} />
            <NavIcon icon={<User size={24} />} label="Profile" active={currentPath === '/profile'} onClick={() => navigate('/profile')} />
        </div>
    );
};

const NavIcon = ({ icon, label, onClick, active }) => (
    <div onClick={onClick} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        color: active ? 'var(--text-main)' : '#8E8E93',
        transition: 'color 0.2s ease',
        minWidth: '48px',
    }}>
        {icon}
        <span style={{
            fontSize: '10px',
            fontWeight: active ? '600' : '500',
            fontFamily: 'var(--font-sans)',
        }}>{label}</span>
    </div>
);

export default BottomNav;
