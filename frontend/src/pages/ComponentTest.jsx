import React from 'react';
import FeedbackPopUp from '../components/FeedbackPopUp';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function ComponentTest() {

    return (
        <div className="container" style={{ position: 'relative', backgroundColor: 'var(--bg-color)', padding: 0 }}>
            <h2>Component Test Page</h2>
            <FeedbackPopUp variant="help" onClose={() => { }} onSubmit={(feedback) => console.log('Help Feedback:', feedback)} />
            <FeedbackPopUp variant="reroute" onClose={() => { }} onSubmit={(feedback) => console.log('Reroute Feedback:', feedback)} />
        </div>
    )
}


export default ComponentTest;
