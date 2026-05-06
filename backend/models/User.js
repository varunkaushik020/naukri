const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['seeker', 'recruiter', 'admin'],
        default: 'seeker',
    },
    profile: {
        skills: [String],
        experience: {
            type: Number,
            default: 0,
        },
        resumeText: {
            type: String,
            default: '',
            description: 'Extracted text content from resume for ATS scoring',
        },
        resumeFileName: {
            type: String,
            default: '',
            description: 'Resume file name stored in uploads/resumes/ folder or Firebase',
        },
        resumeFileType: {
            type: String,
            default: '',
            description: 'Resume file MIME type',
            maxlength: 100,
        },
        resumeFileURL: {
            type: String,
            default: '',
            description: 'Firebase Storage download URL',
        },
        resumeFirebaseId: {
            type: String,
            default: '',
            description: 'Firestore document ID',
        },
        resumeStoragePath: {
            type: String,
            default: '',
            description: 'Firebase Storage path',
        },
        phone: String,
        location: String,
        education: [
            {
                qualification: {
                    type: String,
                    enum: ['10th', '12th', 'Graduation', 'Post-Graduation', 'Diploma', 'Other'],
                },
                boardOrUniversity: String,
                institution: String,
                yearOfPassing: Number,
                marks: String,
                cgpa: String,
                specialization: String,
            }
        ],
        summary: String,
        currentCompany: String,
        expectedSalary: {
            min: Number,
            max: Number,
        },
        preferredLocation: [String],
        dateOfBirth: {
            type: String,
            default: '',
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
            default: '',
        },
        nationality: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        state: {
            type: String,
            default: '',
        },
        pincode: {
            type: String,
            default: '',
        },
        languages: [String],
        bio: {
            type: String,
            default: '',
        },
        expertise: [String],
        company: String,
        designation: String,
        totalHires: {
            type: Number,
            default: 0,
        },
        yearsOfExperience: {
            type: Number,
            default: 0,
        },
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    lockUntil: {
        type: Date,
        default: null,
    },
    failedAttempts: {
        type: Number,
        default: 0,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isAccountLocked = function () {
    return !!(this.isLocked && this.lockUntil > Date.now());
};

userSchema.methods.resetLockout = function () {
    this.isLocked = false;
    this.lockUntil = null;
    this.failedAttempts = 0;
};

module.exports = mongoose.model('User', userSchema);
