const { isAccountLocked, getRemainingLockTime } = require('../services/accountLockoutService');

const checkAccountLockout = async (req, res, next) => {
    try {
        const email = req.body.email || (req.user && req.user.email);

        if (!email) {
            return next();
        }

        const locked = await isAccountLocked(email);

        if (locked) {
            const remainingMinutes = await getRemainingLockTime(email, require('../models/User'));

            if (remainingMinutes !== null) {
                return res.status(403).json({
                    success: false,
                    message: `Account is locked. Please try again after ${remainingMinutes} minutes.`,
                    lockDuration: remainingMinutes,
                });
            }
        }

        next();
    } catch (error) {
        console.error('Account lockout check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during account lockout check',
        });
    }
};

module.exports = { checkAccountLockout };
