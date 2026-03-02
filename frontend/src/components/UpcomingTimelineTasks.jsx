import { useMemo } from 'react';
import { ArrowUpLeft, ChevronLeft } from 'lucide-react';
import { ring } from 'ldrs';
import 'ldrs/react/Ring.css';
import { UpcomingTimelineShell } from './UpcomingTimeline';
import '../styles/components/UpcomingTimelineTasks.css';

ring.register();

const EMPTY_DAILY_MESSAGES = [
    "No tasks due today — enjoy the free time!",
    "Nothing scheduled for this day. Relax or plan ahead!",
    "A blank day — perfect for catching up or resting.",
    "No tasks here. Maybe tackle something from tomorrow?",
    "All clear for this day. You deserve a break!",
];

/**
 * UpcomingTimelineTasks — daily task view inside the blue shell, no timeline
 *
 * @param {string}   date     — display date for the header, e.g. "27 Feb"
 * @param {Array}    items    — [{ id, title, goalTitle, dueDate, locked? }]
 * @param {function} onClick  — optional callback when a card is tapped
 */
const UpcomingTimelineTasks = ({ date, items = [], loaded = true, onClick, onBack }) => {
    const emptyMessage = useMemo(() =>
        EMPTY_DAILY_MESSAGES[Math.floor(Math.random() * EMPTY_DAILY_MESSAGES.length)],
    []);

    return (
        <UpcomingTimelineShell
            variant="tasks"
            title={date}
            subtitle="See what tasks you have due this day"
            className="ut-no-timeline"
            headerLeft={onBack && (
                <button className="utt-back-btn" onClick={onBack} type="button">
                    <ChevronLeft size={22} strokeWidth={2.5} />
                </button>
            )}
        >
            {!loaded && (
                <div className="ut-loading">
                    <l-ring size="50" speed="1.75" color="#1C1C1E" />
                </div>
            )}
            {loaded && items.length === 0 && (
                <p className="ut-empty-message">{emptyMessage}</p>
            )}
            {items.map((item, i) => {
                const dateLabel = new Date(item.dueDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                });
                return (
                    <div
                        className="ut-item"
                        key={item.id}
                        style={{ animationDelay: `${0.05 + i * 0.07}s` }}
                    >
                        <div
                            className={`utt-card${item.locked ? ' utt-card--locked' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onClick && onClick(item); }}
                            role={onClick ? 'button' : undefined}
                            tabIndex={onClick ? 0 : undefined}
                        >
                            {/* date badge */}
                            <span className="utt-date-badge">{dateLabel}</span>

                            {/* lock icon */}
                            {item.locked && (
                                <svg className="utt-lock" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {/* shackle — stroke only */}
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    {/* body — filled */}
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="currentColor" />
                                </svg>
                            )}

                            <div className="utt-card-body">
                                <ArrowUpLeft className="utt-icon" size={18} strokeWidth={2.5} />
                                <div className="utt-text">
                                    <h4 className="utt-title">{item.title}</h4>
                                    <p className="utt-meta">From &ldquo;{item.goalTitle}&rdquo;</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </UpcomingTimelineShell>
    );
};

export default UpcomingTimelineTasks;
