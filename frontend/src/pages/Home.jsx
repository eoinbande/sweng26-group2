import React, { useState, useEffect } from 'react';

import Header from '../components/Header';
import CalendarStrip from '../components/CalendarStrip';
import CreateGoalCard from '../components/CreateGoalCard';
import UpcomingTasks from '../components/UpcomingTasks';
import GoalsGrid from '../components/GoalsGrid';
import BottomNav from '../components/BottomNav';

import Loading from '../components/Loading';
import { supabase } from '../supabase_client';

import '../styles/Home.css';
import '../index.css';

function Home() {
    
    const [userName, setUserName] = useState('Guest');
    const [isAppReady, setIsAppReady] = useState(false);

    // once the UI is rendered get the progile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;

                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('name')
                        .eq('id', user.id)
                        .single();

                    setUserName(profile?.name || user.email.split('@')[0]);
                }
            } catch (e) {
                console.error("Error loading profile", e);
            }
        };

        fetchProfile();
    }, []);

    // called by Loading.jsx after 2 sec. which will update our state
    const handleLoadingComplete = () => {
        setIsAppReady(true);
    };

    if (!isAppReady) {
        return <Loading onLoadingComplete={handleLoadingComplete} />;
    }

    return (
        <div className="home-page">
            {/* pass the name to the Header as a prop */}
            <Header userName={userName} />
            <CalendarStrip />
            <CreateGoalCard />
            <UpcomingTasks />
            <GoalsGrid />
            <BottomNav />
        </div>
    );
}

export default Home;