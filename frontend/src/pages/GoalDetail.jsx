import React, { useState, useMemo } from 'react';
import { 
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

/* Small red pennant / flag icon */
const FlagIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="8" y1="6" x2="8" y2="36" stroke="#D96C6C" strokeWidth="3" strokeLinecap="round"/>
        <path d="M10 7L32 13L10 21Z" fill="#D96C6C"/>
    </svg>
);

/* Determine progress bar colour from palette */
const getProgressColor = (pct) => {
    if (pct === 100) return '#69995D';   // --accent-green
    if (pct >= 68)   return '#BFD1E5';   // --accent-blue
    if (pct >= 34)   return '#FFB92E';   // --primary (yellow)
    return '#DD645F';                     // --accent-red-soft
};

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goalTitle = location.state?.goal?.title || "Master the piano";

    /* ---- initial task / subtask data ---- */
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "Set overall budget",
            meta: "27 days left",
            status: "active",
            type: "task",           // parent task
            subtasks: [
                { id: "1a", title: "Research costs",   completed: true  },
                { id: "1b", title: "Draft spreadsheet", completed: false },
                { id: "1c", title: "Get approval",      completed: false }
            ]
        },
        {
            id: 2,
            title: "Book venue",
            meta: "17 days left",
            status: "active",
            type: "subtask",
            flag: { text: "1", color: "flag-blue", icon: "?" }
        },
        {
            id: 3,
            title: "Choose caterer",
            meta: "26 Jan",
            status: "completed",
            type: "subtask",
            flag: { text: "1", color: "flag-grey" }
        },
        {
            id: 4,
            title: "Finalize guest list",
            meta: "3 days left",
            status: "active",
            type: "subtask",
            flag: { text: "1", color: "flag-blue", icon: "?" }
        },
        {
            id: 5,
            title: "Send save-the-dates",
            meta: "27 days left",
            dependency: 4,                                       // depends on task 4
            error: 'Complete Task "Finalize guest list" before',
            status: "locked",
            type: "subtask",
            flag: { text: "2", color: "flag-blue", icon: "?" }
        }
    ]);

    /* ---- toggle a task between active ↔ completed ---- */
    const toggleTask = (taskId) => {
        setTasks(prev => {
            const updated = prev.map(t => {
                if (t.id !== taskId) return t;
                if (t.status === 'locked') return t;           // can't toggle locked
                const newStatus = t.status === 'completed' ? 'active' : 'completed';
                return { ...t, status: newStatus };
            });

            // Unlock dependents whose dependency is now completed
            return updated.map(t => {
                if (t.status !== 'locked' || !t.dependency) return t;
                const dep = updated.find(d => d.id === t.dependency);
                if (dep && dep.status === 'completed') {
                    return { ...t, status: 'active', error: undefined };
                }
                return t;
            });
        });
    };

    /* ---- computed progress ---- */
    const completableCount = tasks.filter(t => t.status !== 'locked').length;
    const completedCount   = tasks.filter(t => t.status === 'completed').length;
    const progress         = completableCount > 0
        ? Math.round((completedCount / tasks.length) * 100)
        : 0;
    const progressColor    = getProgressColor(progress);

    /* ---- build bookmark text for parent tasks with subtasks ---- */
    const getBookmarkInfo = (task) => {
        if (!task.subtasks) return null;
        const done  = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        return { text: `${done}/${total}`, color: done === total ? 'flag-green' : 'flag-green' };
    };

    return (
        <div className="goal-detail-page">
            <div className="goal-detail-container">
                {/* Title Section with flag icon */}
                <div className="goal-header-row">
                    <FlagIcon />
                    <h1 className="goal-title">{goalTitle}</h1>
                </div>

                {/* Progress Section — responsive colour & width */}
                <div className="detail-progress-track">
                    <div
                        className="detail-progress-fill"
                        style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    />
                </div>
                <div className="goal-meta">
                    <span>{progress}% complete</span>
                    <span className="tag-creative">Creative</span>
                </div>

                {/* Date Section */}
                <div className="goal-end-date">
                    <Calendar size={22} color="#1A1A1A" />
                    <span>Goal ends: 27 Jan</span>
                </div>

                {/* Timeline Tasks */}
                <div className="timeline-wrapper">
                    {tasks.map((task, index) => {
                        const isSubtask = task.type === 'subtask';
                        const bookmark  = getBookmarkInfo(task);

                        return (
                            <div
                                key={task.id}
                                className={`task-item ${index % 2 !== 0 ? 'task-item--offset' : ''}`}
                            >
                                {/* Connector line to next task */}
                                {index < tasks.length - 1 && (
                                    <div className={`timeline-connector ${index % 2 === 0 ? 'connector-right' : 'connector-left'}`} />
                                )}

                                {/* Left Status Icon (clickable for active/completed) */}
                                <StatusIcon
                                    status={task.status}
                                    onClick={() => toggleTask(task.id)}
                                />

                                {/* Card Content — subtasks get a narrower card */}
                                <div className={`task-card ${task.status === 'locked' ? 'task-card--locked' : ''} ${isSubtask ? 'task-card--subtask' : ''}`}>
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

                                    {/* Right side: bookmark (parent) or flag (subtask) */}
                                    {bookmark ? (
                                        <div className="task-bookmark">
                                            <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                                                <path d="M0 0H36V38L18 30L0 38V0Z" fill="#7AD37F"/>
                                            </svg>
                                            <span className="bookmark-text">{bookmark.text}</span>
                                        </div>
                                    ) : task.flag ? (
                                        <div className={`task-flag ${task.flag.color}`}>
                                            <span>{task.flag.text}</span>
                                            {task.flag.icon && (
                                                <HelpCircle size={14} strokeWidth={3} />
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fab-container">
                <button className="btn-add-task">Add Task</button>
                <button className="btn-reroute">Reroute Plan</button>
            </div>

            <BottomNav />
        </div>
    );
};

/* ---- Helper: left-side status circle ---- */
const StatusIcon = ({ status, onClick }) => {
    const clickable = status === 'active' || status === 'completed';

    if (status === 'locked') {
        return (
            <div className="status-icon-wrapper status-red">
                <Lock size={18} fill="white" strokeWidth={2.5} />
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div
                className="status-icon-wrapper status-yellow status-icon--clickable"
                onClick={onClick}
                role="button"
                tabIndex={0}
                aria-label="Mark as incomplete"
            >
                <Check size={22} strokeWidth={3} />
            </div>
        );
    }

    /* active — empty circle, no tick */
    return (
        <div
            className="status-icon-wrapper status-empty status-icon--clickable"
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label="Mark as complete"
        />
    );
};

export default GoalDetail;