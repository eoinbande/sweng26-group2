import useCountUp from '../hooks/useCountUp';
import '../styles/Profile.css';

// single unified analytics card with three color zones: red → white → blue
const AnalyticsCard = ({ topLabel, number, unit, bottomLabel, smallNumber, smallLabel }) => {
    const mainCount = useCountUp(number, 800, true);
    const smallCount = useCountUp(smallNumber, 800, true);

    const blurStyle = (blur) => blur > 0 ? {
        filter: `blur(${blur}px)`,
        transform: `scaleY(${1 + blur * 0.04})`,
    } : undefined;

    return (
        <div className="analytics-card">
            <div className="analytics-card-red">
                <span className="analytics-card-top-label">{topLabel}</span>
            </div>
            <div className="analytics-card-lower">
                <div className="analytics-card-white">
                    <span className="analytics-card-number" style={blurStyle(mainCount.blur)}>{mainCount.value}</span>
                    <span className="analytics-card-unit">{unit}</span>
                    <span className="analytics-card-divider-label">{bottomLabel}</span>
                </div>
                <div className="analytics-card-blue">
                    <span className="analytics-card-small-number" style={blurStyle(smallCount.blur)}>{smallCount.value}</span>
                    <span className="analytics-card-small-label">{smallLabel}</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
