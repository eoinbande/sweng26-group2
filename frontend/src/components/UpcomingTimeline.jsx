import { useRef, useState, useCallback, useEffect } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import '../styles/components/UpcomingTimeline.css';

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
const UpcomingTimeline = ({ variant = 'goals', items = [], onClick }) => {
    const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.goals;

    const timelineRef = useRef(null);
    // top fade only appears once content is cut off by scrolling
    const [showTopFade, setShowTopFade] = useState(false);

    const updateFades = useCallback(() => {
        const el = timelineRef.current;
        if (!el) return;
        setShowTopFade(el.scrollTop > 5);
    }, []);

    // correct initial state after render (handles cases with few items)
    useEffect(() => {
        updateFades();
    }, [updateFades, items]);

    return (
        <section className={`ut-section ut-section--${variant}`}>
            <div className="ut-container" style={{ backgroundColor: config.bgColor }}>
                <h3 className="ut-title">{config.title}</h3>
                <p className="ut-subtitle">{config.subtitle}</p>

                <div className="ut-timeline-wrap">
                    <div
                        className="ut-timeline"
                        ref={timelineRef}
                        onScroll={updateFades}
                    >
                        {items.map((item) => {
                            const dateObj = new Date(item.dueDate);
                            const dayNum = dateObj.getDate();
                            const dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                            return (
                                <div className="ut-item" key={item.id}>
                                    {/* left: date label */}
                                    <div className="ut-date">
                                        <span className="ut-date-num">{dayNum}</span>
                                        <span className="ut-date-day">{dayName}</span>
                                    </div>

                                    {/* center: dot */}
                                    <div className="ut-connector">
                                        <div className="ut-dot" />
                                    </div>

                                    {/* right: item card */}
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
                    </div>

                    <div className="ut-fade ut-fade--top" style={{ opacity: showTopFade ? 1 : 0 }} />
                    <div className="ut-fade ut-fade--bottom" />
                </div>
            </div>
        </section>
    );
};

export default UpcomingTimeline;
