const express = require('express');
const router = express.Router();
const {
    applyForJob,
    getApplicationsForJob,
    getMyApplications,
    updateApplicationStatus,
    withdrawApplication,
    getApplicationById,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { isSeeker, isRecruiter } = require('../middleware/rbac');

router.post('/', protect, isSeeker, applyForJob);
router.get('/my-applications', protect, isSeeker, getMyApplications);
router.get('/job/:jobId', protect, isRecruiter, getApplicationsForJob);
router.put('/:id/status', protect, isRecruiter, updateApplicationStatus);
router.put('/:id/withdraw', protect, isSeeker, withdrawApplication);
router.get('/:id', protect, getApplicationById);

module.exports = router;
