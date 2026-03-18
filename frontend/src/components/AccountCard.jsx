import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import '../styles/Profile.css';

const AccountCard = ({ username, email, streakDays, onUpdateProfile, onSignOut }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(username);

    const handleEditClick = () => {
        setEditName(username);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (onUpdateProfile) {
            await onUpdateProfile(editName);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="account-card-wrapper fade-in">
            <div className="account-card">
                <div className="account-card-streak">
                    <svg className="account-card-streak-icon" viewBox="0 0 24 24" fill="#ee9300" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C10.5 6 7 8.5 7 12.5C7 16.09 9.69 19 12 19C14.31 19 17 16.09 17 12.5C17 8.5 13.5 6 12 2Z" />
                        <path d="M12 19C10.9 19 9.5 17.53 9.5 15.5C9.5 13.47 11 12 12 11C13 12 14.5 13.47 14.5 15.5C14.5 17.53 13.1 19 12 19Z" fill="#FFDC00" />
                    </svg>
                    <span className="account-card-streak-text">{streakDays} days</span>
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Username</span>
                    {isEditing ? (
                        <input 
                            className="account-card-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                        />
                    ) : (
                        <span className="account-card-value">{username}</span>
                    )}
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Email</span>
                    <span className="account-card-value">{email}</span>
                </div>

                {isEditing ? (
                    <div className="account-card-actions">
                        <button className="account-card-action-btn save" onClick={handleSave}>
                            <Check size={18} />
                        </button>
                        <button className="account-card-action-btn cancel" onClick={handleCancel}>
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <button className="account-card-edit" onClick={handleEditClick} aria-label="Edit profile">
                        <Pencil strokeWidth={2.5} size={20} />
                    </button>
                )}
            </div>

            <button className="sign-out-button" onClick={onSignOut}>
                Sign Out
            </button>
        </div>
    );
};

export default AccountCard;
