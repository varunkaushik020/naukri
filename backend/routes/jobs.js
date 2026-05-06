const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    withdrawJob,
    closeJob,
    getMyJobs,
    getRecruiterDashboardStats,
    getRecentApplicants,
} = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { isRecruiter } = require('../middleware/rbac');

router.get('/', getJobs);
router.get('/:id', getJobById);

router.post('/', protect, isRecruiter, createJob);
router.put('/:id', protect, isRecruiter, updateJob);
router.delete('/:id', protect, isRecruiter, withdrawJob);
router.put('/:id/close', protect, isRecruiter, closeJob);
router.get('/recruiter/my-jobs', protect, isRecruiter, getMyJobs);
router.get('/recruiter/dashboard-stats', protect, isRecruiter, getRecruiterDashboardStats);
router.get('/recruiter/recent-applicants', protect, isRecruiter, getRecentApplicants);

module.exports = router;
