import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const ScheduleContext = createContext(null);

const baseUrl = import.meta.env.VITE_API_URL;

// maps backend task data → shape expected by UpcomingTimeline
const mapTaskToTimeline = (t) => ({
    id: t.task_id || t.ai_id,
    goalId: t.goal_id,
    title: t.description,
    description: t.goal_title,
    dueDate: t.due_date,
    locked: t.status === 'not_started' && t.order > 1,
});

// maps backend goal data → shape expected by UpcomingTimeline
const mapGoalToTimeline = (g) => ({
    id: g.goal_id,
    goalId: g.goal_id,
    title: g.title,
    description: g.description || `${g.task_count} task${g.task_count === 1 ? '' : 's'}`,
    dueDate: g.goal_due_date,
});

export const ScheduleProvider = ({ children }) => {
    const { user } = useUser();
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [upcomingGoals, setUpcomingGoals] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const fetchSchedule = useCallback(async () => {
        if (!user) return;
        try {
            // fetch sequentially to avoid flooding supabase connections
            const tasksRes = await fetch(`${baseUrl}/schedule/${user.id}/upcoming-tasks`);
            if (tasksRes.ok) {
                const json = await tasksRes.json();
                setUpcomingTasks(json.tasks.map(mapTaskToTimeline));
            }

            const goalsRes = await fetch(`${baseUrl}/schedule/${user.id}/upcoming-goals`);
            if (goalsRes.ok) {
                const json = await goalsRes.json();
                setUpcomingGoals(json.goals.map(mapGoalToTimeline));
            }
        } catch (err) {
            console.error('failed to fetch schedule data:', err);
        } finally {
            setLoaded(true);
        }
    }, [user]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return (
        <ScheduleContext.Provider value={{
            upcomingTasks,
            upcomingGoals,
            loaded,
            refreshSchedule: fetchSchedule,
        }}>
            {children}
        </ScheduleContext.Provider>
    );
};

export const useSchedule = () => useContext(ScheduleContext);
