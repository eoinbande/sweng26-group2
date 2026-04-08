import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import '../index.css';

const Header = ({userName}) => {
    const navigate = useNavigate();

    return (
        <header className="home-header">
            <div className="flex-between">
                <div>
                    <h1>Hi, {userName || 'Guest'}.</h1>
                </div>

                <div className="header-right">
                    <button
                        className="btn-view-garden"
                        onClick={() => navigate('/garden')}
                    >
                        <Sprout size={20} strokeWidth={2.2} />
                    </button>
                    <div className="header-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                        <div className="avatar-placeholder">
                            {userName ? userName.charAt(0).toUpperCase() : '?'}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
