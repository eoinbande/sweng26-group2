import React from 'react';
import { User } from 'lucide-react';
import '../index.css';

const Header = () => {
    return (
        <header style={{ marginBottom: 'var(--space-md)' }}>
            <div className="flex-between">
                <div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        marginBottom: 'var(--space-xs)'
                    }}>
                        Hi, Jaume L.
                    </h1>
                </div>

                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#8E8E93', // Placeholder gray
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    {/* Use specific image if available, else placeholder icon */}
                    {/* <img src="..." alt="Profile" /> */}
                </div>
            </div>
        </header>
    );
};

export default Header;
