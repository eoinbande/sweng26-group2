import React, { useState } from 'react';
import { ArrowLeft, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { InputBar } from '../components/InputBar';
import '../index.css';

function CreateGoal() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [manualGoal, setManualGoal] = useState('');

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
            overflow: 'hidden',
        }}>
            {/* Blue Section - Top */}
            <div style={{
                background: 'var(--accent-blue)',
                padding: 'var(--space-lg)',
                paddingTop: 'var(--space-xl)',
                paddingBottom: 'var(--space-xl)',
                borderRadius: '0 0 var(--radius-xxl) var(--radius-xxl)',
                flexShrink: 0,
                boxShadow: 'var(--shadow-float)',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* back button */}
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 'var(--space-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 'var(--space-lg)',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                    <ArrowLeft size={32} color="var(--text-main)" strokeWidth={2.5} />
                </button>

                {/* Title and Subtitle */}
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '40px',
                    fontWeight: '600',
                    lineHeight: '1.2',
                    marginBottom: 'var(--space-md)',
                    color: 'var(--text-main)',
                }}>
                    Let's build<br />your goal.
                </h1>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '16px',
                    color: 'var(--text-main)',
                    opacity: 0.8,
                    marginBottom: 'var(--space-xl)',
                }}>
                    Tell us where you want to go, we'll<br />show you how to get there
                </p>

                {/* AI suggested buttons */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    flexWrap: 'wrap',
                    marginBottom: 'var(--space-lg)',
                }}>
                    <button
                        onClick={() => {
                            console.log('AI suggestion clicked: Create a new bank account.');
                            navigate('/review-plan');
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: '18px 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '140px',
                            textAlign: 'left',
                            boxShadow: '0 2px 8px rgba(107, 141, 176, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.8) 0%, rgba(139, 169, 201, 0.8) 100%)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 141, 176, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 141, 176, 0.3)';
                        }}
                    >
                        Create a new bank account.
                    </button>
                    <button
                        onClick={() => {
                            console.log('AI suggestion clicked: Help me get an A in Probability I.');
                            navigate('/review-plan');
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            padding: '18px 24px',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            flex: '0 1 auto',
                            minWidth: '140px',
                            textAlign: 'left',
                            boxShadow: '0 2px 8px rgba(107, 141, 176, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.8) 0%, rgba(139, 169, 201, 0.8) 100%)';
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 141, 176, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(107, 141, 176, 0.6) 0%, rgba(139, 169, 201, 0.6) 100%)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 141, 176, 0.3)';
                        }}
                    >
                        Help me get an A in Probability I.
                    </button>
                </div>

                {/* ai input */}
                <InputBar
                    placeholder="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onSubmit={() => {
                        console.log('Message submitted:', message);
                        setMessage('');
                        navigate('/review-plan');
                    }}
                    icon={<Mic size={18} color="white" />}
                    buttonStyle="dark"
                    variant="auth"
                    padding="12px 14px"
                    borderRadius="var(--radius-lg)"
                />
            </div>

            {/* Beige Section - Bottom */}
            <div style={{
                flex: 1,
                backgroundColor: 'var(--bg-color)',
                padding: 'var(--space-lg)',
                paddingBottom: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                overflowY: 'auto',
            }}>
                {/* 'or' divider */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--space-lg)',
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
                <InputBar
                    placeholder="Manually create your goal..."
                    value={manualGoal}
                    onChange={(e) => setManualGoal(e.target.value)}
                    onSubmit={() => {
                        console.log('Manual goal submitted:', manualGoal);
                        setManualGoal('');
                        navigate('/review-plan');
                    }}
                    variant="auth"
                    borderRadius="var(--radius-xl)"
                />
            </div>

            <BottomNav />
        </div>
    );
}

export default CreateGoal;
