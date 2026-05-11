import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import TopNav from '../../components/common/TopNav/TopNav';
import { Card, Badge, Button } from '../../components/common';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import { useApi } from '../../hooks/useApi';
import { createJobFilter, renderSkillsWithLimit, getEmptyStateMessage, createModalCloseHandler } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './SeekerDashboard.css';

const SeekerDashboard = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [showQuickApply, setShowQuickApply] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [uniqueLocations, setUniqueLocations] = useState([]);
    const { loading: loadingJobs, execute: fetchJobs } = useApi(
        async () => {
            const { jobAPI } = await import('../../services/api/api');
            return await jobAPI.getJobs();
        },
        { errorMessage: false }
    );

    useEffect(() => {
        fetchJobs().then(result => {
            if (result.success && Array.isArray(result.data)) {
                setJobs(result.data);
                const locations = [...new Set(result.data.map(job => job.location).filter(Boolean))];
                setUniqueLocations(locations);
            } else if (result.success && result.data.jobs) {
                setJobs(result.data.jobs);
                const locations = [...new Set(result.data.jobs.map(job => job.location).filter(Boolean))];
                setUniqueLocations(locations);
            }
        });
    }, []);

    const handleQuickApply = (job) => { setSelectedJob(job); setShowQuickApply(true); };

    const submitQuickApply = async (applicationData) => {
        try {
            const { applicationAPI } = await import('../../services/api/api');
            const response = await applicationAPI.applyForJob({ jobId: selectedJob._id, ...applicationData });
            if (response.data.success) {
                toast.success('Application submitted successfully!');
                setShowQuickApply(false);
                setSelectedJob(null);
            }
        } catch (error) {
            toast.error('Error submitting application');
        }
    };

    const filteredJobs = Array.isArray(jobs) ? jobs.filter(createJobFilter(searchTerm, locationFilter)) : [];

    return (
        <div className="seeker-dashboard-container">
            <TopNav />

            <div className="dashboard-content">
                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by job title or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="location-select"
                        >
                            <option value="">All Locations</option>
                            {uniqueLocations.map((location, index) => (
                                <option key={index} value={location.toLowerCase()}>
                                    {location}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="jobs-grid">
                    {loadingJobs ? (
                        <div className="loading">Loading jobs...</div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="no-jobs">
                            <p>{getEmptyStateMessage('jobs')}</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <Card key={job._id} className="job-card" hoverable>
                                <div className="job-header">
                                    <h3>{job.title}</h3>
                                    <span className="company-name">{job.companyId?.name || 'Company'}</span>
                                </div>

                                <div className="job-details">
                                    <div className="detail-item">
                                        <span className="icon">ðŸ“</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">ðŸ’¼</span>
                                        <span>{job.experience} years exp</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">ðŸ’°</span>
                                        <span>â‚¹{job.salary.min} - â‚¹{job.salary.max}</span>
                                    </div>
                                </div>

                                <div className="job-skills">
                                    {(() => {
                                        const { visibleSkills, hasMore, remainingCount } = renderSkillsWithLimit(job.requiredSkills, 5);
                                        return (
                                            <>
                                                {visibleSkills.map((skill, index) => (
                                                    <Badge key={index} variant="primary" size="small">{skill}</Badge>
                                                ))}
                                                {hasMore && (
                                                    <Badge variant="default" size="small">+{remainingCount} more</Badge>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                                <div className="job-actions">
                                    <Button
                                        onClick={() => handleQuickApply(job)}
                                        variant="gradient"
                                        icon="ðŸš€"
                                    >
                                        Quick Apply
                                    </Button>
                                    <Button variant="secondary">
                                        View Details
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {showQuickApply && selectedJob && (
                    <QuickApplyModal
                        job={selectedJob}
                        user={user}
                        onClose={createModalCloseHandler(setShowQuickApply, setSelectedJob)}
                        onSubmit={submitQuickApply}
                    />
                )}
            </div>
        </div>
    );
};

const QuickApplyModal = ({ job, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        resume: user?.profile?.resume || user?.resume || '',
        coverLetter: '',
        phone: user?.profile?.phone || user?.phone || '',
        location: user?.profile?.location || user?.location || '',
    });
    const [uploadedResume, setUploadedResume] = useState(null);

    const handleResumeUpload = (fileData) => {
        if (fileData) {
            setUploadedResume(fileData);
            setFormData({ ...formData, resume: fileData.base64 });
        } else {
            setUploadedResume(null);
            setFormData({ ...formData, resume: '' });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>ðŸš€ Quick Apply - {job.title}</h2>
                    <button onClick={onClose} className="btn-close">Ã—</button>
                </div>

                <form onSubmit={handleSubmit} className="quick-apply-form">
                    <div className="form-group">
                        <label>Resume *</label>
                        <FileUpload
                            label="Upload your resume"
                            accept=".pdf,.doc,.docx"
                            maxSizeMB={2}
                            existingFileUrl={formData.resume}
                            onFileSelect={handleResumeUpload}
                            helpText="PDF or Word document (Max 2MB)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Cover Letter</label>
                        <textarea
                            value={formData.coverLetter}
                            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                            placeholder="Tell us why you're a great fit..."
                            rows="4"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Your contact number"
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Current Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Your current city"
                            className="form-control"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeekerDashboard;
