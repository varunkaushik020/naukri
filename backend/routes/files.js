const express = require('express');
const router = express.Router();
const { uploadResume, getResumeUrl, removeResume } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/upload/resume', protect, upload.single('resume'), uploadResume);

router.get('/resume/url', protect, getResumeUrl);

router.delete('/resume', protect, removeResume);

module.exports = router;
