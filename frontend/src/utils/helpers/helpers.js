
export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
};

export const validateRequiredFields = (formData, requiredFields) => {
    const missingFields = [];

    requiredFields.forEach(field => {
        if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
            missingFields.push(field);
        }
    });

    return {
        isValid: missingFields.length === 0,
        missingFields,
    };
};

export const createJobFilter = (searchTerm, locationFilter) => {
    return (job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
        return matchesSearch && matchesLocation;
    };
};

export const renderSkillsWithLimit = (skillsArray, limit = 5) => {
    if (!Array.isArray(skillsArray)) return { visibleSkills: [], hasMore: false, remainingCount: 0 };

    const visibleSkills = skillsArray.slice(0, limit);
    const remainingCount = skillsArray.length - limit;

    return {
        visibleSkills,
        hasMore: remainingCount > 0,
        remainingCount,
    };
};

export const getEmptyStateMessage = (type, customMessages = {}) => {
    const defaultMessages = {
        jobs: 'No jobs found matching your criteria',
        applications: 'You haven\'t applied to any jobs yet',
        skills: 'No skills added',
        education: 'No education details added',
        companies: 'No companies available',
    };

    return customMessages[type] || defaultMessages[type] || 'No data available';
};

export const createModalCloseHandler = (setShowModal, setSelectedItem = null) => {
    return () => {
        setShowModal(false);
        if (setSelectedItem) setSelectedItem(null);
    };
};

export const getCompanyName = (entity) => {
    return entity?.companyId?.name || entity?.company?.name || 'Company';
};

export const getJobTitle = (application) => {
    return application?.jobId?.title || 'Job Position';
};

export const safeFormatDate = (date, options = {}) => {
    if (!date) return 'Not specified';
    try {
        return new Date(date).toLocaleDateString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

export const navigateByRole = (navigate, user) => {
    const role = user?.role;
    if (role === 'seeker') navigate('/seeker/dashboard');
    else if (role === 'recruiter') navigate('/recruiter/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
};

export const parseSkillsToArray = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

export const formatSkillsToString = (skillsArray) => {
    if (!Array.isArray(skillsArray)) return '';
    return skillsArray.join(', ');
};

export const formatEducationForAPI = (educationArray) => {
    return educationArray
        .map(edu => ({
            ...edu,
            yearOfPassing: edu.yearOfPassing ? Number(edu.yearOfPassing) : null,
        }))
        .filter(edu => edu.qualification);
};
