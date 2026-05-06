const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
    },
    website: {
        type: String,
        required: [true, 'Website is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Company description is required'],
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        default: '1-10',
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
    logo: {
        type: String,
        default: '',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    verifiedAt: {
        type: Date,
        default: null,
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    rejectionReason: {
        type: String,
        default: '',
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminNotes: {
        type: String,
        default: '',
    },
    totalJobsPosted: {
        type: Number,
        default: 0,
    },
    activeJobs: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

companySchema.index({ isVerified: 1 });
companySchema.index({ name: 1 });

module.exports = mongoose.model('Company', companySchema);
