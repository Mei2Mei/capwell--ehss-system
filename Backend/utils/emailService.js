const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER, // e.g. ehss@outlook.com
    pass: process.env.SMTP_PASS, // app password or SMTP password
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

/**
 * Send notification email to Linda when a public action is submitted
 */
const sendPublicActionAlert = async ({ description, department, reporter_name, reporter_email }) => {
  const submittedBy = reporter_name
    ? `${reporter_name}${reporter_email ? ` (${reporter_email})` : ''}`
    : 'Anonymous';

  const mailOptions = {
    from: `"Capwell EHSS System" <${process.env.SMTP_USER}>`,
    to: process.env.LINDA_EMAIL, // e.g. linda@capwell.com
    subject: '⚠️ New Safety Issue Reported — Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a5276; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 18px;">Capwell EHSS — New Action Submitted</h2>
        </div>
        <div style="background: #f5f7fa; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 16px; color: #333;">A new safety issue or action has been submitted via the Public Action Portal.</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; font-weight: 600; width: 140px; color: #1a5276;">Description</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; color: #333;">${description}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; border: 1px solid #e0e0e0; font-weight: 600; color: #1a5276;">Department</td>
              <td style="padding: 8px 12px; background: #f9f9f9; border: 1px solid #e0e0e0; color: #333;">${department || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; font-weight: 600; color: #1a5276;">Submitted By</td>
              <td style="padding: 8px 12px; background: #fff; border: 1px solid #e0e0e0; color: #333;">${submittedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f9f9f9; border: 1px solid #e0e0e0; font-weight: 600; color: #1a5276;">Submitted At</td>
              <td style="padding: 8px 12px; background: #f9f9f9; border: 1px solid #e0e0e0; color: #333;">${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}</td>
            </tr>
          </table>

          <p style="margin: 20px 0 0; font-size: 12px; color: #888;">
            Please log in to the EHSS system to review and assign this action item.<br/>
            This is an automated notification from the Capwell EHSS Management System.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendPublicActionAlert };