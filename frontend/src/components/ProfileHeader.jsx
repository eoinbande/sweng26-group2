import PageHeader from './PageHeader';
import '../styles/Profile.css';

const ProfileHeader = () => {
    return (
        <div className="profile-header-wrapper">
            <div className="profile-header-bg" />
            <div className="profile-header-content">
                <PageHeader title="Your Account" accentColor="var(--accent-red-soft)" />
            </div>
            <div className="profile-avatar-container">
                <div className="profile-avatar" />
            </div>
        </div>
    );
};

export default ProfileHeader;
