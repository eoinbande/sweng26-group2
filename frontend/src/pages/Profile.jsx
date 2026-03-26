import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import AccountCard from '../components/AccountCard';
import AnalyticsSection from '../components/AnalyticsSection';
import BottomNav from '../components/BottomNav';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../supabase_client';
import { Check } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { user, userName, userEmail, updateUserName } = useUser();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#ffdbda';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const [streakDays, setStreakDays] = useState(0);
    const [tasksCompleted, setTasksCompleted] = useState(0);
    const [onTimeTasks, setOnTimeTasks] = useState(0);
    const [goalsCompleted, setGoalsCompleted] = useState(0);
    const [onTimeGoals, setOnTimeGoals] = useState(0);
    const [profileLoaded, setProfileLoaded] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pinkHeight, setPinkHeight] = useState(0);
    const topSectionRef = useRef(null);
    const cardRef = useRef(null);

    // measure pink bg height: from top of section to vertical center of account card
    const measurePink = useCallback(() => {
        if (topSectionRef.current && cardRef.current) {
            const sectionTop = topSectionRef.current.getBoundingClientRect().top;
            const cardRect = cardRef.current.getBoundingClientRect();
            const cardMid = cardRect.top + cardRect.height / 2;
            setPinkHeight(cardMid - sectionTop);
        }
    }, []);

    useEffect(() => {
        measurePink();
        window.addEventListener('resize', measurePink);
        return () => window.removeEventListener('resize', measurePink);
    }, [measurePink, userName, profileLoaded]);

    // fetch analytics data only (user profile comes from context)
    useEffect(() => {
        if (!user) return;
        const fetchAnalytics = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;
                // fetch sequentially to avoid flooding supabase connections
                const streakRes = await fetch(`${baseUrl}/profile/${user.id}/streak`);
                if (streakRes.ok) setStreakDays((await streakRes.json()).current_streak ?? 0);

                const tasksRes = await fetch(`${baseUrl}/profile/${user.id}/tasks-completed`);
                if (tasksRes.ok) setTasksCompleted((await tasksRes.json()).tasks_completed ?? 0);

                const tasksOnTimeRes = await fetch(`${baseUrl}/profile/${user.id}/tasks-completed-on-time`);
                if (tasksOnTimeRes.ok) setOnTimeTasks((await tasksOnTimeRes.json()).tasks_completed_on_time ?? 0);

                const goalsRes = await fetch(`${baseUrl}/profile/${user.id}/goals-completed`);
                if (goalsRes.ok) setGoalsCompleted((await goalsRes.json()).goals_completed ?? 0);

                const goalsOnTimeRes = await fetch(`${baseUrl}/profile/${user.id}/goals-completed-on-time`);
                if (goalsOnTimeRes.ok) setOnTimeGoals((await goalsOnTimeRes.json()).goals_completed_on_time ?? 0);
            } catch (e) {
                console.error('Error loading analytics', e);
            } finally {
                setProfileLoaded(true);
            }
        };

        fetchAnalytics();
    }, [user]);

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
        if (!user) return;

        try {
            if (newName && newName !== userName) {
                const { error } = await supabase
                    .from('profiles')
                    .update({ name: newName })
                    .eq('id', user.id);

                if (error) throw error;
                updateUserName(newName);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. ' + error.message);
        }
    };

    return (
        <div className="profile-page">
            {showSuccess && (
                <>
                    <div className="success-overlay"></div>
                    <div className="success-popup">
                        <div className="success-icon-circle">
                            <Check size={32} strokeWidth={3} />
                        </div>
                        <span className="success-message">Username updated!</span>
                    </div>
                </>
            )}

            <div className="profile-page-content">
              <div className="profile-content-bg">
                <div className="profile-top-section" ref={topSectionRef}>
                    <div
                        className="profile-pink-bg"
                        style={{ height: pinkHeight || 'auto' }}
                    />
                    <ProfileHeader />

                    <div ref={cardRef}>
                        <AccountCard
                            username={userName}
                            email={userEmail}
                            streakDays={streakDays}
                            onUpdateProfile={handleUpdateProfile}
                            onSignOut={handleSignOut}
                        />
                    </div>
                </div>

                <AnalyticsSection
                    tasksCompleted={tasksCompleted}
                    goalsCompleted={goalsCompleted}
                    onTimeTasks={onTimeTasks}
                    onTimeGoals={onTimeGoals}
                    loaded={profileLoaded}
                />
              </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default Profile;
