import React, { useState, useRef, useCallback, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import GoalListCard from '../components/GoalListCard';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../styles/Goals.css';

const COLOR_SCHEMES_LIST = ['blue', 'yellow', 'orange', 'pink'];

const Goals = () => {
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/goals/${user.id}`);
                const data = await res.json();

                const mapped = (data.goals || []).map((goal, index) => ({
                    id: goal.id,
                    title: goal.title,
                    description: goal.description || '',
                    date: goal.due_date
                        ? new Date(goal.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '',
                    progress: 0, // TODO: calculate from task completion
                    colorScheme: COLOR_SCHEMES_LIST[index % COLOR_SCHEMES_LIST.length],
                }));

                setGoals(mapped);
            } catch (err) {
                console.error('Failed to fetch goals:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

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
