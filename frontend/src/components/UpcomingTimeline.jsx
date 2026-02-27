import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import '../styles/components/UpcomingTimeline.css';

// encouraging messages when there are no items
const EMPTY_MESSAGES = {
    tasks: [
        "You're all caught up — no tasks due soon!",
        "Nothing on the horizon. Time to set a new goal?",
        "Clear schedule ahead. Enjoy the breathing room!",
        "No upcoming tasks — you're crushing it!",
        "All clear! A perfect time to plan something new.",
    ],
    goals: [
        "No goals coming up — dream something big!",
        "Your slate is clean. What will you aim for next?",
        "No deadlines in sight. Set a new goal to stay on track!",
        "Nothing upcoming — the perfect time to plan ahead.",
        "All goals complete or far away. Keep up the momentum!",
    ],
};

// variant config — controls title and subtitle per section type
const VARIANT_CONFIG = {
    goals: {
        title: 'Upcoming Goals',
        subtitle: 'See your goals for this month here',
        bgColor: 'var(--accent-red-soft)',
    },
    tasks: {
        title: 'Upcoming Tasks',
        subtitle: 'See your plan for this week here',
        bgColor: 'var(--accent-blue)',
    },
};

/**
 * UpcomingTimeline — reusable timeline section for upcoming goals or tasks
 *
 * @param {string}   variant  — "goals" | "tasks"
 * @param {Array}    items    — [{ id, title, description, dueDate, locked? }]
 * @param {function} onClick  — optional callback when a card is tapped
 */
/**
 * shared shell — header, scrollable area with fades, background color
 * used by both UpcomingTimeline and UpcomingTimelineTasks
 */
const UpcomingTimelineShell = ({ variant = 'goals', title, subtitle, className, headerLeft, headerExtra, children }) => {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.goals;

    const timelineRef = useRef(null);
    const [showTopFade, setShowTopFade] = useState(false);

    const updateFades = useCallback(() => {
        const el = timelineRef.current;
        if (!el) return;
        setShowTopFade(el.scrollTop > 5);
    }, []);

    useEffect(() => {
        updateFades();
    }, [updateFades, children]);

    return (
        <section className={`ut-section ut-section--${variant}${className ? ` ${className}` : ''}`}>
            <div className="ut-container" style={{ backgroundColor: config.bgColor }}>
                <div className="ut-title-row">
                    {headerLeft}
                    <h3 className="ut-title">{title || config.title}</h3>
                </div>
                <p className="ut-subtitle">{subtitle || config.subtitle}</p>
                {headerExtra}

                <div className="ut-timeline-wrap">
                    <div
                        className="ut-timeline"
                        ref={timelineRef}
                        onScroll={updateFades}
                    >
                        {children}
                    </div>

                    <div className="ut-fade ut-fade--top" style={{ opacity: showTopFade ? 1 : 0 }} />
                    <div className="ut-fade ut-fade--bottom" />
                </div>
            </div>
        </section>
    );
};

const UpcomingTimeline = ({ variant = 'goals', items = [], loaded = true, onClick, headerExtra }) => {
    const emptyMessage = useMemo(() => {
        const msgs = EMPTY_MESSAGES[variant] || EMPTY_MESSAGES.tasks;
        return msgs[Math.floor(Math.random() * msgs.length)];
    }, [variant]);

    return (
        <UpcomingTimelineShell variant={variant} headerExtra={headerExtra}>
            {loaded && items.length === 0 && (
                <p className="ut-empty-message">{emptyMessage}</p>
            )}
            {items.map((item) => {
                const dateObj = new Date(item.dueDate);
                const dayNum = dateObj.getDate();
                const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                return (
                    <div className="ut-item" key={item.id}>
                        <div className="ut-date">
                            <span className="ut-date-num">{dayNum}</span>
                            <span className="ut-date-day">{dayName}</span>
                        </div>

                        <div className="ut-connector">
                            <div className="ut-dot" />
                        </div>

                        <div
                            className={`ut-card ${item.locked ? 'ut-card--locked' : ''}`}
                            onClick={() => onClick && onClick(item)}
                            role={onClick ? 'button' : undefined}
                            tabIndex={onClick ? 0 : undefined}
                        >
                            <div className="ut-card-content">
                                <ArrowUpLeft
                                    className="ut-card-icon"
                                    size={16}
                                    strokeWidth={2.5}
                                />
                                <div className="ut-card-text">
                                    <h4 className="ut-card-title">{item.title}</h4>
                                    <p className="ut-card-desc">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </UpcomingTimelineShell>
    );
};

export { UpcomingTimelineShell };
export default UpcomingTimeline;
