import React from 'react';
import { User } from 'lucide-react';
import '../index.css';

const Header = () => {
    return (
        <header style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-sm)' }}>
            <div className="flex-between">
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '40px',
                        fontWeight: '600',
                        marginBottom: '0'
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
