const nodemailer = require('nodemailer');

// 1. Setup Transport (Configure with VIT or Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Sends a formal Digital Receipt upon issue resolution.
 */
exports.sendResolutionEmail = async (userEmail, issueData) => {
  const mailOptions = {
    from: `"SpotFix Architects" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Resolution Record: ${issueData.title}`,
    html: `
      <div style="font-family: sans-serif; color: #334155; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 24px; padding: 40px;">
        <h1 style="color: #2563eb; margin-bottom: 8px;">Issue Resolved</h1>
        <p style="font-weight: bold; margin-bottom: 24px;">Thank you for contributing to VIT campus maintenance.</p>
        
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Digital Receipt ID</p>
          <p style="margin: 4px 0 16px 0; font-weight: bold; color: #1e293b;">#${issueData.receiptId}</p>
          
          <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 800;">Impact Points Earned</p>
          <p style="margin: 4px 0 0 0; font-weight: 800; color: #2563eb; font-size: 24px;">+${issueData.points} XP</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6;">
          Your report for <strong>"${issueData.title}"</strong> has been successfully addressed by the maintenance team. 
          Your contribution has been logged in your <strong>User History</strong> and your <strong>Leaderboard</strong> rank has been updated.
        </p>
        
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;" />
        <p style="font-size: 10px; color: #94a3b8; text-align: center; text-transform: uppercase; font-weight: 800; letter-spacing: 2px;">
          Built by The Architects
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Resolution receipt sent to ${userEmail}`);
  } catch (err) {
    console.error("Email Service Error:", err);
  }
};