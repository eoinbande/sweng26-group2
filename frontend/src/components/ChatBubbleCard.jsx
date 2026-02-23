import React from 'react';
import '../styles/components/ChatBubbleCard.css';

/**
 * ChatBubbleCard — outgoing message bubble wrapper
 *
 * asymmetric rounding: top-left is sharp (tail), other corners fully rounded
 *
 * @param {string}    backgroundColor — bubble fill color
 * @param {ReactNode} children
 * @param {string}    className       — additional classes
 */
const ChatBubbleCard = ({ backgroundColor = 'var(--accent-red-soft)', children, className = '' }) => {
    return (
        <div
            className={`chat-bubble ${className}`}
            style={{ backgroundColor }}
        >
            {children}
        </div>
    );
};

export default ChatBubbleCard;
