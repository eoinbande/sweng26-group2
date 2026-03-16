import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../styles/GreenPage.css';

// animates a number from 0 to target over duration
const useCountUp = (target, duration = 800, shouldStart = false) => {
    const [value, setValue] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (!shouldStart || target === 0) {
            if (shouldStart) setValue(0);
            return;
        }

        const start = performance.now();
        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, shouldStart]);

    return value;
};

// semicircular gauge for co2 visualization
const Co2Gauge = ({ loaded, fillOffset }) => (
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
                className={`co2-gauge-fill ${loaded ? 'co2-gauge-fill--active' : ''}`}
                d="M 20,100 A 80,80 0 0,1 180,100"
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray="251"
                strokeDashoffset={loaded ? fillOffset : 251}
            />
        </svg>
    </div>
);

function GreenPage() {
    // simulated loading state — replace with real fetch later
    const [data, setData] = useState(null);
    const loaded = data !== null;

    useEffect(() => {
        // simulate api delay — swap with real endpoint
        const timer = setTimeout(() => {
            setData({ co2: 120, aiCalls: 28, tokens: 234 });
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const co2 = useCountUp(data?.co2 ?? 0, 1000, loaded);
    const aiCalls = useCountUp(data?.aiCalls ?? 0, 800, loaded);
    const tokens = useCountUp(data?.tokens ?? 0, 1000, loaded);

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
                    <Co2Gauge loaded={loaded} fillOffset={80} />
                    <div className="co2-info">
                        <span className="co2-value">
                            {loaded ? `${co2}g` : '—'}
                        </span>
                        <span className="co2-label">CO<sub>2</sub></span>
                        <span className="co2-description">from all your activity</span>
                    </div>
                </div>

                {/* stats section */}
                <h2 className="green-page-section-title">
                    In total, you've made...
                </h2>

                <div className="green-page-stats-wrapper">
                    <div className="stat-card stat-card-dark">
                        <span className="stat-value">
                            {loaded ? aiCalls : '—'}
                        </span>
                        <span className="stat-label">AI Calls</span>
                    </div>
                    <div className="stat-card stat-card-light">
                        <span className="stat-using-label">using a total of...</span>
                        <span className="stat-value">
                            {loaded ? tokens : '—'}
                        </span>
                        <span className="stat-label">tokens</span>
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}

export default GreenPage;
