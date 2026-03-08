import '../index.css';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import 'dayjs/locale/en-gb';

dayjs.extend(weekday);
dayjs.locale('en-gb'); // Start week on Monday

const CalendarStrip = () => {
    // Generate current week (Mon-Sun)
    const startOfWeek = dayjs().startOf('week');
    const today = dayjs();
    
    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = startOfWeek.add(i, 'day');
        return {
            date: d.date(),
            day: d.format('ddd'), // Mon, Tue...
            active: d.isSame(today, 'day')
        };
    });

    return (
        <div className="home-calendar">
            <div className="flex-between" style={{ padding: '0 var(--space-xs)' }}>
                {days.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-sm)'
                    }}>
                        <span className="calendar-day-label" style={{
                            color: item.active ? 'var(--text-main)' : 'var(--text-secondary)',
                            fontWeight: item.active ? '600' : '400'
                        }}>
                            {item.day}
                        </span>
                        <div className="calendar-day-circle" style={{
                            backgroundColor: item.active ? 'var(--primary)' : 'white',
                            boxShadow: item.active ? 'var(--shadow-md)' : 'none',
                        }}>
                            {item.date}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarStrip;
