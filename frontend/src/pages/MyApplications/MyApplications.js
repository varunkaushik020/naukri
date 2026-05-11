import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import TopNav from '../../components/common/TopNav/TopNav';
import { Card, Badge } from '../../components/common';
import { useApi } from '../../hooks/useApi';
import { getEmptyStateMessage, getJobTitle, getCompanyName, safeFormatDate } from '../../utils/helpers';
import '../SeekerDashboard/SeekerDashboard.css';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const { loading: loadingApps, execute: fetchApplications } = useApi(
        async () => {
            const { applicationAPI } = await import('../../services/api/api');
            return await applicationAPI.getMyApplications();
        },
        { errorMessage: false }
    );

    useEffect(() => {
        fetchApplications().then(result => {
            if (result.success && Array.isArray(result.data)) {
                setApplications(result.data);
            } else if (result.success && result.data.applications) {
                setApplications(result.data.applications);
            }
        });
    }, []);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'badge-pending';
            case 'shortlisted': return 'badge-shortlisted';
            case 'rejected': return 'badge-rejected';
            case 'accepted': return 'badge-accepted';
            default: return '';
        }
    };

    return (
        <div className="seeker-dashboard-container">
            <TopNav />

            <div className="dashboard-content">
                <div className="applications-container">
                    <h1 className="page-title">ðŸ“‹ My Applications</h1>
                    {loadingApps ? (
                        <div className="loading">Loading applications...</div>
                    ) : !Array.isArray(applications) || applications.length === 0 ? (
                        <div className="no-applications">
                            <h2>No applications yet</h2>
                            <p>{getEmptyStateMessage('applications')}</p>
                        </div>
                    ) : (
                        applications.map(app => (
                            <Card key={app._id} className="application-card" hoverable>
                                <div className="application-header">
                                    <h3>{getJobTitle(app)}</h3>
                                    <Badge
                                        variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : app.status === 'shortlisted' ? 'info' : 'warning'}
                                    >
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="application-details">
                                    <div className="detail-row">
                                        <span className="label">Company:</span>
                                        <span className="value">{getCompanyName(app.jobId)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Location:</span>
                                        <span className="value">{app.jobId?.location || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Applied on:</span>
                                        <span className="value">{safeFormatDate(app.createdAt)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">ATS Score:</span>
                                        <span className="value">{app.atsScore || 'N/A'}</span>
                                    </div>
                                </div>

                                {app.resume && (
                                    <div className="application-resume">
                                        <strong>Resume:</strong>
                                        <a href={app.resume} target="_blank" rel="noopener noreferrer">
                                            View Resume
                                        </a>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyApplications;
