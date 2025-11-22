const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration - Using Gmail with App Password (FREE)
// You can also use other free services like:
// - Mailgun (5,000 emails/month free)
// - SendGrid (100 emails/day free)
// - Resend (100 emails/day free)
// - Brevo/Sendinblue (300 emails/day free)

const createTransporter = () => {
  // For Gmail: Use App Password, not your regular password
  // Go to Google Account > Security > 2FA > App Passwords
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App Password
      }
    });
  }

  // For custom SMTP
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Company details for email templates
const COMPANY_INFO = {
  name: 'RAGHHAV ROADWAYS',
  email: 'raghhavroadways@gmail.com',
  phone: '+91 9727-466-477',
  address: 'PLOT NO. D-407, BLD. NO. D-1, 4TH FLOOR, UMANG RESIDENCY, NR. SACHIN RAILWAY STATION, SACHIN, SURAT - 394230',
  gstin: '24BQCPP3322B1ZH'
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body (HTML)
 * @param {string} options.text - Email body (plain text)
 * @param {Array} options.attachments - Email attachments
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${COMPANY_INFO.name}" <${process.env.EMAIL_USER || COMPANY_INFO.email}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${options.to}: ${error.message}`);
    throw error;
  }
};

// Email Templates

/**
 * Send invoice email
 */
const sendInvoiceEmail = async (to, invoiceData, pdfBuffer) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .invoice-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; color: #1e40af; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${COMPANY_INFO.name}</h1>
          <p>Invoice Notification</p>
        </div>
        <div class="content">
          <p>Dear ${invoiceData.partyName},</p>
          <p>Please find attached the invoice for your recent consignments.</p>

          <div class="invoice-info">
            <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Due Date:</strong> ${invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
            <p class="amount">Amount Due: ₹${Number(invoiceData.totalAmount).toLocaleString('en-IN')}</p>
          </div>

          <p>Please make the payment before the due date to avoid any late charges.</p>

          <p><strong>Bank Details:</strong></p>
          <p>Bank: AXIS BANK<br>
          Account No.: 924020013795444<br>
          IFSC: UTIB0005605<br>
          Branch: STATION ROAD SACHIN</p>
        </div>
        <div class="footer">
          <p>${COMPANY_INFO.name}</p>
          <p>${COMPANY_INFO.address}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
          <p>GSTIN: ${COMPANY_INFO.gstin}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = pdfBuffer ? [{
    filename: `Invoice_${invoiceData.invoiceNumber}.pdf`,
    content: pdfBuffer
  }] : [];

  return sendEmail({
    to,
    subject: `Invoice ${invoiceData.invoiceNumber} from ${COMPANY_INFO.name}`,
    html,
    text: `Invoice ${invoiceData.invoiceNumber} - Amount: ₹${invoiceData.totalAmount}`,
    attachments
  });
};

/**
 * Send payment reminder email
 */
