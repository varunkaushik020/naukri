const { getRedisClient } = require('../config/redis');

const LOCKOUT_THRESHOLD = 3;
const LOCKOUT_DURATION = 3600;

const recordFailedAttempt = async (email) => {
    try {
        const redisClient = getRedisClient();
        const key = `failed_mfa:${email}`;

        let attempts = await redisClient.get(key);
        attempts = attempts ? parseInt(attempts) : 0;

        attempts++;

        await redisClient.setEx(key, 7200, attempts.toString());

        return attempts;
    } catch (error) {
        console.error('Error recording failed MFA attempt:', error);
        return 0;
    }
};

const checkAndLockAccount = async (email, userModel) => {
    try {
        const redisClient = getRedisClient();
        const failedAttemptsKey = `failed_mfa:${email}`;

        const attempts = await redisClient.get(failedAttemptsKey);
        const attemptCount = attempts ? parseInt(attempts) : 0;

        if (attemptCount >= LOCKOUT_THRESHOLD) {
            const user = await userModel.findOne({ email });

            if (user) {
                user.isLocked = true;
                user.lockUntil = new Date(Date.now() + (LOCKOUT_DURATION * 1000));
                user.failedAttempts = attemptCount;
                await user.save();

                const lockKey = `account_locked:${email}`;
                await redisClient.setEx(lockKey, LOCKOUT_DURATION, 'true');

                return {
                    locked: true,
                    message: `Account locked due to multiple failed attempts. Try again after 1 hour.`,
                };
            }
        }

        return {
            locked: false,
            remainingAttempts: LOCKOUT_THRESHOLD - attemptCount,
        };
    } catch (error) {
        console.error('Error checking and locking account:', error);
        return { locked: false, message: 'Error checking account status' };
    }
};

const resetFailedAttempts = async (email) => {
    try {
        const redisClient = getRedisClient();
        const failedAttemptsKey = `failed_mfa:${email}`;
        const lockKey = `account_locked:${email}`;

        await redisClient.del(failedAttemptsKey);

        await redisClient.del(lockKey);

        const user = await require('../models/User').findOne({ email });
        if (user) {
            user.resetLockout();
            await user.save();
        }
    } catch (error) {
        console.error('Error resetting failed attempts:', error);
    }
};

const isAccountLocked = async (email) => {
    try {
        const redisClient = getRedisClient();
        const lockKey = `account_locked:${email}`;

        const isLocked = await redisClient.get(lockKey);
        return isLocked === 'true';
    } catch (error) {
        console.error('Error checking account lock status:', error);
        return false;
    }
};

const getRemainingLockTime = async (email, userModel) => {
    try {
        const user = await userModel.findOne({ email });

        if (!user || !user.lockUntil) {
            return null;
        }

        const now = new Date();
        const lockUntil = new Date(user.lockUntil);

        if (lockUntil <= now) {
            user.resetLockout();
            await user.save();
            return null;
        }

        const remainingMs = lockUntil - now;
        const remainingMinutes = Math.floor(remainingMs / 60000);

        return remainingMinutes;
    } catch (error) {
        console.error('Error getting remaining lock time:', error);
        return null;
    }
};

module.exports = {
    recordFailedAttempt,
    checkAndLockAccount,
    resetFailedAttempts,
    isAccountLocked,
    getRemainingLockTime,
    LOCKOUT_THRESHOLD,
    LOCKOUT_DURATION,
};
