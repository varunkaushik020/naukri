import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import TopNav from '../../components/common/TopNav/TopNav';
import { Card, Badge, Button } from '../../components/common';
import JobCreateForm from './JobCreateForm/JobCreateForm';
import { useApi } from '../../hooks';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState(null);
    const [applicantsData, setApplicantsData] = useState([]);
    const [jobsData, setJobsData] = useState([]);
    const [showJobForm, setShowJobForm] = useState(false);

    const { loading: statsLoading, execute: fetchStats } = useApi(
        async () => {
            const { jobAPI } = await import('../../services/api/api');
            return await jobAPI.getRecruiterDashboardStats();
        },
        { errorMessage: false }
    );

    const { loading: applicantsLoading, execute: fetchApplicants } = useApi(
        async () => {
            const { jobAPI } = await import('../../services/api/api');
            return await jobAPI.getRecentApplicants({ limit: 10 });
        },
        { errorMessage: false }
    );

    const { loading: jobsLoading, execute: fetchJobs } = useApi(
        async () => {
            const { jobAPI } = await import('../../services/api/api');
            return await jobAPI.getMyJobs({ status: 'active', limit: 10 });
        },
        { errorMessage: false }
    );

    useEffect(() => {
        fetchStats().then(result => {
            if (result.success) {
                if (result.data && typeof result.data === 'object') {
                    setStatsData(result.data);
                } else {
                    setStatsData({});
                }
            }
        });

        fetchApplicants().then(result => {
            if (result.success) {
                if (Array.isArray(result.data)) {
                    setApplicantsData(result.data);
                } else if (result.data && Array.isArray(result.data.applicants)) {
                    setApplicantsData(result.data.applicants);
                } else {
                    setApplicantsData([]);
                }
            }
        });

        fetchJobs().then(result => {
            if (result.success) {
                if (Array.isArray(result.data)) {
                    setJobsData(result.data);
                } else if (result.data && Array.isArray(result.data.jobs)) {
                    setJobsData(result.data.jobs);
                } else {
                    setJobsData([]);
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 day ago';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'info';
            case 'shortlisted': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    if (statsLoading || applicantsLoading || jobsLoading) {
        return (
            <div className="recruiter-dashboard-container">
                <TopNav />
                <div className="loading-dashboard">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recruiter-dashboard-container">
            <TopNav />

            <div className="recruiter-dashboard-content">
                {showJobForm && (
                    <div className="job-form-modal">
                        <div className="job-form-modal-content">
                            <button
                                className="modal-close-btn"
                                onClick={() => setShowJobForm(false)}
                            >
                                ✕
                            </button>
                            <JobCreateForm
                                onSuccess={() => {
                                    setShowJobForm(false);
                                    fetchJobs().then(result => {
                                        if (result.success) {
                                            if (Array.isArray(result.data)) {
                                                setJobsData(result.data);
                                            } else if (result.data && Array.isArray(result.data.jobs)) {
                                                setJobsData(result.data.jobs);
                                            } else {
                                                setJobsData([]);
                                            }
                                        }
                                    });
                                }}
                                onCancel={() => setShowJobForm(false)}
                            />
                        </div>
                    </div>
                )}

                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>Recruiter Dashboard</h1>
                        <p>Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'}! Here's your hiring overview.</p>
                    </div>
                    <div className="header-actions">
                        <Button
                            variant="primary"
                            icon="➕"
                            onClick={() => setShowJobForm(true)}
                        >
                            Post New Job
                        </Button>
                    </div>
                </div>

                <div className="stats-grid">
                    {[
                        { title: 'Active Jobs', value: statsData?.activeJobs || 0, icon: '💼' },
                        { title: 'Total Applications', value: statsData?.totalApplications || 0, icon: '📋' },
                        { title: 'Interviewing', value: statsData?.interviewing || 0, icon: '🎯' },
                        { title: 'Hired This Month', value: statsData?.hiredThisMonth || 0, icon: '✅' },
                    ].map((stat, index) => (
                        <Card key={index} className="stat-card" hoverable>
                            <div className="stat-header">
                                <span className="stat-icon">{stat.icon}</span>
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-title">{stat.title}</div>
                        </Card>
                    ))}
                </div>

                <Card className="pipeline-card">
                    <div className="card-header">
                        <h2>Candidate Pipeline</h2>
                        <span className="pipeline-total">
                            Total: {(statsData?.pipeline?.new || 0) + (statsData?.pipeline?.screening || 0) + (statsData?.pipeline?.interviewing || 0)} candidates
                        </span>
                    </div>
                    <div className="pipeline-tracker">
                        {[
                            { stage: 'New', count: statsData?.pipeline?.new || 0, color: '#3b82f6' },
                            { stage: 'Screening', count: statsData?.pipeline?.screening || 0, color: '#8b5cf6' },
                            { stage: 'Interviewing', count: statsData?.interviewing || 0, color: '#f59e0b' },
                            { stage: 'Offer', count: statsData?.pipeline?.offer || 0, color: '#10b981' },
                            { stage: 'Hired', count: statsData?.hiredThisMonth || 0, color: '#06b6d4' },
                        ].map((stage, index, array) => (
                            <div key={index} className="pipeline-stage">
                                <div className="stage-info">
                                    <div className="stage-count" style={{ color: stage.color }}>
                                        {stage.count}
                                    </div>
                                    <div className="stage-name">{stage.stage}</div>
                                </div>
                                <div className="stage-bar">
                                    <div
                                        className="stage-progress"
                                        style={{
                                            width: `${stage.count > 0 ? Math.max((stage.count / Math.max(...array.map(s => s.count))) * 100, 10) : 0}%`,
                                            backgroundColor: stage.color,
                                        }}
                                    ></div>
                                </div>
                                {index < array.length - 1 && (
                                    <div className="stage-arrow">â†’</div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="main-grid">
                    <Card className="applicants-card">
                        <div className="card-header">
                            <h2>Recent Applicants</h2>
                            <Button variant="secondary" size="small">
                                View All
                            </Button>
                        </div>
                        {applicantsData.length === 0 ? (
                            <div className="empty-state">
                                <p>No applications yet</p>
                            </div>
                        ) : (
                            <div className="applicants-table">
                                <div className="table-header">
                                    <div className="col-candidate">Candidate</div>
                                    <div className="col-position">Position</div>
                                    <div className="col-skills">Skills</div>
                                    <div className="col-score">ATS Score</div>
                                    <div className="col-status">Status</div>
                                    <div className="col-action">Action</div>
                                </div>
                                {applicantsData.map((applicant) => (
                                    <div key={applicant.id} className="table-row">
                                        <div className="col-candidate">
                                            <div className="candidate-info">
                                                <div className="candidate-avatar">
                                                    {applicant.avatar}
                                                </div>
                                                <div className="candidate-details">
                                                    <div className="candidate-name">{applicant.name}</div>
                                                    <div className="candidate-email">{applicant.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-position">
                                            <div className="position-info">
                                                <div className="position-title">{applicant.position}</div>
                                                <div className="position-date">{formatDate(applicant.appliedDate)}</div>
                                            </div>
                                        </div>
                                        <div className="col-skills">
                                            <div className="skills-list">
                                                {applicant.skills.slice(0, 2).map((skill, i) => (
                                                    <Badge key={i} variant="default" size="small">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {applicant.skills.length > 2 && (
                                                    <Badge variant="default" size="small">
                                                        +{applicant.skills.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-score">
                                            <div className={`score-badge ${applicant.atsScore >= 90 ? 'excellent' : applicant.atsScore >= 80 ? 'good' : 'average'}`}>
                                                {applicant.atsScore}%
                                            </div>
                                        </div>
                                        <div className="col-status">
                                            <Badge variant={getStatusVariant(applicant.status)}>
                                                {applicant.status}
                                            </Badge>
                                        </div>
                                        <div className="col-action">
                                            <Button variant="primary" size="small">
                                                Review
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="active-jobs-card">
                        <div className="card-header">
                            <h2>Active Jobs</h2>
                            <Button variant="secondary" size="small">
                                Manage Jobs
                            </Button>
                        </div>
                        {jobsData.length === 0 ? (
                            <div className="empty-state">
                                <p>No active jobs posted yet</p>
                            </div>
                        ) : (
                            <div className="jobs-list">
                                {jobsData.map((job, index) => (
                                    <div key={index} className="job-item">
                                        <div className="job-info">
                                            <div className="job-title">{job.title}</div>
                                            <div className="job-meta">
                                                <span className="job-applications">
                                                    ðŸ“‹ {job.applicationsCount || 0} applications
                                                </span>
                                                <span className="job-posted">{formatDate(job.createdAt)}</span>
                                            </div>
                                        </div>
                                        <Badge variant="success">{job.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RecruiterDashboard;
