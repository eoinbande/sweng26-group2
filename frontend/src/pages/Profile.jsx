import React from 'react';
import '../styles/Profile.css';
import { FiEdit2 } from 'react-icons/fi';

const Profile = ({ username = 'Marissa', email = 'Marissa', streak = 217, onEdit, onSignOut }) => {
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

                <button className="profile-edit-btn" onClick={onEdit} aria-label="Edit profile">
                    <FiEdit2 size={20} color="#1a1a1a" />
                </button>
            </div>

            <button className="profile-signout-btn" onClick={onSignOut}>Sign Out</button>
            <div className="profile-nav-spacer" />
        </div>
    );
};

export default Profile;