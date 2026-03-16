import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../index.css';

/* Custom filled house icon with fully rounded corners */
const HomeIcon = ({ size = 26 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1A1A1A" xmlns="http://www.w3.org/2000/svg" style={{ display: 'flex' }}>
        <path d="M12 3Q13.5 3 15.75 5L20.5 9Q21.5 10 21.5 11.5V18Q21.5 22 17.75 22H15.25Q13.75 22 13.75 20V18Q13.75 15 12 15Q10.25 15 10.25 18V20Q10.25 22 8.75 22H6.25Q2.5 22 2.5 18V11.5Q2.5 10 3.5 9L8.25 5Q10.5 3 12 3Z" />
    </svg>
);

const Target = ({ size = 30 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 7a5 5 0 1 0 5 5" fill="none" /><path d="M13 3.055a9 9 0 1 0 7.941 7.945" fill="none" /><path d="M15 6v3h3l3 -3h-3v-3l-3 3" /><path d="M15 9l-3 3" /></svg>
)

const Schedule = ({ size = 30 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-clipboard-text"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-2.997 10.83h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m0 -4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m-1 -9a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z" /></svg>
)

const BarChart = ({ size = 30 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="2" y="13" width="6" height="8" rx="1.5" />
        <rect x="9" y="5" width="6" height="16" rx="1.5" />
        <rect x="16" y="9" width="6" height="12" rx="1.5" />
    </svg>
)

const User = ({ size = 30 }) => (
<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
)



const BottomNav = ({ transparent = false }) => {
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
            backgroundColor: transparent ? 'transparent' : 'rgba(248, 248, 244, 0.97)',
            backdropFilter: 'blur(12px)',
            padding: '10px 16px 14px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            borderTop: 'none',
            zIndex: 100,
        }}>
            <NavIcon icon={<Target />} label="Goals" active={currentPath === '/goals'} onClick={() => navigate('/goals')} />
            <NavIcon icon={<Schedule />} label="Schedule" active={currentPath === '/schedule'} onClick={() => navigate('/schedule')} />

            {/* Floating Home Button */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer',
                marginBottom: '0px',
            }} onClick={() => navigate('/home')}>
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

            <NavIcon icon={<BarChart/>} label="Green" active={currentPath === '/greenpage'} onClick={() => navigate('/greenpage')} />
            <NavIcon icon={<User/>} label="Profile" active={currentPath === '/profile'} onClick={() => navigate('/profile')} />
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
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {icon}
        </div>
        <span style={{
            fontSize: '10px',
            fontWeight: active ? '600' : '500',
            fontFamily: 'var(--font-sans)',
        }}>{label}</span>
    </div>
);

export default BottomNav;
