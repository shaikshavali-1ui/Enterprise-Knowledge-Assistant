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
  const { title, category, minimumAccessRole, accessRole, content, author, requesterRole } = req.body;

  const minAccessRole = minimumAccessRole || accessRole || 'Employee';

  // RBAC Capability Matrix Enforcement: Upload Documents requires Team Lead, Manager, Director, HR, or CEO/Admin
  if (requesterRole === 'Employee') {
    loggerService.logAudit('SECURITY_ALERT', { name: author || 'User', role: requesterRole }, `Access Denied: Attempted document ingestion with Employee rank.`);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Team Lead, Manager, Director, HR, or CEO/Admin personnel are authorized to ingest documents.'
    });
  }

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and Content are required.' });
  }

  const newDoc = vectorStore.addDocument({
    title,
    category: category || 'General Policy',
    minimumAccessRole: minAccessRole,
    accessRole: minAccessRole,
    author: author || 'Admin User',
    content
  });

  loggerService.logAudit('DOCUMENT_INGESTED', { name: author || 'Admin', role: minAccessRole }, `Ingested document "${title}" with Minimum Access Role [${minAccessRole}].`);

  res.status(201).json({
    success: true,
    message: `Document successfully ingested with Minimum Access Role [${minAccessRole}] and indexed into vector store.`,
    document: newDoc,
    stats: vectorStore.getStats()
  });
});

// Get vector store statistics
router.get('/stats', (req, res) => {
  res.json({ success: true, stats: vectorStore.getStats() });
});

// Delete document (Admin & HR Only)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { requesterRole, userName } = req.query;

  if (requesterRole === 'Employee' || (requesterRole && requesterRole !== 'Admin' && requesterRole !== 'HR Manager')) {
    loggerService.logAudit('SECURITY_ALERT', { name: userName || 'User', role: requesterRole }, `Access Denied: Attempted document deletion without Admin/HR clearance.`);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Only Admin and HR Lead personnel are authorized to remove documents from the vector database.'
    });
  }

  const removedDoc = vectorStore.deleteDocument(id);
  if (removedDoc) {
    loggerService.logAudit('DOCUMENT_DELETED', { name: userName || 'Admin', role: requesterRole || 'Admin' }, `Deleted document "${removedDoc.title}" from vector store.`);
    return res.json({
      success: true,
      message: `Document "${removedDoc.title}" removed successfully from knowledge base.`,
      stats: vectorStore.getStats()
    });
  } else {
    return res.status(404).json({ success: false, message: 'Document not found.' });
  }
});

export default router;
