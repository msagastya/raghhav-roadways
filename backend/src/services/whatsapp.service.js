const logger = require('../utils/logger');

/**
 * WhatsApp Business API Integration
 *
 * FREE Options:
 * 1. WhatsApp Business API (Cloud API) - Free to set up, pay per message
 *    - First 1000 conversations/month are FREE
 *    - https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * 2. WhatsApp Web.js - Free open source library (unofficial)
 *    - https://github.com/pedroslopez/whatsapp-web.js
 *    - Requires keeping a session active
 *
 * 3. Twilio WhatsApp Sandbox - Free for testing
 *    - https://www.twilio.com/docs/whatsapp/sandbox
 *
 * This implementation supports the Official WhatsApp Cloud API
 */

const WHATSAPP_CONFIG = {
  apiVersion: 'v18.0',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
};

const COMPANY_INFO = {
  name: 'RAGHHAV ROADWAYS',
  phone: '+919727466477'
};

/**
 * Send WhatsApp message using Cloud API
 */
const sendMessage = async (to, message) => {
  try {
    if (!WHATSAPP_CONFIG.phoneNumberId || !WHATSAPP_CONFIG.accessToken) {
      logger.warn('WhatsApp not configured. Message not sent.');
      return { success: false, error: 'WhatsApp not configured' };
    }

    // Format phone number (remove + and spaces)
    const formattedPhone = to.replace(/[\s+]/g, '');

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { body: message }
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      logger.info(`WhatsApp message sent to ${to}: ${data.messages?.[0]?.id}`);
      return { success: true, messageId: data.messages?.[0]?.id };
    } else {
      logger.error(`WhatsApp send failed: ${JSON.stringify(data)}`);
      return { success: false, error: data.error?.message || 'Unknown error' };
    }
  } catch (error) {
    logger.error(`WhatsApp error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send template message (for business notifications)
 */
const sendTemplateMessage = async (to, templateName, components = []) => {
  try {
    if (!WHATSAPP_CONFIG.phoneNumberId || !WHATSAPP_CONFIG.accessToken) {
      logger.warn('WhatsApp not configured. Template message not sent.');
      return { success: false, error: 'WhatsApp not configured' };
    }

    const formattedPhone = to.replace(/[\s+]/g, '');

    const response = await fetch(
      `https://graph.facebook.com/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: components
          }
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      logger.info(`WhatsApp template sent to ${to}: ${data.messages?.[0]?.id}`);
      return { success: true, messageId: data.messages?.[0]?.id };
    } else {
      return { success: false, error: data.error?.message || 'Unknown error' };
    }
  } catch (error) {
    logger.error(`WhatsApp template error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// Pre-built message templates

/**
 * Send consignment booking notification
 */
const sendBookingNotification = async (phone, data) => {
  const message = `🚚 *${COMPANY_INFO.name}*

*Booking Confirmed!*

GR Number: *${data.grNumber}*
Date: ${new Date(data.grDate).toLocaleDateString('en-IN')}

From: ${data.fromLocation}
To: ${data.toLocation}

Vehicle: ${data.vehicleNumber}
${data.driverName ? `Driver: ${data.driverName}` : ''}
${data.driverMobile ? `Driver Contact: ${data.driverMobile}` : ''}

Packages: ${data.noOfPackages || '-'}
Weight: ${data.chargedWeight || '-'} MT

Amount: ₹${Number(data.totalAmount).toLocaleString('en-IN')}
Payment: ${data.paymentMode}

Track your shipment status anytime!

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Send status update notification
 */
const sendStatusUpdate = async (phone, data) => {
  const statusEmojis = {
    'Booked': '📋',
    'Loaded': '📦',
    'In Transit': '🚚',
    'Delivered': '✅',
    'Settled': '💰'
  };

  const message = `${statusEmojis[data.status] || '📋'} *Shipment Update*

*${COMPANY_INFO.name}*

GR Number: *${data.grNumber}*
Status: *${data.status}*

${data.remarks ? `Remarks: ${data.remarks}` : ''}

From: ${data.fromLocation}
To: ${data.toLocation}

${data.status === 'Delivered' ? `Delivered on: ${new Date().toLocaleDateString('en-IN')}` : ''}

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Send invoice notification
 */
const sendInvoiceNotification = async (phone, data) => {
  const message = `📄 *Invoice Generated*

*${COMPANY_INFO.name}*

Invoice No: *${data.invoiceNumber}*
Date: ${new Date(data.invoiceDate).toLocaleDateString('en-IN')}

Amount: *₹${Number(data.totalAmount).toLocaleString('en-IN')}*
${data.dueDate ? `Due Date: ${new Date(data.dueDate).toLocaleDateString('en-IN')}` : ''}

*Bank Details:*
Bank: AXIS BANK
A/C: 924020013795444
IFSC: UTIB0005605

Pay via UPI: raghhavroadways@axisbank

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Send payment reminder
 */
const sendPaymentReminder = async (phone, data) => {
  const message = `⚠️ *Payment Reminder*

*${COMPANY_INFO.name}*

Invoice No: *${data.invoiceNumber}*

Outstanding: *₹${Number(data.balanceAmount).toLocaleString('en-IN')}*
${data.daysOverdue ? `Overdue by: ${data.daysOverdue} days` : ''}

Please clear the dues at earliest.

*Bank Details:*
Bank: AXIS BANK
A/C: 924020013795444
IFSC: UTIB0005605

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Send payment confirmation
 */
const sendPaymentConfirmation = async (phone, data) => {
  const message = `✅ *Payment Received*

*${COMPANY_INFO.name}*

Invoice: ${data.invoiceNumber}
Amount: *₹${Number(data.amount).toLocaleString('en-IN')}*
Date: ${new Date(data.date).toLocaleDateString('en-IN')}
${data.paymentMode ? `Mode: ${data.paymentMode}` : ''}
${data.reference ? `Ref: ${data.reference}` : ''}

${data.balanceAmount > 0 ? `Balance Due: ₹${Number(data.balanceAmount).toLocaleString('en-IN')}` : 'Account Settled ✓'}

Thank you for your payment!

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Send document expiry alert
 */
const sendDocumentExpiryAlert = async (phone, data) => {
  const message = `🔔 *Document Expiry Alert*

*${COMPANY_INFO.name}*

Vehicle: *${data.vehicleNo}*

${data.expiringDocuments.map(doc => `${doc.isExpired ? '❌' : '⚠️'} ${doc.type}: ${doc.isExpired ? 'EXPIRED' : `Expiring on ${new Date(doc.date).toLocaleDateString('en-IN')}`}`).join('\n')}

Please renew documents to avoid penalties.

For queries: ${COMPANY_INFO.phone}`;

  return sendMessage(phone, message);
};

/**
 * Generate WhatsApp deep link for click-to-chat
 */
const generateChatLink = (phone, message = '') => {
  const formattedPhone = phone.replace(/[\s+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Check if WhatsApp is configured
 */
const isConfigured = () => {
  return !!(WHATSAPP_CONFIG.phoneNumberId && WHATSAPP_CONFIG.accessToken);
};

module.exports = {
  sendMessage,
  sendTemplateMessage,
  sendBookingNotification,
  sendStatusUpdate,
  sendInvoiceNotification,
  sendPaymentReminder,
  sendPaymentConfirmation,
  sendDocumentExpiryAlert,
  generateChatLink,
  isConfigured,
  COMPANY_INFO
};
