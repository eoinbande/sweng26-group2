import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2 } from 'react-icons/fi';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const streak = 217; // TODO: fetch real streak from backend

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (user) {
                    setEmail(user.email || '');
                    setUsername(
                        user.user_metadata?.username ||
                        user.email?.split('@')[0] ||
                        ''
                    );
                }
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };

        fetchUser();

        // Show spinner for 1.5s, then fade in profile
        const loadTimer = setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setVisible(true), 50);
        }, 1500);

        return () => clearTimeout(loadTimer);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    /* ── Loading screen ── */
    if (isLoading) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'var(--bg-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    border: '4px solid rgba(255, 185, 46, 0.2)',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'profileSpin 1s linear infinite',
                }} />
                <style>{`
                    @keyframes profileSpin {
                        from { transform: rotate(0deg); }
                        to   { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    /* ── Profile page ── */
    return (
        <div
            className="profile-page"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
        >
            {/* Pink top half */}
            <div className="profile-header-bg">
                <h1 className="profile-title">Your Account</h1>

                {/* Arched avatar — semicircle on top of rectangle */}
                <div className="profile-avatar-wrap">
                    <div className="profile-avatar-top" />
                    <div className="profile-avatar-body" />
                </div>
            </div>

            {/* Grey lower half */}
            <div className="profile-lower">

                {/* Card overlaps the pink/grey boundary */}
                <div className="profile-card">

                    {/* Streak badge — top-right of card */}
                    <div className="profile-streak">
                        <span className="profile-streak-icon">🔥</span>
                        <span className="profile-streak-days">{streak} days</span>
                    </div>

                    <div className="profile-info">
                        <div className="profile-info-row">
                            <span className="profile-info-label">Username</span>
                            <span className="profile-info-value">{username}</span>
                        </div>
                        <div className="profile-info-row">
                            <span className="profile-info-label">Email</span>
                            <span className="profile-info-value">{email}</span>
                        </div>
                    </div>

                    {/* Edit button — bottom-right of card */}
                    <button className="profile-edit-btn" aria-label="Edit profile">
                        <FiEdit2 size={19} color="#1a1a1a" />
                    </button>
                </div>

                {/* Sign Out — directly below card */}
                <button className="profile-signout-btn" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>

            <BottomNav />
        </div>
    );
};

export default Profile;