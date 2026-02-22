import React, { useMemo } from 'react';
import '../styles/MonthCalendar.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// color scheme map matching the goal color schemes used elsewhere
const COLOR_MAP = {
    blue: { bg: 'rgba(191, 209, 229, 0.5)', text: '#5A7A9B' },
    yellow: { bg: 'rgba(255, 197, 80, 0.35)', text: '#8B6914' },
    green: { bg: 'rgba(105, 153, 93, 0.3)', text: '#4A6B40' },
    pink: { bg: 'rgba(221, 100, 95, 0.3)', text: '#A0413D' },
    orange: { bg: 'rgba(237, 162, 87, 0.35)', text: '#8B5A1E' },
};

/**
 * generates a 2d grid of day objects for the given month
 * each row = 1 week (mon–sun), padded with prev/next month days
 */
function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // day of week for the 1st (0=sun → convert to mon=0)
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const grid = [];
    let currentDay = 1 - startDow; // may start negative (prev month)

    for (let row = 0; row < 5; row++) {
        const week = [];
        for (let col = 0; col < 7; col++) {
            const isCurrentMonth = currentDay >= 1 && currentDay <= daysInMonth;
            let displayDay;
            if (currentDay < 1) {
                // prev month
                const prevMonthLast = new Date(year, month, 0).getDate();
                displayDay = prevMonthLast + currentDay;
            } else if (currentDay > daysInMonth) {
                // next month
                displayDay = currentDay - daysInMonth;
            } else {
                displayDay = currentDay;
            }
            week.push({
                day: displayDay,
                date: currentDay,
                isCurrentMonth,
            });
            currentDay++;
        }
        grid.push(week);
    }

    return grid;
}

/**
 * determines highlight info for a cell based on goal ranges
 * returns { color, isStart, isEnd, isMid } or null
 */
function getCellHighlight(cellDate, daysInMonth, goalRanges) {
    if (cellDate < 1 || cellDate > daysInMonth) return null;

    for (const range of goalRanges) {
        if (cellDate >= range.startDay && cellDate <= range.endDay) {
            const color = COLOR_MAP[range.colorScheme] || COLOR_MAP.blue;
            return {
                color,
                isStart: cellDate === range.startDay,
                isEnd: cellDate === range.endDay,
                isSingle: range.startDay === range.endDay,
            };
        }
    }
    return null;
}

/**
 * MonthCalendar — responsive monthly calendar grid with goal range highlights
 *
 * @param {number} year
 * @param {number} month — 0-indexed (0 = january)
 * @param {Array} goalRanges — [{ startDay, endDay, colorScheme }]
 */
const MonthCalendar = ({ year, month, goalRanges = [] }) => {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = isCurrentMonth ? today.getDate() : -1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

    return (
        <div className="month-calendar">
            {/* day of week labels */}
            <div className="mc-day-labels">
                {DAY_LABELS.map((label) => (
                    <span key={label} className="mc-day-label">{label}</span>
                ))}
            </div>

            {/* divider line */}
            <div className="mc-divider" />

            {/* date grid */}
            <div className="mc-grid">
                {grid.map((week, rowIndex) => (
                    <div key={rowIndex} className="mc-week">
                        {week.map((cell, colIndex) => {
                            const highlight = cell.isCurrentMonth
                                ? getCellHighlight(cell.date, daysInMonth, goalRanges)
                                : null;
                            const isToday = cell.date === todayDate && cell.isCurrentMonth;

                            // build class list for the cell
                            let cellClass = 'mc-cell';
                            if (!cell.isCurrentMonth) cellClass += ' mc-cell--outside';
                            if (isToday) cellClass += ' mc-cell--today';
                            if (highlight) {
                                cellClass += ' mc-cell--highlighted';
                                if (highlight.isSingle) cellClass += ' mc-cell--single';
                                else if (highlight.isStart) cellClass += ' mc-cell--start';
                                else if (highlight.isEnd) cellClass += ' mc-cell--end';
                                else cellClass += ' mc-cell--mid';
                            }

                            return (
                                <div
                                    key={colIndex}
                                    className={cellClass}
                                    style={highlight ? {
                                        '--range-bg': highlight.color.bg,
                                        '--range-text': highlight.color.text,
                                    } : undefined}
                                >
                                    <span className="mc-cell-number">{cell.day}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MonthCalendar;
