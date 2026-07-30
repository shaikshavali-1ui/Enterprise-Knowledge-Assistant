import express from 'express';
import { emailService } from '../services/emailService.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Dispatch email via SMTP
router.post('/send', async (req, res) => {
  try {
    const { to, subject, type, body, variables, senderName } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'Recipient (to) and Subject are required.' });
    }

    const logEntry = await emailService.sendEmail({
      to,
      subject,
      type: type || 'AUTOMATED',
      body,
      variables,
      senderName: senderName || 'Enterprise HR Assistant'
    });

    loggerService.logAudit('EMAIL_DISPATCHED', { name: senderName || 'System', role: 'Automated' }, `Sent email "${subject}" to ${to}. Status: ${logEntry.status}`);

    res.json({
      success: true,
      message: 'Email dispatched successfully via SMTP transport.',
      emailLog: logEntry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get email logs
router.get('/logs', (req, res) => {
  res.json({
    success: true,
    logs: emailService.getLogs()
  });
});

export default router;
