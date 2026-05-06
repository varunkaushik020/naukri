const crypto = require('crypto');
const { getRedisClient, isRedisAvailable } = require('../config/redis');
const { sendEmail } = require('../config/mailer');

const memoryStore = new Map();

const generateOTP = () => {
    return crypto.randomInt(1, 1000000).toString().padStart(6, '0');
};

const sendMFAOTP = async (email, otp) => {
    try {
        const redisClient = getRedisClient();

        const key = `mfa:${email}`;
        if (isRedisAvailable() && redisClient) {
            await redisClient.setEx(key, 300, otp);
        } else {
            memoryStore.set(key, { otp, expiresAt: Date.now() + 300000 });
            console.log('âš ï¸  Using in-memory OTP storage (Redis not available)');
        }

        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Naukri Portal - Multi-Factor Authentication</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for login verification is:</p>
        <h1 style="background-color: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #888; font-size: 12px;">This is an automated message. Please do not reply.</p>
      </div>
    `;

        const emailResult = await sendEmail({
            to: email,
            subject: 'Your MFA Verification Code - Naukri Portal',
            html: htmlContent,
        });

        if (!emailResult || emailResult.messageId.startsWith('simulated-')) {
            console.log('\nðŸ” YOUR MFA VERIFICATION CODE:', otp);
            console.log('   (Email not configured - OTP logged to console)\n');
        }

        return true;
    } catch (error) {
        console.error('Error sending MFA OTP:', error.message);
        console.log('OTP stored. Check console for code.');
        return true;
    }
};

const verifyMFAOTP = async (email, otp) => {
    try {
        const redisClient = getRedisClient();
        const key = `mfa:${email}`;

        let storedOTP;

        if (isRedisAvailable() && redisClient) {
            storedOTP = await redisClient.get(key);
        } else {
            const entry = memoryStore.get(key);
            if (entry && entry.expiresAt > Date.now()) {
                storedOTP = entry.otp;
            } else {
                memoryStore.delete(key);
            }
        }

        if (!storedOTP) {
            return { success: false, message: 'OTP expired or invalid' };
        }

        if (storedOTP !== otp) {
            return { success: false, message: 'Invalid OTP' };
        }

        if (isRedisAvailable() && redisClient) {
            await redisClient.del(key);
        } else {
            memoryStore.delete(key);
        }

        return { success: true, message: 'MFA verified successfully' };
    } catch (error) {
        console.error('Error verifying MFA OTP:', error);
        throw new Error('Failed to verify MFA OTP');
    }
};

const isMFARequired = async (email) => {
    try {
        const redisClient = getRedisClient();
        const key = `mfa_required:${email}`;

        if (isRedisAvailable() && redisClient) {
            const mfaRequired = await redisClient.get(key);
            return mfaRequired === 'true';
        } else {
            const entry = memoryStore.get(key);
            return entry && entry.expiresAt > Date.now() ? entry.value === 'true' : false;
        }
    } catch (error) {
        console.error('Error checking MFA requirement:', error);
        return false;
    }
};

const setMFARequirement = async (email, required) => {
    try {
        const redisClient = getRedisClient();
        const key = `mfa_required:${email}`;

        if (isRedisAvailable() && redisClient) {
            await redisClient.setEx(key, 3600, required.toString());
        } else {
            memoryStore.set(key, { value: required.toString(), expiresAt: Date.now() + 3600000 });
        }
    } catch (error) {
        console.error('Error setting MFA requirement:', error);
    }
};

module.exports = {
    generateOTP,
    sendMFAOTP,
    verifyMFAOTP,
    isMFARequired,
    setMFARequirement,
};