const sendPaymentReminder = async (to, reminderData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .invoice-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .amount { font-size: 24px; color: #dc2626; font-weight: bold; }
        .overdue { color: #dc2626; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Reminder</h1>
          <p>${COMPANY_INFO.name}</p>
        </div>
        <div class="content">
          <p>Dear ${reminderData.partyName},</p>
          <p>This is a friendly reminder that payment for the following invoice is <span class="overdue">overdue</span>.</p>

          <div class="invoice-info">
            <p><strong>Invoice Number:</strong> ${reminderData.invoiceNumber}</p>
            <p><strong>Invoice Date:</strong> ${new Date(reminderData.invoiceDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Due Date:</strong> ${new Date(reminderData.dueDate).toLocaleDateString('en-IN')}</p>
            <p><strong>Days Overdue:</strong> <span class="overdue">${reminderData.daysOverdue} days</span></p>
            <p class="amount">Balance Due: ₹${Number(reminderData.balanceAmount).toLocaleString('en-IN')}</p>
          </div>

          <p>Please arrange for immediate payment to avoid any inconvenience.</p>

          <p><strong>Bank Details:</strong></p>
          <p>Bank: AXIS BANK<br>
          Account No.: 924020013795444<br>
          IFSC: UTIB0005605<br>
          Branch: STATION ROAD SACHIN</p>

          <p>If you have already made the payment, please ignore this reminder and share the payment details with us.</p>
        </div>
        <div class="footer">
          <p>${COMPANY_INFO.name}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Payment Reminder - Invoice ${reminderData.invoiceNumber} Overdue`,
    html,
    text: `Payment Reminder: Invoice ${reminderData.invoiceNumber} is ${reminderData.daysOverdue} days overdue. Balance: ₹${reminderData.balanceAmount}`
  });
};

/**
 * Send consignment status update email
 */
const sendStatusUpdate = async (to, statusData) => {
  const statusColors = {
    'Booked': '#3b82f6',
    'Loaded': '#8b5cf6',
    'In Transit': '#f59e0b',
    'Delivered': '#10b981',
    'Settled': '#059669'
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColors[statusData.status] || '#1e40af'}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .status-badge { display: inline-block; padding: 8px 16px; background: ${statusColors[statusData.status] || '#1e40af'}; color: white; border-radius: 20px; font-weight: bold; }
        .shipment-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shipment Status Update</h1>
          <p>${COMPANY_INFO.name}</p>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your shipment status has been updated.</p>

          <div class="shipment-info">
            <p><strong>GR Number:</strong> ${statusData.grNumber}</p>
            <p><strong>From:</strong> ${statusData.fromLocation}</p>
            <p><strong>To:</strong> ${statusData.toLocation}</p>
            <p><strong>Vehicle:</strong> ${statusData.vehicleNumber}</p>
            <p><strong>Status:</strong> <span class="status-badge">${statusData.status}</span></p>
            ${statusData.remarks ? `<p><strong>Remarks:</strong> ${statusData.remarks}</p>` : ''}
          </div>

          <p>For any queries, please contact us.</p>
        </div>
        <div class="footer">
          <p>${COMPANY_INFO.name}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Shipment ${statusData.grNumber} - Status: ${statusData.status}`,
    html,
    text: `Shipment ${statusData.grNumber} status updated to ${statusData.status}`
  });
};

/**
 * Send vehicle document expiry alert
 */
const sendDocumentExpiryAlert = async (to, vehicleData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .document-list { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
        .expiring { color: #dc2626; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Document Expiry Alert</h1>
          <p>${COMPANY_INFO.name}</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <strong>Attention Required!</strong>
            <p>The following vehicle documents are expiring soon or have expired.</p>
          </div>

          <div class="document-list">
            <h3>Vehicle: ${vehicleData.vehicleNo}</h3>
            ${vehicleData.expiringDocuments.map(doc => `
              <p><strong>${doc.type}:</strong>
                <span class="${doc.isExpired ? 'expiring' : ''}">${doc.isExpired ? 'EXPIRED' : 'Expiring'} on ${new Date(doc.date).toLocaleDateString('en-IN')}</span>
                ${doc.daysLeft ? ` (${doc.daysLeft} days left)` : ''}
              </p>
            `).join('')}
          </div>

          <p>Please renew the documents at the earliest to avoid any legal complications.</p>
        </div>
        <div class="footer">
          <p>${COMPANY_INFO.name}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Document Expiry Alert - Vehicle ${vehicleData.vehicleNo}`,
    html,
    text: `Vehicle ${vehicleData.vehicleNo} has documents expiring soon.`
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (to, userData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .credentials { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #1e40af; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${COMPANY_INFO.name}</h1>
          <p>Transport Management System</p>
        </div>
        <div class="content">
          <p>Dear ${userData.fullName || userData.username},</p>
          <p>Welcome! Your account has been created successfully.</p>

          <div class="credentials">
            <p><strong>Username:</strong> ${userData.username}</p>
            <p><strong>Role:</strong> ${userData.roleName}</p>
            ${userData.tempPassword ? `<p><strong>Temporary Password:</strong> ${userData.tempPassword}</p>` : ''}
          </div>

          ${userData.tempPassword ? '<p><strong>Important:</strong> Please change your password after first login.</p>' : ''}

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://raghhav-roadways.vercel.app'}/login" class="btn">Login Now</a>
          </p>
        </div>
        <div class="footer">
          <p>${COMPANY_INFO.name}</p>
          <p>Phone: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to ${COMPANY_INFO.name} - Account Created`,
    html,
    text: `Welcome to ${COMPANY_INFO.name}! Your username is ${userData.username}.`
  });
};

module.exports = {
  sendEmail,
  sendInvoiceEmail,
  sendPaymentReminder,
  sendStatusUpdate,
  sendDocumentExpiryAlert,
  sendWelcomeEmail,
  COMPANY_INFO
};
