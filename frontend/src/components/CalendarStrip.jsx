import React from 'react';
import '../index.css';

const CalendarStrip = () => {
    const days = [
        { day: 'Mon', date: 26 },
        { day: 'Tue', date: 27, active: true },
        { day: 'Wed', date: 28 },
        { day: 'Thu', date: 29 },
        { day: 'Fri', date: 30 },
        { day: 'Sat', date: 31 },
        { day: 'Sun', date: 1 },
    ];

    return (
        <div style={{ marginBottom: 'var(--space-mdlg)' }}>
            <div className="flex-between" style={{ padding: '0 var(--space-xs)' }}>
                {days.map((item, index) => (
                    <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--space-sm)'
                    }}>
                        <span style={{
                            fontSize: '13px',
                            color: item.active ? 'var(--text-main)' : 'var(--text-secondary)',
                            fontWeight: item.active ? '600' : '400'
                        }}>
                            {item.day}
                        </span>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: item.active ? 'var(--primary)' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: item.active ? 'var(--shadow-md)' : 'none',
                            fontWeight: '600',
                            fontSize: '14px'
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
