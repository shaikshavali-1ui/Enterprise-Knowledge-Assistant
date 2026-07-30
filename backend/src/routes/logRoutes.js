import express from 'express';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Get conversation logs
router.get('/conversations', (req, res) => {
  res.json({
    success: true,
    logs: loggerService.getConversationLogs()
  });
});

// Get security audit logs
router.get('/audit', (req, res) => {
  res.json({
    success: true,
    logs: loggerService.getAuditLogs()
  });
});

export default router;
