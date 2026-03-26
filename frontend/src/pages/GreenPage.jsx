import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import useCountUp from '../hooks/useCountUp';
import { useUser } from '../contexts/UserContext';
import '../styles/GreenPage.css';

// format a number to at most 4 characters (e.g. 1500 → "1.5K", 13000 → "13K")
const formatCompact = (n, { decimal = false } = {}) => {
    if (n < 10000) return String(n);
    if (n < 1000000) {
        const k = n / 1000;
        if (decimal) return `${+k.toFixed(1)}K`;
        return k >= 10 ? `${Math.round(k)}K` : `${+k.toFixed(1)}K`;
    }
    const m = n / 1000000;
    if (decimal) return `${+m.toFixed(1)}M`;
    return m >= 10 ? `${Math.round(m)}M` : `${+m.toFixed(1)}M`;
};

// format carbon from grams: g if < 1000, kg otherwise
const formatCarbonGrams = (g) => {
    if (g < 1000) return `${Math.round(g)}g`;
    return `${+(g / 1000).toFixed(1)}kg`;
};

// format carbon from kg (sparkline data is in kg)
const formatCarbon = (kg) => formatCarbonGrams(kg * 1000);

// sparkline chart for carbon trend
const CarbonSparkline = ({ data, labels, loaded }) => {
    const svgRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(null);

    // resolve touch/mouse x → nearest data index
    const getIndexFromX = useCallback((clientX) => {
        if (!svgRef.current || !data) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const relX = (clientX - rect.left) / rect.width;
        const idx = Math.round(relX * (data.length - 1));
        return Math.max(0, Math.min(data.length - 1, idx));
    }, [data]);

    const handlePointerMove = useCallback((e) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setActiveIndex(getIndexFromX(clientX));
    }, [getIndexFromX]);

    const handlePointerLeave = useCallback(() => {
        setActiveIndex(null);
    }, []);

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
    const pointCount = data.length > 1 ? data.length - 1 : 1;

    // build polyline points — missing months sit at the baseline (y=0 value)
    const points = data.map((val, i) => {
        const x = padding + (i / pointCount) * usableW;
        const y = padding + usableH - ((val - min) / range) * usableH;
        return `${x},${y}`;
    }).join(' ');

    // build area fill path (closed shape under the line)
    const areaPath = `M ${padding},${padding + usableH} ` +
        data.map((val, i) => {
            const x = padding + (i / pointCount) * usableW;
            const y = padding + usableH - ((val - min) / range) * usableH;
            return `L ${x},${y}`;
        }).join(' ') +
        ` L ${padding + usableW},${padding + usableH} Z`;

    // active point coordinates
    const activeX = activeIndex !== null ? padding + (activeIndex / pointCount) * usableW : null;
    const activeY = activeIndex !== null ? padding + usableH - ((data[activeIndex] - min) / range) * usableH : null;

    return (
        <div className="sparkline-card">
            <span className="sparkline-title">Monthly carbon trend</span>

            {/* tooltip — fixed top-right position */}
            {activeIndex !== null && (
                <div className="sparkline-tooltip">
                    <span className="sparkline-tooltip-value">{formatCarbon(data[activeIndex])}</span>
                    <span className="sparkline-tooltip-label">{labels[activeIndex]}</span>
                </div>
            )}

            <svg
                ref={svgRef}
                className="sparkline-svg sparkline-svg--interactive"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                onMouseMove={handlePointerMove}
                onMouseLeave={handlePointerLeave}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerLeave}
            >
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
                {/* vertical indicator line */}
                {activeIndex !== null && (
                    <line
                        x1={activeX} y1={padding}
                        x2={activeX} y2={padding + usableH}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                    />
                )}
                {/* dots */}
                {data.map((val, i) => {
                    const x = padding + (i / pointCount) * usableW;
                    const y = padding + usableH - ((val - min) / range) * usableH;
                    const isActive = i === activeIndex;
                    return (
                        <circle
                            key={i}
                            className={`sparkline-dot${isActive ? ' sparkline-dot--active' : ''}`}
                            cx={x}
                            cy={y}
                            r={isActive ? 5 : 3}
                            fill={isActive ? '#FFFFFF' : '#FFFFFF'}
                            stroke="#A2E070"
                            strokeWidth={isActive ? 2.5 : 1.5}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        />
                    );
                })}
            </svg>
            {/* month labels */}
            <div className="sparkline-labels">
                {labels.map((label, i) => (
                    <span key={i} className={`sparkline-label${i === activeIndex ? ' sparkline-label--active' : ''}`}>{label}</span>
                ))}
            </div>
        </div>
    );
};

