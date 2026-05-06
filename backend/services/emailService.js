const { sendEmail } = require('../config/mailer');

const sendApplicationConfirmation = async (seekerEmail, jobTitle, companyName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Received - ${companyName}</h2>
        <p>Hello,</p>
        <p>Your application for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted.</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0;"><strong>What's next?</strong></p>
          <ul style="margin: 10px 0;">
            <li>The recruiter will review your application</li>
            <li>You'll be notified if you're shortlisted</li>
            <li>You can track your application status in your dashboard</li>
          </ul>
        </div>
        <p>Thank you for applying!</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #888; font-size: 12px;">Naukri Portal - Connecting Talent with Opportunities</p>
      </div>
    `;

    await sendEmail({
      to: seekerEmail,
      subject: `Application Confirmation - ${jobTitle} at ${companyName}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending application confirmation:', error);
    return false;
  }
};

const sendApplicationStatusUpdate = async (seekerEmail, jobTitle, companyName, newStatus) => {
  try {
    const statusMessages = {
      shortlisted: {
        subject: 'Congratulations! You\'ve Been Shortlisted',
        message: 'Great news! Your application has been shortlisted for the next round.',
        color: '#4CAF50',
      },
      rejected: {
        subject: 'Application Status Update',
        message: 'Thank you for your interest. Unfortunately, your application was not selected for this position.',
        color: '#f44336',
      },
      accepted: {
        subject: 'Congratulations! Your Application Has Been Accepted',
        message: 'Excellent! You have been selected for this position. The company will contact you soon with next steps.',
        color: '#2196F3',
      },
    };

    const statusInfo = statusMessages[newStatus] || {
      subject: 'Application Status Update',
      message: `Your application status has been updated to: ${newStatus}`,
      color: '#FF9800',
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusInfo.color};">${statusInfo.subject}</h2>
        <p>Hello,</p>
        <p>${statusInfo.message}</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Position Details:</strong></p>
          <p style="margin: 10px 0;"><strong>Job Title:</strong> ${jobTitle}</p>
          <p style="margin: 10px 0;"><strong>Company:</strong> ${companyName}</p>
          <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; text-transform: capitalize;">${newStatus}</span></p>
        </div>
        <p>Best of luck with your job search!</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #888; font-size: 12px;">Naukri Portal - Connecting Talent with Opportunities</p>
      </div>
    `;

    await sendEmail({
      to: seekerEmail,
      subject: statusInfo.subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending application status update:', error);
    return false;
  }
};

const sendWelcomeEmail = async (userName, userEmail, userRole) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Welcome to Naukri Portal!</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for joining Naukri Portal! Your account has been successfully created.</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0;"><strong>Account Details:</strong></p>
          <ul style="margin: 10px 0;">
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Account Type:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</li>
          </ul>
        </div>
        <div style="background-color: #e3f2fd; padding: 15px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <p style="margin: 0;"><strong>What's Next?</strong></p>
          <ul style="margin: 10px 0;">
            ${userRole === 'seeker' ? `
              <li>Complete your profile with your skills and experience</li>
              <li>Upload your resume to get better job matches</li>
              <li>Browse and apply for jobs that match your profile</li>
            ` : userRole === 'recruiter' ? `
              <li>Complete your company profile</li>
              <li>Post job openings to attract top talent</li>
              <li>Review and manage applications from seekers</li>
            ` : `
              <li>Set up your admin dashboard</li>
              <li>Monitor platform activity and user management</li>
              <li>Verify company registrations</li>
            `}
          </ul>
        </div>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        <p style="margin-top: 30px;">Best regards,<br><strong>The Naukri Portal Team</strong></p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #888; font-size: 12px;">Naukri Portal - Connecting Talent with Opportunities</p>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject: 'Welcome to Naukri Portal - Your Account is Ready!',
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const sendNewApplicantNotification = async (recruiterEmail, seekerName, jobTitle, companyName) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Application Received</h2>
        <p>Hello,</p>
        <p><strong>${seekerName}</strong> has applied for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
        <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Action Required:</strong></p>
          <p style="margin: 10px 0;">Please review the application in your recruiter dashboard and take appropriate action.</p>
        </div>
        <p>Login to your dashboard to view the application details and ATS score.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;" />
        <p style="color: #888; font-size: 12px;">Naukri Portal - Connecting Talent with Opportunities</p>
      </div>
    `;

    await sendEmail({
      to: recruiterEmail,
      subject: `New Application: ${seekerName} applied for ${jobTitle}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending new applicant notification:', error);
    return false;
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
  sendNewApplicantNotification,
  sendWelcomeEmail,
};
