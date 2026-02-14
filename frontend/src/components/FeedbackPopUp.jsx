import React from 'react';
import '../index.css';
import { InputBar } from './InputBar';
import { X, Mic } from 'lucide-react';

// variant content configuration
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

    return (
        <div style={{
            background: config.background,
            padding: '12%',
            borderRadius: '15% 15% 0 0',
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            boxSizing: 'border-box',
        }}>
            {/* close button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '6%',
                    right: '6%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                <X size={28} color="var(--text-main)" strokeWidth={2.5} />
            </button>

            {/* title */}
            <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(32px, 8vw, 44px)',
                fontWeight: '600',
                color: 'var(--text-main)',
                textAlign: 'left',
                margin: 0,
                marginTop: '18%',
                marginBottom: '3%',
            }}>
                {config.title}
            </h2>

            {/* subtitle */}
            <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(12px, 3.5vw, 16px)',
                color: 'var(--text-main)',
                textAlign: 'left',
                margin: 0,
                lineHeight: 1.5,
                maxWidth: '75%',
            }}>
                {config.subtitle}
            </p>

            {/* input bar */}
            <div style={{ width: '100%', marginTop: 'auto', paddingBottom: '5%' }}>
                <InputBar
                    variant="auth"
                    placeholder="Feedback to AI..."
                    onSubmit={onSubmit}
                    icon={<Mic size={18} color="white" />}
                    buttonStyle="dark"
                    padding="12px 14px"
                    borderRadius="var(--radius-lg)"
                />
            </div>
        </div>
    );
}
