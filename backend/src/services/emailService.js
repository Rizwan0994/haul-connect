const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail({ to, subject, text, html, attachments }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'sender@example.com', // Replace with your sender email or use environment variable
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachments: attachments,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };