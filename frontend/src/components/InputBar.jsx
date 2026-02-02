import React from 'react';
import { ArrowRight } from 'lucide-react';

export function InputBar({
    placeholder = "Message",
    value,
    onChange,
    onSubmit,
    icon = <ArrowRight size={24} color="var(--text-main)" />,
    buttonStyle = "transparent",
    showFocusShadow = false,
}) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onSubmit) {
            onSubmit(value);
        }
    };

    const handleButtonClick = () => {
        if (onSubmit) {
            onSubmit(value);
        }
    };

    const handleFocus = (e) => {
        if (showFocusShadow) {
            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-lg)';
        }
    };

    const handleBlur = (e) => {
        if (showFocusShadow) {
            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-md)';
        }
    };

    const getButtonStyles = () => {
        const baseStyles = {
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            flexShrink: 0,
        };

        if (buttonStyle === 'dark') {
            return {
                ...baseStyles,
                backgroundColor: 'var(--text-main)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
            };
        }

        return {
            ...baseStyles,
            backgroundColor: 'transparent',
            padding: 'var(--space-xs)',
        };
    };

    return (
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
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
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
                onClick={handleButtonClick}
                style={getButtonStyles()}
                onMouseEnter={(e) => e.currentTarget.style.transform = buttonStyle === 'dark' ? 'scale(1.1)' : 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
            >
                {icon}
            </button>
        </div>
    );
}
