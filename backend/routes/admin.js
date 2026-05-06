const express = require('express');
const router = express.Router();
const {
    getPendingCompanies,
    verifyCompany,
    rejectCompany,
    getAnalytics,
    getAllUsers,
    toggleUserLock,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');

router.use(protect);
router.use(isAdmin);

router.get('/companies/pending', getPendingCompanies);
router.put('/companies/:id/verify', verifyCompany);
router.put('/companies/:id/reject', rejectCompany);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-lock', toggleUserLock);

module.exports = router;
