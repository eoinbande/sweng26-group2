import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const Header = ({userName}) => {
    const navigate = useNavigate();

    return (
        <header className="home-header">
            <div className="flex-between">
                <div>
                    <h1>Hi, {userName || 'Guest'}.</h1>
                </div>

                <div className="header-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                    <div className="avatar-placeholder">
                        {/* If name exists, show first letter, else show '?' */}
                        {userName ? userName.charAt(0).toUpperCase() : '?'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
