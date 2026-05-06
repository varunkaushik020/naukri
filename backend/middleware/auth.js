const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authorization format',
                });
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.',
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.',
                });
            }

            if (user.isAccountLocked()) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is temporarily locked due to multiple failed login attempts.',
                });
            }

            req.user = user;
            next();
        } catch (error) {
            let errorMessage = 'Invalid or expired token. Please login again.';

            if (error.name === 'JsonWebTokenError') {
                errorMessage = 'Invalid token format. Please login again.';
            } else if (error.name === 'TokenExpiredError') {
                errorMessage = 'Token has expired. Please login again.';
            }

            return res.status(401).json({
                success: false,
                message: errorMessage,
                errorType: error.name,
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};

module.exports = { protect };
