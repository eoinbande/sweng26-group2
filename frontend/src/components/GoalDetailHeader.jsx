import React from 'react';
import { ArrowUpLeft, Calendar } from 'lucide-react';
import '../styles/components/GoalDetailHeader.css';

// progress bar fills
const getProgressColor = (pct) => {
    if (pct === 100) return 'var(--green)';
    if (pct >= 68)   return 'var(--blue)';
    if (pct >= 34)   return 'var(--yellow)';
    return 'var(--red)';
};

const formatEndDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
};

// GoalDetailHeader component: goal title, progress bar, category, end date

const GoalDetailHeader = ({ title, progress = 0, category, endDate, onBack }) => {
    const progressColor = getProgressColor(progress);
    const formattedEndDate = formatEndDate(endDate);

    return (
        <div className="goal-detail-header">
            {/* back arrow and title */}
            <div className="goal-detail-header__title-row">
                <button
                    className="goal-detail-header__back-btn"
                    onClick={onBack}
                    aria-label="Back to goals"
                >
                    <ArrowUpLeft size={40} strokeWidth={2.5} />
                </button>
                <h1 className="goal-detail-header__title">{title}</h1>
            </div>

            {/* progress bar */}
            <div className="goal-detail-header__progress-section">
                <div className="goal-detail-header__progress-track">
                    <div
                        className="goal-detail-header__progress-fill"
                        style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    />
                </div>

                <div className="goal-detail-header__meta">
                    <span className="goal-detail-header__percentage">
                        {progress}% complete
                    </span>
                    {category && (
                        <span className="goal-detail-header__category">{category}</span>
                    )}
                </div>
            </div>

            {/* end date */}
            {formattedEndDate && (
                <div className="goal-detail-header__end-date">
                    <Calendar size={22} />
                    <span>Goal ends: {formattedEndDate}</span>
                </div>
            )}
        </div>
    );
};

export default GoalDetailHeader;
