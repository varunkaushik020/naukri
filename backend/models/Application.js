const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    seekerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resume: {
        type: String,
        required: [true, 'Resume is required'],
    },
    coverLetter: {
        type: String,
        default: '',
    },
    atsScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        enum: ['pending', 'shortlisted', 'rejected', 'withdrawn', 'accepted'],
        default: 'pending',
    },
    appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recruiterNotes: {
        type: String,
        default: '',
    },
    withdrawnAt: {
        type: Date,
        default: null,
    },
    withdrawnBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    withdrawalReason: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

applicationSchema.index({ jobId: 1 });
applicationSchema.index({ seekerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ atsScore: -1 });

applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
