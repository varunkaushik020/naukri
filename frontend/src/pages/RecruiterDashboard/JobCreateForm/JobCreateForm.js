import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Card, FileUpload } from '../../../components/common';
import { jobAPI, companyAPI } from '../../../services/api/api';
import './JobCreateForm.css';

const JobCreateForm = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        descriptionFile: null,
        companyId: '',
        location: '',
        workMode: 'On-site',
        experienceMin: 0,
        experienceMax: 10,
        salaryMin: 0,
        salaryMax: 0,
        skills: [],
        openings: 1,
    });
    const [skillInput, setSkillInput] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await companyAPI.getMyCompanies();
                if (response.data.success) {
                    const verifiedCompanies = response.data.data.filter(
                        company => company.isVerified
                    );
                    setCompanies(verifiedCompanies);

                    if (verifiedCompanies.length === 1) {
                        setFormData(prev => ({
                            ...prev,
                            companyId: verifiedCompanies[0]._id,
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching companies:', error);
                toast.error('Failed to load companies');
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleDescriptionFileUpload = (fileData) => {
        if (!fileData) {
            setFormData(prev => ({
                ...prev,
                descriptionFile: null,
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            descriptionFile: {
                base64: fileData.base64,
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
            },
        }));
        toast.success(`File "${fileData.name}" uploaded successfully`);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleAddSkill = (e) => {
        e.preventDefault();
        const skill = skillInput.trim();

        if (!skill) {
            toast.error('Please enter a skill');
            return;
        }

        if (formData.skills.includes(skill)) {
            toast.error('Skill already added');
            return;
        }

        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, skill],
        }));
        setSkillInput('');
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove),
        }));
    };

    const handleSkillKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(e);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Job title is required';
        }

        if (!formData.companyId) {
            newErrors.companyId = 'Please select a company';
        }

        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Job description is required';
        }

        if (formData.skills.length === 0) {
            newErrors.skills = 'At least one skill is required';
        }

        if (formData.experienceMin < 0) {
            newErrors.experienceMin = 'Minimum experience cannot be negative';
        }

        if (formData.experienceMax < formData.experienceMin) {
            newErrors.experienceMax = 'Maximum experience must be greater than minimum';
        }

        if (formData.salaryMax < formData.salaryMin) {
            newErrors.salaryMax = 'Maximum salary must be greater than minimum';
        }

        if (formData.openings < 1) {
            newErrors.openings = 'At least one opening is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const jobData = {
                title: formData.title,
                description: formData.descriptionFile
                    ? {
                        text: formData.description,
                        fileName: formData.descriptionFile.name,
                        fileType: formData.descriptionFile.type,
                        base64: formData.descriptionFile.base64,
                    }
                    : formData.description,
                requiredSkills: formData.skills,
                experience: {
                    min: Number(formData.experienceMin),
                    max: Number(formData.experienceMax),
                    type: 'Years',
                },
                salary: {
                    min: Number(formData.salaryMin),
                    max: Number(formData.salaryMax),
                    currency: 'INR',
                    type: formData.salaryMax > formData.salaryMin ? 'Range' : 'Fixed',
                },
                location: formData.location,
                workMode: formData.workMode,
                employmentType: 'Full-time',
                openings: Number(formData.openings),
                companyId: formData.companyId,
            };

            const response = await jobAPI.createJob(jobData);

            if (response.data.success) {
                toast.success('Job posted successfully! 📎‰');

                setFormData({
                    title: '',
                    description: '',
                    descriptionFile: null,
                    companyId: companies.length === 1 ? companies[0]._id : '',
                    location: '',
                    workMode: 'On-site',
                    experienceMin: 0,
                    experienceMax: 10,
                    salaryMin: 0,
                    salaryMax: 0,
                    skills: [],
                    openings: 1,
                });
                setErrors({});

                if (onSuccess) {
                    onSuccess(response.data.data);
                }
            }
        } catch (error) {
            console.error('Job creation error:', error);

            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.join(', ') ||
                'Failed to create job. Please try again.';

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="job-create-form-card">
            <div className="form-header">
                <h2>Post a New Job</h2>
                <p>Fill in the details below to create a new job posting</p>
            </div>

            <form onSubmit={handleSubmit} className="job-create-form">
                <div className="form-section">
                    <h3 className="section-title">
                        <span className="section-icon">ðŸ“‹</span>
                        Basic Information
                    </h3>

                    <div className="form-grid">
                        <Input
                            label="Job Title"
                            name="title"
                            type="text"
                            placeholder="e.g. Senior Frontend Developer"
                            value={formData.title}
                            onChange={handleChange}
                            error={!!errors.title}
                            errorMessage={errors.title}
                            required
                        />

                        <div className="form-field">
                            <label className="input-label">
                                Company
                                <span className="required">*</span>
                            </label>
                            {loadingCompanies ? (
                                <div className="loading-text">Loading companies...</div>
                            ) : companies.length === 0 ? (
                                <div className="error-text">
                                    No verified companies found. Please register a company first.
                                </div>
                            ) : (
                                <select
                                    name="companyId"
                                    value={formData.companyId}
                                    onChange={handleChange}
                                    className="select-field"
                                    error={!!errors.companyId}
                                >
                                    <option value="">Select a company</option>
                                    {companies.map(company => (
                                        <option key={company._id} value={company._id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.companyId && (
                                <span className="input-error-message">{errors.companyId}</span>
                            )}
                        </div>

                        <Input
                            label="Location"
                            name="location"
                            type="text"
                            placeholder="e.g. Bangalore, India"
                            value={formData.location}
                            onChange={handleChange}
                            error={!!errors.location}
                            errorMessage={errors.location}
                            required
                        />

                        <div className="form-field">
                            <label className="input-label">
                                Work Mode
                                <span className="required">*</span>
                            </label>
                            <select
                                name="workMode"
                                value={formData.workMode}
                                onChange={handleChange}
                                className="select-field"
                            >
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <span className="section-icon">🎯</span>
                        Requirements
                    </h3>

                    <div className="form-grid">
                        <div className="form-field">
                            <label className="input-label">
                                Experience Range (Years)
                                <span className="required">*</span>
                            </label>
                            <div className="experience-inputs">
                                <Input
                                    name="experienceMin"
                                    type="number"
                                    placeholder="Min"
                                    value={formData.experienceMin}
                                    onChange={handleChange}
                                    error={!!errors.experienceMin}
                                    errorMessage={errors.experienceMin}
                                    min="0"
                                />
                                <span className="separator">to</span>
                                <Input
                                    name="experienceMax"
                                    type="number"
                                    placeholder="Max"
                                    value={formData.experienceMax}
                                    onChange={handleChange}
                                    error={!!errors.experienceMax}
                                    errorMessage={errors.experienceMax}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="input-label">
                                Number of Openings
                                <span className="required">*</span>
                            </label>
                            <Input
                                name="openings"
                                type="number"
                                placeholder="e.g. 5"
                                value={formData.openings}
                                onChange={handleChange}
                                error={!!errors.openings}
                                errorMessage={errors.openings}
                                min="1"
                            />
                        </div>

                        <div className="form-field full-width">
                            <label className="input-label">
                                Required Skills
                                <span className="required">*</span>
                            </label>
                            <div className="skills-input-container">
                                <div className="skills-input-wrapper">
                                    <input
                                        type="text"
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={handleSkillKeyPress}
                                        placeholder="Type a skill and press Enter or click Add"
                                        className="skill-input-field"
                                    />
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="small"
                                        onClick={handleAddSkill}
                                    >
                                        Add
                                    </Button>
                                </div>

                                {errors.skills && (
                                    <span className="input-error-message">{errors.skills}</span>
                                )}

                                {formData.skills.length > 0 && (
                                    <div className="skills-tags">
                                        {formData.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">
                                                {skill}
                                                <button
                                                    type="button"
                                                    className="skill-remove-btn"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <span className="section-icon">ðŸ“</span>
                        Job Details
                    </h3>

                    <div className="form-grid">
                        <div className="form-field full-width">
                            <label className="input-label">
                                Job Description
                                <span className="required">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                className="textarea-field"
                                rows="6"
                            />
                            {errors.description && (
                                <span className="input-error-message">{errors.description}</span>
                            )}
                        </div>

                        <div className="form-field full-width">
                            <FileUpload
                                label="Upload Job Description Document (Optional)"
                                accept=".pdf,.doc,.docx,.txt"
                                maxSizeMB={5}
                                onFileSelect={handleDescriptionFileUpload}
                                helpText="Upload a detailed job description document (PDF, DOC, DOCX, or TXT)"
                            />
                        </div>

                        <div className="form-field">
                            <label className="input-label">
                                Salary Range (â‚¹ in Lakhs)
                            </label>
                            <div className="salary-inputs">
                                <Input
                                    name="salaryMin"
                                    type="number"
                                    placeholder="Min (e.g. 5)"
                                    value={formData.salaryMin}
                                    onChange={handleChange}
                                    error={!!errors.salaryMin}
                                    errorMessage={errors.salaryMin}
                                    min="0"
                                    step="0.5"
                                />
                                <span className="separator">to</span>
                                <Input
                                    name="salaryMax"
                                    type="number"
                                    placeholder="Max (e.g. 15)"
                                    value={formData.salaryMax}
                                    onChange={handleChange}
                                    error={!!errors.salaryMax}
                                    errorMessage={errors.salaryMax}
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Posting Job...' : 'Post Job'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default JobCreateForm;
