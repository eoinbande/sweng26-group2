import React from 'react';
import Header from '../components/Header';
import CalendarStrip from '../components/CalendarStrip';
import CreateGoalCard from '../components/CreateGoalCard';
import UpcomingTasks from '../components/UpcomingTasks';
import GoalsGrid from '../components/GoalsGrid';
import BottomNav from '../components/BottomNav';
import '../index.css';

function Home() {
    return (
        <div className="container">
            <Header />
            <CalendarStrip />
            <CreateGoalCard />
            <UpcomingTasks />
            <GoalsGrid />
            <BottomNav />
        </div>
    );
}

export default Home;
