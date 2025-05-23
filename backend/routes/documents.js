const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { auth, adminAuth } = require('../middleware/auth');
const { emitToDocument, emitToSociety } = require('../socket');

// Create a new document
router.post('/', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['rules', 'notices', 'minutes', 'financials', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = new Document({
      ...req.body,
      societyId: req.user.societyId,
      createdBy: req.user._id,
      lastEditedBy: req.user._id
    });

    await document.save();
    
    // Notify society members about the new document
    emitToSociety(req.user.societyId, 'document-created', {
      documentId: document._id,
      title: document.title,
      category: document.category,
      createdBy: req.user.name
    });

    res.status(201).json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all documents for society
router.get('/', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    
    const query = { societyId: req.user.societyId };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Either document is public or user is in allowedEditors
    query.$or = [
      { isPublic: true },
      { allowedEditors: req.user._id },
      { createdBy: req.user._id }
    ];
    
    const documents = await Document.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .populate('lastEditedBy', 'name');
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
      $or: [
        { isPublic: true },
        { allowedEditors: req.user._id },
        { createdBy: req.user._id }
      ]
    })
    .populate('createdBy', 'name')
    .populate('lastEditedBy', 'name')
    .populate('allowedEditors', 'name');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Increment view count
    document.viewCount += 1;
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.put('/:id', auth, [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('category').optional().isIn(['rules', 'notices', 'minutes', 'financials', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has permission to edit
    if (!document.canEdit(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this document' });
    }
    
    // Save revision if content is being updated
    if (req.body.content && req.body.content !== document.content) {
      await document.saveRevision(req.user._id, req.body.content, req.body.comments || 'Updated document');
    } else {
      // Just update other fields
      if (req.body.title) document.title = req.body.title;
      if (req.body.category) document.category = req.body.category;
      if (req.body.isPublic !== undefined) document.isPublic = req.body.isPublic;
      if (req.body.tags) document.tags = req.body.tags;
      if (req.body.expiryDate) document.expiryDate = req.body.expiryDate;
      
      document.lastEditedBy = req.user._id;
      await document.save();
    }
    
    // Notify collaborators about the update
    emitToDocument(document._id, 'document-updated', {
      documentId: document._id,
      updatedBy: req.user.name,
      updatedAt: new Date()
    });
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save draft
router.post('/:id/draft', auth, [
  body('content').trim().notEmpty().withMessage('Draft content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user has permission to edit
    if (!document.canEdit(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this document' });
    }
    
    await document.saveDraft(req.user._id, req.body.content);
    
    res.json({
      success: true,
      draft: {
        content: document.draft.content,
        lastSaved: document.draft.lastSaved
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish draft
router.post('/:id/publish-draft', auth, async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (!document.draft || !document.draft.content) {
      return res.status(400).json({ message: 'No draft available to publish' });
    }
    
    // Check if user has permission to edit
    if (!document.canEdit(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to publish this document' });
    }
    
    await document.publishDraft(req.user._id);
    
    // Notify collaborators about the update
    emitToDocument(document._id, 'document-updated', {
      documentId: document._id,
      updatedBy: req.user.name,
      updatedAt: new Date(),
      message: 'Draft published'
    });
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add allowed editor
router.post('/:id/editors', adminAuth, [
  body('userId').notEmpty().withMessage('User ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const document = await Document.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const { userId } = req.body;
    
    // Check if user is already in allowed editors
    if (document.allowedEditors.includes(userId)) {
      return res.status(400).json({ message: 'User is already an editor' });
    }
    
    document.allowedEditors.push(userId);
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove allowed editor
router.delete('/:id/editors/:userId', adminAuth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    document.allowedEditors = document.allowedEditors.filter(
      editor => editor.toString() !== req.params.userId
    );
    
    await document.save();
    
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      societyId: req.user.societyId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    await document.remove();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document revisions
router.get('/:id/revisions', auth, async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      societyId: req.user.societyId,
      $or: [
        { isPublic: true },
        { allowedEditors: req.user._id },
        { createdBy: req.user._id }
      ]
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document.revisions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 