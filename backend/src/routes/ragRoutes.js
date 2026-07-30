import express from 'express';
import { ragEngine } from '../services/ragEngine.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Process RAG query
router.post('/query', async (req, res) => {
  try {
    const { query, userRole = 'Employee', userId = 'usr_employee', userName = 'John Doe' } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required.' });
    }

    const ragResult = await ragEngine.processQuery({ query, userRole, userId, userName });

    // Log conversation
    loggerService.logConversation({
      query,
      userId,
      userName,
      userRole,
      answer: ragResult.answer,
      citations: ragResult.citations,
      filteredOutDueToRBAC: ragResult.filteredOutDueToRBAC,
      latencyMs: ragResult.latencyMs
    });

    res.json({
      success: true,
      data: ragResult
    });
  } catch (err) {
    console.error('[RAG API Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
