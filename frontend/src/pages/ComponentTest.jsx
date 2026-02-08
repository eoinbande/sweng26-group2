import React from 'react';
import FeedbackPopUp from '../components/FeedbackPopUp';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function ComponentTest() {

    return (
        <div style={{ padding: 'var(--space-lg)' }}>
            <h2>Component Test Page</h2>
            <FeedbackPopUp variant="roadblock" onClose={() => { }} onSubmit={(feedback) => console.log('Roadblock Feedback:', feedback)} />
            <FeedbackPopUp variant="change" onClose={() => { }} onSubmit={(feedback) => console.log('Change Feedback:', feedback)} />
        </div>
    )
}


export default ComponentTest;
