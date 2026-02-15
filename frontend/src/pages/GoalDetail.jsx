import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import GoalDetailHeader from '../components/GoalDetailHeader';
import TaskTimeline from '../components/TaskTimeline';
import Loading from '../components/Loading'; // Import Loading component if it exists
import '../styles/GoalDetail.css';

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Safely access location state
    // Use "Loading..." as default if we are loading, unless we want to show stale title?
    // User requested "just put loading goals" instead of showing stale or mock data briefly.
    const [goalTitle, setGoalTitle] = useState(location.state?.goal?.title || location.state?.goalTitle || "Loading...");
    const goalId = location.state?.goal?.id || location.state?.goalId || null;

    /* rstore tasks from location.state if returning from feedback page */
    const [tasks, setTasks] = useState(location.state?.tasks || []);
    const [endDate, setEndDate] = useState("");
    const [progress, setProgress] = useState(0); 
    
    // Add loading state
    const [isLoading, setIsLoading] = useState(true);

    /* Fetch goal details from backend */
    useEffect(() => {
        if (!goalId) {
            console.error("No goal ID provided");
            setIsLoading(false);
            return;
        }

        const fetchGoalDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/goal-details/${goalId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch details');
                }
                
                const data = await response.json();
                
                // Debug log to check data structure
                console.log("Goal details fetched:", data);

                if (data.goal?.title) {
                    setGoalTitle(data.goal.title);
                }
                
                // Set End Date if available
                if (data.goal && data.goal.goal_data && data.goal.goal_data.goal_due_date) {
                    const rawDate = data.goal.goal_data.goal_due_date;
                    // Format date nicely (e.g. 14 Feb 2026)
                    const dateObj = new Date(rawDate);
                    if (!isNaN(dateObj)) {
                        setEndDate(dateObj.toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        }));
                    } else {
                         setEndDate(rawDate);
                    }
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

                if (data.tasks) {
                    setTasks(processTasks(data.tasks));
                }
                
                // Fetch progress from backend
                const progRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${goalId}/progress`);
                const progData = await progRes.json();
                if (progData) setProgress(progData.percentage);
            } catch (err) {
                console.error("Error loading goal details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGoalDetails();
    }, [goalId]);

    /* API Helper to update status */
    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!res.ok) {
                console.error("Failed to update task status:", res.status);
                // Optionally revert local state here
                return;
            }

            // Fetch progress after successful update
            if (goalId) {
                try {
                    const progRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${goalId}/progress`);
                    const progData = await progRes.json();
                    if (progData) setProgress(progData.percentage);
                } catch (e) { console.error("Failed to fetch progress:", e); }
            }
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


    /* progress - fetched from backend now */
    // const totalTasks = tasks.length;
    // const completedTasks = tasks.filter(t => isTaskComplete(t)).length;
    // const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


    if (isLoading) {
        return (
            <div className="goal-detail-page">
                <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                     {/* Use Loading component if available, else text */}
                     <Loading />
                </div>
                <BottomNav />
            </div>
        );
    }

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
