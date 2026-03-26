import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import GoalListCard from '../components/GoalListCard';
import BottomNav from '../components/BottomNav';
import Loading from '../components/Loading';
import { useUser } from '../contexts/UserContext';
import { useGoals } from '../contexts/GoalsContext';
import '../styles/Goals.css';
import CategoryIcon from '../components/CategoryIcon';

const Goals = () => {
    const location = useLocation();
    const { user } = useUser();
    const {
        goals,
        categories,
        loading,
        updateGoalCategory,
        updateGoalProgress,
        addCategory,
        deleteCategory,
    } = useGoals();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#F8F8F4';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const [showBottomFade, setShowBottomFade] = useState(true);
    const scrollRef = useRef(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
        setShowBottomFade(!isAtBottom);
    }, []);

    // update progress when returning from GoalDetail
    useEffect(() => {
        const updatedId = location.state?.updatedGoalId;
        const updatedProgress = location.state?.updatedProgress;
        if (updatedId != null && updatedProgress != null) {
            updateGoalProgress(updatedId, updatedProgress);
        }
    }, [location.state, updateGoalProgress]);

    const handleSelectionChange = (updated) => {
        setSelectedCategories(updated);
    };

    const baseUrl = import.meta.env.VITE_API_URL;

    const handleNewCategory = async (name) => {
        if (!name.trim() || !user) return;
        await fetch(`${baseUrl}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, name: name.trim() })
        });
        addCategory(name.trim());
    };

    const handleDeleteCategory = async (name) => {
    if (!user) return;
    await fetch(`${baseUrl}/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, name })
    });
    deleteCategory(name);
};


    const handleAssignCategory = async (goalId, cat) => {
        await fetch(`${baseUrl}/goals/${goalId}/category`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: cat })
        });
        updateGoalCategory(goalId, cat);
    };

    if (loading) {
        return (
            <div className="goals-page">
                <Loading />
                <BottomNav />
            </div>
        );
    }

    // map context goals to the shape GoalListCard expects
    const displayGoals = goals.map(g => ({
        ...g,
        date: g.dateFormatted,
    }));

    const filteredGoals = selectedCategories.length === 0
        ? displayGoals
        : displayGoals.filter(g => selectedCategories.includes(g.category));

    const activeGoals = filteredGoals.filter(g => g.progress < 100);
    const completedGoals = filteredGoals.filter(g => g.progress === 100);


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
                {activeGoals.length === 0 && completedGoals.length === 0 ? (
    <p style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No goals yet. Create one!</p>
) : (
    <>
        {activeGoals.length > 0 && (
            <>
                <div className="goals-section-header">
                    <h2 className="goals-section-title">Active Goals</h2>
                    <p className="goals-section-subtitle">See your current goals here</p>
                </div>
                <div className="goals-list">
                    {activeGoals.map((goal) => (
                        <GoalListCard key={goal.id}
                            goal={goal}
                            categories={categories}
                            onNewCategory={handleNewCategory}
                            onAssignCategory={handleAssignCategory}
                        />
                    ))}
                </div>
            </>
        )}

        <div style={{ marginTop: '30px' }}>
            <div className="goals-section-header">
                <h2 className="goals-section-title">Completed Goals</h2>
                <p className="goals-section-subtitle">See your goal history here</p>
            </div>
            {completedGoals.length > 0 ? (
                <div className="goals-list">
                    {completedGoals.map((goal) => (
                        <GoalListCard key={goal.id}
                            goal={goal}
                            completed
                            categories={categories}
                            onNewCategory={handleNewCategory}
                            onAssignCategory={handleAssignCategory}
                        />
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>No completed goals yet!</p>
            )}
        </div>
    </>
)}


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
