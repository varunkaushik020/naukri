const Company = require('../models/Company');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getPendingCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ isVerified: false })
            .populate('createdBy', 'name email phone')
            .sort({ createdAt: 'desc' });

        res.status(200).json({
            success: true,
            data: companies,
            count: companies.length,
        });
    } catch (error) {
        console.error('Get pending companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching pending companies',
            error: error.message,
        });
    }
};

const verifyCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        if (company.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Company is already verified',
            });
        }

        company.isVerified = true;
        company.verifiedBy = req.user._id;
        company.verifiedAt = new Date();
        company.rejectedBy = null;
        company.rejectionReason = '';

        await company.save();

        res.status(200).json({
            success: true,
            message: 'Company verified successfully',
            data: company,
        });
    } catch (error) {
        console.error('Verify company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while verifying company',
            error: error.message,
        });
    }
};

const rejectCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        company.isVerified = false;
        company.rejectedBy = req.user._id;
        company.rejectionReason = reason || 'No reason provided';

        await company.save();

        res.status(200).json({
            success: true,
            message: 'Company rejected',
            data: company,
        });
    } catch (error) {
        console.error('Reject company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting company',
            error: error.message,
        });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSeekers = await User.countDocuments({ role: 'seeker' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalCompanies = await Company.countDocuments();
        const verifiedCompanies = await Company.countDocuments({ isVerified: true });
        const pendingCompanies = await Company.countDocuments({ isVerified: false });
        const totalJobs = await Job.countDocuments();
        const activeJobs = await Job.countDocuments({ status: 'active' });
        const totalApplications = await Application.countDocuments();

        const recentCompanies = await Company.find()
            .sort({ createdAt: 'desc' })
            .limit(5)
            .populate('createdBy', 'name email');

        const recentJobs = await Job.find()
            .sort({ createdAt: 'desc' })
            .limit(5)
            .populate('postedBy', 'name email')
            .populate('companyId', 'name');

        const applicationsByStatus = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalSeekers,
                    totalRecruiters,
                    totalCompanies,
                    verifiedCompanies,
                    pendingCompanies,
                    totalJobs,
                    activeJobs,
                    totalApplications,
                },
                applicationsByStatus,
                recentCompanies,
                recentJobs,
            },
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching analytics',
            error: error.message,
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;

        const query = {};
        if (role) {
            query.role = role;
        }

        const skip = (page - 1) * limit;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: 'desc' })
            .limit(Number(limit))
            .skip(skip);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
            error: error.message,
        });
    }
};

const toggleUserLock = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot lock admin accounts',
            });
        }

        user.isLocked = !user.isLocked;
        if (!user.isLocked) {
            user.lockUntil = null;
            user.failedAttempts = 0;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isLocked ? 'locked' : 'unlocked'} successfully`,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                isLocked: user.isLocked,
            },
        });
    } catch (error) {
        console.error('Toggle user lock error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    getPendingCompanies,
    verifyCompany,
    rejectCompany,
    getAnalytics,
    getAllUsers,
    toggleUserLock,
};
