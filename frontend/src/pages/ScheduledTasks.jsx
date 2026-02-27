import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import MonthCalendar from '../components/MonthCalendar';
import UpcomingTimeline from '../components/UpcomingTimeline';
import UpcomingTimelineTasks from '../components/UpcomingTimelineTasks';
import BottomNav from '../components/BottomNav';
import { supabase } from '../supabase_client';
import '../styles/ScheduledTasks.css';
import '../index.css';

// builds calendar highlight ranges from task due dates for a given month
function buildTaskRanges(tasks, year, month) {
    // collect unique day-of-month numbers that have tasks in this month
    const days = new Set();
    for (const t of tasks) {
        const d = new Date(t.dueDate);
        if (d.getFullYear() === year && d.getMonth() === month) {
            days.add(d.getDate());
        }
    }
    if (days.size === 0) return [];

    // sort and merge consecutive days into ranges
    const sorted = [...days].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            ranges.push({ startDay: start, endDay: end, colorScheme: 'blue' });
            start = sorted[i];
            end = sorted[i];
        }
    }
    ranges.push({ startDay: start, endDay: end, colorScheme: 'blue' });
    return ranges;
}

// maps backend goal data → shape expected by UpcomingTimeline
const mapGoalToTimeline = (g) => ({
    id: g.goal_id,
    title: g.title,
    description: g.description || `${g.task_count} task${g.task_count === 1 ? '' : 's'}`,
    dueDate: g.goal_due_date,
});

// maps backend task data → shape expected by UpcomingTimeline
const mapTaskToTimeline = (t) => ({
    id: t.task_id || t.ai_id,
    title: t.description,
    description: t.goal_title,
    dueDate: t.due_date,
    locked: t.status === 'not_started' && t.order > 1,
});

// maps backend task data → shape expected by UpcomingTimelineTasks
const mapTaskToDaily = (t) => ({
    id: t.task_id || t.ai_id,
    title: t.description,
    goalTitle: t.goal_title,
    dueDate: t.due_date,
    locked: t.status === 'not_started' && t.order > 1,
});

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
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [upcomingGoals, setUpcomingGoals] = useState([]);
    const [dailyTasks, setDailyTasks] = useState([]);
    const [scheduleLoaded, setScheduleLoaded] = useState(false);
    const calYear = now.getFullYear();
    const taskRanges = useMemo(
        () => buildTaskRanges(upcomingTasks, calYear, calMonth),
        [upcomingTasks, calYear, calMonth],
    );
    const touchStartX = useRef(0);
    const calTouchStartX = useRef(0);
    const calendarRef = useRef(null);

    // fetch upcoming tasks and goals from backend
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) return;
                const [tasksRes, goalsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/schedule/${user.id}/upcoming-tasks`),
                    fetch(`${import.meta.env.VITE_API_URL}/schedule/${user.id}/upcoming-goals`),
                ]);
                if (!cancelled && tasksRes.ok) {
                    const json = await tasksRes.json();
                    setUpcomingTasks(json.tasks.map(mapTaskToTimeline));
                }
                if (!cancelled && goalsRes.ok) {
                    const json = await goalsRes.json();
                    setUpcomingGoals(json.goals.map(mapGoalToTimeline));
                }
            } catch (err) {
                console.error('failed to fetch schedule data:', err);
            } finally {
                if (!cancelled) setScheduleLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // fetch tasks for selected date
    useEffect(() => {
        if (!selectedDate) { setDailyTasks([]); return; }
        let cancelled = false;
        (async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) return;
                const dateStr = selectedDate.format('YYYY-MM-DD');
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/schedule/${user.id}/date?date=${dateStr}`
                );
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled) setDailyTasks(json.tasks.map(mapTaskToDaily));
            } catch (err) {
                console.error('failed to fetch daily tasks:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedDate]);

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
                            goalRanges={taskRanges}
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
                            items={dailyTasks}
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
                                items={upcomingTasks}
                                loaded={scheduleLoaded}
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
                                items={upcomingGoals}
                                loaded={scheduleLoaded}
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
