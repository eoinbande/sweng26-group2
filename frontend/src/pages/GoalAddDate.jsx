import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateScrollPicker } from 'react-date-wheel-picker';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import '../index.css';

function GoalAddDate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [manualGoal, setManualGoal] = useState('');
    const [dateValue, setDateValue] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    // const [isFading, setIsFading] = useState(false);
    // const [isExpanding, setIsExpanding] = useState(false);
    const pickerRef = useRef(null);

    // goal text passed from CreateGoal
    const goalText = location.state?.goalText || '';

    // fade in content on mount
    useEffect(() => {
        const timer = setTimeout(() => setContentVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // format date from picker as MM/DD/YYYY
    const handleDateChange = (date) => {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        setDateValue(`${mm}/${dd}/${yyyy}`);
    };

    // close picker when clicking outside
    useEffect(() => {
        if (!showPicker) return;
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    // // --- expanding blue card transition for navigating to loading/review ---
    // // uncomment isFading and isExpanding state above to use
    // const handleDateSubmit = () => {
    //     // step 1: fade out content
    //     setIsFading(true);
    //     // step 2: expand blue card to fill screen
    //     setTimeout(() => setIsExpanding(true), 400);
    //     // step 3: navigate to review/loading after expansion
    //     setTimeout(() => {
    //         navigate('/review-plan', {
    //             state: {
    //                 goalText,
    //                 dueDate: dateValue,
    //                 showLoading: true,
    //             },
    //         });
    //     }, 1400);
    // };
    //
    // // blue section style additions for expansion:
    // // borderRadius: isExpanding ? '0' : '0 0 var(--radius-xxl) var(--radius-xxl)',
    // // height: isExpanding ? '100vh' : '66vh',
    // // transition: 'height 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), border-radius 0.3s ease-out',
    //
    // // content fade-out (add to each content element):
    // // opacity: isFading ? 0 : (contentVisible ? 1 : 0),
    // // transform: isFading ? 'translateY(-20px)' : (contentVisible ? 'translateY(0)' : 'translateY(20px)'),

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: 'var(--bg-color)',
        }}>
            {/* blue section */}
            <div style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '66vh',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* back button */}
                <button
                    onClick={() => navigate('/create-goal')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'flex-start',
                        marginBottom: 'var(--space-lg)',
                        opacity: contentVisible ? 1 : 0,
                        transition: 'opacity 0.4s ease-out',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* title */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(30px, 5vh, 40px)',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    alignSelf: 'center',
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.4s ease-out 0.1s',
                }}>
                    When's your<br />deadline?
                </h1>

                {/* date input / picker morph container */}
                <div
                    ref={pickerRef}
                    onClick={() => { if (!showPicker) setShowPicker(true); }}
                    style={{
                        marginTop: 'var(--space-xl)',
                        opacity: contentVisible ? 1 : 0,
                        transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s, background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        maxWidth: showPicker ? '95%' : '90%',
                        width: '100%',
                        alignSelf: 'center',
                        cursor: showPicker ? 'default' : 'pointer',
                        backgroundColor: showPicker ? 'white' : 'var(--blue-soft)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '0',
                        boxShadow: showPicker ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                    }}
                >
                    {/* collapsed: input bar label */}
                    <div style={{
                        maxHeight: showPicker ? '0px' : '80px',
                        opacity: showPicker ? 0 : 1,
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
                    }}>
                        <InputBar
                            placeholder="MM/DD/YYYY"
                            value={dateValue}
                            onChange={() => {}}
                            onSubmit={() => {}}
                            variant="auth"
                            borderRadius="var(--radius-xl)"
                            backgroundColor="transparent"
                            padding="22px"
                            fontSize="20px"
                            readOnly
                        />
                    </div>

                    {/* expanded: date wheel picker */}
                    <div className="date-picker-wrapper" style={{
                        maxHeight: showPicker ? '200px' : '0px',
                        opacity: showPicker ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease 0.1s',
                        fontFamily: 'var(--font-sans)',
                    }}>
                        <DateScrollPicker
                            onDateChange={handleDateChange}
                            startYear={2025}
                            defaultYear={new Date().getFullYear()}
                            defaultMonth={new Date().getMonth()}
                            defaultDay={new Date().getDate()}
                            itemHeight={40}
                            visibleRows={3}
                            dateTimeFormatOptions={{ month: 'short' }}
                            highlightOverlayStyle={{
                                borderTop: '1px solid #ccc',
                                borderBottom: '1px solid #ccc',
                                background: 'transparent',
                                borderRadius: 0,
                                boxShadow: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* skip / let ai decide buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'center',
                    marginTop: 'var(--space-lg)',
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.4s ease-out 0.3s',
                }}>
                    <button
                        onClick={() => console.log('Skip deadline')}
                        style={{
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-main)',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '12px 32px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        Skip deadline
                    </button>
                    <button
                        onClick={() => console.log('Let AI decide')}
                        style={{
                            backgroundColor: 'var(--text-main)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-pill)',
                            padding: '12px 32px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: 'var(--shadow-sm)',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        Let AI decide
                    </button>
                </div>

            </div>

            {/* bottom section */}
            <div style={{
                position: 'absolute',
                top: '66vh',
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-color)',
            }}>
                {/* 'or' divider */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '20px',
                        fontWeight: '500',
                        color: 'var(--text-main)',
                    }}>
                        or
                    </p>
                </div>

                {/* manual input */}
                <div style={{
                    padding: '0 var(--space-lg)',
                    paddingBottom: '150px',
                }}>
                    <InputBar
                        placeholder="Manually create your goal..."
                        value={manualGoal}
                        onChange={(e) => setManualGoal(e.target.value)}
                        onSubmit={() => {
                            if (manualGoal.trim()) {
                                console.log('Manual goal:', manualGoal);
                                setManualGoal('');
                            }
                        }}
                        variant="auth"
                        padding="18px 20px"
                        borderRadius="var(--radius-xl)"
                    />
                </div>
            </div>

            {/* bottom nav */}
            <BottomNav />
        </div>
    );
}

export default GoalAddDate;
