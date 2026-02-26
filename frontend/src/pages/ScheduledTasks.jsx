import React, { useState, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import MonthCalendar from '../components/MonthCalendar';
import UpcomingTimeline from '../components/UpcomingTimeline';
import BottomNav from '../components/BottomNav';
import '../styles/ScheduledTasks.css';
import '../index.css';

// mock goal ranges for calendar highlights
const MOCK_GOAL_RANGES = [
    { startDay: 26, endDay: 28, colorScheme: 'blue' },
    { startDay: 29, endDay: 30, colorScheme: 'green' },
    { startDay: 28, endDay: 28, colorScheme: 'pink' },
];

// mock upcoming goals
const MOCK_GOALS = [
    { id: 'g1', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g4', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
];

// mock upcoming tasks
const MOCK_TASKS = [
    { id: 't1', title: 'Set overall budget', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27', locked: true },
    { id: 't3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't4', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
];

const VARIANTS = ['tasks', 'goals'];
const SWIPE_THRESHOLD = 50;

function ScheduledTasks() {
    const now = new Date();
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(0);

    const onTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const onTouchEnd = useCallback((e) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        // swipe left → next, swipe right → prev
        setActiveIndex((prev) =>
            delta > 0
                ? Math.min(prev + 1, VARIANTS.length - 1)
                : Math.max(prev - 1, 0)
        );
    }, []);

    const itemsMap = { tasks: MOCK_TASKS, goals: MOCK_GOALS };

    return (
        <div className="scheduled-tasks-page">
            <div className="scheduled-tasks-container">
                <div className="scheduled-tasks-padded">
                    <PageHeader title="February" />
                    <MonthCalendar
                        year={now.getFullYear()}
                        month={now.getMonth()}
                        goalRanges={MOCK_GOAL_RANGES}
                    />
                </div>

                {/* swipe indicator dots */}
                <div className="ut-swipe-dots">
                    {VARIANTS.map((v, i) => (
                        <div
                            key={v}
                            className={`ut-swipe-dot${i === activeIndex ? ' ut-swipe-dot--active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                        />
                    ))}
                </div>

                {/* swipeable timeline panels */}
                <div
                    className="ut-swipe-viewport"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <div
                        className="ut-swipe-track"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {VARIANTS.map((v, i) => (
                            <UpcomingTimeline
                                key={i === activeIndex ? `${v}-${activeIndex}` : v}
                                variant={v}
                                items={itemsMap[v]}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default ScheduledTasks;
