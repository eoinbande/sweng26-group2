import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import GoalDetailHeader from '../components/GoalDetailHeader';
import TaskTimeline from '../components/TaskTimeline';
import Loading from '../components/Loading'; // Import Loading component if it exists
import FeedbackPopUp from '../components/FeedbackPopUp';
import '../styles/GoalDetail.css';
import { supabase } from '../supabase_client';

const GoalDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Safely access location state
    // Use "Loading..." as default if we are loading, unless we want to show stale title
    const [goalTitle, setGoalTitle] = useState(location.state?.goal?.title || location.state?.goalTitle || "Loading...");
    const goalId = location.state?.goal?.id || location.state?.goalId || null;

    /* rstore tasks from location.state if returning from feedback page */
    const [tasks, setTasks] = useState(location.state?.tasks || []);
    const [endDate, setEndDate] = useState("");
    const [progress, setProgress] = useState(0);

    // Feedback popup state
    const [showFeedback, setShowFeedback] = useState(false);
    const [closingFeedback, setClosingFeedback] = useState(false);

    const closeFeedback = () => {
        setClosingFeedback(true);
        setTimeout(() => {
            setShowFeedback(false);
            setClosingFeedback(false);
        }, 150);
    };

    /* helper to calculate progress locally — matches backend logic
       (counts every row in the tasks table: parent tasks + subtasks) */
    const calculateLocalProgress = (currentTasks) => {
        if (!currentTasks || currentTasks.length === 0) return 0;

        let totalNodes = 0;
        let completedNodes = 0;

        currentTasks.forEach(task => {
            // Always count the parent task
            totalNodes += 1;
            if (task.completed) completedNodes += 1;

            // Count every subtask
            if (task.subtasks && task.subtasks.length > 0) {
                task.subtasks.forEach(sub => {
                    totalNodes += 1;
                    if (sub.completed) completedNodes += 1;
                });
            }
        });

        return totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
    };

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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/goal-details/${goalId}`, { cache: 'no-store' });

                if (!response.ok) {
                    throw new Error('Failed to fetch details');
                }

                const data = await response.json();

                // Debug log to check data structure
                console.log("Goal details fetched:", data);

                if (data.goal?.title) {
                    setGoalTitle(data.goal.title);
                }

                // Set End Date if available — check multiple possible locations
                let rawEndDate = '';
                if (data.goal) {
                    const gd = data.goal.goal_data;
                    if (gd && gd.goal_due_date) {
                        rawEndDate = gd.goal_due_date;
                    } else if (data.goal.due_date) {
                        rawEndDate = data.goal.due_date;
                    }
                }
                if (rawEndDate) {
                    setEndDate(rawEndDate);
                }
                console.log("End date extracted:", rawEndDate, "goal_data:", data.goal?.goal_data);

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
                    const processed = processTasks(data.tasks);
                    setTasks(processed);
                    // Calculate progress locally from task data for immediate accuracy
                    setProgress(calculateLocalProgress(processed));
                }

                // Also fetch backend progress as fallback / validation
                try {
                    const progRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${goalId}/progress`, { cache: 'no-store' });
                    const progData = await progRes.json();
                    if (progData) setProgress(progData.percentage);
                } catch (e) {
                    // Local calculation is already set, so this is fine
                }
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
        // Prevent unticking completed subtasks
        const parentTask = tasks.find(t => t.id === taskId);
        if (parentTask) {
            const sub = parentTask.subtasks.find(s => s.id === subtaskId);
            if (sub && sub.completed) return;
        }

        let newStatus = 'not_started';

        setTasks(prev => {
            const newTasks = prev.map(task => {
                if (task.id !== taskId) return task;

                // 1. Update the specific subtask
                const updatedSubtasks = task.subtasks.map(s => {
                    if (s.id === subtaskId) {
                        const nextCompleted = !s.completed;
                        newStatus = nextCompleted ? 'completed' : 'not_started';
                        return { ...s, completed: nextCompleted };
                    }
                    return s;
                });

                // 2. DON'T auto-complete parent yet — let the user see
                //    the last subtask checked before the task collapses
                return {
                    ...task,
                    subtasks: updatedSubtasks,
                    // Keep parent uncompleted for now
                    completed: false
                };
            });

            setProgress(calculateLocalProgress(newTasks));
            return newTasks;
        });

        updateTaskStatus(subtaskId, newStatus);

        // After a longer delay, auto-complete parent if all subtasks done
        setTimeout(() => {
            setTasks(prev => {
                const newTasks = prev.map(task => {
                    if (task.id !== taskId) return task;
                    const allDone = task.subtasks.every(s => s.completed);
                    if (allDone && !task.completed) {
                        updateTaskStatus(taskId, 'completed');
                        return { ...task, completed: true };
                    }
                    return task;
                });
                setProgress(calculateLocalProgress(newTasks));
                return newTasks;
            });
        }, 1200);
    };

    /* toggle a whole task (complete all subtasks or un-complete) */
    const toggleTask = (taskIndex) => {
    const status = getTaskStatus(taskIndex);
    if (status === 'locked') return;

    const task = tasks[taskIndex];
    const isComplete = isTaskComplete(task);

    // Once completed, tasks cannot be unticked
    if (isComplete) return;

    let targetStatus = 'completed';
    let targetBool = true;

    setTasks(prev => {
        const newTasks = prev.map((t, i) => {
            if (i !== taskIndex) return t;
            return {
                ...t,
                completed: targetBool,
                subtasks: t.subtasks.map(s => ({ ...s, completed: targetBool }))
            };
        });

        setProgress(calculateLocalProgress(newTasks));
        return newTasks;
    });

    // API Sync
    if (task.subtasks.length > 0) {
        task.subtasks.forEach(s => updateTaskStatus(s.id, targetStatus));
    }
    updateTaskStatus(task.id, targetStatus);
    };

    // Feedback submisison
    const handleSubmitFeedback = async (text) => {
    const val = text; // handle value from InputBar or state
    if (!val.trim()) return;
    
        //setSubmittingFeedback(true);
        //setShowLoading(true); // Show loading overlay while processing feedback
    
        try {
            // Get current user ID
            let userId = null;
            try {
                const { data } = await supabase.auth.getUser();
                userId = data?.user?.id;
            } catch (err) {
                console.error('Auth error:', err);
            }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback: val })
        });

        const data = await res.json();
        console.log('Feedback response:', data);

        if (!res.ok) {
            console.error('Failed to process feedback:', data);
            alert('Failed to process feedback. Check console.');
            //setSubmittingFeedback(false);
            //setShowLoading(false);
            return;
        }

        //setFeedbackText('');
        closeFeedback();

        // Update the preview data with new tasks from feedback
        // Navigate to ReviewPlan again with updated data and loading overlay
        navigate('/review-plan', {
            replace: true,
            state: {
                goal: goalTitle,
                showLoading: true,
                previewData: {
                    goal_id: goalId,
                    tasks: data.tasks,
                },
                userId: userId,
                originalPrompt: goalTitle,
                from: 'detail',
                dueDate: endDate,
            },
        });

        //setSubmittingFeedback(false);

    } catch (err) {
        console.error('Network error:', err);
        alert('Network error. Is the backend running?');
        //setSubmittingFeedback(false);
        //setShowLoading(false);
    }
    };
            


    /* progress - fetched from backend now */
    // const totalTasks = tasks.length;
    // const completedTasks = tasks.filter(t => isTaskComplete(t)).length;
    // const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


    if (isLoading) {
        return (
            <div className="goal-detail-page">
                <Loading />
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

            {/* feedback popup */}
            {showFeedback && (
                <div
                    className={`feedback-overlay ${closingFeedback ? 'closing' : ''}`}
                    onClick={closeFeedback}
                >
                    <div
                        className={`feedback-bottom-sheet ${closingFeedback ? 'closing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FeedbackPopUp
                            variant="reroute"
                            onClose={closeFeedback}
                            onSubmit={(value) => { 
                                console.log('Submitted value:', value);
                                handleSubmitFeedback(value); 
                            }}
                        />
                    </div>
                </div>
            )}

            {/* floating action button */}
            <div className="fab-container">
                <button className="btn-update-plan" onClick={() => setShowFeedback(true)}>
                    Update Plan
                </button>
            </div>

            <BottomNav />
        </div>
    );
};

export default GoalDetail;
