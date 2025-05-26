const twilio = require('twilio');
const SMSTemplate = require('../models/SMSTemplate');

// Initialize Twilio client only in production
let client;
if (process.env.NODE_ENV === 'production') {
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Send SMS using Twilio
const sendSMS = async (to, message) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - SMS would be sent to:', to);
      console.log('Message:', message);
      return {
        success: true,
        messageId: 'dev-' + Date.now(),
        status: 'sent'
      };
    }

    const response = await client.messages.create({
      body: message,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send SMS using template
const sendTemplatedSMS = async (to, templateId, variables = {}) => {
  try {
    const template = await SMSTemplate.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const message = template.render(variables);
    const result = await sendSMS(to, message);
    
    // Increment template usage
    await template.incrementUsage();
    
    return result;
  } catch (error) {
    console.error('Templated SMS send error:', error);
    throw error;
  }
};

// Send bulk SMS using template
const sendBulkTemplatedSMS = async (recipients, templateId, variables = {}) => {
  try {
    const template = await SMSTemplate.findById(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const message = template.render(variables);
    const results = await Promise.all(
      recipients.map(async (to) => {
        try {
          const result = await sendSMS(to, message);
          return { to, success: true, ...result };
        } catch (error) {
          return { to, success: false, error: error.message };
        }
      })
    );

    // Increment template usage
    await template.incrementUsage();

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Bulk templated SMS send error:', error);
    throw error;
  }
};

// Verify phone number
const verifyPhoneNumber = async (phoneNumber) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - Verification code would be sent to:', phoneNumber);
      return {
        success: true,
        status: 'pending'
      };
    }

    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' });

    return {
      success: true,
      status: verification.status
    };
  } catch (error) {
    console.error('Phone verification error:', error);
    throw new Error(`Failed to verify phone number: ${error.message}`);
  }
};

// Check verification code
const checkVerificationCode = async (phoneNumber, code) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - Verifying code:', code, 'for:', phoneNumber);
      return {
        success: true,
        status: 'approved',
        valid: true
      };
    }

    const verification = await client.verify
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code });

    return {
      success: true,
      status: verification.status,
      valid: verification.status === 'approved'
    };
  } catch (error) {
    console.error('Verification check error:', error);
    throw new Error(`Failed to check verification code: ${error.message}`);
  }
};

module.exports = {
  sendSMS,
  sendTemplatedSMS,
  sendBulkTemplatedSMS,
  verifyPhoneNumber,
  checkVerificationCode
}; 