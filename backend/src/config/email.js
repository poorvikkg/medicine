const nodemailer = require('nodemailer');

const useEmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter;

if (useEmail) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('[Email Init Error] SMTP email verification failed:', error.message);
    } else {
      console.log('[Email Init] SMTP email server is ready to send messages');
    }
  });
} else {
  console.log('[Email Init Warning] Email notifications not configured (EMAIL_USER/EMAIL_PASS missing). Running with mock email console logs.');
}

/**
 * Sends an email notification.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!useEmail) {
    console.log('\n--- [Mock Email Dispatch] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Text): ${text}`);
    console.log('-----------------------------\n');
    return { mock: true, message: 'Email credentials not configured. Logged to console.' };
  }

  try {
    const mailOptions = {
      from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'MediCare'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Alert sent to ${to}. MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Email Error] Failed to send email alert to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmail };
