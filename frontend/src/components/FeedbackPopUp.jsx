import React, { useState } from 'react';
import '../index.css';
import { InputBar } from './InputBar';
import { X, Mic, ArrowUp } from 'lucide-react';

const variantConfig = {
    help: {
        background: 'var(--accent-blue)',
        title: 'Hit a roadblock?',
        subtitle: "Tell us what's blocking you and we'll find another way to get there.",
    },
    reroute: {
        background: 'var(--accent-pink)',
        title: 'Change of plans?',
        subtitle: "Tell us what's shifted, we'll help you reroute.",
    },
};

export default function FeedbackPopUp({ variant = 'help', onClose, onSubmit }) {
    const config = variantConfig[variant] || variantConfig.help;
    const [inputValue, setInputValue] = useState('');

    return (
        <div style={{
            background: config.background,
            padding: '100px 80px 80px 80px', 
            borderRadius: '60px 60px 0 0',
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
        }}>
            {/* close button - pinned to top right */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10
                }}
            >
                <X size={24} color="var(--text-main)" strokeWidth={2.5} />
            </button>

            {/* title */}
            <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 7vw, 36px)',
                fontWeight: '600',
                color: 'var(--text-main)',
                textAlign: 'left',
                margin: 0,
                marginTop: '1rem', 
                marginBottom: '0.75rem',
                lineHeight: 1.2,
            }}>
                {config.title}
            </h2>

            {/* subtitle */}
            <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '15px',
                color: 'var(--text-main)',
                textAlign: 'left',
                margin: 0,
                lineHeight: 1.5,
                maxWidth: '90%',
                marginBottom: '2.5rem', 
            }}>
                {config.subtitle}
            </p>

            {/* input bar container */}
            <div style={{ width: '100%' }}>
                <InputBar
                    variant="auth"
                    placeholder="Feedback to AI..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onSubmit={() => onSubmit(inputValue)}
                    icon={<ArrowUp size={20} color="white" strokeWidth={2.5} />} // icon={<Mic size={18} color="white" />}
                    buttonStyle="dark"
                    padding="18px 20px"
                    borderRadius="var(--radius-xl)"
                />
            </div>
        </div>
    );
}