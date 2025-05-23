const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Generate random password
const generateRandomPassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html
    });

    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate time difference in hours
const getHoursDifference = (date1, date2) => {
  const diff = Math.abs(new Date(date1) - new Date(date2));
  return Math.ceil(diff / (1000 * 60 * 60));
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const isValidPhoneNumber = (phoneNumber) => {
  // Allow +91 followed by 10 digits or just 10 digits
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber);
};

// Generate pagination parameters
const getPaginationParams = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Format pagination response
const formatPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit
    }
  };
};

module.exports = {
  generateToken,
  generateRandomPassword,
  sendEmail,
  formatDate,
  getHoursDifference,
  isValidEmail,
  isValidPhoneNumber,
  getPaginationParams,
  formatPaginationResponse
}; 