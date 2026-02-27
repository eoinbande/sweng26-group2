import React, { useState, useRef, useCallback, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import MonthCalendar from '../components/MonthCalendar';
import UpcomingTimeline from '../components/UpcomingTimeline';
import UpcomingTimelineTasks from '../components/UpcomingTimelineTasks';
import BottomNav from '../components/BottomNav';
import '../styles/ScheduledTasks.css';
import '../index.css';

// mock goal ranges for calendar highlights
const MOCK_GOAL_RANGES = [
    { startDay: 26, endDay: 28, colorScheme: 'blue' },
];


// mock upcoming tasks (timeline view)
const MOCK_TASKS = [
    { id: 't1', title: 'Set overall budget', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27', locked: true },
    { id: 't3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 't4', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
];

// mock daily tasks (card view)
const MOCK_DAILY_TASKS = [
    { id: 'dt1', title: 'Set overall budget', goalTitle: 'Plan a wedding', dueDate: '2026-02-27', locked: true },
    { id: 'dt2', title: 'Set overall budget', goalTitle: 'Plan a wedding', dueDate: '2026-02-27' },
    { id: 'dt3', title: 'Set overall budget', goalTitle: 'Plan a wedding', dueDate: '2026-02-27' },
    { id: 'dt4', title: 'Set overall budget', goalTitle: 'Plan a wedding', dueDate: '2026-02-27', locked: true },
];

// mock upcoming goals (timeline view)
const MOCK_GOALS = [
    { id: 'g1', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-27' },
    { id: 'g2', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-02-28', locked: true },
    { id: 'g3', title: 'Create a bank account', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, se....', dueDate: '2026-03-01' },
];

const PANELS = ['tasks', 'goals'];
const SWIPE_THRESHOLD = 50;
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function ScheduledTasks() {
    const now = new Date();
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const touchStartX = useRef(0);
    const calTouchStartX = useRef(0);
    const calendarRef = useRef(null);

    // sync header when MUI changes month (swipe, outside-month click, etc.)
    const onMonthChange = useCallback((date) => {
        setCalMonth(date.month());
        setSelectedDate(null);
    }, []);

    // swipe between calendar months — click MUI's hidden nav arrows
    const onCalTouchStart = useCallback((e) => {
        calTouchStartX.current = e.touches[0].clientX;
    }, []);

    const onCalTouchEnd = useCallback((e) => {
        const delta = calTouchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        if (!calendarRef.current) return;
        // MUI renders two arrow buttons inside the hidden header
        const arrows = calendarRef.current.querySelectorAll(
            '.MuiPickersArrowSwitcher-root button'
        );
        if (!arrows.length) return;
        // swipe left → next (second arrow), swipe right → prev (first arrow)
        const btn = delta > 0 ? arrows[1] : arrows[0];
        if (btn) btn.click();
    }, []);

    // click outside calendar → deselect
    useEffect(() => {
        if (!selectedDate) return;
        const handleClick = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setSelectedDate(null);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [selectedDate]);

    const onTouchStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const onTouchEnd = useCallback((e) => {
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) < SWIPE_THRESHOLD) return;
        // swipe left → next, swipe right → prev
        setActiveIndex((prev) =>
            delta > 0
                ? Math.min(prev + 1, PANELS.length - 1)
                : Math.max(prev - 1, 0)
        );
    }, []);

    const onDayClick = useCallback((day) => {
        setSelectedDate(day);
    }, []);

    const dateLabel = selectedDate
        ? selectedDate.format('D MMM')
        : '';

    return (
        <div className="scheduled-tasks-page">
            <div className="scheduled-tasks-container">
                <div className="scheduled-tasks-padded">
                    <PageHeader title={MONTH_NAMES[calMonth]} />
                    <div
                        ref={calendarRef}
                        onTouchStart={onCalTouchStart}
                        onTouchEnd={onCalTouchEnd}
                    >
                        <MonthCalendar
                            year={now.getFullYear()}
                            month={now.getMonth()}
                            goalRanges={MOCK_GOAL_RANGES}
                            onDayClick={onDayClick}
                            onMonthChange={onMonthChange}
                        />
                    </div>
                </div>

                {selectedDate ? (
                    <div className="ut-daily-viewport">
                        <UpcomingTimelineTasks
                            key={`daily-${selectedDate.format('YYYY-MM-DD')}`}
                            date={dateLabel}
                            items={MOCK_DAILY_TASKS}
                            onBack={() => setSelectedDate(null)}
                        />
                    </div>
                ) : (
                    <div
                        className="ut-swipe-viewport"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <div
                            className="ut-swipe-track"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            <UpcomingTimeline
                                key={activeIndex === 0 ? `tasks-${activeIndex}` : 'tasks'}
                                variant="tasks"
                                items={MOCK_TASKS}
                                headerExtra={
                                    <div className="ut-swipe-dots">
                                        {PANELS.map((v, i) => (
                                            <div
                                                key={v}
                                                className={`ut-swipe-dot${i === activeIndex ? ' ut-swipe-dot--active' : ''}`}
                                                onClick={() => setActiveIndex(i)}
                                            />
                                        ))}
                                    </div>
                                }
                            />
                            <UpcomingTimeline
                                key={activeIndex === 1 ? `goals-${activeIndex}` : 'goals'}
                                variant="goals"
                                items={MOCK_GOALS}
                                headerExtra={
                                    <div className="ut-swipe-dots">
                                        {PANELS.map((v, i) => (
                                            <div
                                                key={v}
                                                className={`ut-swipe-dot${i === activeIndex ? ' ut-swipe-dot--active' : ''}`}
                                                onClick={() => setActiveIndex(i)}
                                            />
                                        ))}
                                    </div>
                                }
                            />
                        </div>
                    </div>
                )}
            </div>

            <BottomNav transparent />
        </div>
    );
}

export default ScheduledTasks;
