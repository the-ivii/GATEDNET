const mongoose = require('mongoose');

const smsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  variables: [{
    type: String,
    trim: true
  }],
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  }
}, {
  timestamps: true
});

// Method to render template with variables
smsTemplateSchema.methods.render = function(variables = {}) {
  let content = this.content;
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
  });

  // Check for any remaining variables
  const remainingVars = content.match(/{{[^}]+}}/g);
  if (remainingVars) {
    throw new Error(`Missing variables: ${remainingVars.join(', ')}`);
  }

  return content;
};

// Method to increment usage count
smsTemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

module.exports = mongoose.model('SMSTemplate', smsTemplateSchema); 