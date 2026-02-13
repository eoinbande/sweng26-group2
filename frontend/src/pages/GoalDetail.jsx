import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import GoalDetailHeader from '../components/GoalDetailHeader';
import TaskTimeline from '../components/TaskTimeline';
import '../styles/GoalDetail.css';

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goalTitle = location.state?.goal?.title || "Master the piano";
    const goalId = location.state?.goal?.id || null;

    /* mock data */
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

    /* rstore tasks from location.state if returning from feedback page */
    const [tasks, setTasks] = useState(location.state?.tasks || defaultTasks);

    /* derived helpers */
    const isTaskComplete = (task) =>
        task.subtasks.length > 0 && task.subtasks.every(s => s.completed);

    const getTaskStatus = (taskIndex) => {
        const task = tasks[taskIndex];
        if (isTaskComplete(task)) return 'completed';
        if (taskIndex === 0) return 'active';
        const allPreviousDone = tasks.slice(0, taskIndex).every(t => isTaskComplete(t));
        return allPreviousDone ? 'active' : 'locked';
    };

    /* toggle a subtask */
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

    /* toggle a whole task (complete all subtasks or un-complete) */
    const toggleTask = (taskIndex) => {
        const status = getTaskStatus(taskIndex);
        if (status === 'locked') return;

        if (isTaskComplete(tasks[taskIndex])) {
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
        } else {
            /* complete:mark ALL subtasks as done */
            setTasks(prev => prev.map((t, i) => {
                if (i !== taskIndex) return t;
                return {
                    ...t,
                    subtasks: t.subtasks.map(s => ({ ...s, completed: true }))
                };
            }));
        }
    };

    /* progress */
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => isTaskComplete(t)).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="goal-detail-page">
            <div className="goal-detail-container">
                <GoalDetailHeader
                    title={goalTitle}
                    progress={progress}
                    category="Event"
                    endDate="27 Jan"
                    onBack={() => navigate('/goals', {
                        state: {
                            updatedGoalId: goalId,
                            updatedProgress: progress,
                        }
                    })}
                />

                <TaskTimeline
                    tasks={tasks}
                    getTaskStatus={getTaskStatus}
                    isTaskComplete={isTaskComplete}
                    toggleTask={toggleTask}
                    toggleSubtask={toggleSubtask}
                />
            </div>

            {/* Floating Action Button */}
            <div className="fab-container">
                <button className="btn-update-plan">
                    Update Plan
                </button>
            </div>

            <BottomNav />
        </div>
    );
};

export default GoalDetail;
