import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const GoalListCard = ({ goal, onClick }) => {
    const navigate = useNavigate();
    const scheme = COLOR_SCHEMES[goal.colorScheme] || COLOR_SCHEMES.blue;

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
            className="goal-list-card"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`Open ${goal.title}`}
        >
            <div className="goal-card-inner">
                {/* Header Section */}
                <div 
                    className="goal-card-header"
                    style={{ backgroundColor: scheme.header }}
                >
                    <h2 className="goal-card-title">{goal.title}</h2>
                </div>

                {/* Body Section */}
                <div 
                    className="goal-card-body"
                    style={{ backgroundColor: scheme.body }}
                >
                    <p className="goal-card-description">{goal.description}</p>
                    <ProgressBar progress={goal.progress} />
                </div>
            </div>

            {/* date tab - vertical strip on the right side */}
            <div className="goal-date-tab">
                <span className="goal-date-text">{goal.date || ''}</span>
            </div>
        </article>
    );
};

export default GoalListCard;
