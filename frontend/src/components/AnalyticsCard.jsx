import '../styles/Profile.css';

// single unified analytics card with three color zones: red → white → blue
const AnalyticsCard = ({ topLabel, number, unit, bottomLabel, smallNumber, smallLabel }) => {
    return (
        <div className="analytics-card">
            <div className="analytics-card-red">
                <span className="analytics-card-top-label">{topLabel}</span>
            </div>
            <div className="analytics-card-lower">
                <div className="analytics-card-white">
                    <span className="analytics-card-number">{number}</span>
                    <span className="analytics-card-unit">{unit}</span>
                    <span className="analytics-card-divider-label">{bottomLabel}</span>
                </div>
                <div className="analytics-card-blue">
                    <span className="analytics-card-small-number">{smallNumber}</span>
                    <span className="analytics-card-small-label">{smallLabel}</span>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCard;
