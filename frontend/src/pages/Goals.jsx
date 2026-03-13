import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoalListCard from '../components/GoalListCard';
import BottomNav from '../components/BottomNav';
import Loading from '../components/Loading';
import { supabase, isDemoMode } from '../supabase_client';
import '../styles/Goals.css';
import CategoryIcon from '../components/CategoryIcon';

const COLOR_SCHEMES_LIST = ['blue', 'yellow', 'green', 'pink'];

const MOCK_GOALS = [
    { id: 1, title: 'Learn Piano', description: 'Master basic chords and scales', date: '15 Mar', progress: 40, colorScheme: 'blue' },
    { id: 2, title: 'Get fit for summer', description: 'Exercise 4x a week', date: '1 Jun', progress: 20, colorScheme: 'yellow' },
    { id: 3, title: 'Ace Probability I', description: 'Study all chapters and past papers', date: '20 Apr', progress: 65, colorScheme: 'orange' },
    { id: 4, title: 'Build portfolio site', description: 'Design and deploy personal website', date: '10 Mar', progress: 10, colorScheme: 'pink' },
];

const Goals = () => {
    const location = useLocation();
    const [showBottomFade, setShowBottomFade] = useState(true);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);


    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
        setShowBottomFade(!isAtBottom);
    }, []);

    // Fetch goals from backend on mount
    useEffect(() => {
        const fetchGoals = async () => {
            // In demo mode, use mock data directly
            if (isDemoMode) {
                setGoals(MOCK_GOALS);
                setLoading(false);
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${user.id}`, { cache: 'no-store' });
                const data = await res.json();

                const mapped = await Promise.all((data.goals || []).map(async (goal, index) => {
                    let goalData = {};
                    try {
                        goalData = typeof goal.goal_data === 'string'
                            ? JSON.parse(goal.goal_data)
                            : goal.goal_data || {};
                    } catch (e) { goalData = {}; }

                    let progress = 0;
                    try {
                        const pRes = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${goal.id}/progress`, { cache: 'no-store' });
                        const pData = await pRes.json();
                        if (pData) progress = pData.percentage;
                    } catch (e) {
                        console.error("Failed to fetch progress for goal " + goal.id);
                    }

                    return {
                        id: goal.id,
                        title: goal.title,
                        category: goal.category|| null, 
                        description: goal.description || goalData.description || '',
                        date: (goal.due_date || goalData.goal_due_date)
                            ? new Date(goal.due_date || goalData.goal_due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                            : '',
                        progress: progress,
                        colorScheme: COLOR_SCHEMES_LIST[index % COLOR_SCHEMES_LIST.length],
                    };
                }));

                setGoals(mapped);
                // Fetch categories
                const catRes = await fetch(`${import.meta.env.VITE_API_URL}/categories/${user.id}`);
                const catData = await catRes.json();
                setCategories(catData.categories.map(c => c.name)); // backend returns objects with a .name field

            } catch (err) {
                console.error('Failed to fetch goals, using mock data:', err);
                setGoals(MOCK_GOALS);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    /* ---- Update progress when returning from GoalDetail ---- */
    useEffect(() => {
        const updatedId = location.state?.updatedGoalId;
        const updatedProgress = location.state?.updatedProgress;
        if (updatedId != null && updatedProgress != null) {
            setGoals(prev => prev.map(g =>
                g.id === updatedId ? { ...g, progress: updatedProgress } : g
            ));
        }
    }, [location.state]);

     const handleSelectionChange = (updated) => {
    setSelectedCategories(updated);
    };

    const handleNewCategory = async (name) => {
    if (!name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    await fetch(`${import.meta.env.VITE_API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, name: name.trim() })
    });
    setCategories(prev => [...prev, name.trim()]); // still update state so UI reacts instantly
    };


    if (loading) {
        return (
            <div className="goals-page">
                <Loading />
                <BottomNav />
            </div>
        );
    }

    const filteredGoals = selectedCategories.length === 0
    ? goals
    : goals.filter(g => selectedCategories.includes(g.category));


    return (
        <div className="goals-page">
            <div className="goals-container" ref={scrollRef} onScroll={handleScroll}>
                <PageHeader title="Goals" />
                <CategoryIcon
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onSelectionChange={handleSelectionChange}
                    onNewCategory={handleNewCategory}
                />
                {/* Goals List */}
                <div className="goals-list">
                    {filteredGoals.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No goals yet. Create one!</p>
                    ) : (
                        filteredGoals.map((goal) => (
                            <GoalListCard key={goal.id} 
                            goal={goal}
                            categories={categories}
                            onNewCategory={handleNewCategory}
                            onAssignCategory={async (goalId, cat) => {
                                await fetch(`${import.meta.env.VITE_API_URL}/goals/${goalId}/category`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ category: cat })
                            });
                            setGoals(prev => prev.map(g => g.id === goalId ? {...g, category: cat} : g));
                        }}
 />
                        ))
                    )}
                </div>


            <div
                className="goals-fade-overlay"
                style={{ opacity: showBottomFade ? 1 : 0 }}
            />
            <BottomNav />
        </div>
    </div>
    );
};

export default Goals;
