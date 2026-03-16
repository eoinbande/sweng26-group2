import React from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../styles/GreenPage.css';

// semicircular gauge for co2 visualization
const Co2Gauge = () => (
    <div className="co2-gauge-container">
        <svg className="co2-gauge-svg" viewBox="0 0 200 115">
            {/* track — both ends rounded */}
            <path
                className="co2-gauge-track"
                d="M 20,100 A 80,80 0 0,1 180,100"
                strokeWidth="22"
                strokeLinecap="round"
            />
            {/* filled arc — both ends rounded */}
            <path
                className="co2-gauge-fill"
                d="M 20,100 A 80,80 0 0,1 180,100"
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset="80"
            />
        </svg>
    </div>
);

function GreenPage() {
    return (
        <div className="green-page">
            <div className="green-wave green-wave-1" />
            <div className="green-wave green-wave-2" />
            <div className="green-wave green-wave-3" />
            <div className="green-wave green-wave-4" />

            <div className="green-page-content">
                <PageHeader title="Green Dashboard" accentColor="#DD645F" />

                <p className="green-page-subtitle">
                    Your AI activity, quantified & visualized
                </p>

                {/* co2 card */}
                <div className="green-page-co2-card">
                    <Co2Gauge />
                    <div className="co2-info">
                        <span className="co2-value">120g</span>
                        <span className="co2-label">CO<sub>2</sub></span>
                        <span className="co2-description">from all your activity</span>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default GreenPage;
