import React, { useState, useMemo } from 'react';
import { 
    Calendar, 
    Check, 
    CheckCheck, 
    Lock, 
    Clock, 
    HelpCircle,
    ArrowUpLeft 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/GoalDetail.css';

/* Determine progress bar colour from palette */
const getProgressColor = (pct) => {
    if (pct === 100) return '#69995D';   // --accent-green
    if (pct >= 68)   return '#5681b3';   // --accent-blue
    if (pct >= 34)   return '#FFB92E';   // --primary (yellow)
    return '#DD645F';                     // --accent-red-soft
};

/* Calculate "X days left" or "overdue" from a target date */
const getDaysLeftText = (dateStr) => {
    if (!dateStr) return '';
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffMs = target - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
};

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goalTitle = location.state?.goal?.title || "Master the piano";

    /* Default task data — used on first visit */
    const defaultTasks = [
        {
            id: 1,
            title: "Set overall budget",
            dueDate: "2026-03-09",
            subtasks: [
                { id: "1a", title: "Research costs",    dueDate: "2026-02-20", completed: true  },
                { id: "1b", title: "Draft spreadsheet", dueDate: "2026-02-28", completed: false },
                { id: "1c", title: "Get approval",      dueDate: "2026-03-05", completed: false }
            ]
        },
        {
            id: 2,
            title: "Book venue",
            dueDate: "2026-02-27",
            subtasks: [
                { id: "2a", title: "Shortlist venues",  dueDate: "2026-02-15", completed: false },
                { id: "2b", title: "Visit & compare",   dueDate: "2026-02-20", completed: false },
                { id: "2c", title: "Sign contract",     dueDate: "2026-02-25", completed: false }
            ]
        },
        {
            id: 3,
            title: "Choose caterer",
            dueDate: "2026-03-15",
            subtasks: [
                { id: "3a", title: "Get quotes",        dueDate: "2026-03-05", completed: false },
                { id: "3b", title: "Taste test",        dueDate: "2026-03-12", completed: false }
            ]
        },
        {
            id: 4,
            title: "Finalize guest list",
            dueDate: "2026-02-13",
            subtasks: [
                { id: "4a", title: "Collect RSVPs",     dueDate: "2026-02-10", completed: false },
                { id: "4b", title: "Confirm numbers",   dueDate: "2026-02-11", completed: false },
                { id: "4c", title: "Assign tables",     dueDate: "2026-02-12", completed: false }
            ]
        },
        {
            id: 5,
            title: "Send save-the-dates",
            dueDate: "2026-03-09",
            subtasks: [
                { id: "5a", title: "Design template",   dueDate: "2026-03-01", completed: false },
                { id: "5b", title: "Send digitally",    dueDate: "2026-03-07", completed: false }
            ]
        }
    ];

    /* Restore tasks from location.state if returning from feedback page, otherwise use defaults */
    const [tasks, setTasks] = useState(location.state?.tasks || defaultTasks);

    /* ---- Derived: is each task complete? (all subtasks done) ---- */
    const isTaskComplete = (task) =>
        task.subtasks.length > 0 && task.subtasks.every(s => s.completed);

    /* ---- Derived: task status based on chronological order ---- */
    const getTaskStatus = (taskIndex) => {
        const task = tasks[taskIndex];
        if (isTaskComplete(task)) return 'completed';
        // First task is always active
        if (taskIndex === 0) return 'active';
        // A task is active only if all previous tasks are completed
        const allPreviousDone = tasks.slice(0, taskIndex).every(t => isTaskComplete(t));
        return allPreviousDone ? 'active' : 'locked';
    };

    /* ---- Toggle a subtask ---- */
    const toggleSubtask = (taskId, subtaskId) => {
        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;
            return {
                ...task,
                subtasks: task.subtasks.map(s =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                )
            };
        }));
    };

    /* ---- Toggle a whole task (only if all subtasks are done, acts as final confirm) ---- */
    const toggleTask = (taskIndex) => {
        const status = getTaskStatus(taskIndex);
        if (status === 'locked') return;
        const task = tasks[taskIndex];
        const allSubsDone = task.subtasks.every(s => s.completed);
        // If all subtasks done, allow un-completing by un-checking all subtasks
        if (isTaskComplete(task)) {
            // Un-complete: reset last subtask
            setTasks(prev => prev.map((t, i) => {
                if (i !== taskIndex) return t;
                return {
                    ...t,
                    subtasks: t.subtasks.map((s, si) =>
                        si === t.subtasks.length - 1 ? { ...s, completed: false } : s
                    )
                };
            }));
            return;
        }
        // If not all subtasks done, don't allow direct task completion
        // (user must complete subtasks first — no-op)
    };

    /* ---- Progress: based on tasks completed, NOT subtasks ---- */
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => isTaskComplete(t)).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const progressColor = getProgressColor(progress);

    /* ---- Bookmark info: shows subtask progress e.g. "1/3" ---- */
    const getBookmarkInfo = (task) => {
        const done  = task.subtasks.filter(s => s.completed).length;
        const total = task.subtasks.length;
        const color = done === total ? 'flag-green' : 'flag-blue';
        return { text: `${done}/${total}`, color };
    };

    return (
        <div className="goal-detail-page">
            <div className="goal-detail-container">
                {/* Back arrow + Title */}
                <div className="goal-header-row">
                    <button
                        className="back-arrow-btn"
                        onClick={() => navigate('/goals')}
                        aria-label="Back to goals"
                    >
                        <ArrowUpLeft size={28} strokeWidth={2.5} />
                    </button>
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
                        const status   = getTaskStatus(index);
                        const bookmark = getBookmarkInfo(task);
                        const allSubsDone = task.subtasks.every(s => s.completed);
                        const daysLeft = getDaysLeftText(task.dueDate);

                        // Find which previous task is blocking this one
                        let lockMessage = '';
                        if (status === 'locked') {
                            // Find the first incomplete predecessor
                            for (let i = index - 1; i >= 0; i--) {
                                if (!isTaskComplete(tasks[i])) {
                                    lockMessage = `Complete "${tasks[i].title}" first`;
                                    break;
                                }
                            }
                        }

                        return (
                            <div
                                key={task.id}
                                className="task-item"
                            >
                                {/* Connector line to next task */}
                                {index < tasks.length - 1 && (
                                    <div className="timeline-connector connector-straight" />
                                )}

                                {/* Left Status Icon */}
                                <StatusIcon
                                    status={status}
                                    allSubsDone={allSubsDone}
                                    onClick={() => toggleTask(index)}
                                />

                                {/* Card Content — ALL cards are the same width */}
                                <div className={`task-card ${status === 'locked' ? 'task-card--locked' : ''}`}>
                                    <h4 className={status === 'completed' ? 'strikethrough-text' : ''}>
                                        {task.title}
                                    </h4>

                                    <p className={status === 'completed' ? 'strikethrough-text meta-text' : 'meta-text'}>
                                        <Clock size={12} style={{ marginRight: 4 }} />
                                        {daysLeft}
                                    </p>

                                    {lockMessage && (
                                        <p className="error-text">{lockMessage}</p>
                                    )}

                                    {/* Subtasks (shown when task is active) */}
                                    {status === 'active' && task.subtasks.length > 0 && (
                                        <div className="subtask-list">
                                            {task.subtasks.map(sub => (
                                                <div
                                                    key={sub.id}
                                                    className={`subtask-row ${sub.completed ? 'subtask-row--done' : ''}`}
                                                >
                                                    <div
                                                        className={`subtask-check ${sub.completed ? 'subtask-check--done' : ''}`}
                                                        onClick={() => toggleSubtask(task.id, sub.id)}
                                                    >
                                                        {sub.completed && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <div className="subtask-content" onClick={() => toggleSubtask(task.id, sub.id)}>
                                                        <span className={sub.completed ? 'strikethrough-text' : ''}>
                                                            {sub.title}
                                                        </span>
                                                        <span className="subtask-date">
                                                            <Clock size={10} style={{ marginRight: 2 }} />
                                                            {getDaysLeftText(sub.dueDate)}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="subtask-help-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/feedback', {
                                                                state: {
                                                                    subtask: sub,
                                                                    taskTitle: task.title,
                                                                    // Pass current state so we can restore it on return
                                                                    returnTo: location.pathname,
                                                                    tasks: tasks,
                                                                    goal: { title: goalTitle },
                                                                }
                                                            });
                                                        }}
                                                        aria-label="Get help with this subtask"
                                                    >
                                                        <HelpCircle size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bookmark showing subtask progress */}
                                    <div className="task-bookmark">
                                        <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                                            <path
                                                d="M0 0H36V38L18 30L0 38V0Z"
                                                fill={bookmark.color === 'flag-green' ? '#7AD37F' : '#AECBFA'}
                                            />
                                        </svg>
                                        <span className="bookmark-text">{bookmark.text}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fab-container">
                <button className="btn-update-plan">Update Plan</button>
            </div>

            <BottomNav />
        </div>
    );
};

/* ---- Helper: left-side status circle ---- */
const StatusIcon = ({ status, allSubsDone, onClick }) => {
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

    /* active — if all subtasks done, show ready-to-complete style, else empty */
    if (allSubsDone) {
        return (
            <div
                className="status-icon-wrapper status-ready status-icon--clickable"
                onClick={onClick}
                role="button"
                tabIndex={0}
                aria-label="All subtasks done — mark as complete"
            >
                <CheckCheck size={20} strokeWidth={2.5} />
            </div>
        );
    }

    return (
        <div
            className="status-icon-wrapper status-empty"
            title="Complete all subtasks first"
        />
    );
};

export default GoalDetail;