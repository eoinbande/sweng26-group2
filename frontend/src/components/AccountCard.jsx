import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';
import '../styles/Profile.css';

const AccountCard = ({ username, email, streakDays, onUpdateProfile, onSignOut, loaded }) => {
    const streakCount = useCountUp(streakDays, 800, loaded);
    const [fireReady, setFireReady] = useState(false);

    // trigger fire as count-up is finishing
    useEffect(() => {
        if (loaded && streakCount.blur < 0.3) setFireReady(true);
    }, [loaded, streakCount.blur]);
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
                <div className={`account-card-streak${loaded ? ' loaded' : ''}`}>
                    <div className="streak-fire-wrap">
                        <svg className={`account-card-streak-icon${fireReady ? ' loaded' : ''}`} viewBox="0 0 24 24" fill="#ee9300" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C10.5 6 7 8.5 7 12.5C7 16.09 9.69 19 12 19C14.31 19 17 16.09 17 12.5C17 8.5 13.5 6 12 2Z" />
                            <path d="M12 19C10.9 19 9.5 17.53 9.5 15.5C9.5 13.47 11 12 12 11C13 12 14.5 13.47 14.5 15.5C14.5 17.53 13.1 19 12 19Z" fill="#FFDC00" />
                        </svg>
                        {fireReady && (
                            <div className="fire-embers">
                                <span className="ember ember-1" />
                                <span className="ember ember-2" />
                                <span className="ember ember-3" />
                                <span className="ember ember-4" />
                                <span className="ember ember-5" />
                            </div>
                        )}
                    </div>
                    <span className="account-card-streak-text" style={streakCount.blur > 0 ? {
                        filter: `blur(${streakCount.blur}px)`,
                        transform: `scaleY(${1 + streakCount.blur * 0.04})`,
                    } : undefined}>
                        {loaded ? `${streakCount.value} days` : '—'}
                    </span>
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Username</span>
                    {isEditing ? (
                        <div className="username-edit-container">
                            <input 
                                className="account-card-input"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                            />
                            <button className="account-card-action-btn save" onClick={handleSave}>
                                <Check size={18} />
                            </button>
                            <button className="account-card-action-btn cancel" onClick={handleCancel}>
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="username-row">
                            <span className="account-card-value">{username}</span>
                            <button className="inline-edit-btn" onClick={handleEditClick} aria-label="Edit username">
                                <Pencil size={18} fill="currentColor" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Email</span>
                    <span className="account-card-value">{email}</span>
                </div>
            </div>

            <button className="sign-out-button" onClick={onSignOut}>
                Sign Out
            </button>
        </div>
    );
};

export default AccountCard;