function GreenPage() {
    const { user } = useUser();

    // set body background so color bleeds behind status bar
    useEffect(() => {
        document.body.style.backgroundColor = '#AAD786';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const [data, setData] = useState(null);
    const loaded = data !== null;

    useEffect(() => {
        if (!user) return;
        const fetchGreenData = async () => {
            try {

                const apiUrl = import.meta.env.VITE_API_URL;

                // fetch overall stats and monthly stats in parallel
                const [statsRes, monthlyRes] = await Promise.all([
                    fetch(`${apiUrl}/green/stats/${user.id}`, { cache: 'no-store' }),
                    fetch(`${apiUrl}/green/stats/monthly/${user.id}`, { cache: 'no-store' }),
                ]);

                const stats = await statsRes.json();
                const monthly = await monthlyRes.json();

                // build all 12 months of the current year, fill missing with 0
                const now = new Date();
                const year = now.getFullYear();
                const allMonths = Array.from({ length: 12 }, (_, i) => {
                    const key = `${year}-${String(i + 1).padStart(2, '0')}`;
                    return {
                        key,
                        label: new Date(year, i).toLocaleString('default', { month: 'short' }),
                        carbon: monthly[key]?.carbon_footprint ?? 0,
                    };
                });
                const carbonTrend = allMonths.map(m => m.carbon);
                const trendLabels = allMonths.map(m => m.label);

                // sort months that have data for % change calculation
                const sortedMonths = Object.keys(monthly).sort();

                // calculate month-over-month co2 % change
                let co2ChangePct = 0;
                if (sortedMonths.length >= 2) {
                    const current = monthly[sortedMonths[sortedMonths.length - 1]].carbon_footprint;
                    const previous = monthly[sortedMonths[sortedMonths.length - 2]].carbon_footprint;
                    if (previous > 0) {
                        co2ChangePct = Math.round(((current - previous) / previous) * 100);
                    }
                }

                // total_carbon is in kg, convert to grams for display
                setData({
                    co2: Math.round(stats.total_carbon * 1000),
                    co2ChangePct,
                    aiCalls: stats.total_ai_calls,
                    tokens: stats.total_tokens,
                    carbonTrend,
                    trendLabels,
                });
            } catch (err) {
                console.error('failed to fetch green data:', err);
            }
        };

        fetchGreenData();
    }, [user]);

    const co2Count = useCountUp(data?.co2 ?? 0, 1000, loaded);
    const co2Change = useCountUp(data?.co2ChangePct ?? 0, 800, loaded);
    const aiCallsCount = useCountUp(data?.aiCalls ?? 0, 800, loaded);
    const tokensCount = useCountUp(data?.tokens ?? 0, 1000, loaded);

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
                    <span className="co2-label">CO<sub>2</sub></span>
                    <span className="co2-value" style={co2Count.blur > 0 ? {
                        filter: `blur(${co2Count.blur}px)`,
                        transform: `scaleY(${1 + co2Count.blur * 0.04})`
                    } : undefined}>
                        {loaded ? formatCarbonGrams(co2Count.value) : '—'}
                    </span>
                    <span className="co2-description">so far this month</span>
                    <div className="co2-divider" />
                    <div className="co2-change-badge">
                        <span className="co2-change-arrow">
                            {loaded ? ((data?.co2ChangePct ?? 0) >= 0 ? '↑' : '↓') : ''}
                        </span>
                        <span style={co2Change.blur > 0 ? {
                            filter: `blur(${co2Change.blur}px)`,
                            transform: `scaleY(${1 + co2Change.blur * 0.04})`
                        } : undefined}>
                            {loaded ? `${Math.abs(co2Change.value)}%` : '—'}
                        </span>
                    </div>
                    <span className="co2-change-label">CO<sub>2</sub> vs. last month</span>
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
                            {loaded ? formatCompact(aiCallsCount.value) : '—'}
                        </span>
                        <span className="stat-label">AI Calls</span>
                    </div>
                    <div className="stat-card stat-card-light">
                        <span className="stat-using-label">using a total of...</span>
                        <span className="stat-value" style={tokensCount.blur > 0 ? {
                            filter: `blur(${tokensCount.blur}px)`,
                            transform: `scaleY(${1 + tokensCount.blur * 0.04})`
                        } : undefined}>
                            {loaded ? formatCompact(tokensCount.value, { decimal: true }) : '—'}
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
