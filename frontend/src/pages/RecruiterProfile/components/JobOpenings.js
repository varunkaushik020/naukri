import { Card, Badge, Button } from '../../../components/common';
import './JobOpenings.css';

const JobOpenings = ({ jobs, formatDate }) => {
    return (
        <Card className="jobs-section-card">
            <div className="section-header">
                <h2>ðŸš€ Latest Job Openings</h2>
                <Button variant="secondary" size="small">
                    View All
                </Button>
            </div>
            {jobs.length === 0 ? (
                <div className="empty-jobs-state">
                    <p>No active job postings</p>
                </div>
            ) : (
                <div className="jobs-list-compact">
                    {jobs.map((job, index) => (
                        <div key={job._id || index} className="job-card-compact">
                            <div className="job-card-header">
                                <h3 className="job-title-compact">{job.title}</h3>
                                <Badge variant="success" size="small">{job.status}</Badge>
                            </div>
                            <div className="job-details-compact">
                                <span className="job-detail-item">
                                    ðŸ“ {job.location}
                                </span>
                                <span className="job-detail-item">
                                    ðŸ’° â‚¹{job.salary?.min?.toLocaleString()} - â‚¹{job.salary?.max?.toLocaleString()}
                                </span>
                                <span className="job-detail-item">
                                    ðŸ’¼ {job.experience} yrs exp
                                </span>
                            </div>
                            <div className="job-footer-compact">
                                <span className="job-posted-date">
                                    Posted {formatDate(job.createdAt)}
                                </span>
                                <Button variant="primary" size="small">
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default JobOpenings;
