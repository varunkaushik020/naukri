const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { sendMFAOTP, verifyMFAOTP } = require('../services/mfaService');
const { recordFailedAttempt, checkAndLockAccount, resetFailedAttempts } = require('../services/accountLockoutService');
const { setMFARequirement } = require('../services/mfaService');
const { sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const register = async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'seeker',
            profile: profile || {},
        });

        await sendWelcomeEmail(name, email, role || 'seeker');

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please login with your credentials.',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        if (user.isAccountLocked()) {
            return res.status(403).json({
                success: false,
                message: 'Account is temporarily locked due to multiple failed login attempts.',
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user._id);

        const otp = require('../services/mfaService').generateOTP();
        await sendMFAOTP(email, otp);
        await setMFARequirement(email, true);

        res.status(200).json({
            success: true,
            message: 'Login successful. Please enter the MFA code sent to your email.',
            requiresMFA: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message,
        });
    }
};

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const otp = require('../services/mfaService').generateOTP();
        await sendMFAOTP(email, otp);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email',
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending OTP',
            error: error.message,
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp, token } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        const result = await verifyMFAOTP(email, otp);

        if (!result.success) {
            const attempts = await recordFailedAttempt(email);

            const lockResult = await checkAndLockAccount(email, User);

            if (lockResult.locked) {
                return res.status(403).json({
                    success: false,
                    message: lockResult.message,
                });
            }

            return res.status(401).json({
                success: false,
                message: result.message,
                remainingAttempts: lockResult.remainingAttempts,
            });
        }

        await resetFailedAttempts(email);

        const user = await User.findById(req.user?.id || token).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'MFA verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profile: {
                    skills: user.profile.skills,
                    experience: user.profile.experience,
                    resumeFileName: user.profile.resumeFileName,
                    resumeFileType: user.profile.resumeFileType,
                    resumeFileURL: user.profile.resumeFileURL,
                    resumeFirebaseId: user.profile.resumeFirebaseId,
                    resumeStoragePath: user.profile.resumeStoragePath,
                    phone: user.profile.phone,
                    location: user.profile.location,
                    education: user.profile.education,
                    summary: user.profile.summary,
                    expectedSalary: user.profile.expectedSalary,
                    dateOfBirth: user.profile.dateOfBirth,
                    gender: user.profile.gender,
                    nationality: user.profile.nationality,
                    address: user.profile.address,
                    city: user.profile.city,
                    state: user.profile.state,
                    pincode: user.profile.pincode,
                    languages: user.profile.languages,
                },
            },
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during MFA verification',
            error: error.message,
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profile: {
                    skills: user.profile.skills,
                    experience: user.profile.experience,
                    resumeFileName: user.profile.resumeFileName,
                    resumeFileType: user.profile.resumeFileType,
                    resumeFileURL: user.profile.resumeFileURL,
                    resumeFirebaseId: user.profile.resumeFirebaseId,
                    resumeStoragePath: user.profile.resumeStoragePath,
                    phone: user.profile.phone,
                    location: user.profile.location,
                    education: user.profile.education,
                    summary: user.profile.summary,
                    currentCompany: user.profile.currentCompany,
                    expectedSalary: user.profile.expectedSalary,
                    preferredLocation: user.profile.preferredLocation,
                    dateOfBirth: user.profile.dateOfBirth,
                    gender: user.profile.gender,
                    nationality: user.profile.nationality,
                    address: user.profile.address,
                    city: user.profile.city,
                    state: user.profile.state,
                    pincode: user.profile.pincode,
                    languages: user.profile.languages,
                    bio: user.profile.bio,
                    expertise: user.profile.expertise,
                    company: user.profile.company,
                    designation: user.profile.designation,
                    totalHires: user.profile.totalHires,
                    yearsOfExperience: user.profile.yearsOfExperience,
                },
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (name) {
            user.name = name.trim();
        }

        if (profile) {
            if (profile.phone !== undefined) user.profile.phone = profile.phone.trim() || '';
            if (profile.location !== undefined) user.profile.location = profile.location.trim() || '';
            if (profile.skills !== undefined) user.profile.skills = profile.skills;
            if (profile.experience !== undefined) user.profile.experience = Number(profile.experience);

            if (profile.resumeFileName !== undefined) {
                if (profile.resumeFileName === '' && user.profile.resumeFileName) {
                    const oldFilePath = path.join(__dirname, '..', 'uploads', 'resumes', user.profile.resumeFileName);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
                user.profile.resumeFileName = profile.resumeFileName;
            }
            if (profile.resumeFileType !== undefined) {
                user.profile.resumeFileType = profile.resumeFileType;
            }
            if (profile.resumeFileURL !== undefined) {
                user.profile.resumeFileURL = profile.resumeFileURL;
            }
            if (profile.resumeFirebaseId !== undefined) {
                user.profile.resumeFirebaseId = profile.resumeFirebaseId;
            }
            if (profile.resumeStoragePath !== undefined) {
                user.profile.resumeStoragePath = profile.resumeStoragePath;
            }

            if (profile.summary !== undefined) user.profile.summary = profile.summary;
            if (profile.currentCompany !== undefined) user.profile.currentCompany = profile.currentCompany;
            if (profile.preferredLocation !== undefined) user.profile.preferredLocation = profile.preferredLocation;

            if (profile.dateOfBirth !== undefined) user.profile.dateOfBirth = profile.dateOfBirth;
            if (profile.gender !== undefined) user.profile.gender = profile.gender;
            if (profile.nationality !== undefined) user.profile.nationality = profile.nationality.trim();
            if (profile.address !== undefined) user.profile.address = profile.address.trim();
            if (profile.city !== undefined) user.profile.city = profile.city.trim();
            if (profile.state !== undefined) user.profile.state = profile.state.trim();
            if (profile.pincode !== undefined) user.profile.pincode = profile.pincode.trim();
            if (profile.languages !== undefined) user.profile.languages = profile.languages;

            if (profile.bio !== undefined) user.profile.bio = profile.bio;
            if (profile.expertise !== undefined) user.profile.expertise = profile.expertise;
            if (profile.company !== undefined) user.profile.company = profile.company;
            if (profile.designation !== undefined) user.profile.designation = profile.designation;
            if (profile.totalHires !== undefined) user.profile.totalHires = Number(profile.totalHires);
            if (profile.yearsOfExperience !== undefined) user.profile.yearsOfExperience = Number(profile.yearsOfExperience);

            if (profile.education !== undefined) {
                user.profile.education = profile.education.map(edu => ({
                    qualification: edu.qualification,
                    boardOrUniversity: edu.boardOrUniversity?.trim() || '',
                    institution: edu.institution?.trim() || '',
                    yearOfPassing: Number(edu.yearOfPassing) || null,
                    marks: edu.marks || '',
                    cgpa: edu.cgpa || '',
                    specialization: edu.specialization?.trim() || '',
                }));
            }

            if (profile.expectedSalary) {
                if (typeof profile.expectedSalary === 'object') {
                    user.profile.expectedSalary = {
                        min: Number(profile.expectedSalary.min) || 0,
                        max: Number(profile.expectedSalary.max) || 0,
                    };
                }
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                profile: {
                    skills: user.profile.skills,
                    experience: user.profile.experience,
                    resumeFileName: user.profile.resumeFileName,
                    resumeFileType: user.profile.resumeFileType,
                    resumeFileURL: user.profile.resumeFileURL,
                    resumeFirebaseId: user.profile.resumeFirebaseId,
                    resumeStoragePath: user.profile.resumeStoragePath,
                    phone: user.profile.phone,
                    location: user.profile.location,
                    education: user.profile.education,
                    summary: user.profile.summary,
                    currentCompany: user.profile.currentCompany,
                    expectedSalary: user.profile.expectedSalary,
                    preferredLocation: user.profile.preferredLocation,
                    dateOfBirth: user.profile.dateOfBirth,
                    gender: user.profile.gender,
                    nationality: user.profile.nationality,
                    address: user.profile.address,
                    city: user.profile.city,
                    state: user.profile.state,
                    pincode: user.profile.pincode,
                    languages: user.profile.languages,
                    bio: user.profile.bio,
                    expertise: user.profile.expertise,
                    company: user.profile.company,
                    designation: user.profile.designation,
                    totalHires: user.profile.totalHires,
                    yearsOfExperience: user.profile.yearsOfExperience,
                },
                isVerified: user.isVerified,
            },
        });
    } catch (error) {
        console.error('Update profile error:', error);

        let errorMessage = 'Server error';
        let statusCode = 500;

        if (error.name === 'ValidationError') {
            errorMessage = 'Validation Error: ' + Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
            statusCode = 400;
        }
        else if (error.name === 'CastError') {
            errorMessage = 'Invalid user ID';
            statusCode = 400;
        }
        else if (error.code === 11000) {
            errorMessage = 'Duplicate field value entered';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: error.message,
        });
    }
};

module.exports = {
    register,
    login,
    sendOTP,
    verifyOTP,
    getMe,
    updateProfile,
};
