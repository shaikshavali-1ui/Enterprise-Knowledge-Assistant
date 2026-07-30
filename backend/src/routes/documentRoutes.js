import express from 'express';
import { vectorStore } from '../services/vectorStore.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Get all documents
router.get('/', (req, res) => {
  const docs = vectorStore.getAllDocuments();
  const stats = vectorStore.getStats();
  res.json({ success: true, documents: docs, stats });
});

// Upload / Add new document to vector index
router.post('/upload', (req, res) => {
  const { title, category, accessRole, content, author, requesterRole } = req.body;

  if (requesterRole === 'Employee' || (requesterRole && requesterRole !== 'Admin' && requesterRole !== 'HR Manager')) {
    loggerService.logAudit('SECURITY_ALERT', { name: author || 'User', role: requesterRole }, `Access Denied: Attempted document ingestion without Admin/HR clearance.`);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Admin and HR Lead personnel are authorized to ingest documents into the vector database.'
    });
  }

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and Content are required.' });
  }

  const newDoc = vectorStore.addDocument({
    title,
    category: category || 'General Policy',
    accessRole: accessRole || 'Public',
    author: author || 'Admin User',
    content
  });

  loggerService.logAudit('DOCUMENT_INGESTED', { name: author || 'Admin', role: accessRole }, `Ingested document "${title}" into vector store.`);

  res.status(201).json({
    success: true,
    message: 'Document successfully ingested and indexed into vector database.',
    document: newDoc,
    stats: vectorStore.getStats()
  });
});

// Get vector store statistics
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: vectorStore.getStats() });
});

export default router;
