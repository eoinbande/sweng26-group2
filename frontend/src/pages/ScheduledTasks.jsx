import React from 'react';
import PageHeader from '../components/PageHeader';
import MonthCalendar from '../components/MonthCalendar';
import BottomNav from '../components/BottomNav';
import '../styles/ScheduledTasks.css';
import '../index.css';

// mock goal ranges for calendar highlights
const MOCK_GOAL_RANGES = [
    { startDay: 26, endDay: 28, colorScheme: 'blue' },
    { startDay: 29, endDay: 30, colorScheme: 'green' },
    { startDay: 28, endDay: 28, colorScheme: 'pink' },
];

function ScheduledTasks() {
    const now = new Date();

    return (
        <div className="scheduled-tasks-page">
            <div className="scheduled-tasks-container">
                <PageHeader title="February" />
                <MonthCalendar
                    year={now.getFullYear()}
                    month={now.getMonth()}
                    goalRanges={MOCK_GOAL_RANGES}
                />
            </div>

            <BottomNav />
        </div>
    );
}

export default ScheduledTasks;
