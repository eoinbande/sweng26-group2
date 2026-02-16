import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react';
import '../styles/components/TaskTimeline.css';

const getDaysLeftText = (dateStr) => {
    if (!dateStr) return '';
    const target = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffMs = target - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0)  return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
};

const getBookmarkInfo = (task) => {
    // If no subtasks, track the task itself (0/1 or 1/1)
    if (!task.subtasks || task.subtasks.length === 0) {
        const isDone = task.status === 'completed' || task.completed;
        return { text: `${isDone ? 1 : 0}/1`, isComplete: isDone };
    }
    const done  = task.subtasks.filter(s => s.completed).length;
    const total = task.subtasks.length;
    return { text: `${done}/${total}`, isComplete: done === total };
};

// checkbox icon for task status(locked/active/completed)

const StatusIcon = ({ status, allSubsDone, onClick }) => {
    const [shaking, setShaking] = React.useState(false);

    const handleLockedClick = () => {
        setShaking(true);
        setTimeout(() => setShaking(false), 450);
    };

    if (status === 'locked') {
        return (
            <div
                className={`tl-status-icon tl-status-icon--locked ${shaking ? 'tl-shake' : ''}`}
                onClick={handleLockedClick}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7 10V7a5 5 0 0 1 10 0v3"
                        stroke="white" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" fill="none"
                    />
                    <rect x="5" y="10" width="14" height="11" rx="2.5" fill="white" />
                </svg>
            </div>
        );
    }

    if (status === 'completed') {
        return (
            <div
                className="tl-status-icon tl-status-icon--completed tl-status-icon--clickable"
                onClick={onClick}
                role="button" tabIndex={0}
                aria-label="Mark as incomplete"
            >
                <Check size={20} strokeWidth={3} />
            </div>
        );
    }

    // all subtasks done, mark task as complete
    if (allSubsDone) {
        return (
            <div
                className="tl-status-icon tl-status-icon--ready tl-status-icon--clickable"
                onClick={onClick}
                role="button" tabIndex={0}
                aria-label="All subtasks done — mark as complete"
            >
                <CheckCheck size={18} strokeWidth={2.5} />
            </div>
        );
    }

    // not all subtasks done- but user marks task as complete
    return (
        <div
            className="tl-status-icon tl-status-icon--active tl-status-icon--clickable"
            onClick={onClick}
            role="button" tabIndex={0}
            aria-label="Mark task as complete"
        />
    );
};

// main

/* render task timeline. for that we need:
 @param {Array}    tasks          – ordered task objects
 @param {Function} getTaskStatus  – (index) active/completed/locked
 @param {Function} isTaskComplete – (task)  -> boolean
 @param {Function} toggleTask     – (index) -> void
 @param {Function} toggleSubtask  -> (taskId, subtaskId) -> void
 */

const TaskTimeline = ({ tasks, getTaskStatus, isTaskComplete, toggleTask, toggleSubtask }) => {
    return (
        <div className="tl-wrapper">
            {tasks.map((task, index) => {
                const status    = getTaskStatus(index);
                const bookmark  = getBookmarkInfo(task);
                const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                // Only show double-check if there ARE subtasks and they are ALL done
                const allSubsDone = hasSubtasks && task.subtasks.every(s => s.completed);
                const daysLeft  = getDaysLeftText(task.dueDate);

                // message for locked tasks
                let lockMessage = '';
                if (status === 'locked') {
                    for (let i = index - 1; i >= 0; i--) {
                        if (!isTaskComplete(tasks[i])) {
                            lockMessage = `Complete task "${tasks[i].title}" first`;
                            break;
                        }
                    }
                }

                return (
                    <div key={task.id} className={`tl-item ${status === 'locked' ? 'tl-item--locked' : ''}`}>
                        {/* Connector line to next task */}
                        {index < tasks.length - 1 && (
                            <div className="tl-connector" />
                        )}

                        {/* Status circle */}
                        <StatusIcon
                            status={status}
                            allSubsDone={allSubsDone}
                            onClick={() => toggleTask(index)}
                        />

                        {/* task card */}
                        <div className={`tl-card ${status === 'locked' ? 'tl-card--locked' : ''} ${status === 'completed' ? 'tl-card--completed' : ''}`}>
                            {/* Bookmark ribbon — overflows the card */}
                            <div className="tl-bookmark">
                                <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                                    <path
                                        d="M0 8C0 3.58 3.58 0 8 0H28C32.42 0 36 3.58 36 8V38L18 30L0 38V8Z"
                                        fill={bookmark.isComplete ? 'var(--green-soft)' : 'var(--accent-blue)'}
                                    />
                                </svg>
                                <span className="tl-bookmark__text">{bookmark.text}</span>
                            </div>

                            <h4 className={status === 'completed' ? 'tl-strikethrough' : ''}>
                                {index + 1}. {task.title}
                            </h4>

                            <p className={`tl-meta ${status === 'completed' ? 'tl-strikethrough' : ''}`}>
                                <Clock size={12} />
                                {daysLeft}
                            </p>

                            {lockMessage && (
                                <p className="tl-lock-msg">{lockMessage}</p>
                            )}

                            {/* subtasks;only shown for ACTIVE tasks */}
                            {status === 'active' && task.subtasks.length > 0 && (
                                <div className="tl-subtask-list">
                                    {task.subtasks.map((sub, subIndex) => (
                                        <div
                                            key={sub.id}
                                            className={`tl-subtask ${sub.completed ? 'tl-subtask--done' : ''}`}
                                        >
                                            <div
                                                className={`tl-subtask__check ${sub.completed ? 'tl-subtask__check--done' : ''}`}
                                                onClick={() => toggleSubtask(task.id, sub.id)}
                                            >
                                                {sub.completed && <Check size={12} strokeWidth={3} />}
                                            </div>
                                            <div
                                                className="tl-subtask__content"
                                                onClick={() => toggleSubtask(task.id, sub.id)}
                                            >
                                                <span className={sub.completed ? 'tl-strikethrough' : ''}>
                                                    {sub.title}
                                                </span>
                                                <span className="tl-subtask__date">
                                                    <Clock size={10} />
                                                    {getDaysLeftText(sub.dueDate)}
                                                </span>
                                            </div>
                                            <span className="tl-subtask__number">
                                                {index + 1}.{subIndex + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default TaskTimeline;
