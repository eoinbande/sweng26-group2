import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

const GoalsContext = createContext(null);

const COLOR_SCHEMES = ['blue', 'yellow', 'green', 'pink'];

export const GoalsProvider = ({ children }) => {
    const { user } = useUser();
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_URL;

    // fetch all goals + progress + categories
    const fetchGoals = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`${baseUrl}/goals/${user.id}`, { cache: 'no-store' });
            const data = await res.json();

            // fetch progress sequentially to avoid flooding supabase connections
            const mapped = [];
            for (let index = 0; index < (data.goals || []).length; index++) {
                const goal = data.goals[index];
                let goalData = {};
                try {
                    goalData = typeof goal.goal_data === 'string'
                        ? JSON.parse(goal.goal_data)
                        : goal.goal_data || {};
                } catch (e) { goalData = {}; }

                let progress = 0;
                try {
                    const pRes = await fetch(`${baseUrl}/tasks/${goal.id}/progress`, { cache: 'no-store' });
                    const pData = await pRes.json();
                    if (pData) progress = pData.percentage;
                } catch (e) {
                    console.error('failed to fetch progress for goal ' + goal.id);
                }

                mapped.push({
                    id: goal.id,
                    title: goal.title,
                    category: goal.category || null,
                    description: goal.description || goalData.description || '',
                    dueDate: goal.due_date || goalData.goal_due_date || null,
                    dateFormatted: (goal.due_date || goalData.goal_due_date)
                        ? new Date(goal.due_date || goalData.goal_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '',
                    progress,
                    colorScheme: COLOR_SCHEMES[index % COLOR_SCHEMES.length],
                });
            }

            setGoals(mapped);

            // fetch categories
            const catRes = await fetch(`${baseUrl}/categories/${user.id}`);
            const catData = await catRes.json();
            setCategories((catData.categories || []).map(c => c.name));
        } catch (err) {
            console.error('failed to fetch goals:', err);
        } finally {
            setLoading(false);
        }
    }, [user, baseUrl]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    // add or update a goal in the cache (prevents duplicates on feedback re-accept)
    const addGoal = useCallback((goal) => {
        setGoals(prev => {
            const goalId = goal.id || goal.goal_id;
            const existing = prev.find(g => g.id === goalId);
            const newGoal = {
                id: goalId,
                title: goal.title,
                category: goal.category || existing?.category || null,
                description: goal.description || '',
                dueDate: goal.due_date || goal.goal_due_date || null,
                dateFormatted: (goal.due_date || goal.goal_due_date)
                    ? new Date(goal.due_date || goal.goal_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : '',
                progress: existing?.progress ?? 0,
                colorScheme: existing?.colorScheme || COLOR_SCHEMES[prev.length % COLOR_SCHEMES.length],
            };
            if (existing) {
                return prev.map(g => g.id === goalId ? newGoal : g);
            }
            return [...prev, newGoal];
        });
    }, []);

    // remove a goal from the cache
    const deleteGoal = useCallback((goalId) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    }, []);

    // update a goal's category in the cache
    const updateGoalCategory = useCallback((goalId, category) => {
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, category } : g
        ));
    }, []);

    // update a goal's progress in the cache
    const updateGoalProgress = useCallback((goalId, progress) => {
        setGoals(prev => prev.map(g =>
            g.id === goalId ? { ...g, progress } : g
        ));
    }, []);

    // add a new category to the cache
    const addCategory = useCallback((name) => {
        setCategories(prev => prev.includes(name) ? prev : [...prev, name]);
    }, []);

    //delete category
    const deleteCategory = useCallback(async (name) => {
        if (!user) return;
        try {
            const res = await fetch(`${baseUrl}/categories/${user.id}/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c !== name));
                setGoals(prev => prev.map(g => g.category === name ? { ...g, category: null } : g));
            } else {
                console.error('Failed to delete category:', res.status);
            }
        } catch (e) {
            console.error('Error deleting category:', e);
        }
    }, [user, baseUrl]);


    return (
        <GoalsContext.Provider value={{
            goals,
            categories,
            loading,
            addGoal,
            deleteGoal,
            updateGoalCategory,
            updateGoalProgress,
            addCategory,
            deleteCategory,
            refreshGoals: fetchGoals,
        }}>
            {children}
        </GoalsContext.Provider>
    );
};

export const useGoals = () => useContext(GoalsContext);
