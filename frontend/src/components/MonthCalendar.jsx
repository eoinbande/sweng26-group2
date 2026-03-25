import React, { useMemo, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/en-gb';
import { styled } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import '../styles/components/MonthCalendar.css';

// configure dayjs to start weeks on monday
dayjs.extend(weekday);
dayjs.extend(updateLocale);
dayjs.locale('en-gb');

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
 * styled day component — handles range highlighting via styled-components
 * uses disableMargin for seamless continuous bars between days
 */
const StyledDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        prop !== 'highlightBg' &&
        prop !== 'highlightText' &&
        prop !== 'isStart' &&
        prop !== 'isEnd' &&
        prop !== 'isMid' &&
        prop !== 'isSingle',
})(({ highlightBg, highlightText, isStart, isEnd, isMid, isSingle }) => {
    const inRange = isStart || isEnd || isMid;

    return {
        // use nested selector for higher specificity over MUI defaults
        '&.MuiPickersDay-root': {
            // all range days: flat rectangle, colored background, no transform
            ...(inRange && {
                borderRadius: 0,
                backgroundColor: highlightBg,
                color: highlightText,
                fontWeight: 600,
                '&:hover, &:focus, &:active': {
                    backgroundColor: highlightBg,
                    transform: 'none',
                },
            }),

            // single day — perfect circle, no transform
            ...(isSingle && {
                backgroundColor: highlightBg,
                color: highlightText,
                fontWeight: 600,
                borderRadius: '999px',
                width: 'clamp(26px, 4dvh, 36px)',
                aspectRatio: '1',
                justifySelf: 'center',
                '&:hover, &:focus, &:active': {
                    backgroundColor: highlightBg,
                    transform: 'none',
                },
            }),

            // rounded left cap for range start
            ...(isStart && {
                borderTopLeftRadius: '999px',
                borderBottomLeftRadius: '999px',
            }),

            // rounded right cap for range end
            ...(isEnd && {
                borderTopRightRadius: '999px',
                borderBottomRightRadius: '999px',
            }),
        },
    };
});

/**
 * custom day slot — wraps StyledDay with highlight props
 */
function Day(props) {
    const { day, outsideCurrentMonth, goalRanges = [], onDayClick, ...other } = props;
    const dayOfMonth = day.date();
    const isCurrentMonth = !outsideCurrentMonth;

    const highlight = isCurrentMonth ? getDayHighlight(dayOfMonth, goalRanges) : null;

    const handleClick = () => {
        if (!outsideCurrentMonth && onDayClick) onDayClick(day);
    };

    return (
        <StyledDay
            {...other}
            day={day}
            outsideCurrentMonth={outsideCurrentMonth}
            onDaySelect={handleClick}
            onClick={handleClick}
            disableMargin
            selected={false}
            className={highlight ? 'day-highlighted' : undefined}
            highlightBg={highlight ? highlight.color.bg : undefined}
            highlightText={highlight ? highlight.color.text : undefined}
            isStart={highlight ? highlight.isStart && !highlight.isSingle : false}
            isEnd={highlight ? highlight.isEnd && !highlight.isSingle : false}
            isMid={highlight ? !highlight.isStart && !highlight.isEnd : false}
            isSingle={highlight ? highlight.isSingle : false}
            sx={{
                // today circle override — skip if day is already highlighted
                ...(!highlight && {
                    '&.MuiPickersDay-today': {
                        border: 'none',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: '999px',
                        width: 'clamp(26px, 4dvh, 36px)',
                        aspectRatio: '1',
                        justifySelf: 'center',
                        '&:hover, &:focus': {
                            backgroundColor: 'var(--primary)',
                        },
                    },
                }),
                // remove default today border when highlighted
                ...(highlight && {
                    '&.MuiPickersDay-today': {
                        border: 'none',
                    },
                }),
            }}
        />
    );
}

/**
 * MonthCalendar — MUI DateCalendar with goal range highlights
 *
 * @param {number} year
 * @param {number} month — 0-indexed (0 = january)
 * @param {Array} goalRanges — [{ startDay, endDay, colorScheme }]
 */
const MonthCalendar = ({ year, month, goalRanges = [], onDayClick, onMonthChange }) => {
    const displayDate = useMemo(() => dayjs(new Date(year, month, 1)), [year, month]);
    const wrapperRef = useRef(null);
    const timerRef = useRef(null);

    // measure the current month's last row and set wrapper height;
    // uses the last monthContainer to avoid stale rows during transitions
    const calcHeight = () => {
        const el = wrapperRef.current;
        if (!el) return;
        const containers = el.querySelectorAll('.MuiDayCalendar-monthContainer');
        if (!containers.length) return;
        const current = containers[0];
        const rows = current.querySelectorAll('.MuiDayCalendar-weekContainer');
        if (rows.length) {
            const wrapperTop = el.getBoundingClientRect().top;
            const lastRow = rows[rows.length - 1];
            const h = lastRow.getBoundingClientRect().bottom - wrapperTop;
            if (h > 0) el.style.height = h + 'px';
        }
    };

    // initial height calc + window resize only
    useEffect(() => {
        requestAnimationFrame(calcHeight);
        const onResize = () => requestAnimationFrame(calcHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // on month change: let MUI slide freely, then animate to new height
    const handleMonthChange = (date) => {
        const el = wrapperRef.current;
        if (el) {
            // freeze current height so the upcoming component doesn't jump
            const current = el.getBoundingClientRect().height;
            el.style.transition = 'none';
            el.style.height = current + 'px';

            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                // after MUI's slide finishes, animate to the new height
                el.style.transition = '';
                calcHeight();
            }, 400);
        }
        if (onMonthChange) onMonthChange(date);
    };

    return (
        <div className="month-calendar" ref={wrapperRef}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                <DateCalendar
                    value={null}
                    referenceDate={displayDate}
                    views={['day']}
                    slots={{ day: Day }}
                    slotProps={{
                        day: { goalRanges, onDayClick },
                    }}
                    onMonthChange={handleMonthChange}
                    showDaysOutsideCurrentMonth
                    sx={{
                        width: '100%',
                        // keep header in DOM for programmatic arrow clicks, but hide visually
                        '& .MuiPickersCalendarHeader-root': {
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            overflow: 'hidden',
                        },
                    }}
                />
            </LocalizationProvider>
        </div>
    );
};

export default MonthCalendar;
