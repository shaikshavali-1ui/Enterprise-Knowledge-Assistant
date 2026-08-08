import { emailService } from './emailService.js';
import { loggerService } from './loggerService.js';

class LeaveService {
  constructor() {
    this.leaveRequests = [
      {
        id: 'leave_1001',
        employeeName: 'Shaik Shavali',
        employeeEmail: 'shaikshavali05335@gmail.com',
        employeeId: 'EMP-1001',
        leaveType: 'Annual Leave',
        startDate: '2026-08-10',
        endDate: '2026-08-17',
        reason: 'Family Vacation & Personal Time',
        status: 'Pending',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null
      },
      {
        id: 'leave_1002',
        employeeName: 'Elena Rostova',
        employeeEmail: 'elena.rostova@enterprise.com',
        employeeId: 'EMP-1002',
        leaveType: 'Sick Leave',
        startDate: '2026-08-01',
        endDate: '2026-08-03',
        reason: 'Medical Treatment & Rest',
        status: 'Approved',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        reviewedBy: 'Priya Sharma (HR Lead)',
        reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        rejectionReason: null
      }
    ];
  }

  /**
   * Submit a new leave request
   */
  async submitLeaveRequest({ employeeName, employeeEmail, employeeId, leaveType, startDate, endDate, reason, hrEmail }) {
    const newRequest = {
      id: `leave_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      employeeName: employeeName.trim(),
      employeeEmail: employeeEmail.trim().toLowerCase(),
      employeeId: employeeId || 'EMP-1001',
      leaveType: leaveType || 'Annual Leave',
      startDate,
      endDate,
      reason: reason || 'Personal Leave',
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null
    };

    this.leaveRequests.unshift(newRequest);

    // Step 2: Send email to HR/Admin approver via SMTP
    try {
      await emailService.sendLeaveApprovalRequiredEmail({ leaveRequest: newRequest, hrEmail });
    } catch (err) {
      console.error('[LeaveService] Error sending approval email to HR:', err.message);
    }

    loggerService.logAudit(
      'LEAVE_REQUEST_SUBMITTED',
      { name: newRequest.employeeName, email: newRequest.employeeEmail },
      `Leave request '${newRequest.leaveType}' (${startDate} to ${endDate}) submitted by ${newRequest.employeeName}. Status: Pending.`
    );

    return newRequest;
  }

  /**
   * Review Leave Request (Approve or Reject)
   */
  async reviewLeaveRequest({ requestId, action, reviewedBy = 'HR Manager', rejectionReason = '' }) {
    const request = this.leaveRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error(`Leave request with ID '${requestId}' not found.`);
    }

    const isApprove = action.toUpperCase() === 'APPROVE' || action.toUpperCase() === 'APPROVED';
    request.status = isApprove ? 'Approved' : 'Rejected';
    request.reviewedBy = reviewedBy;
    request.reviewedAt = new Date().toISOString();
    request.rejectionReason = isApprove ? null : (rejectionReason || 'Project deadlines or operational requirements.');

    // Step 5: Send final email to Employee via SMTP
    try {
      await emailService.sendLeaveFinalDecisionEmail({ leaveRequest: request });
    } catch (err) {
      console.error('[LeaveService] Error sending final decision email to Employee:', err.message);
    }

    loggerService.logAudit(
      'LEAVE_REQUEST_REVIEWED',
      { name: reviewedBy, role: 'HR Manager' },
      `Leave request '${request.id}' for ${request.employeeName} was ${request.status} by ${reviewedBy}.`
    );

    return request;
  }

  /**
   * Get all leave requests
   */
  getAllLeaveRequests() {
    return this.leaveRequests;
  }

  /**
   * Get leave request by ID
   */
  getLeaveRequestById(id) {
    return this.leaveRequests.find(r => r.id === id);
  }
}

export const leaveService = new LeaveService();
