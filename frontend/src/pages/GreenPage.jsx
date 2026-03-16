import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import '../styles/GreenPage.css';

// animates a number from 0 to target over duration, returns { value, blur }
const useCountUp = (target, duration = 800, shouldStart = false) => {
    const [value, setValue] = useState(0);
    const [progress, setProgress] = useState(0);
    const frameRef = useRef(null);

    useEffect(() => {
        if (!shouldStart || target === 0) {
            if (shouldStart) { setValue(0); setProgress(1); }
            return;
        }

        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            setProgress(p);
            if (p < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target, duration, shouldStart]);

    // vertical blur that fades out as count finishes
    const blur = progress < 1 ? (1 - progress) * 2 : 0;

    return { value, blur };
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

// sparkline chart for carbon trend
const CarbonSparkline = ({ data, labels, loaded }) => {
    if (!loaded || !data) return (
        <div className="sparkline-card">
            <span className="sparkline-title">Monthly carbon trend</span>
            <div className="sparkline-placeholder">—</div>
        </div>
    );

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 280;
    const height = 80;
    const padding = 8;
    const usableH = height - padding * 2;
    const usableW = width - padding * 2;

    // build polyline points
    const points = data.map((val, i) => {
        const x = padding + (i / (data.length - 1)) * usableW;
        const y = padding + usableH - ((val - min) / range) * usableH;
        return `${x},${y}`;
    }).join(' ');

    // build area fill path (closed shape under the line)
    const areaPath = `M ${padding},${padding + usableH} ` +
        data.map((val, i) => {
            const x = padding + (i / (data.length - 1)) * usableW;
            const y = padding + usableH - ((val - min) / range) * usableH;
            return `L ${x},${y}`;
        }).join(' ') +
        ` L ${padding + usableW},${padding + usableH} Z`;

    return (
        <div className="sparkline-card">
            <span className="sparkline-title">Monthly carbon trend</span>
            <svg className="sparkline-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A2E070" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#A2E070" stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                {/* area fill */}
                <path
                    className="sparkline-area"
                    d={areaPath}
                    fill="url(#sparkFill)"
                />
                {/* line */}
                <polyline
                    className="sparkline-line"
                    points={points}
                    fill="none"
                    stroke="#A2E070"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* dots */}
                {data.map((val, i) => {
                    const x = padding + (i / (data.length - 1)) * usableW;
                    const y = padding + usableH - ((val - min) / range) * usableH;
                    return (
                        <circle
                            key={i}
                            className="sparkline-dot"
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#FFFFFF"
                            stroke="#A2E070"
                            strokeWidth="1.5"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        />
                    );
                })}
            </svg>
            {/* day labels */}
            <div className="sparkline-labels">
                {labels.map((label, i) => (
                    <span key={i} className="sparkline-label">{label}</span>
                ))}
            </div>
        </div>
    );
};

function GreenPage() {
    // simulated loading state — replace with real fetch later
    const [data, setData] = useState(null);
    const loaded = data !== null;

    useEffect(() => {
        // simulate api delay — swap with real endpoint
        const timer = setTimeout(() => {
            setData({
                co2: 120,
                aiCalls: 28,
                tokens: 234,
                // monthly carbon trend — replace with real data
                carbonTrend: [45, 62, 38, 71, 55, 48, 80, 65, 42, 58, 35, 120],
                trendLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            });
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    // temporary: 1000g max until we have a real usage-based cap
    const CO2_GAUGE_MAX = 1000;
    const ARC_LENGTH = 251;

    const co2Count = useCountUp(data?.co2 ?? 0, 1000, loaded);
    const aiCallsCount = useCountUp(data?.aiCalls ?? 0, 800, loaded);
    const tokensCount = useCountUp(data?.tokens ?? 0, 1000, loaded);

    // temporary: scale gauge fill relative to 1000g max
    const co2Raw = data?.co2 ?? 0;
    const gaugeOffset = ARC_LENGTH - (ARC_LENGTH * Math.min(co2Raw, CO2_GAUGE_MAX) / CO2_GAUGE_MAX);

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
                    <Co2Gauge loaded={loaded} fillOffset={gaugeOffset} />
                    <div className="co2-info">
                        <span className="co2-value" style={co2Count.blur > 0 ? {
                            filter: `blur(${co2Count.blur}px)`,
                            transform: `scaleY(${1 + co2Count.blur * 0.04})`
                        } : undefined}>
                            {loaded ? `${co2Count.value}g` : '—'}
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
                        <span className="stat-value" style={aiCallsCount.blur > 0 ? {
                            filter: `blur(${aiCallsCount.blur}px)`,
                            transform: `scaleY(${1 + aiCallsCount.blur * 0.04})`
                        } : undefined}>
                            {loaded ? aiCallsCount.value : '—'}
                        </span>
                        <span className="stat-label">AI Calls</span>
                    </div>
                    <div className="stat-card stat-card-light">
                        <span className="stat-using-label">using a total of...</span>
                        <span className="stat-value" style={tokensCount.blur > 0 ? {
                            filter: `blur(${tokensCount.blur}px)`,
                            transform: `scaleY(${1 + tokensCount.blur * 0.04})`
                        } : undefined}>
                            {loaded ? tokensCount.value : '—'}
                        </span>
                        <span className="stat-label">tokens</span>
                    </div>
                </div>

                {/* carbon trend sparkline */}
                <CarbonSparkline
                    data={data?.carbonTrend}
                    labels={data?.trendLabels}
                    loaded={loaded}
                />
            </div>

            <BottomNav />
        </div>
    );
}

export default GreenPage;
