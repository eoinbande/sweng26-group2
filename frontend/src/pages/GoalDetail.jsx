import React from 'react';
import { 
    ArrowUpLeft, 
    Calendar, 
    Check, 
    CheckCheck, 
    Lock, 
    Clock, 
    HelpCircle 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/GoalDetail.css';

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Fallback if accessed directly without state, though usually passed from Goals
    const goalTitle = location.state?.goal?.title || "Master the piano";

    // Hardcoded tasks to match the design image exactly
    const tasks = [
        {
            id: 1,
            title: "Set overall budget",
            meta: "27 days left",
            status: "active",
            flag: { text: "1/3", color: "flag-green", bookmark: true }
        },
        {
            id: 2,
            title: "Book venue",
            meta: "17 days left",
            status: "active",
            flag: { text: "1", color: "flag-blue", icon: "?" }
        },
        {
            id: 3,
            title: "Choose caterer",
            meta: "26 Jan",
            status: "completed",
            flag: { text: "1", color: "flag-grey" }
        },
        {
            id: 4,
            title: "Finalize guest list",
            meta: "3 days left",
            status: "active",
            flag: { text: "1", color: "flag-blue", icon: "?" }
        },
        {
            id: 5,
            title: "Send save-the-dates",
            meta: "27 days left",
            error: 'Complete Task "Finalize guest list" before',
            status: "locked",
            flag: { text: "2", color: "flag-blue", icon: "?" }
        }
    ];

    return (
        <div className="goal-detail-page">
            <div className="goal-detail-container">
                {/* Header with Back Button */}
                <div className="goal-detail-back">
                    <button 
                        onClick={() => navigate(-1)}
                        className="back-button"
                    >
                        <ArrowUpLeft size={28} color="#D96C6C" strokeWidth={2.5} />
                    </button>
                </div>

                {/* Title Section */}
                <h1 className="goal-title">{goalTitle}</h1>

                {/* Progress Section */}
                <div className="detail-progress-track">
                    <div className="detail-progress-fill" style={{ width: '14%' }}></div>
                </div>
                <div className="goal-meta">
                    <span>14% complete</span>
                    <span className="tag-creative">Creative</span>
                </div>

                {/* Date Section */}
                <div className="goal-end-date">
                    <Calendar size={22} color="#1A1A1A" />
                    <span>Goal ends: 27 Jan</span>
                </div>

                {/* Timeline Tasks */}
                <div className="timeline-wrapper">
                    {tasks.map((task, index) => (
                        <div key={task.id} className={`task-item ${index % 2 !== 0 ? 'task-item--offset' : ''}`}>
                            {/* Connector line to next task */}
                            {index < tasks.length - 1 && (
                                <div className={`timeline-connector ${index % 2 === 0 ? 'connector-right' : 'connector-left'}`}></div>
                            )}
                            
                            {/* Left Status Icon */}
                            <StatusIcon status={task.status} />

                            {/* Card Content */}
                            <div className={`task-card ${task.status === 'locked' ? 'task-card--locked' : ''}`}>
                                <h4 className={task.status === 'completed' ? 'strikethrough-text' : ''}>
                                    {task.title}
                                </h4>
                                
                                <p className={task.status === 'completed' ? 'strikethrough-text meta-text' : 'meta-text'}>
                                    <Clock size={12} style={{ marginRight: 4 }} />
                                    {task.meta}
                                </p>
                                
                                {task.error && (
                                    <p className="error-text">{task.error}</p>
                                )}

                                {/* Right Flag */}
                                {task.flag.bookmark ? (
                                    <div className="task-bookmark">
                                        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                                            <path d="M0 0H36V38L18 30L0 38V0Z" fill="#7AD37F"/>
                                        </svg>
                                        <span className="bookmark-text">{task.flag.text}</span>
                                    </div>
                                ) : (
                                    <div className={`task-flag ${task.flag.color}`}>
                                        <span>{task.flag.text}</span>
                                        {task.flag.icon && (
                                            <HelpCircle size={14} strokeWidth={3} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fab-container">
                <button className="btn-primary-yellow">Add Task</button>
                <button className="btn-secondary-pink">Reroute Plan</button>
            </div>

            <BottomNav />
        </div>
    );
};

// Helper Component for the Left Icons
const StatusIcon = ({ status }) => {
    if (status === 'locked') {
        return (
            <div className="status-icon-wrapper status-red">
                <Lock size={18} fill="white" strokeWidth={2.5} />
            </div>
        );
    }
    
    if (status === 'completed') {
        return (
            <div className="status-icon-wrapper status-grey">
                <CheckCheck size={20} color="#C7C7CC" />
            </div>
        );
    }

    // Default active (Yellow)
    return (
        <div className="status-icon-wrapper status-yellow">
            <Check size={22} strokeWidth={3} />
        </div>
    );
};

export default GoalDetail;