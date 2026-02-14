import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoalListCard from '../components/GoalListCard';
import BottomNav from '../components/BottomNav';
import { supabase, isDemoMode } from '../supabase_client';
import '../styles/Goals.css';

const COLOR_SCHEMES_LIST = ['blue', 'yellow', 'orange', 'pink'];

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

                const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${user.id}`);
                const data = await res.json();

                const mapped = (data.goals || []).map((goal, index) => ({
                    id: goal.id,
                    title: goal.title,
                    description: goal.description || '',
                    date: goal.due_date
                        ? new Date(goal.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '',
                    progress: 0,
                    colorScheme: COLOR_SCHEMES_LIST[index % COLOR_SCHEMES_LIST.length],
                }));

                setGoals(mapped);
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

    return (
        <div className="goals-page">
        <div className="goals-container" ref={scrollRef} onScroll={handleScroll}>
            <PageHeader title="Goals" />

            {/* Goals List */}
            <div className="goals-list">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading goals...</p>
                ) : goals.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No goals yet. Create one!</p>
                ) : (
                    goals.map((goal) => (
                        <GoalListCard key={goal.id} goal={goal} />
                    ))
                )}
            </div>
        </div>

            <div
                className="goals-fade-overlay"
                style={{ opacity: showBottomFade ? 1 : 0 }}
            />
            <BottomNav />
        </div>
    );
};

export default Goals;
