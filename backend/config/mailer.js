const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
            process.env.EMAIL_USER === 'your_email@gmail.com') {
            console.log('\nðŸ’¡ Email service not configured. MFA codes will be logged to console.');
            console.log('   To enable email, set up Gmail App-Specific Password from:');
            console.log('   https://myaccount.google.com/apppasswords\n');
            return null;
        }

        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        transporter.verify((error, success) => {
            if (error) {
                console.warn('Email service verification failed:', error.message);
            } else {
                console.log('Email server ready to send messages');
            }
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    const mailTransporter = getTransporter();

    if (!mailTransporter) {
        console.log('\n=== EMAIL NOT CONFIGURED - SIMULATED SEND ===');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log('HTML Content:', options.html.substring(0, 200) + '...');
        console.log('================================================\n');
        return { messageId: 'simulated-' + Date.now() };
    }

    const mailOptions = {
        from: `Naukri Portal <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    try {
        const info = await mailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        console.log('Continuing without email service...');
        return null;
    }
};

module.exports = { sendEmail, getTransporter };
