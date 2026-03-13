import AnalyticsCard from './AnalyticsCard';
import '../styles/Profile.css';

const AnalyticsSection = ({ tasksCompleted, goalsCompleted, onTimeTasks, onTimeGoals }) => {
    return (
        <section className="analytics-section">
            <h2 className="analytics-section-title">Your Analytics</h2>
            <p className="analytics-section-subtitle">See how far you've come!</p>

            <div className="analytics-grid">
                <AnalyticsCard
                    topLabel="You have completed..."
                    number={tasksCompleted}
                    unit="tasks"
                    bottomLabel="Out of which..."
                    smallNumber={onTimeTasks}
                    smallLabel="Were completed on-time."
                />
                <AnalyticsCard
                    topLabel="You have completed..."
                    number={goalsCompleted}
                    unit="goals"
                    bottomLabel="Out of which..."
                    smallNumber={onTimeGoals}
                    smallLabel="Were completed on-time."
                />
            </div>
        </section>
    );
};

export default AnalyticsSection;
