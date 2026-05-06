const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select a resume file.',
            });
        }

        const userId = req.user._id;
        const uploadedFilename = req.file.filename;
        const originalFilename = req.file.originalname;
        const fileType = req.file.mimetype;
        const fileSize = req.file.size;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.profile.resumeFileName = uploadedFilename;
        user.profile.resumeFileType = fileType;
        await user.save();

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${uploadedFilename}`;

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                fileName: uploadedFilename,
                originalName: originalFilename,
                fileType: fileType,
                fileSize: fileSize,
                fileUrl: fileUrl,
            },
        });
    } catch (error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to upload resume',
            error: error.message,
        });
    }
};

const getResumeUrl = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user || !user.profile.resumeFileName) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found',
            });
        }

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${user.profile.resumeFileName}`;

        res.status(200).json({
            success: true,
            data: {
                fileName: user.profile.resumeFileName,
                fileType: user.profile.resumeFileType,
                fileUrl: fileUrl,
            },
        });
    } catch (error) {
        console.error('Get resume URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get resume URL',
            error: error.message,
        });
    }
};

const removeResume = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.profile.resumeFileName) {
            const filePath = path.join(__dirname, '..', 'uploads', 'resumes', user.profile.resumeFileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        user.profile.resumeFileName = '';
        user.profile.resumeFileType = '';
        user.profile.resumeText = '';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Resume removed successfully',
        });
    } catch (error) {
        console.error('Remove resume error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove resume',
            error: error.message,
        });
    }
};

module.exports = {
    uploadResume,
    getResumeUrl,
    removeResume,
};
