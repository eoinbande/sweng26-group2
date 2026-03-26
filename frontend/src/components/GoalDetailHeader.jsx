import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpLeft, Calendar, Pencil, Check, X } from 'lucide-react';
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

const GoalDetailHeader = ({ title, progress = 0, category, endDate, onBack, onTitleChange }) => {
    const progressColor = getProgressColor(progress);
    const formattedEndDate = formatEndDate(endDate);
    const [isEditing, setIsEditing] = useState(false);
    const [editClosing, setEditClosing] = useState(false);
    const [editValue, setEditValue] = useState(title);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && !editClosing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing, editClosing]);

    const closeEdit = (callback) => {
        setEditClosing(true);
        setTimeout(() => {
            setIsEditing(false);
            setEditClosing(false);
            if (callback) callback();
        }, 200);
    };

    const handleSave = () => {
        const trimmed = editValue.trim();
        closeEdit(() => {
            if (trimmed && trimmed !== title && onTitleChange) {
                onTitleChange(trimmed);
            }
        });
    };

    const handleCancel = () => {
        closeEdit(() => setEditValue(title));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    };

    return (
        <div className="goal-detail-header">
            {/* back arrow, title, and edit button */}
            <div className="goal-detail-header__title-row">
                <button
                    className="goal-detail-header__back-btn"
                    onClick={onBack}
                    aria-label="Back to goals"
                >
                    <ArrowUpLeft size={40} strokeWidth={2.5} />
                </button>
                {isEditing ? (
                    <div className={`goal-detail-header__edit-row${editClosing ? ' closing' : ''}`}>
                        <input
                            ref={inputRef}
                            className={`goal-detail-header__title-input${editClosing ? ' closing' : ''}`}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className={`goal-detail-header__action-btn save${editClosing ? ' closing' : ''}`} onClick={handleSave} aria-label="Save">
                            <Check size={22} strokeWidth={2.5} />
                        </button>
                        <button className={`goal-detail-header__action-btn cancel${editClosing ? ' closing' : ''}`} onClick={handleCancel} aria-label="Cancel">
                            <X size={22} strokeWidth={2.5} />
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="goal-detail-header__title">{title}</h1>
                        <button
                            className="goal-detail-header__edit-btn"
                            onClick={() => { setEditValue(title); setIsEditing(true); }}
                            aria-label="Edit goal title"
                        >
                            <Pencil size={26} />
                        </button>
                    </>
                )}
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
