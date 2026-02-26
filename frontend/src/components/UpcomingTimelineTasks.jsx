import { UpcomingTimelineShell } from './UpcomingTimeline';

/**
 * UpcomingTimelineTasks — uses the tasks (blue) shell with custom content
 *
 * @param {Array}    items    — [{ id, title, description, dueDate }]
 * @param {function} onClick  — optional callback when an item is tapped
 */
const UpcomingTimelineTasks = ({ items = [], onClick }) => {
    return (
        <UpcomingTimelineShell variant="tasks">
            {items.map((item) => (
                <div
                    className="ut-item"
                    key={item.id}
                    onClick={() => onClick && onClick(item)}
                    role={onClick ? 'button' : undefined}
                    tabIndex={onClick ? 0 : undefined}
                >
                    <div className="ut-card">
                        <div className="ut-card-content">
                            <div className="ut-card-text">
                                <h4 className="ut-card-title">{item.title}</h4>
                                <p className="ut-card-desc">{item.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </UpcomingTimelineShell>
    );
};

export default UpcomingTimelineTasks;
