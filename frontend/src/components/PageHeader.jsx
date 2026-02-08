import React from 'react';
import '../styles/components/PageHeader.css';

/**
 PageHeader - Reusable header component with half circle accent and title
 Used across multiple pages (Goals, Schedule, Progress, Profile, etc.)
 
 * @param {string} title 
 * @param {string} accentColor - optional color of half circle (defaults to red)
 */
const PageHeader = ({ title, accentColor = '#E8505B' }) => {
    return (
        <div className="page-header">
            <div 
                className="page-header-accent"
                style={{ backgroundColor: accentColor }}
            />
            <h1 className="page-header-title">{title}</h1>
        </div>
    );
};

export default PageHeader;
