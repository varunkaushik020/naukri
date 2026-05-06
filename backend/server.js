const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

dotenv.config();

const app = express();

connectDB();

connectRedis();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    exposedHeaders: ['Authorization'],
}));

app.use('/uploads', express.static('uploads'));

app.use(express.json({
    limit: '10mb',
    type: 'application/json'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
    parameterLimit: 50000
}));

app.use((req, res, next) => {
    console.log(`\nðŸ“¥ [Request] ${req.method} ${req.path}`);
    console.log('   Headers:', JSON.stringify(req.headers, null, 2));
    next();
});

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const companyRoutes = require('./routes/companies');
const adminRoutes = require('./routes/admin');
const fileRoutes = require('./routes/files');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Naukri Portal API is running',
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        console.error('âŒ File too large:', {
            path: req.path,
            method: req.method,
            size: req.headers['content-length']
        });
        return res.status(413).json({
            success: false,
            message: 'File is too large. Maximum size is 50MB.',
        });
    }

    console.error('Server error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
