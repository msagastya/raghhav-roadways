const logger = require('../utils/logger');

let Resend = null;
let resend = null;

// Initialize Resend if API key is provided
if (process.env.RESEND_API_KEY) {
  try {
    Resend = require('resend').Resend;
    resend = new Resend(process.env.RESEND_API_KEY);
    logger.info('Resend email service initialized');
  } catch (error) {
    logger.warn('Resend not available (install with: npm install resend)');
  }
}

/**
 * Send Invoice Email
 * @param {string} userEmail - Recipient email
 * @param {object} invoice - Invoice data
 */
async function sendInvoiceEmail(userEmail, invoice) {
  if (!resend) {
    logger.warn('Resend not configured, skipping email');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@raghhavroadways.com',
      to: userEmail,
      subject: `Invoice #${invoice.invoiceNumber} - Raghhav Roadways`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f4e78;">Invoice Notification</h2>

              <p>Dear Customer,</p>

              <p>Your invoice <strong>#${invoice.invoiceNumber}</strong> has been generated.</p>

              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Invoice Details:</strong></p>
                <p>Invoice Number: ${invoice.invoiceNumber}</p>
                <p>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p>Amount: ₹${invoice.totalAmount?.toFixed(2) || 'N/A'}</p>
              </div>

              <p>Please login to your dashboard to view and download the complete invoice.</p>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    logger.info('Invoice email sent', {
      userEmail,
      invoiceId: invoice.id,
      messageId: response.id,
    });

    return {
      success: true,
      messageId: response.id,
      message: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Failed to send invoice email', {
      userEmail,
      invoiceId: invoice.id,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
}

/**
 * Send Payment Confirmation Email
 * @param {string} userEmail - Recipient email
 * @param {object} payment - Payment data
 */
async function sendPaymentConfirmationEmail(userEmail, payment) {
  if (!resend) {
    logger.warn('Resend not configured, skipping email');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@raghhavroadways.com',
      to: userEmail,
      subject: `Payment Confirmation - Raghhav Roadways`,
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f4e78;">Payment Confirmation</h2>

              <p>Dear Customer,</p>

              <p>Your payment has been received successfully.</p>

              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
                <p><strong>✓ Payment Confirmed</strong></p>
                <p>Amount: ₹${payment.amount?.toFixed(2) || 'N/A'}</p>
                <p>Date: ${new Date(payment.paymentDate).toLocaleDateString()}</p>
                <p>Reference: ${payment.transactionId || payment.id}</p>
              </div>

              <p>Thank you for your payment. We appreciate your business!</p>

              <p style="color: #666; font-size: 12px; margin-top: 20px;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    logger.info('Payment confirmation email sent', {
      userEmail,
      paymentId: payment.id,
      messageId: response.id,
    });

    return {
      success: true,
      messageId: response.id,
      message: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Failed to send payment email', {
      userEmail,
      paymentId: payment.id,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
}

/**
 * Send Generic Email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
async function sendEmail(to, subject, html) {
  if (!resend) {
    logger.warn('Resend not configured, skipping email');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@raghhavroadways.com',
      to,
      subject,
      html,
    });

    logger.info('Email sent', { to, subject, messageId: response.id });

    return {
      success: true,
      messageId: response.id,
      message: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message,
    });

    return {
      success: false,
      error: error.message,
      message: 'Failed to send email',
    };
  }
}

module.exports = {
  sendInvoiceEmail,
  sendPaymentConfirmationEmail,
  sendEmail,
};
