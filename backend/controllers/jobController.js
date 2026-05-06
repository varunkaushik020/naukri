const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const User = require('../models/User');
const { calculateATSScore, calculateDetailedATSScore } = require('../services/atsScoringService');

const createJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requiredSkills,
            experience,
            salary,
            location,
            workMode,
            employmentType,
            companyId,
            openings,
            applicationDeadline,
        } = req.body;

        if (!title || !description || !requiredSkills || !location || !companyId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, description, requiredSkills, location, companyId',
            });
        }

        if (!experience || typeof experience.min === 'undefined' || typeof experience.max === 'undefined') {
            return res.status(400).json({
                success: false,
                message: 'Experience must include min and max values',
            });
        }

        if (experience.min > experience.max) {
            return res.status(400).json({
                success: false,
                message: 'Minimum experience cannot be greater than maximum experience',
            });
        }

        if (salary && typeof salary.min !== 'undefined' && typeof salary.max !== 'undefined') {
            if (salary.min > salary.max) {
                return res.status(400).json({
                    success: false,
                    message: 'Minimum salary cannot be greater than maximum salary',
                });
            }
        }

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        if (!company.isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Company must be verified before posting jobs',
            });
        }

        const job = await Job.create({
            title,
            description: description.text || description,
            descriptionFileName: description.fileName || '',
            descriptionFileType: description.fileType || '',
            requiredSkills,
            experience,
            salary: salary || { min: 0, max: 0, currency: 'INR', type: 'Range' },
            location,
            workMode: workMode || 'On-site',
            employmentType: employmentType || 'Full-time',
            companyId,
            postedBy: req.user._id,
            openings: openings || 1,
            applicationDeadline,
        });

        const populatedJob = await Job.findById(job._id)
            .populate('companyId', 'name logo industry')
            .populate('postedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Job posted successfully',
            data: populatedJob,
        });
    } catch (error) {
        console.error('Create job error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating job',
            error: error.message,
        });
    }
};

const getJobs = async (req, res) => {
    try {
        const {
            search,
            location,
            minExperience,
            maxExperience,
            skills,
            workMode,
            employmentType,
            status = 'active',
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const query = { status };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (minExperience !== undefined || maxExperience !== undefined) {
            query.experience = {};
            if (minExperience !== undefined) query.experience.$gte = Number(minExperience);
            if (maxExperience !== undefined) query.experience.$lte = Number(maxExperience);
        }

        if (skills) {
            const skillsArray = skills.split(',');
            query.requiredSkills = { $in: skillsArray };
        }

        if (workMode) {
            query.workMode = workMode;
        }

        if (employmentType) {
            query.employmentType = employmentType;
        }

        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
            .populate('companyId', 'name logo industry')
            .populate('postedBy', 'name email')
            .sort({ [sortBy]: sortOrder })
            .limit(Number(limit))
            .skip(skip);

        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching jobs',
            error: error.message,
        });
    }
};

const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id)
            .populate('companyId', 'name website description industry size location logo')
            .populate('postedBy', 'name email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        res.status(200).json({
            success: true,
            data: job,
        });
    } catch (error) {
        console.error('Get job by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        let job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job',
            });
        }

        job = await Job.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: job,
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating job',
            error: error.message,
        });
    }
};

const withdrawJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this job',
            });
        }

        job.status = 'withdrawn';
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Job withdrawn successfully',
            data: job,
        });
    } catch (error) {
        console.error('Withdraw job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while withdrawing job',
            error: error.message,
        });
    }
};

const closeJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to close this job',
            });
        }

        job.status = 'closed';
        await job.save();

        res.status(200).json({
            success: true,
            message: 'Job closed successfully',
            data: job,
        });
    } catch (error) {
        console.error('Close job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while closing job',
            error: error.message,
        });
    }
};

const getMyJobs = async (req, res) => {
    try {
        const { status = 'active', page = 1, limit = 10 } = req.query;

        const query = {
            postedBy: req.user._id,
            status,
        };

        const skip = (page - 1) * limit;

        const jobs = await Job.find(query)
            .populate('companyId', 'name logo')
            .sort({ createdAt: 'desc' })
            .limit(Number(limit))
            .skip(skip);

        const jobsWithCounts = await Promise.all(
            jobs.map(async (job) => {
                const applicationsCount = await Application.countDocuments({
                    jobId: job._id,
                    status: { $ne: 'withdrawn' },
                });
                return {
                    ...job.toObject(),
                    applicationsCount,
                };
            })
        );

        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            data: jobsWithCounts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get my jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

const getRecruiterDashboardStats = async (req, res) => {
    try {
        const recruiterId = req.user._id;

        const activeJobsCount = await Job.countDocuments({
            postedBy: recruiterId,
            status: 'active',
        });

        const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);

        const totalApplications = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: { $ne: 'withdrawn' },
        });

        const interviewingCount = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: 'shortlisted',
        });

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const hiredThisMonth = await Application.countDocuments({
            jobId: { $in: jobIds },
            status: 'accepted',
            updatedAt: { $gte: startOfMonth },
        });

        const pipelineData = await Application.aggregate([
            { $match: { jobId: { $in: jobIds } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const pipeline = {
            new: 0,
            screening: 0,
            interviewing: 0,
            offer: 0,
            hired: 0,
        };

        pipelineData.forEach(item => {
            switch (item._id) {
                case 'pending':
                    pipeline.new = item.count;
                    break;
                case 'screening':
                    pipeline.screening = item.count;
                    break;
                case 'shortlisted':
                    pipeline.interviewing = item.count;
                    break;
                case 'interviewing':
                    pipeline.interviewing += item.count;
                    break;
                case 'offered':
                    pipeline.offer = item.count;
                    break;
                case 'accepted':
                    pipeline.hired = item.count;
                    break;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                activeJobs: activeJobsCount,
                totalApplications,
                interviewing: interviewingCount,
                hiredThisMonth,
                pipeline,
            },
        });
    } catch (error) {
        console.error('Get recruiter dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics',
            error: error.message,
        });
    }
};

const getRecentApplicants = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const recruiterId = req.user._id;

        const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('_id');
        const jobIds = recruiterJobs.map(job => job._id);

        const applications = await Application.find({
            jobId: { $in: jobIds },
            status: { $ne: 'withdrawn' },
        })
            .populate({
                path: 'seekerId',
                select: 'name email profile',
            })
            .populate({
                path: 'jobId',
                select: 'title requiredSkills',
            })
            .sort({ createdAt: 'desc' })
            .limit(Number(limit));

        const formattedApplications = applications.map(app => {
            const seeker = app.seekerId;
            const job = app.jobId;

            return {
                id: app._id,
                name: seeker?.name || 'Unknown',
                email: seeker?.email || 'N/A',
                position: job?.title || 'Unknown Position',
                appliedDate: app.createdAt,
                status: app.status,
                skills: seeker?.profile?.skills || [],
                atsScore: app.atsScore || 0,
                avatar: seeker?.name
                    ? seeker.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'NA',
            };
        });

        res.status(200).json({
            success: true,
            data: formattedApplications,
            count: formattedApplications.length,
        });
    } catch (error) {
        console.error('Get recent applicants error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching recent applicants',
            error: error.message,
        });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    withdrawJob,
    closeJob,
    getMyJobs,
    getRecruiterDashboardStats,
    getRecentApplicants,
};
