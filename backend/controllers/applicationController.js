const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const { calculateATSScore, calculateDetailedATSScore } = require('../services/atsScoringService');
const { sendApplicationConfirmation, sendApplicationStatusUpdate, sendNewApplicantNotification } = require('../services/emailService');

const applyForJob = async (req, res) => {
    try {
        const { jobId, resume, coverLetter } = req.body;

        if (!jobId || !resume) {
            return res.status(400).json({
                success: false,
                message: 'Job ID and resume are required',
            });
        }

        const job = await Job.findById(jobId).populate('companyId');
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: `This job is no longer accepting applications. Status: ${job.status}`,
            });
        }

        const existingApplication = await Application.findOne({
            jobId,
            seekerId: req.user._id,
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job',
            });
        }

        const seeker = await User.findById(req.user._id);

        const atsScore = calculateATSScore(job.requiredSkills, resume);

        const application = await Application.create({
            jobId,
            seekerId: req.user._id,
            resume,
            coverLetter: coverLetter || '',
            atsScore,
            appliedBy: req.user._id,
        });

        await application.populate('jobId', 'title');
        await application.populate('seekerId', 'name email profile');

        sendApplicationConfirmation(
            seeker.email,
            job.title,
            job.companyId.name
        );

        const recruiter = await User.findById(job.postedBy);
        if (recruiter) {
            sendNewApplicantNotification(
                recruiter.email,
                seeker.name,
                job.title,
                job.companyId.name
            );
        }

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                ...application.toObject(),
                atsScore,
            },
        });
    } catch (error) {
        console.error('Apply for job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting application',
            error: error.message,
        });
    }
};

const getApplicationsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, sortBy = 'atsScore', sortOrder = 'desc' } = req.query;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found',
            });
        }

        if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this job',
            });
        }

        const query = { jobId };
        if (status) {
            query.status = status;
        }

        const sortOptions = {};
        if (sortBy === 'atsScore') {
            sortOptions.atsScore = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'appliedAt') {
            sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
        }

        const applications = await Application.find(query)
            .populate('seekerId', 'name email profile')
            .sort(sortOptions);

        const applicationsWithDetails = await Promise.all(
            applications.map(async (app) => {
                const detailedScore = calculateDetailedATSScore(
                    job.requiredSkills,
                    app.resume
                );
                return {
                    ...app.toObject(),
                    atsDetails: detailedScore,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: applicationsWithDetails,
            count: applicationsWithDetails.length,
        });
    } catch (error) {
        console.error('Get applications for job error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applications',
            error: error.message,
        });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const { status } = req.query;

        const query = { seekerId: req.user._id };
        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate('jobId', 'title description location salary workMode employmentType')
            .populate({
                path: 'jobId',
                populate: {
                    path: 'companyId',
                    select: 'name logo industry location',
                },
            })
            .sort({ createdAt: 'desc' });

        res.status(200).json({
            success: true,
            data: applications,
            count: applications.length,
        });
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching applications',
            error: error.message,
        });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, recruiterNotes } = req.body;

        const application = await Application.findById(id)
            .populate('jobId')
            .populate('seekerId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        if (
            application.jobId.postedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application',
            });
        }

        application.status = status;
        if (recruiterNotes) {
            application.recruiterNotes = recruiterNotes;
        }

        await application.save();

        sendApplicationStatusUpdate(
            application.seekerId.email,
            application.jobId.title,
            application.jobId.companyId.name,
            status
        );

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: application,
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating application status',
            error: error.message,
        });
    }
};

const withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const application = await Application.findById(id)
            .populate('jobId')
            .populate('seekerId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        if (application.seekerId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this application',
            });
        }

        application.status = 'withdrawn';
        application.withdrawnAt = new Date();
        application.withdrawnBy = req.user._id;
        application.withdrawalReason = reason || '';

        await application.save();

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully',
            data: application,
        });
    } catch (error) {
        console.error('Withdraw application error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while withdrawing application',
            error: error.message,
        });
    }
};

const getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id)
            .populate('jobId', 'title description')
            .populate('seekerId', 'name email profile')
            .populate({
                path: 'jobId',
                populate: {
                    path: 'companyId',
                    select: 'name logo',
                },
            });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        const isSeeker = application.seekerId._id.toString() === req.user._id.toString();
        const isRecruiter = application.jobId.postedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isSeeker && !isRecruiter && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application',
            });
        }

        res.status(200).json({
            success: true,
            data: application,
        });
    } catch (error) {
        console.error('Get application by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    applyForJob,
    getApplicationsForJob,
    getMyApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationById,
};
