const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['rules', 'notices', 'minutes', 'financials', 'other'],
    default: 'other'
  },
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
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  allowedEditors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  version: {
    type: Number,
    default: 1
  },
  revisions: [{
    content: String,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    comments: String
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // For auto-save drafts functionality
  draft: {
    content: String,
    lastSaved: Date,
    savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  },
  expiryDate: Date
}, {
  timestamps: true
});

// Method to save a new revision
documentSchema.methods.saveRevision = function(userId, content, comments = '') {
  this.revisions.push({
    content: this.content, // Save current content as revision
    editedBy: userId,
    editedAt: new Date(),
    comments
  });
  
  this.content = content;
  this.lastEditedBy = userId;
  this.version += 1;
  
  return this.save();
};

// Method to save draft
documentSchema.methods.saveDraft = function(userId, content) {
  this.draft = {
    content,
    lastSaved: new Date(),
    savedBy: userId
  };
  
  return this.save();
};

// Method to check if user can edit
documentSchema.methods.canEdit = function(userId) {
  // Admin can always edit
  if (String(this.createdBy) === String(userId)) return true;
  
  // Check if user is in allowed editors
  return this.allowedEditors.some(editor => String(editor) === String(userId));
};

// Method to publish draft to content
documentSchema.methods.publishDraft = function(userId) {
  if (!this.draft || !this.draft.content) {
    throw new Error('No draft available to publish');
  }
  
  if (!this.canEdit(userId)) {
    throw new Error('User not authorized to publish');
  }
  
  // Save current version as revision
  this.revisions.push({
    content: this.content,
    editedBy: userId,
    editedAt: new Date(),
    comments: 'Published from draft'
  });
  
  this.content = this.draft.content;
  this.lastEditedBy = userId;
  this.version += 1;
  this.draft = null;
  
  return this.save();
};

module.exports = mongoose.model('Document', documentSchema); 