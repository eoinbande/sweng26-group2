import React, { useEffect } from 'react';

import Header from '../components/Header';
import CalendarStrip from '../components/CalendarStrip';
import CreateGoalCard from '../components/CreateGoalCard';
import UpcomingTasks from '../components/UpcomingTasks';
import GoalsGrid from '../components/GoalsGrid';
import BottomNav from '../components/BottomNav';
import { useUser } from '../contexts/UserContext';

import '../styles/Home.css';
import '../index.css';

function Home() {
    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#F8F8F4';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const { userName } = useUser();

    return (
        <div className="home-page">
            <Header userName={userName || 'Guest'} />
            <CalendarStrip />
            <CreateGoalCard />
            <UpcomingTasks />
            <GoalsGrid />
            <BottomNav />
        </div>
    );
}

export default Home;