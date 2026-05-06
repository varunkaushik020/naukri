const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
    },
    descriptionFileName: {
        type: String,
        default: '',
        description: 'Original job description file name if uploaded',
    },
    descriptionFileType: {
        type: String,
        default: '',
        description: 'Job description file MIME type',
    },
    requiredSkills: {
        type: [String],
        required: [true, 'Required skills are required'],
    },
    experience: {
        min: {
            type: Number,
            required: [true, 'Minimum experience is required'],
            min: 0,
            default: 0,
        },
        max: {
            type: Number,
            required: [true, 'Maximum experience is required'],
            min: 0,
            default: 0,
        },
        type: {
            type: String,
            enum: ['Years', 'Months'],
            default: 'Years',
        },
    },
    salary: {
        min: {
            type: Number,
            default: 0,
        },
        max: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: 'INR',
        },
        type: {
            type: String,
            enum: ['Fixed', 'Range'],
            default: 'Range',
        },
    },
    location: {
        type: String,
        required: [true, 'Job location is required'],
    },
    workMode: {
        type: String,
        enum: ['Remote', 'Hybrid', 'On-site'],
        default: 'On-site',
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time',
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'withdrawn', 'paused'],
        default: 'active',
    },
    withdrawnAt: {
        type: Date,
    },
    withdrawnBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    withdrawalReason: {
        type: String,
    },
    openings: {
        type: Number,
        default: 1,
        min: 1,
    },
    applicationDeadline: {
        type: Date,
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    applicationsCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

jobSchema.index({ status: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ requiredSkills: 1 });

module.exports = mongoose.model('Job', jobSchema);
