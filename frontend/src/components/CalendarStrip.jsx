import '../index.css';

const CalendarStrip = () => {
    const days = [
        { day: 'Mon', date: 16 },
        { day: 'Tue', date: 17 },
        { day: 'Wed', date: 18 },
        { day: 'Thu', date: 19 },
        { day: 'Fri', date: 20, active: true  },
        { day: 'Sat', date: 21},
        { day: 'Sun', date: 22 },
    ];

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
