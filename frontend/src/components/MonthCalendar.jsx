import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import '../styles/components/MonthCalendar.css';

// color scheme map matching the goal color schemes used elsewhere
const COLOR_MAP = {
    blue: { bg: 'rgba(191, 209, 229, 0.5)', text: '#5A7A9B' },
    yellow: { bg: 'rgba(255, 197, 80, 0.35)', text: '#8B6914' },
    green: { bg: 'rgba(105, 153, 93, 0.3)', text: '#4A6B40' },
    pink: { bg: 'rgba(221, 100, 95, 0.3)', text: '#A0413D' },
    orange: { bg: 'rgba(237, 162, 87, 0.35)', text: '#8B5A1E' },
};

/**
 * determines highlight info for a day based on goal ranges
 */
function getDayHighlight(dayOfMonth, goalRanges) {
    for (const range of goalRanges) {
        if (dayOfMonth >= range.startDay && dayOfMonth <= range.endDay) {
            const color = COLOR_MAP[range.colorScheme] || COLOR_MAP.blue;
            return {
                color,
                isStart: dayOfMonth === range.startDay,
                isEnd: dayOfMonth === range.endDay,
                isSingle: range.startDay === range.endDay,
            };
        }
    }
    return null;
}

/**
 * custom day component that renders goal range highlights
 */
function CustomDay(props) {
    const { day, outsideCurrentMonth, goalRanges = [], ...other } = props;
    const dayOfMonth = day.date();
    const isCurrentMonth = !outsideCurrentMonth;

    const highlight = isCurrentMonth ? getDayHighlight(dayOfMonth, goalRanges) : null;

    // build class list
    let wrapperClass = 'mc-day-wrapper';
    if (highlight) {
        wrapperClass += ' mc-cell--highlighted';
        if (highlight.isSingle) wrapperClass += ' mc-cell--single';
        else if (highlight.isStart) wrapperClass += ' mc-cell--start';
        else if (highlight.isEnd) wrapperClass += ' mc-cell--end';
        else wrapperClass += ' mc-cell--mid';
    }

    return (
        <div
            className={wrapperClass}
            style={highlight ? {
                '--range-bg': highlight.color.bg,
                '--range-text': highlight.color.text,
            } : undefined}
        >
            <PickersDay
                {...other}
                day={day}
                outsideCurrentMonth={outsideCurrentMonth}
                sx={{
                    // override mui default selected/today styles
                    '&.Mui-selected': {
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        '&:hover': { backgroundColor: 'transparent' },
                        '&:focus': { backgroundColor: 'transparent' },
                    },
                    '&.MuiPickersDay-today': {
                        border: 'none',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: 'var(--primary)' },
                        '&:focus': { backgroundColor: 'var(--primary)' },
                    },
                    ...(highlight ? {
                        color: 'var(--range-text)',
                        fontWeight: 600,
                    } : {}),
                }}
            />
        </div>
    );
}

/**
 * MonthCalendar — MUI DateCalendar with goal range highlights
 *
 * @param {number} year
 * @param {number} month — 0-indexed (0 = january)
 * @param {Array} goalRanges — [{ startDay, endDay, colorScheme }]
 */
const MonthCalendar = ({ year, month, goalRanges = [] }) => {
    const displayDate = useMemo(() => dayjs(new Date(year, month, 1)), [year, month]);

    return (
        <div className="month-calendar">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                    value={null}
                    defaultCalendarMonth={displayDate}
                    readOnly
                    views={['day']}
                    slots={{ day: CustomDay }}
                    slotProps={{
                        day: { goalRanges },
                    }}
                    showDaysOutsideCurrentMonth
                    fixedWeekNumber={5}
                    sx={{
                        width: '100%',
                        maxHeight: 'none',
                        height: 'auto',
                        // hide the header (month/year + navigation arrows)
                        '& .MuiPickersCalendarHeader-root': {
                            display: 'none',
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default MonthCalendar;
