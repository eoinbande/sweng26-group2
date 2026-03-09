import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../index.css';

const Profile = () => {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error.message);
            // Even if error, might want to redirect
            navigate('/login');
        }
    };

    return (
        <div className="profile-page" style={{
            maxWidth: '480px',
            margin: '0 auto',
            minHeight: '100dvh', // Changed from height: 100% to minHeight: 100dvh
            backgroundColor: 'var(--bg-color)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative' // relative ensures Profile header stays in place
        }}>
            <div className="profile-container" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '0 var(--space-lg)',
                paddingBottom: '120px' // Space for bottom nav
            }}>
                <PageHeader title="Your Account" accentColor="var(--accent-red)" />
                
                <div style={{
                    flex: 1,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                }}>
                    <button 
                        onClick={handleSignOut}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            padding: 'var(--space-md) var(--space-xl)',
                            backgroundColor: 'var(--primary)', // Using blue as primary action
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
            
            <BottomNav />
        </div>
    );
};

export default Profile;
