import React from 'react';
import PageHeader from '../components/PageHeader';
import MonthCalendar from '../components/MonthCalendar';
import UpcomingTimeline from '../components/UpcomingTimeline';
import BottomNav from '../components/BottomNav';
import '../styles/ScheduledTasks.css';
import '../index.css';

// mock goal ranges for calendar highlights
const MOCK_GOAL_RANGES = [
    { startDay: 26, endDay: 28, colorScheme: 'blue' },
    { startDay: 29, endDay: 30, colorScheme: 'green' },
    { startDay: 28, endDay: 28, colorScheme: 'pink' },
];

// mock upcoming goals
const MOCK_GOALS = [
    { id: 'g1', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g4', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
];

// mock upcoming tasks
const MOCK_TASKS = [
    { id: 't1', title: 'Set overall budget', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27', locked: true },
    { id: 't3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't4', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
];

function ScheduledTasks() {
    const now = new Date();

    return (
        <div className="scheduled-tasks-page">
            <div className="scheduled-tasks-container">
                <div className="scheduled-tasks-padded">
                    <PageHeader title="February" />
                    <MonthCalendar
                        year={now.getFullYear()}
                        month={now.getMonth()}
                        goalRanges={MOCK_GOAL_RANGES}
                    />
                </div>
                {/* <UpcomingTimeline variant="goals" items={MOCK_GOALS} /> */}
                <UpcomingTimeline variant="tasks" items={MOCK_TASKS} />
            </div>

            <BottomNav />
        </div>
    );
}

export default ScheduledTasks;
