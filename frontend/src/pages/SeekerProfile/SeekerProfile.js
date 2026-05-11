import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import TopNav from '../../components/common/TopNav/TopNav';
import { Card, Badge, Button, FileUpload } from '../../components/common';
import { useApi } from '../../hooks';
import toast from 'react-hot-toast';
import { ProfileHeader, StatsGrid, BioSection, ExpertiseTags } from '../RecruiterProfile/components';
import './SeekerProfile.css';

const SeekerProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        skills: [],
        experience: 0,
        location: '',
        phone: '',
        currentCompany: '',
        expectedSalary: { min: 0, max: 0 },
        education: [],
        resumeFile: null,
        resumeFileName: '',
        resumeFileType: '',
        resumeRemoved: false,
        dateOfBirth: '',
        gender: '',
        nationality: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        languages: [],
    });

    const { loading: appsLoading, execute: fetchApplications } = useApi(
        async () => {
            const { applicationAPI } = await import('../../services/api/api');
            return await applicationAPI.getMyApplications();
        },
        { errorMessage: false }
    );

    const [applications, setApplications] = useState([]);

    useEffect(() => {
        fetchApplications().then(result => {
            if (result.success) {
                const apps = Array.isArray(result.data) ? result.data : result.data.applications || [];
                setApplications(apps);
            }
        });

        if (user?.profile) {
            setProfileData({
                name: user?.name || '',
                bio: user.profile.bio || user.profile.summary || '',
                skills: user.profile.skills || [],
                experience: user.profile.experience || 0,
                location: user.profile.location || '',
                phone: user.profile.phone || '',
                currentCompany: user.profile.currentCompany || '',
                expectedSalary: user.profile.expectedSalary || { min: 0, max: 0 },
                education: user.profile.education || [],
                resumeFile: null,
                resumeFileName: user.profile.resumeFileName || '',
                resumeFileType: user.profile.resumeFileType || '',
                resumeRemoved: false,
                dateOfBirth: user.profile.dateOfBirth || '',
                gender: user.profile.gender || '',
                nationality: user.profile.nationality || '',
                address: user.profile.address || '',
                city: user.profile.city || '',
                state: user.profile.state || '',
                pincode: user.profile.pincode || '',
                languages: user.profile.languages || [],
            });
        }
    }, [user]);

    const handleAddSkill = (skill) => {
        if (skill && !profileData.skills.includes(skill)) {
            setProfileData({
                ...profileData,
                skills: [...profileData.skills, skill],
            });
        }
    };

    const handleRemoveSkill = (skill) => {
        setProfileData({
            ...profileData,
            skills: profileData.skills.filter(s => s !== skill),
        });
    };

    const handleAddLanguage = (language) => {
        if (language && !profileData.languages.includes(language)) {
            setProfileData({
                ...profileData,
                languages: [...profileData.languages, language],
            });
        }
    };

    const handleRemoveLanguage = (language) => {
        setProfileData({
            ...profileData,
            languages: profileData.languages.filter(l => l !== language),
        });
    };

    const handleResumeUpload = (fileData) => {
        if (!fileData) {
            setProfileData(prev => ({
                ...prev,
                resumeFile: null,
                resumeFileName: '',
                resumeFileType: '',
                resumeRemoved: true,
            }));
            toast.success('Resume removed. Click Save Profile to confirm.');
            return;
        }

        setProfileData(prev => ({
            ...prev,
            resumeFile: fileData.file,
            resumeFileName: fileData.name,
            resumeFileType: fileData.type,
            resumeRemoved: false,
        }));
        toast.success(`Resume "${fileData.name}" selected. Click Save Profile to upload.`);
    };

    const handleDownloadResume = () => {
        if (!profileData.resumeFileName) {
            toast.error('No resume available for download');
            return;
        }

        const fileUrl = `http://localhost:5000/uploads/resumes/${profileData.resumeFileName}`;
        window.open(fileUrl, '_blank');
    };

    const handleMetaItemChange = (field, index, value) => {
        if (field === 'metaItems') {
            const icon = headerData.metaItems[index].icon;
            if (icon === '📍') {
                setProfileData(prev => ({
                    ...prev,
                    location: value,
                }));
            } else if (icon === '📞') {
                setProfileData(prev => ({
                    ...prev,
                    phone: value,
                }));
            }
        } else if (field === 'designation') {
            setProfileData(prev => ({
                ...prev,
                currentCompany: value,
            }));
        } else if (field === 'name') {
            setProfileData(prev => ({
                ...prev,
                name: value,
            }));
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            if (profileData.resumeFile) {
                try {
                    const { fileAPI } = await import('../../services/api/api');
                    const formData = new FormData();
                    formData.append('resume', profileData.resumeFile);

                    const uploadResponse = await fileAPI.uploadResume(formData);

                    if (uploadResponse.data.success) {
                        profileData.resumeFileName = uploadResponse.data.data.fileName;
                        profileData.resumeFileType = uploadResponse.data.data.fileType;
                    }
                } catch (error) {
                    console.error('Resume upload failed:', error);
                    toast.error('Failed to upload resume: ' + (error.response?.data?.message || error.message));
                    setSaving(false);
                    return;
                }
            }

            if (profileData.resumeRemoved) {
                try {
                    const { fileAPI } = await import('../../services/api/api');
                    await fileAPI.removeResume();
                    profileData.resumeFileName = '';
                    profileData.resumeFileType = '';
                } catch (error) {
                    console.error('Resume removal failed:', error);
                }
            }

            const updateData = {
                name: profileData.name || user?.name,
                phone: profileData.phone,
                location: profileData.location,
                bio: profileData.bio,
                summary: profileData.bio,
                skills: profileData.skills,
                experience: profileData.experience,
                currentCompany: profileData.currentCompany,
                expectedSalary: profileData.expectedSalary,
                education: profileData.education,
                resumeFileName: profileData.resumeFileName || undefined,
                resumeFileType: profileData.resumeFileType || undefined,
                dateOfBirth: profileData.dateOfBirth,
                gender: profileData.gender,
                nationality: profileData.nationality,
                address: profileData.address,
                city: profileData.city,
                state: profileData.state,
                pincode: profileData.pincode,
                languages: profileData.languages,
            };

            const result = await updateUserProfile(updateData);

            if (result.success) {
                toast.success('Profile updated successfully!');
                setEditing(false);

                const { authAPI } = await import('../../services/api/api');
                const meResponse = await authAPI.getMe();

                if (meResponse.data.success) {
                    const freshUserData = meResponse.data.data;
                    localStorage.setItem('user', JSON.stringify(freshUserData));

                    setProfileData({
                        name: freshUserData.name || '',
                        bio: freshUserData.profile?.bio || freshUserData.profile?.summary || '',
                        skills: freshUserData.profile?.skills || [],
                        experience: freshUserData.profile?.experience || 0,
                        location: freshUserData.profile?.location || '',
                        phone: freshUserData.profile?.phone || '',
                        currentCompany: freshUserData.profile?.currentCompany || '',
                        expectedSalary: freshUserData.profile?.expectedSalary || { min: 0, max: 0 },
                        education: freshUserData.profile?.education || [],
                        resumeFile: null,
                        resumeFileName: freshUserData.profile?.resumeFileName || '',
                        resumeFileType: freshUserData.profile?.resumeFileType || '',
                        resumeRemoved: false,
                        dateOfBirth: freshUserData.profile?.dateOfBirth || '',
                        gender: freshUserData.profile?.gender || '',
                        nationality: freshUserData.profile?.nationality || '',
                        address: freshUserData.profile?.address || '',
                        city: freshUserData.profile?.city || '',
                        state: freshUserData.profile?.state || '',
                        pincode: freshUserData.profile?.pincode || '',
                        languages: freshUserData.profile?.languages || [],
                    });
                }
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const stats = [
        { icon: '📋', value: applications.length, label: 'Applications' },
        { icon: '💼', value: profileData.experience, label: 'Years Experience' },
        { icon: '🎯', value: profileData.skills.length, label: 'Skills' },
        { icon: '🎓', value: profileData.education.length, label: 'Education' },
    ];

    const headerData = {
        name: profileData.name || user?.name || '',
        designation: profileData.currentCompany || '',
        verified: false,
        metaItems: [
            { icon: '📍', value: profileData.location || 'Not specified' },
            { icon: '📧', value: user?.email },
            { icon: '📞', value: profileData.phone || 'Not specified' },
        ],
    };

    if (appsLoading) {
        return (
            <div className="seeker-profile-container">
                <TopNav />
                <div className="loading-profile">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seeker-profile-container">
            <TopNav />

            <div className="seeker-profile-content">
                <ProfileHeader
                    user={user}
                    profileData={headerData}
                    companyData={null}
                    editing={editing}
                    onEditToggle={() => editing ? handleSaveProfile() : setEditing(true)}
                    onProfileDataChange={handleMetaItemChange}
                    onNameChange={(value) => setProfileData(prev => ({ ...prev, name: value }))}
                    saving={saving}
                />

                <StatsGrid stats={stats} />

                <div className="profile-main-grid">
                    <div className="profile-left-column">
                        <BioSection
                            bio={profileData.bio}
                            editing={editing}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        />

                        <Card className="profile-section-card">
                            <div className="section-header">
                                <h2>👤 Personal Details</h2>
                            </div>
                            <div className="company-info-grid">
                                <div className="company-info-item">
                                    <label>Date of Birth</label>
                                    {editing ? (
                                        <input
                                            type="date"
                                            className="edit-input"
                                            value={profileData.dateOfBirth}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                dateOfBirth: e.target.value
                                            })}
                                        />
                                    ) : (
                                        <value>{profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Gender</label>
                                    {editing ? (
                                        <select
                                            className="edit-input"
                                            value={profileData.gender}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                gender: e.target.value
                                            })}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                            <option value="Prefer not to say">Prefer not to say</option>
                                        </select>
                                    ) : (
                                        <value>{profileData.gender || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Nationality</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.nationality}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                nationality: e.target.value
                                            })}
                                            placeholder="e.g. Indian"
                                        />
                                    ) : (
                                        <value>{profileData.nationality || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item full-width">
                                    <label>Address</label>
                                    {editing ? (
                                        <textarea
                                            className="edit-input edit-textarea"
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                address: e.target.value
                                            })}
                                            placeholder="Enter your full address"
                                            rows="3"
                                        />
                                    ) : (
                                        <value>{profileData.address || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>City</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.city}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                city: e.target.value
                                            })}
                                            placeholder="Enter city"
                                        />
                                    ) : (
                                        <value>{profileData.city || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>State</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.state}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                state: e.target.value
                                            })}
                                            placeholder="Enter state"
                                        />
                                    ) : (
                                        <value>{profileData.state || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>PIN Code</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.pincode}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                pincode: e.target.value
                                            })}
                                            placeholder="Enter PIN code"
                                        />
                                    ) : (
                                        <value>{profileData.pincode || 'Not specified'}</value>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <ExpertiseTags
                            expertise={profileData.skills}
                            editing={editing}
                            onAdd={handleAddSkill}
                            onRemove={handleRemoveSkill}
                        />

                        <Card className="profile-section-card">
                            <div className="section-header">
                                <h2>💼 Professional Information</h2>
                            </div>
                            <div className="company-info-grid">
                                <div className="company-info-item">
                                    <label>Experience</label>
                                    {editing ? (
                                        <input
                                            type="number"
                                            className="edit-input"
                                            value={profileData.experience}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                experience: Number(e.target.value)
                                            })}
                                            min="0"
                                            placeholder="Years of experience"
                                        />
                                    ) : (
                                        <value>{profileData.experience} years</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Current Company</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.currentCompany}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                currentCompany: e.target.value
                                            })}
                                            placeholder="Enter company name"
                                        />
                                    ) : (
                                        <value>{profileData.currentCompany || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Location</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                location: e.target.value
                                            })}
                                            placeholder="Enter location"
                                        />
                                    ) : (
                                        <value>{profileData.location || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Phone</label>
                                    {editing ? (
                                        <input
                                            type="tel"
                                            className="edit-input"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({
                                                ...profileData,
                                                phone: e.target.value
                                            })}
                                            placeholder="Enter phone number"
                                        />
                                    ) : (
                                        <value>{profileData.phone || 'Not specified'}</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Resume</label>
                                    {editing ? (
                                        <div>
                                            <FileUpload
                                                label="Upload Resume"
                                                accept=".pdf,.doc,.docx"
                                                maxSizeMB={5}
                                                onFileSelect={handleResumeUpload}
                                                existingFileUrl={profileData.resumeFileURL || ''}
                                                helpText="Upload PDF or Word document (Max 5MB). File will be uploaded to Firebase when you click Save Profile."
                                            />
                                            {profileData.resumeFile && (
                                                <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '8px' }}>
                                                    âš ï¸ New resume selected: {profileData.resumeFile.name} - Click Save Profile to upload
                                                </p>
                                            )}
                                        </div>
                                    ) : profileData.resumeFileName ? (
                                        <div className="resume-link">
                                            <button
                                                onClick={handleDownloadResume}
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '10px 20px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                ðŸ“„ Preview / Download Resume
                                            </button>
                                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                                {profileData.resumeFileName}
                                            </p>
                                        </div>
                                    ) : (
                                        <value>No resume uploaded</value>
                                    )}
                                </div>
                                <div className="company-info-item">
                                    <label>Expected Salary (Min)</label>
                                    <value>
                                        {editing ? (
                                            <input
                                                type="number"
                                                className="edit-input"
                                                value={profileData.expectedSalary.min}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    expectedSalary: {
                                                        ...profileData.expectedSalary,
                                                        min: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                        ) : (
                                            `â‚¹${profileData.expectedSalary.min?.toLocaleString() || '0'}`
                                        )}
                                    </value>
                                </div>
                                <div className="company-info-item">
                                    <label>Expected Salary (Max)</label>
                                    <value>
                                        {editing ? (
                                            <input
                                                type="number"
                                                className="edit-input"
                                                value={profileData.expectedSalary.max}
                                                onChange={(e) => setProfileData({
                                                    ...profileData,
                                                    expectedSalary: {
                                                        ...profileData.expectedSalary,
                                                        max: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                        ) : (
                                            `â‚¹${profileData.expectedSalary.max?.toLocaleString() || '0'}`
                                        )}
                                    </value>
                                </div>
                            </div>
                        </Card>

                        {profileData.education.length > 0 && (
                            <Card className="profile-section-card">
                                <div className="section-header">
                                    <h2>📎“ Education</h2>
                                </div>
                                <div className="education-list">
                                    {profileData.education.map((edu, index) => (
                                        <div key={index} className="education-item">
                                            <div className="education-header">
                                                <h3>{edu.qualification}</h3>
                                                {edu.yearOfPassing && (
                                                    <Badge variant="default" size="small">{edu.yearOfPassing}</Badge>
                                                )}
                                            </div>
                                            <div className="education-details">
                                                {edu.institution && <p>{edu.institution}</p>}
                                                {edu.boardOrUniversity && <p className="education-sub">{edu.boardOrUniversity}</p>}
                                                {edu.specialization && <p className="education-sub">{edu.specialization}</p>}
                                                {(edu.marks || edu.cgpa) && (
                                                    <p className="education-sub">
                                                        {edu.marks && `Marks: ${edu.marks}`}
                                                        {edu.marks && edu.cgpa && ' | '}
                                                        {edu.cgpa && `CGPA: ${edu.cgpa}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="profile-right-column">
                        <Card className="jobs-section-card">
                            <div className="section-header">
                                <h2>ðŸ“‹ Recent Applications</h2>
                                <Button variant="secondary" size="small">
                                    View All
                                </Button>
                            </div>
                            {applications.length === 0 ? (
                                <div className="empty-jobs-state">
                                    <p>No applications yet</p>
                                </div>
                            ) : (
                                <div className="jobs-list-compact">
                                    {applications.slice(0, 3).map((app, index) => (
                                        <div key={app._id || index} className="job-card-compact">
                                            <div className="job-card-header">
                                                <h3 className="job-title-compact">
                                                    {app.jobId?.title || 'Job Position'}
                                                </h3>
                                                <Badge
                                                    variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}
                                                    size="small"
                                                >
                                                    {app.status}
                                                </Badge>
                                            </div>
                                            <div className="job-details-compact">
                                                <span className="job-detail-item">
                                                    ðŸ¢ {app.jobId?.companyId?.name || 'Company'}
                                                </span>
                                                <span className="job-detail-item">
                                                    ðŸ“ {app.jobId?.location || 'Not specified'}
                                                </span>
                                            </div>
                                            <div className="job-footer-compact">
                                                <span className="job-posted-date">
                                                    Applied {formatDate(app.createdAt)}
                                                </span>
                                                {app.atsScore && (
                                                    <Badge variant="info" size="small">
                                                        ATS: {app.atsScore}%
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card className="quick-actions-card">
                            <div className="section-header">
                                <h2>âš¡ Quick Actions</h2>
                            </div>
                            <div className="quick-actions-grid">
                                <Button variant="gradient" fullWidth icon="ðŸ”">
                                    Browse Jobs
                                </Button>
                                <Button variant="secondary" fullWidth icon="ðŸ“Š">
                                    View Applications
                                </Button>
                                <Button variant="secondary" fullWidth icon="ðŸ“„">
                                    Update Resume
                                </Button>
                                <Button variant="secondary" fullWidth icon="ðŸ””">
                                    Job Alerts
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeekerProfile;
