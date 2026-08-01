import express from 'express';
import { emailService } from '../services/emailService.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Dispatch email via SMTP
router.post('/send', async (req, res) => {
  try {
    const { to, subject, type, body, variables, senderName, userRole } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ success: false, message: 'Recipient (to) and Subject are required.' });
    }

    // RBAC Rule Check: Onboarding Welcome and Policy Notice require HR Manager or Admin clearance
    const restrictedTemplates = ['ONBOARDING_WELCOME', 'POLICY_NOTICE'];
    if (restrictedTemplates.includes(type) && userRole && userRole !== 'Admin' && userRole !== 'HR Manager') {
      loggerService.logAudit(
        'SECURITY_ALERT',
        { name: senderName || 'User', role: userRole },
        `RBAC Violation: User with role '${userRole}' attempted to dispatch restricted template '${type}'.`
      );
      return res.status(403).json({
        success: false,
        message: `Access Denied: Role '${userRole}' is not authorized to dispatch '${type.replace('_', ' ')}'. Only HR Manager and Admin personnel possess security clearance for this template.`
      });
    }

    const logEntry = await emailService.sendEmail({
      to,
      subject,
      type: type || 'AUTOMATED',
      body,
      variables,
      senderName: senderName || 'Enterprise HR Assistant'
    });

    loggerService.logAudit('EMAIL_DISPATCHED', { name: senderName || 'System', role: userRole || 'Automated' }, `Sent email "${subject}" to ${to}. Status: ${logEntry.status}`);

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
