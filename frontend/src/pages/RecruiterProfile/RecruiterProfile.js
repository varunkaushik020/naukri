import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import TopNav from '../../components/common/TopNav/TopNav';
import { Card, Badge, Button } from '../../components/common';
import { useApi } from '../../hooks';
import toast from 'react-hot-toast';
import { StatsGrid, BioSection, ExpertiseTags, CompanyInfo, JobOpenings, QuickActions, ProfileHeader } from './components';
import './RecruiterProfile.css';

const RecruiterProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        expertise: [],
        company: '',
        designation: '',
        totalHires: 0,
        yearsOfExperience: 0,
        location: '',
        phone: '',
    });

    const { loading: companyLoading, execute: fetchCompany } = useApi(
        async () => {
            const { companyAPI } = await import('../../services/api/api');
            return await companyAPI.getMyCompanies();
        },
        { errorMessage: false }
    );

    const { loading: jobsLoading, execute: fetchJobs } = useApi(
        async () => {
            const { jobAPI } = await import('../../services/api/api');
            return await jobAPI.getMyJobs({ status: 'active', limit: 3 });
        },
        { errorMessage: false }
    );

    const [companyData, setCompanyData] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);

    useEffect(() => {
        fetchCompany().then(result => {
            if (result.success && result.data) {
                const company = Array.isArray(result.data) ? result.data[0] : result.data.company;
                setCompanyData(company);
            }
        });

        fetchJobs().then(result => {
            if (result.success) {
                const jobs = Array.isArray(result.data) ? result.data : result.data.jobs || [];
                setRecentJobs(jobs.slice(0, 3));
            }
        });

        if (user?.profile) {
            setProfileData({
                name: user?.name || '',
                bio: user.profile.bio || '',
                expertise: user.profile.expertise || [],
                company: user.profile.company || '',
                designation: user.profile.designation || '',
                totalHires: user.profile.totalHires || 0,
                yearsOfExperience: user.profile.yearsOfExperience || 0,
                location: user.profile.location || '',
                phone: user.profile.phone || '',
            });
        }
    }, [user]);

    const handleAddExpertise = (skill) => {
        if (skill && !profileData.expertise.includes(skill)) {
            setProfileData({
                ...profileData,
                expertise: [...profileData.expertise, skill],
            });
        }
    };

    const handleRemoveExpertise = (skill) => {
        setProfileData({
            ...profileData,
            expertise: profileData.expertise.filter(s => s !== skill),
        });
    };

    const handleMetaItemChange = (field, index, value) => {
        if (field === 'metaItems') {
            const icon = headerData.metaItems[index].icon;
            if (icon === 'ðŸ“') {
                setProfileData(prev => ({
                    ...prev,
                    location: value,
                }));
            } else if (icon === 'ðŸ“ž') {
                setProfileData(prev => ({
                    ...prev,
                    phone: value,
                }));
            }
        } else if (field === 'designation') {
            setProfileData(prev => ({
                ...prev,
                designation: value,
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

            const updateData = {
                name: profileData.name || user?.name,
                phone: profileData.phone,
                location: profileData.location,
                bio: profileData.bio,
                expertise: profileData.expertise,
                company: profileData.company,
                designation: profileData.designation,
                totalHires: profileData.totalHires,
                yearsOfExperience: profileData.yearsOfExperience,
            };

            const result = await updateUserProfile(updateData);

            if (result.success) {
                toast.success('Profile updated successfully!');
                setEditing(false);
                setProfileData({
                    name: result.user.name || '',
                    bio: result.user.profile?.bio || '',
                    expertise: result.user.profile?.expertise || [],
                    company: result.user.profile?.company || '',
                    designation: result.user.profile?.designation || '',
                    totalHires: result.user.profile?.totalHires || 0,
                    yearsOfExperience: result.user.profile?.yearsOfExperience || 0,
                    location: result.user.profile?.location || '',
                    phone: result.user.profile?.phone || '',
                });
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('âŒ Save error:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const headerData = {
        name: profileData.name || user?.name || '',
        designation: profileData.designation || '',
        verified: true,
        verifiedLabel: 'Verified Recruiter',
        showCompany: true,
        metaItems: [
            { icon: '📍', value: profileData.location || 'Not specified' },
            { icon: '📧', value: user?.email },
            { icon: '📞', value: profileData.phone || 'Not specified' },
        ],
    };

    const stats = [
        { icon: '💼', value: recentJobs.length, label: 'Active Jobs' },
        { icon: '👥', value: profileData.totalHires || 0, label: 'Total Hires' },
        { icon: '⭐', value: `${profileData.yearsOfExperience || 0}+`, label: 'Years Experience' },
        { icon: '🏆', value: companyData?.isVerified ? 'Yes' : 'No', label: 'Company Verified' },
    ];

    if (companyLoading || jobsLoading) {
        return (
            <div className="recruiter-profile-container">
                <TopNav />
                <div className="loading-profile">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recruiter-profile-container">
            <TopNav />

            <div className="recruiter-profile-content">
                <ProfileHeader
                    user={user}
                    profileData={headerData}
                    companyData={companyData}
                    editing={editing}
                    onToggleEdit={() => editing ? handleSaveProfile() : setEditing(true)}
                    onProfileDataChange={handleMetaItemChange}
                    onNameChange={(value) => setProfileData(prev => ({ ...prev, name: value }))}
                />

                <StatsGrid stats={stats} />

                <div className="profile-main-grid">
                    <div className="profile-left-column">
                        <BioSection
                            bio={profileData.bio}
                            editing={editing}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        />

                        <ExpertiseTags
                            expertise={profileData.expertise}
                            editing={editing}
                            onAdd={(skill) => handleAddExpertise(skill)}
                            onRemove={(skill) => handleRemoveExpertise(skill)}
                        />

                        <CompanyInfo companyData={companyData} />
                    </div>

                    <div className="profile-right-column">
                        <JobOpenings jobs={recentJobs} formatDate={formatDate} />

                        <QuickActions />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfile;
