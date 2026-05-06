const express = require('express');
const router = express.Router();
const { register, login, sendOTP, verifyOTP, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { checkAccountLockout } = require('../middleware/accountLockout');

router.post('/register', register);
router.post('/login', checkAccountLockout, login);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', protect, verifyOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
