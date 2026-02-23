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
    const streak = 217; // TODO: fetch real streak from backend

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (user) {
                setEmail(user.email || '');
                setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
            }
        };
        fetchUser();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="profile-page">
            <div className="profile-header-bg">
                <h1 className="profile-title">Your Account</h1>
                <div className="profile-avatar" />
            </div>

            <div className="profile-card">
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

                <button className="profile-edit-btn" aria-label="Edit profile">
                    <FiEdit2 size={20} color="#1a1a1a" />
                </button>
            </div>

            <button className="profile-signout-btn" onClick={handleSignOut}>
                Sign Out
            </button>

            <div className="profile-nav-spacer" />
            <BottomNav />
        </div>
    );
};

export default Profile;