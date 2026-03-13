import { Pencil, Flame } from 'lucide-react';
import '../styles/Profile.css';

const AccountCard = ({ username, email, streakDays, onEdit, onSignOut }) => {
    return (
        <div className="account-card-wrapper">
            <div className="account-card">
                <div className="account-card-streak">
                    <Flame className="account-card-streak-icon" />
                    <span className="account-card-streak-text">{streakDays} days</span>
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Username</span>
                    <span className="account-card-value">{username}</span>
                </div>

                <div className="account-card-field">
                    <span className="account-card-label">Email</span>
                    <span className="account-card-value">{email}</span>
                </div>

                <button className="account-card-edit" onClick={onEdit} aria-label="Edit profile">
                    <Pencil />
                </button>
            </div>

            <button className="sign-out-button" onClick={onSignOut}>
                Sign Out
            </button>
        </div>
    );
};

export default AccountCard;
