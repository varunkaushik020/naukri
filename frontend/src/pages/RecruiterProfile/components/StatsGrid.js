import { Card } from '../../../components/common';
import './StatsGrid.css';

const StatsGrid = ({ stats }) => {
    return (
        <div className="profile-stats-grid">
            {stats.map((stat, index) => (
                <Card key={index} className="profile-stat-card">
                    <div className="stat-icon-wrapper">
                        <span className="stat-icon">{stat.icon}</span>
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatsGrid;
