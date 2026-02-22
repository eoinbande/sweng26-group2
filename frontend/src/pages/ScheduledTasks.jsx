import React from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../styles/ScheduledTasks.css';
import '../index.css';

function ScheduledTasks() {

    return (
        <div className="scheduled-tasks-page">
            <div className="scheduled-tasks-container">
                <PageHeader title="February" />
            </div>

            <BottomNav />
        </div>
    );
}

export default ScheduledTasks;
