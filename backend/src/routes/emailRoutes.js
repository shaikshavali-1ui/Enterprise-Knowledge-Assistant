import express from 'express';
import { emailService } from '../services/emailService.js';
import { loggerService } from '../services/loggerService.js';

const router = express.Router();

// Import initialUsers from seedData for target group resolution
import { initialUsers } from '../data/seedData.js';

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

// Dispatch Company Announcement to Targeted Recipient Group with Strict Email Validation & Skip Rules
router.post('/dispatch-announcement', async (req, res) => {
  try {
    const { subject, priority, message, recipientGroup, senderName, userRole } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Announcement Subject and Message Body are required.' });
    }

    // 1. Get all employees in the selected recipient group
    let targetUsers = [];
    const group = recipientGroup || 'all-staff@enterprise.com';

    if (group.includes('all-staff') || group.includes('All Organization Staff')) {
      targetUsers = [...initialUsers];
    } else if (group.includes('managers') || group.includes('Department Managers')) {
      targetUsers = initialUsers.filter(u => 
        ['Manager', 'Director', 'HR', 'CEO', 'Admin', 'System Admin', 'Team Lead'].includes(u.role)
      );
    } else if (group.includes('engineering') || group.includes('Engineering Division')) {
      targetUsers = initialUsers.filter(u => 
        u.department && u.department.toLowerCase().includes('engineering')
      );
    } else {
      targetUsers = [...initialUsers];
    }

    const sentRecipients = [];
    const skippedRecipients = [];
    let sentCount = 0;
    let skippedCount = 0;

    // 2 & 3 & 4. Validate email address and send ONLY to valid emails, skip empty/null/invalid
    for (const u of targetUsers) {
      const email = u.email ? u.email.trim() : '';
      const isValidEmail = Boolean(email) && 
        email.includes('@') && 
        !email.includes('—') && 
        email.toLowerCase() !== 'null' && 
        email.toLowerCase() !== 'undefined';

      if (isValidEmail) {
        sentCount++;
        sentRecipients.push({
          id: u.id,
          name: u.name || u.fullName || 'Employee',
          email: email,
          action: 'SEND',
          status: 'Delivered'
        });

        // Dispatch actual SMTP email
        await emailService.sendEmail({
          to: email,
          subject: `[📢 ${(priority || 'HIGH').toUpperCase()} ANNOUNCEMENT] ${subject}`,
          body: message,
          type: 'ANNOUNCEMENT',
          senderName: senderName || 'Enterprise HR & Admin',
          variables: { priority: priority || 'High', category: 'Company Announcement', recipientName: u.name || u.fullName }
        });
      } else {
        skippedCount++;
        skippedRecipients.push({
          id: u.id || `skipped_${skippedCount}`,
          name: u.name || u.fullName || 'Employee',
          email: '—',
          action: 'SKIP',
          reason: 'No email address'
        });
      }
    }

    const summaryMessage = `Announcement Published Successfully! 📧 Emails sent: ${sentCount} | ⚠️ Skipped: ${skippedCount} employees without email addresses.`;

    loggerService.logAudit('ANNOUNCEMENT_PUBLISHED', { name: senderName || 'Admin', role: userRole || 'Admin' }, `Published announcement "${subject}". Sent: ${sentCount}, Skipped: ${skippedCount}.`);

    // 5. Return detailed summary result
    res.json({
      success: true,
      message: summaryMessage,
      summary: {
        announcementTitle: subject,
        priority: priority || 'High',
        targetGroup: group,
        totalTargeted: targetUsers.length,
        sentCount,
        skippedCount
      },
      sentRecipients,
      skippedRecipients,
      allRecipientsBreakdown: [...sentRecipients, ...skippedRecipients]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Error dispatching announcement: ${err.message}` });
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
