import React, { useState } from 'react';
import { ArrowLeft, Mic, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
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
                backgroundColor: 'var(--accent-blue)',
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
                    <button style={{
                        backgroundColor: 'rgba(139, 157, 175, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        padding: '18px 24px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flex: '0 1 auto',
                        minWidth: '140px',
                        textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 157, 175, 0.7)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 157, 175, 0.5)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    >
                        Create a new bank account.
                    </button>
                    <button style={{
                        backgroundColor: 'rgba(139, 157, 175, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        padding: '18px 24px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flex: '0 1 auto',
                        minWidth: '140px',
                        textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 157, 175, 0.7)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(139, 157, 175, 0.5)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    >
                        Help me get an A in Probability I.
                    </button>
                </div>

                {/* ai input */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '12px 20px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'box-shadow 0.2s',
                    minWidth: 0,
                }}>
                    <input
                        type="text"
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // TODO: Backend Integration - Handle message submission
                                // Example: sendMessageToBackend(message);
                                console.log('Message submitted:', message);
                                setMessage(''); // Clear input after submission
                            }
                        }}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-main)',
                        }}
                    />
                    <button
                        onClick={() => {
                            // TODO: Backend Integration - Handle voice input
                            // Example: startVoiceRecording();
                            console.log('Microphone button clicked');
                        }}
                        style={{
                            backgroundColor: 'var(--text-main)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    >
                        <Mic size={20} color="white" />
                    </button>
                </div>
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: 'var(--radius-pill)',
                    padding: '12px 20px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'box-shadow 0.2s',
                    minWidth: 0,
                }}>
                    <input
                        type="text"
                        placeholder="Manually create your goal..."
                        value={manualGoal}
                        onChange={(e) => setManualGoal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                // TODO: Backend Integration - Handle manual goal creation
                                // Example: createGoalManually(manualGoal);
                                console.log('Manual goal submitted:', manualGoal);
                                setManualGoal(''); // Clear input after submission
                            }
                        }}
                        onFocus={(e) => {
                            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-md)';
                        }}
                        style={{
                            flex: 1,
                            minWidth: 0,
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-main)',
                        }}
                    />
                    <button
                        onClick={() => {
                            // TODO: Backend Integration - Handle manual goal submission
                            // Example: createGoalManually(manualGoal);
                            console.log('Manual goal submitted via button:', manualGoal);
                            setManualGoal(''); // Clear input after submission
                        }}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'var(--space-xs)',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                    >
                        <ArrowRight size={24} color="var(--text-main)" />
                    </button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default CreateGoal;
