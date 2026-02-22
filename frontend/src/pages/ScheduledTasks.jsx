import React from 'react';
import BottomNav from '../components/BottomNav';
import '../index.css';

function ScheduledTasks() {

    return (
        <div style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: 'var(--bg-color)',
        }}>
            <h1>Scheduled Tasks</h1>

            <BottomNav />
        </div>
    );
}

export default ScheduledTasks;
