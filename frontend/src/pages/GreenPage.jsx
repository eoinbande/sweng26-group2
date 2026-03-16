import React from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../styles/GreenPage.css';

function GreenPage() {
    return (
        <div className="green-page">
            <div className="green-wave green-wave-1" />

            <div className="green-page-content">
                <PageHeader title="Green Dashboard" accentColor="#DD645F" />

                <p className="green-page-subtitle">
                    Your AI activity, quantified & visualized
                </p>
            </div>

            <BottomNav />
        </div>
    );
}

export default GreenPage;
