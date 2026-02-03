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
    variant = "default", // "default" or "auth"
    padding = null, // custom padding override
    borderRadius = null, // custom border radius override
}) {
    const isAuthVariant = variant === "auth";

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
        if (isAuthVariant) {
            e.currentTarget.parentElement.style.boxShadow = '0 4px 12px rgba(255, 185, 46, 0.2), 0 0 0 3px rgba(255, 185, 46, 0.1)';
            e.currentTarget.parentElement.style.transform = 'translateY(-2px)';
        } else if (showFocusShadow) {
            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-lg)';
        }
    };

    const handleBlur = (e) => {
        if (isAuthVariant) {
            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-sm)';
            e.currentTarget.parentElement.style.transform = 'translateY(0)';
        } else if (showFocusShadow) {
            e.currentTarget.parentElement.style.boxShadow = 'var(--shadow-md)';
        }
    };

    const handleMouseEnter = (e) => {
        if (isAuthVariant) {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
    };

    const handleMouseLeave = (e) => {
        if (isAuthVariant) {
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
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
                borderRadius: 'var(--radius-md)',
                width: '36px',
                height: '36px',
            };
        }

        return {
            ...baseStyles,
            backgroundColor: 'transparent',
            padding: 'var(--space-xs)',
        };
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                backgroundColor: 'var(--card-bg)',
                borderRadius: borderRadius || (isAuthVariant ? 'var(--radius-md)' : 'var(--radius-pill)'),
                padding: padding || (isAuthVariant ? '16px 20px' : '12px 20px'),
                boxShadow: isAuthVariant ? 'var(--shadow-sm)' : 'var(--shadow-md)',
                transition: 'all 0.3s ease',
                minWidth: 0,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
