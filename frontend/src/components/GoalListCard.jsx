import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import ProgressBar from './ProgressBar';
import '../styles/components/GoalListCard.css';

/**
 GoalListCard - A card component for displaying goals in a list
 Features a colored header, description, progress bar, and book-page style date tab
 
 @param {object} goal - Goal object with id, title, description, date, progress, colorScheme
 @param {function} onClick - Optional click handler (rn empty)
 */

const COLOR_SCHEMES = {
    blue: {
        header: 'var(--blue)',
        body: 'var(--blue-soft)',
    },
    yellow: {
        header: 'var(--yellow)',
        body: 'var(--yellow-soft)',
    },
    green: {
        header: 'var(--green)',
        body: 'var(--green-soft)',
    },
    pink: {
        header: 'var(--pink)',
        body: 'var(--pink-soft)',
    }
};

const GoalListCard = ({ goal, onClick, categories, onAssignCategory, onNewCategory, completed }) => {
    const navigate = useNavigate();
    const scheme = COLOR_SCHEMES[goal.colorScheme] || COLOR_SCHEMES.blue;
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignClosing, setAssignClosing] = useState(false);

    const closeAssign = useCallback(() => {
        setAssignClosing(true);
        setTimeout(() => { setIsAssignOpen(false); setAssignClosing(false); }, 200);
    }, []);


    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(`/goal/${goal.id}`, { state: { goal } });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <article 
            className={`goal-list-card${completed ? ' goal-list-card--completed-root' : ''}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`Open ${goal.title}`}
            style={{ zIndex: isAssignOpen ? 100 : 'auto' }}
        >
            <div className={`goal-card-inner${completed ? ' goal-card-inner--completed' : ''}`}>
            <div className={`goal-card-header${completed ? ' goal-card-header--completed' : ''}`} style={{ backgroundColor: scheme.header }}>        <h2 className="goal-card-title">{goal.title}</h2>
        <div className="goal-card-header-actions">
            {goal.category
                ? <span
                    className="category-badge"
                    onClick={!completed ? (e) => { e.stopPropagation(); isAssignOpen ? closeAssign() : setIsAssignOpen(true); } : undefined}
                    style={!completed ? { cursor: 'pointer' } : {}}
                  >
                    {goal.category}
                  </span>
                : !completed && (
                    <button className="assign-category-btn" onClick={(e) => { e.stopPropagation(); isAssignOpen ? closeAssign() : setIsAssignOpen(true); }}>+</button>
                )
            }
            {!completed && (
                <button className="goal-edit-btn" onClick={(e) => { e.stopPropagation(); }} aria-label="Edit goal">
                    <Pencil size={20} />
                </button>
            )}
        </div>

        {!completed && isAssignOpen && (
            <div className={`assign-dropdown${assignClosing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>
                {categories.map((cat, i) => (
                    <React.Fragment key={cat}>
                        {i > 0 && <div className="assign-dropdown-divider" />}
                        <p onClick={(e) => {
                            e.stopPropagation();
                            onAssignCategory(goal.id, cat);
                            closeAssign();
                        }}>
                             {cat}
                        </p>
                    </React.Fragment>
                ))}
            </div>
        )}
    </div>

    {!completed && (
        <div className="goal-card-body" style={{ backgroundColor: scheme.body }}>
            <p className="goal-card-description">{goal.description}</p>
            <ProgressBar progress={goal.progress} />
        </div>
    )}
</div>

            {/* date tab - vertical strip on the right side */}
            <div className="goal-date-tab">
                <span className="goal-date-text">{goal.date}</span>
            </div>
        </article>
    );
};

export default GoalListCard;
