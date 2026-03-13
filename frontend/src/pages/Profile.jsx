import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import AccountCard from '../components/AccountCard';
import AnalyticsSection from '../components/AnalyticsSection';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;

                if (user) {
                    setEmail(user.email);

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name')
                        .eq('id', user.id)
                        .single();

                    setUsername(profile?.name || user.email.split('@')[0]);
                }
            } catch (e) {
                console.error('Error loading profile', e);
            }
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error.message);
            navigate('/login');
        }
    };

    return (
        <div className="profile-page">
            <ProfileHeader />

            <AccountCard
                username={username}
                email={email}
                streakDays={217}
                onEdit={() => {}}
                onSignOut={handleSignOut}
            />

            <AnalyticsSection
                tasksCompleted={28}
                goalsCompleted={28}
                onTimeTasks={13}
                onTimeGoals={13}
            />

            <BottomNav />
        </div>
    );
};

export default Profile;
