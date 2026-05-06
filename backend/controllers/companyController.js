const Company = require('../models/Company');

const registerCompany = async (req, res) => {
    try {
        const {
            name,
            website,
            description,
            industry,
            size,
            location,
            logo,
        } = req.body;

        const existingCompany = await Company.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });

        if (existingCompany) {
            return res.status(400).json({
                success: false,
                message: 'Company with this name already exists',
            });
        }

        const company = await Company.create({
            name,
            website,
            description,
            industry,
            size,
            location,
            logo,
            createdBy: req.user._id,
            isVerified: false,
        });

        res.status(201).json({
            success: true,
            message: 'Company registered successfully. Pending admin verification.',
            data: company,
        });
    } catch (error) {
        console.error('Register company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while registering company',
            error: error.message,
        });
    }
};

const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findById(id)
            .populate('createdBy', 'name email')
            .populate('verifiedBy', 'name email');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        console.error('Get company by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

const getCompanies = async (req, res) => {
    try {
        const { search, industry, isVerified, page = 1, limit = 10 } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } },
            ];
        }

        if (industry) {
            query.industry = industry;
        }

        if (isVerified !== undefined) {
            query.isVerified = isVerified === 'true';
        }

        const skip = (page - 1) * limit;

        const companies = await Company.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: 'desc' })
            .limit(Number(limit))
            .skip(skip);

        const total = await Company.countDocuments(query);

        res.status(200).json({
            success: true,
            data: companies,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching companies',
            error: error.message,
        });
    }
};

const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        let company = await Company.findById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
        }

        if (
            company.createdBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this company',
            });
        }

        company = await Company.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: company,
        });
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating company',
            error: error.message,
        });
    }
};

const getMyCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ createdBy: req.user._id })
            .sort({ createdAt: 'desc' });

        res.status(200).json({
            success: true,
            data: companies,
            count: companies.length,
        });
    } catch (error) {
        console.error('Get my companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = {
    registerCompany,
    getCompanyById,
    getCompanies,
    updateCompany,
    getMyCompanies,
};
