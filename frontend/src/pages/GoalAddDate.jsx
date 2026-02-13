import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import '../index.css';

function GoalAddDate() {
    const navigate = useNavigate();
    const location = useLocation();
    const [manualGoal, setManualGoal] = useState('');
    const [dateValue, setDateValue] = useState('');

    // goal text passed from CreateGoal
    const goalText = location.state?.goalText || '';

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
                        opacity: 1,
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
                }}>
                    When's your<br />deadline?
                </h1>

                {/* date input */}
                <div style={{
                    marginTop: 'var(--space-xl)',
                    maxWidth: '90%',
                    alignSelf: 'center',
                }}>
                    <InputBar
                        placeholder="DD/MM/YYYY"
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        onSubmit={() => {
                            if (dateValue.trim()) {
                                console.log('Date submitted:', dateValue);
                            }
                        }}
                        variant="auth"
                        borderRadius="var(--radius-xl)"
                        backgroundColor="var(--blue-soft)"
                        padding = "22px"
                        fontSize="20px"
                    />
                </div>

                {/* skip / let ai decide buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'center',
                    marginTop: 'var(--space-lg)',
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
