import React, { useState, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import GoalListCard from '../components/GoalListCard';
import BottomNav from '../components/BottomNav';
import '../styles/Goals.css';

const Goals = () => {
    const [showBottomFade, setShowBottomFade] = useState(true);
    const scrollRef = useRef(null);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
        setShowBottomFade(!isAtBottom);
    }, []);
    // Mock data for goals - matching the design
    const goals = [
        {
            id: 1,
            title: 'Master the piano',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            date: '27 Jan',
            progress: 25,
            colorScheme: 'blue'
        },
        {
            id: 2,
            title: 'Create a bank account',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
            date: '1 May',
            progress: 75,
            colorScheme: 'yellow'
        },
        {
            id: 3,
            title: 'Computer Networks revision',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            date: '27 Jan',
            progress: 30,
            colorScheme: 'orange'
        },
        {
            id: 4,
            title: 'Create a bank account',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
            date: '1 May',
            progress: 10,
            colorScheme: 'pink'
        },
        {
            id: 5,
            title: 'Read 12 books this year',
            description: 'Track reading progress across fiction and non-fiction books throughout the year.',
            date: '31 Dec',
            progress: 50,
            colorScheme: 'blue'
        },
        {
            id: 6,
            title: 'Learn to cook Italian',
            description: 'Master at least 10 traditional Italian recipes from scratch.',
            date: '15 Mar',
            progress: 60,
            colorScheme: 'yellow'
        },
        {
            id: 7,
            title: 'Marathon training',
            description: 'Follow a structured training plan to complete a full marathon by autumn.',
            date: '20 Oct',
            progress: 15,
            colorScheme: 'orange'
        },
        {
            id: 8,
            title: 'Save for summer trip',
            description: 'Set aside money each month to fund a two-week summer holiday.',
            date: '1 Jun',
            progress: 100,
            colorScheme: 'pink'
        }
    ];

    return (
        <div className="goals-page">
        <div className="goals-container" ref={scrollRef} onScroll={handleScroll}>
            <PageHeader title="Goals" />

            {/* Goals List */}
            <div className="goals-list">
                {goals.map((goal) => (
                    <GoalListCard key={goal.id} goal={goal} />
                ))}
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
