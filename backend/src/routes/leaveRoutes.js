import express from 'express';
import { leaveService } from '../services/leaveService.js';

const router = express.Router();

// Get all leave requests
router.get('/requests', (req, res) => {
  res.json({
    success: true,
    leaveRequests: leaveService.getAllLeaveRequests()
  });
});

// Step 1 & 2: Submit a leave request (saves to DB and sends approval email to HR)
router.post('/request', async (req, res) => {
  try {
    const { employeeName, employeeEmail, employeeId, leaveType, startDate, endDate, reason, hrEmail } = req.body;

    if (!employeeName || !employeeEmail || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Employee Name, Employee Email, Start Date, and End Date are required.'
      });
    }

    const newRequest = await leaveService.submitLeaveRequest({
      employeeName,
      employeeEmail,
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      hrEmail
    });

    res.json({
      success: true,
      message: `Leave request submitted successfully. Approval notification email sent to HR (${hrEmail || 'hr@company.com'}).`,
      leaveRequest: newRequest,
      leaveRequests: leaveService.getAllLeaveRequests()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Step 3 & 4 & 5: Review leave request (Approve/Reject) -> updates DB & sends final email to Employee
router.post('/review', async (req, res) => {
  try {
    const { requestId, action, reviewedBy, rejectionReason } = req.body;

    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and Action (APPROVE or REJECT) are required.'
      });
    }

    const updatedRequest = await leaveService.reviewLeaveRequest({
      requestId,
      action,
      reviewedBy,
      rejectionReason
    });

    res.json({
      success: true,
      message: `Leave request for '${updatedRequest.employeeName}' has been ${updatedRequest.status.toLowerCase()} by ${reviewedBy || 'HR Manager'}. Final email dispatched to ${updatedRequest.employeeEmail}.`,
      leaveRequest: updatedRequest,
      leaveRequests: leaveService.getAllLeaveRequests()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Email link direct action endpoint (Option A)
router.get('/action', async (req, res) => {
  try {
    const { id, action, by = 'HR Manager', reason = '' } = req.query;
    if (!id || !action) {
      return res.status(400).send('Invalid parameters.');
    }

    const updated = await leaveService.reviewLeaveRequest({
      requestId: id,
      action: action.toUpperCase(),
      reviewedBy: by,
      rejectionReason: reason
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leave Request ${updated.status}</title>
          <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 40px; border-radius: 16px; text-align: center; border: 1px solid #334155; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h2 { color: ${updated.status === 'Approved' ? '#10b981' : '#ef4444'}; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.6; }
            a { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Leave Request ${updated.status}</h2>
            <p>The leave request for <strong>${updated.employeeName}</strong> (${updated.leaveType}) from ${updated.startDate} to ${updated.endDate} has been <strong>${updated.status.toLowerCase()}</strong>.</p>
            <p>A confirmation email has been dispatched via SMTP to <code>${updated.employeeEmail}</code>.</p>
            <a href="http://localhost:3000/">Return to Enterprise Portal</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Error processing leave request action: ${err.message}`);
  }
});

export default router;
