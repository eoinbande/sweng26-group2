import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import GoalDetailHeader from '../components/GoalDetailHeader';
import TaskTimeline from '../components/TaskTimeline';
import '../styles/GoalDetail.css';

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goalTitle = location.state?.goal?.title || location.state?.goalTitle || "Master the piano";
    const goalId = location.state?.goal?.id || location.state?.goalId || null;

    /* mock data (fallback) */
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
        // ... (truncated, but we rely on fetching now)
    ];

    /* rstore tasks from location.state if returning from feedback page */
    const [tasks, setTasks] = useState(location.state?.tasks || defaultTasks);
    const [endDate, setEndDate] = useState("27 Jan"); // Default / placeholder

    /* Fetch goal details from backend */
    useEffect(() => {
        if (!goalId) return;

        const fetchGoalDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/goal-details/${goalId}`);
                if (!response.ok) throw new Error('Failed to fetch details');
                const data = await response.json();
                
                // Set End Date if available
                if (data.goal && data.goal.goal_data && data.goal.goal_data.goal_due_date) {
                    setEndDate(data.goal.goal_data.goal_due_date);
                }

                // Transform backend tasks to frontend format
                const processTasks = (backendTasks) => {
                    return backendTasks.map(t => ({
                        ...t,
                        // Map description to title (as backend uses description for task name)
                        title: t.description || t.title, 
                        // Ensure dueDate is mapped (backend key is due_date usually)
                        dueDate: t.due_date || t.dueDate,
                        // Process subtasks: map status to completed boolean
                        subtasks: t.subtasks ? t.subtasks.map(s => ({
                           ...s,
                           title: s.description || s.title,
                           dueDate: s.due_date || s.dueDate,
                           completed: s.status === 'completed'
                        })) : [],
                        completed: t.status === 'completed'
                    }));
                };

                if (data.tasks && data.tasks.length > 0) {
                    setTasks(processTasks(data.tasks));
                }
            } catch (err) {
                console.error("Error loading goal details:", err);
            }
        };

        fetchGoalDetails();
    }, [goalId]);

    /* API Helper to update status */
    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            console.error("Failed to update task status:", e);
        }
    };

    /* derived helpers */
    const isTaskComplete = (task) => {
        if (task.subtasks && task.subtasks.length > 0) {
            return task.subtasks.every(s => s.completed);
        }
        return task.completed;
    };

    const getTaskStatus = (taskIndex) => {
        const task = tasks[taskIndex];
        if (isTaskComplete(task)) return 'completed';
        if (taskIndex === 0) return 'active';
        const allPreviousDone = tasks.slice(0, taskIndex).every(t => isTaskComplete(t));
        return allPreviousDone ? 'active' : 'locked';
    };

    /* toggle a subtask */
    const toggleSubtask = (taskId, subtaskId) => {
        let newStatus = 'not_started';
        
        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;
            return {
                ...task,
                subtasks: task.subtasks.map(s => {
                    if (s.id === subtaskId) {
                        const nextCompleted = !s.completed;
                        newStatus = nextCompleted ? 'completed' : 'not_started';
                        return { ...s, completed: nextCompleted };
                    }
                    return s;
                })
            };
        }));
        
        // Trigger API call
        updateTaskStatus(subtaskId, newStatus);
    };

    /* toggle a whole task (complete all subtasks or un-complete) */
    const toggleTask = (taskIndex) => {
        const status = getTaskStatus(taskIndex);
        if (status === 'locked') return;

        const task = tasks[taskIndex];
        const isComplete = isTaskComplete(task); /* currently complete? */
        
        if (isComplete) { // uncheck a completed task -> uncheck only the LAST subtask (go back one step)
            // so we call API for only last subtask
            
            const lastSubIndex = task.subtasks.length - 1;
            if (lastSubIndex >= 0) {
                const lastSubId = task.subtasks[lastSubIndex].id;
                
                setTasks(prev => prev.map((t, i) => {
                    if (i !== taskIndex) return t;
                    return {
                        ...t,
                        subtasks: t.subtasks.map((s, si) =>
                            si === lastSubIndex ? { ...s, completed: false } : s
                        )
                    };
                }));
                // Call API for the last subtask
                updateTaskStatus(lastSubId, 'not_started');
            } else {
                 // No subtasks case: uncheck the task itself
                 setTasks(prev => prev.map((t, i) => {
                    if (i !== taskIndex) return t;
                    return { ...t, completed: false, status: 'in_progress' };
                 }));
                 updateTaskStatus(task.id, 'not_started');
            }
        } else { // mark task as complete -> mark ALL subtasks as done
            setTasks(prev => prev.map((t, i) => {
                if (i !== taskIndex) return t;
                return {
                    ...t,
                    completed: true,
                    status: 'completed',
                    subtasks: t.subtasks.map(s => ({ ...s, completed: true }))
                };
            }));
            
            if (task.subtasks.length > 0) {
                // Call API for ALL subtasks
                task.subtasks.forEach(s => {
                    if (!s.completed) {
                        updateTaskStatus(s.id, 'completed');
                    }
                });
            } else {
                // Call API for task
                 updateTaskStatus(task.id, 'completed');
            }k.subtasks.forEach(s => {
                if (!s.completed) {
                     updateTaskStatus(s.id, 'completed');
                }
            });
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
                    endDate={endDate}
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
