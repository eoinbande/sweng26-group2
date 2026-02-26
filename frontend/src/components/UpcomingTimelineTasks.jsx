import { ArrowUpLeft, Lock } from 'lucide-react';
import { UpcomingTimelineShell } from './UpcomingTimeline';
import '../styles/components/UpcomingTimelineTasks.css';

/**
 * UpcomingTimelineTasks — daily task view inside the blue shell, no timeline
 *
 * @param {string}   date     — display date for the header, e.g. "27 Feb"
 * @param {Array}    items    — [{ id, title, goalTitle, dueDate, locked? }]
 * @param {function} onClick  — optional callback when a card is tapped
 */
const UpcomingTimelineTasks = ({ date, items = [], onClick }) => {
    return (
        <UpcomingTimelineShell
            variant="tasks"
            title={date}
            subtitle="See what tasks you have due this day"
            className="ut-no-timeline"
        >
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
                            onClick={() => onClick && onClick(item)}
                            role={onClick ? 'button' : undefined}
                            tabIndex={onClick ? 0 : undefined}
                        >
                            {/* date badge */}
                            <span className="utt-date-badge">{dateLabel}</span>

                            {/* lock icon */}
                            {item.locked && (
                                <Lock className="utt-lock" size={14} strokeWidth={2.5} />
                            )}

                            <div className="utt-card-body">
                                <ArrowUpLeft className="utt-icon" size={16} strokeWidth={2.5} />
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
