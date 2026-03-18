import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import AccountCard from '../components/AccountCard';
import AnalyticsSection from '../components/AnalyticsSection';
import BottomNav from '../components/BottomNav';
import Loading from '../components/Loading';
import { supabase } from '../supabase_client';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [streakDays, setStreakDays] = useState(0);
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [onTimeTasks, setOnTimeTasks] = useState(0);
    const [goalsCompleted, setGoalsCompleted] = useState(0);
    const [onTimeGoals, setOnTimeGoals] = useState(0);
    const [profileLoaded, setProfileLoaded] = useState(false);

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

                    const baseUrl = import.meta.env.VITE_API_URL;
                    const [streakRes, tasksRes, tasksOnTimeRes, goalsRes, goalsOnTimeRes] = await Promise.all([
                        fetch(`${baseUrl}/profile/${user.id}/streak`, { cache: 'no-store' }),
                        fetch(`${baseUrl}/profile/${user.id}/tasks-completed`, { cache: 'no-store' }),
                        fetch(`${baseUrl}/profile/${user.id}/tasks-completed-on-time`, { cache: 'no-store' }),
                        fetch(`${baseUrl}/profile/${user.id}/goals-completed`, { cache: 'no-store' }),
                        fetch(`${baseUrl}/profile/${user.id}/goals-completed-on-time`, { cache: 'no-store' }),
                    ]);

                    const [streakData, tasksData, tasksOnTimeData, goalsData, goalsOnTimeData] = await Promise.all([
                        streakRes.ok ? streakRes.json() : Promise.resolve({}),
                        tasksRes.ok ? tasksRes.json() : Promise.resolve({}),
                        tasksOnTimeRes.ok ? tasksOnTimeRes.json() : Promise.resolve({}),
                        goalsRes.ok ? goalsRes.json() : Promise.resolve({}),
                        goalsOnTimeRes.ok ? goalsOnTimeRes.json() : Promise.resolve({}),
                    ]);

                    setStreakDays(streakData.current_streak ?? 0);
                    setTasksCompleted(tasksData.tasks_completed ?? 0);
                    setOnTimeTasks(tasksOnTimeData.tasks_completed_on_time ?? 0);
                    setGoalsCompleted(goalsData.goals_completed ?? 0);
                    setOnTimeGoals(goalsOnTimeData.goals_completed_on_time ?? 0);
                }
            } catch (e) {
                console.error('Error loading profile', e);
            } finally {
                setProfileLoaded(true);
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

    const handleUpdateProfile = async (newName) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const trimmedName = newName ? newName.trim() : newName;

        try {
            if (trimmedName && trimmedName !== username) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ name: trimmedName })
                    .eq('id', user.id);
                
                if (error) throw error;
                setUsername(trimmedName);
                alert('Username updated successfully!');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. ' + error.message);
        }
    };

    if (!profileLoaded) {
        return <Loading />;
    }

    return (
        <div className="profile-page">
            <ProfileHeader />

            <AccountCard
                username={username}
                email={email}
                streakDays={streakDays}
                onUpdateProfile={handleUpdateProfile}
                onSignOut={handleSignOut}
            />

            <AnalyticsSection
                tasksCompleted={tasksCompleted}
                goalsCompleted={goalsCompleted}
                onTimeTasks={onTimeTasks}
                onTimeGoals={onTimeGoals}
            />

            <BottomNav />
        </div>
    );
};

export default Profile;
