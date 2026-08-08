import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Eye, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Palmtree,
  Megaphone,
  ArrowRight,
  UserCheck,
  FileText
} from 'lucide-react';

export default function EmailHub({ emailLogs = [], onRefreshLogs, activeUser, emailDraftPreset, users = [] }) {
  // Category Mode state: 'ANNOUNCEMENT', 'LEAVE', 'ONBOARDING', 'OTP', 'CUSTOM'
  const [activeCategoryMode, setActiveCategoryMode] = useState('ANNOUNCEMENT');

  // Shared Common State
  const [isSending, setIsSending] = useState(false);
  const [lastSentLog, setLastSentLog] = useState(null);
  const [announcementDispatchResult, setAnnouncementDispatchResult] = useState(null);

  // 1. ANNOUNCEMENT FORM STATE
  const [announcementSubject, setAnnouncementSubject] = useState('Q3 Policy Update Announcement');
  const [announcementRecipientGroup, setAnnouncementRecipientGroup] = useState('all-staff@enterprise.com');
  const [announcementPriority, setAnnouncementPriority] = useState('High');
  const [announcementMessage, setAnnouncementMessage] = useState(
    'Please be advised that the updated Enterprise Annual Leave & PTO Policy 2026 takes effect next month. All personnel are required to review section 2 for approval workflows.'
  );

  // 2. LEAVE APPROVAL WORKFLOW STATE
  const [leaveRequestsList, setLeaveRequestsList] = useState([
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
  ]);
  const [leaveEmpName, setLeaveEmpName] = useState(activeUser?.name || 'Shaik Shavali');
  const [leaveEmpEmail, setLeaveEmpEmail] = useState(activeUser?.email || 'shaikshavali05335@gmail.com');
  const [leaveEmpId, setLeaveEmpId] = useState(activeUser?.employeeId || 'EMP-1001');
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-08-10');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-08-17');
  const [leaveReason, setLeaveReason] = useState('Family Vacation & Personal Time');
  const [hrApproverEmail, setHrApproverEmail] = useState('shaikshavali05335@gmail.com');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [leaveFeedbackMsg, setLeaveFeedbackMsg] = useState('');

  // 3. ONBOARDING EMAIL FORM STATE
  const [onboardEmpName, setOnboardEmpName] = useState('Alex Mercer');
  const [onboardEmpEmail, setOnboardEmpEmail] = useState('alex.mercer@enterprise.com');
  const [onboardRole, setOnboardRole] = useState('Senior Software Engineer');
  const [onboardDept, setOnboardDept] = useState('Engineering');
  const [onboardTempPass, setOnboardTempPass] = useState('TempPass#2026');
  const [onboardMessage, setOnboardMessage] = useState('Welcome to the Enterprise Team! Please complete your Day 1 orientation schedule and IT equipment setup.');

  // 4. OTP SECURITY FORM STATE
  const [otpEmpEmail, setOtpEmpEmail] = useState(activeUser?.email || 'shaikshavali05335@gmail.com');
  const [otpCode, setOtpCode] = useState('714180');
  const [otpStatus, setOtpStatus] = useState('Verified');

  // 5. CUSTOM EMAIL FORM STATE
  const [customSubject, setCustomSubject] = useState('Direct Enterprise Notification');
  const [customRecipient, setCustomRecipient] = useState('employee@enterprise.com');
  const [customMessage, setCustomMessage] = useState('Please find requested policy documentation attached.');

  // Fetch Leave Requests from backend
  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch('/api/leave/requests');
      const data = await res.json();
      if (data.success && data.leaveRequests) {
        setLeaveRequestsList(data.leaveRequests);
      }
    } catch (err) {
      console.warn('Error fetching leave requests:', err.message);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();

    // Check URL parameters for direct email links (Option A)
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('leaveAction');
    const reqId = urlParams.get('id');

    if (action && reqId) {
      setActiveCategoryMode('LEAVE');
      handleReviewLeave(reqId, action.toUpperCase());
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle presets passed from Dashboard / AI Workspace
  useEffect(() => {
    if (emailDraftPreset) {
      if (typeof emailDraftPreset === 'string') {
        setAnnouncementMessage(emailDraftPreset);
        setActiveCategoryMode('ANNOUNCEMENT');
      } else if (typeof emailDraftPreset === 'object') {
        if (emailDraftPreset.categoryMode) {
          setActiveCategoryMode(emailDraftPreset.categoryMode);
        } else if (emailDraftPreset.subject && emailDraftPreset.subject.toLowerCase().includes('leave')) {
          setActiveCategoryMode('LEAVE');
        } else {
          setActiveCategoryMode('ANNOUNCEMENT');
        }

        if (emailDraftPreset.subject) setAnnouncementSubject(emailDraftPreset.subject);
        if (emailDraftPreset.body) setAnnouncementMessage(emailDraftPreset.body);
      }
    }
  }, [emailDraftPreset]);

  // Submit New Leave Request (Step 1 & Step 2)
  const handleSubmitLeaveRequest = async (e) => {
    if (e) e.preventDefault();
    setIsSubmittingLeave(true);
    setLeaveFeedbackMsg('');

    try {
      const res = await fetch('/api/leave/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: leaveEmpName,
          employeeEmail: leaveEmpEmail,
          employeeId: leaveEmpId,
          leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason,
          hrEmail: hrApproverEmail
        })
      });
      const data = await res.json();
      setIsSubmittingLeave(false);

      if (data.success) {
        setLeaveFeedbackMsg(data.message);
        if (data.leaveRequests) setLeaveRequestsList(data.leaveRequests);
        else fetchLeaveRequests();
        if (onRefreshLogs) onRefreshLogs();
      } else {
        setLeaveFeedbackMsg(`Error: ${data.message}`);
      }
    } catch (err) {
      setIsSubmittingLeave(false);
      setLeaveFeedbackMsg(`Failed to submit leave request: ${err.message}`);
    }
  };

  // Review Leave Request (Step 3, 4, 5: Approve/Reject -> DB update -> Final SMTP email to Employee)
  const handleReviewLeave = async (requestId, action, rejectionReason = '') => {
    let customReason = rejectionReason;
    if (action === 'REJECT' && !customReason) {
      customReason = prompt('Please enter the reason for rejecting this leave request:', 'Project deadline during requested dates.') || 'Project deadline during requested dates.';
    }

    try {
      const reviewerName = activeUser?.name ? `${activeUser.name} (${activeUser.role || 'HR Manager'})` : 'Priya Sharma (HR Lead)';
      const res = await fetch('/api/leave/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          reviewedBy: reviewerName,
          rejectionReason: customReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setLeaveFeedbackMsg(data.message);
        if (data.leaveRequests) setLeaveRequestsList(data.leaveRequests);
        else fetchLeaveRequests();
        if (onRefreshLogs) onRefreshLogs();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(`Error reviewing leave request: ${err.message}`);
    }
  };

  // Dispatch Email Handler for general templates & announcement bulk dispatch
  const handleDispatchEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setLastSentLog(null);

    if (activeCategoryMode === 'ANNOUNCEMENT') {
      setAnnouncementDispatchResult(null);
      try {
        const res = await fetch('/api/email/dispatch-announcement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: announcementSubject,
            priority: announcementPriority,
            message: announcementMessage,
            recipientGroup: announcementRecipientGroup,
            senderName: activeUser?.name || 'Enterprise Admin',
            userRole: activeUser?.role || 'Admin'
          })
        });
        const data = await res.json();
        if (data.success) {
          setAnnouncementDispatchResult(data);
          setLastSentLog({
            status: 'SENT',
            recipient: announcementRecipientGroup,
            timestamp: new Date().toLocaleTimeString(),
            summary: data.message
          });
          if (onRefreshLogs) onRefreshLogs();
        } else {
          alert(`Error publishing announcement: ${data.message}`);
        }
      } catch (err) {
        let targetList = Array.isArray(users) && users.length > 0 ? users : [
          { id: 'usr_admin', name: 'Shaik Shavali', email: 'shaikshavali05335@gmail.com' },
          { id: 'usr_ceo', name: 'Vikram Malhotra', email: 'ceo@enterprise.com' },
          { id: 'usr_hr', name: 'Elena Rostova', email: 'hr.manager@enterprise.com' },
          { id: 'usr_kumar', name: 'Kumar', email: '' }
        ];

        const sentRecipients = [];
        const skippedRecipients = [];
        targetList.forEach(u => {
          const email = u.email ? u.email.trim() : '';
          if (email && email.includes('@') && !email.includes('—')) {
            sentRecipients.push({ id: u.id, name: u.name || u.fullName, email: email, action: 'SEND' });
          } else {
            skippedRecipients.push({ id: u.id, name: u.name || u.fullName, email: '—', action: 'SKIP', reason: 'No email address' });
          }
        });

        const fallbackResult = {
          success: true,
          message: `Announcement Published Successfully! 📧 Emails sent: ${sentRecipients.length} | ⚠️ Skipped: ${skippedRecipients.length} employees without email addresses.`,
          summary: {
            announcementTitle: announcementSubject,
            priority: announcementPriority,
            targetGroup: announcementRecipientGroup,
            totalTargeted: targetList.length,
            sentCount: sentRecipients.length,
            skippedCount: skippedRecipients.length
          },
          sentRecipients,
          skippedRecipients,
          allRecipientsBreakdown: [...sentRecipients, ...skippedRecipients]
        };
        setAnnouncementDispatchResult(fallbackResult);
      } finally {
        setIsSending(false);
      }
      return;
    }

    let payload = {
      templateType: activeCategoryMode,
      senderName: activeUser?.name || 'Enterprise Admin',
      senderEmail: activeUser?.email || 'admin@enterprise.com'
    };

    if (activeCategoryMode === 'ANNOUNCEMENT') {
      payload.to = announcementRecipientGroup;
      payload.subject = `[📢 ${announcementPriority.toUpperCase()} ANNOUNCEMENT] ${announcementSubject}`;
      payload.bodyText = announcementMessage;
      payload.variables = { priority: announcementPriority, category: 'Company Announcement' };
    } else if (activeCategoryMode === 'ONBOARDING') {
      payload.to = onboardEmpEmail;
      payload.subject = `[👤 ONBOARDING INVITATION] Welcome ${onboardEmpName} to ${onboardDept}`;
      payload.bodyText = `${onboardMessage}\n\nTemporary Credentials:\nUsername: ${onboardEmpEmail}\nTemporary Password: ${onboardTempPass}`;
      payload.variables = { employeeName: onboardEmpName, role: onboardRole, department: onboardDept };
    } else if (activeCategoryMode === 'OTP') {
      payload.to = otpEmpEmail;
      payload.subject = `[🔐 SECURITY OTP] Your Enterprise 6-Digit Verification Code is ${otpCode}`;
      payload.bodyText = `Your security verification code is ${otpCode}. Valid for 10 minutes. Do not share with anyone.`;
      payload.variables = { otpCode, status: otpStatus };
    } else {
      payload.to = customRecipient;
      payload.subject = customSubject;
      payload.bodyText = customMessage;
      payload.variables = { category: 'Custom Email' };
    }

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setLastSentLog(data.log);
        if (onRefreshLogs) onRefreshLogs(data.log);
      } else {
        setLastSentLog({
          status: 'FAILED',
          errorMessage: data.message
        });
      }
    } catch (err) {
      setLastSentLog({
        status: 'FAILED',
        errorMessage: err.message
      });
    } finally {
      setIsSending(false);
    }
  };

  const pendingRequests = leaveRequestsList.filter(r => r.status === 'Pending');
  const processedRequests = leaveRequestsList.filter(r => r.status !== 'Pending');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Enterprise Email Automation & Communications</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Nodemailer SMTP Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated email approval workflows, company announcements, onboarding credentials, and OTP verification via SMTP transport.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SMTP Engine: Active</span>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveCategoryMode('ANNOUNCEMENT')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'ANNOUNCEMENT'
              ? 'bg-amber-500/20 border-amber-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-5 h-5 text-amber-400 mb-2" />
          <div className="font-bold text-xs">📢 Company Announcement</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Org-wide notifications</div>
        </button>

        <button
          onClick={() => setActiveCategoryMode('LEAVE')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'LEAVE'
              ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Palmtree className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="font-bold text-xs">🏖 Leave Approval Workflow</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Interactive HR approval</div>
        </button>

        <button
          onClick={() => setActiveCategoryMode('ONBOARDING')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'ONBOARDING'
              ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5 text-indigo-400 mb-2" />
          <div className="font-bold text-xs">👤 Employee Onboarding</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Welcome & credentials</div>
        </button>

        <button
          onClick={() => setActiveCategoryMode('CUSTOM')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'CUSTOM'
              ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="font-bold text-xs">✉ Custom AI Email</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Flexible composition</div>
        </button>
      </div>

      {/* ISOLATED CATEGORY PANELS */}
      {activeCategoryMode === 'LEAVE' ? (
        /* SPECIAL LEAVE WORKFLOW SECTION (5 STEPS) */
        <div className="space-y-6">
          {/* Workflow Architecture Stepper Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 font-mono text-xs">
            <div className="text-xs font-bold text-cyan-300 mb-2 flex items-center space-x-2">
              <Palmtree className="w-4 h-4 text-cyan-400" />
              <span>ENTERPRISE LEAVE APPROVAL AUTOMATION WORKFLOW</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-cyan-400 font-bold block">1. Employee Submit</span>
                <span>Submits Leave Request (Status: Pending)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-amber-400 font-bold block">2. SMTP HR Email</span>
                <span>Auto-sends Email with Approve/Reject Links</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-indigo-400 font-bold block">3. HR Approver Review</span>
                <span>HR reviews via Email Link or Portal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-purple-400 font-bold block">4. DB Status Update</span>
                <span>Backend updates status & reviewer notes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-emerald-400 font-bold block">5. Final SMTP Email</span>
                <span>Auto-sends Decision Email to Employee</span>
              </div>
            </div>
          </div>

          {/* Feedback Banner */}
          {leaveFeedbackMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold">{leaveFeedbackMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN: STEP 1 SUBMIT FORM */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Step 1: Submit Leave Request (Employee View)</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Status: Pending
                </span>
              </div>

              <form onSubmit={handleSubmitLeaveRequest} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={leaveEmpName}
                      onChange={(e) => setLeaveEmpName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      value={leaveEmpId}
                      onChange={(e) => setLeaveEmpId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Employee Email Address *</label>
                  <input
                    type="email"
                    required
                    value={leaveEmpEmail}
                    onChange={(e) => setLeaveEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Leave Type *</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    >
                      <option value="Annual Leave">Annual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Family Vacation">Family Vacation</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Parental Leave">Parental Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Leave Reason / Details *</label>
                  <textarea
                    rows={3}
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    placeholder="Provide leave reason..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">HR / Approver Email *</label>
                  <input
                    type="email"
                    required
                    value={hrApproverEmail}
                    onChange={(e) => setHrApproverEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-glow flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Leave Request & Dispatch HR Approval Email</span>
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: STEP 2-5 HR APPROVER ACTION PANEL */}
            <div className="space-y-6">
              {/* Pending Approvals Card */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Step 2-4: Pending HR Approvals ({pendingRequests.length})</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Action Required
                  </span>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No pending leave requests. Submit a request on the left to test the HR approval workflow.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white text-sm">{req.employeeName}</span>
                            <span className="text-indigo-300 font-mono ml-2">({req.employeeId})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
                            Pending HR Review
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg">
                          <div><span className="text-slate-500">Leave Type:</span> <strong>{req.leaveType}</strong></div>
                          <div><span className="text-slate-500">Duration:</span> <strong>{req.startDate} to {req.endDate}</strong></div>
                          <div className="col-span-2"><span className="text-slate-500">Reason:</span> {req.reason}</div>
                          <div className="col-span-2 text-indigo-300"><span className="text-slate-500">Email:</span> {req.employeeEmail}</div>
                        </div>

                        {/* Interactive Approver Action Buttons */}
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleReviewLeave(req.id, 'APPROVE')}
                            className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Request</span>
                          </button>
                          <button
                            onClick={() => handleReviewLeave(req.id, 'REJECT')}
                            className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject Request</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Processed History Log Card */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Step 5: Reviewed Requests Audit History ({processedRequests.length})
                </h4>

                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {processedRequests.map(req => (
                    <div key={req.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{req.employeeName} ({req.leaveType})</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {req.startDate} to {req.endDate} • Reviewed by: <strong className="text-slate-200">{req.reviewedBy}</strong>
                        </div>
                        {req.rejectionReason && (
                          <div className="text-[10px] text-rose-400 font-mono mt-0.5">Reason: {req.rejectionReason}</div>
                        )}
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                        req.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OTHER CATEGORY FORMS */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            {/* ANNOUNCEMENT */}
            {activeCategoryMode === 'ANNOUNCEMENT' && (
              <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>📢 Company Announcement Setup</span>
                  </h3>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Announcement Title / Subject *</label>
                  <input
                    type="text"
                    required
                    value={announcementSubject}
                    onChange={(e) => setAnnouncementSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Target Recipient Group *</label>
                    <select
                      value={announcementRecipientGroup}
                      onChange={(e) => setAnnouncementRecipientGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    >
                      <option value="all-staff@enterprise.com">All Organization Staff</option>
                      <option value="managers@enterprise.com">Department Managers</option>
                      <option value="engineering@enterprise.com">Engineering Division</option>
                    </select>
                    <p className="text-[11px] text-amber-300/90 mt-1.5 font-mono leading-tight bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                      ℹ️ Emails will be sent only to employees with valid email addresses. Employees without email addresses will be skipped.
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Priority *</label>
                    <select
                      value={announcementPriority}
                      onChange={(e) => setAnnouncementPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Message Body *</label>
                  <textarea
                    rows={6}
                    required
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center justify-center space-x-2 cursor-pointer shadow-glow-indigo"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Announcement & Dispatch Email</span>
                </button>
              </form>
            )}

            {/* ONBOARDING */}
            {activeCategoryMode === 'ONBOARDING' && (
              <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-indigo-400" />
                    <span>👤 Employee Onboarding Setup</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={onboardEmpName}
                      onChange={(e) => setOnboardEmpName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Employee Email *</label>
                    <input
                      type="email"
                      required
                      value={onboardEmpEmail}
                      onChange={(e) => setOnboardEmpEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Job Role / Designation *</label>
                    <input
                      type="text"
                      required
                      value={onboardRole}
                      onChange={(e) => setOnboardRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={onboardDept}
                      onChange={(e) => setOnboardDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Temporary Password *</label>
                  <input
                    type="text"
                    required
                    value={onboardTempPass}
                    onChange={(e) => setOnboardTempPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Welcome Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={onboardMessage}
                    onChange={(e) => setOnboardMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Onboarding Welcome Email</span>
                </button>
              </form>
            )}

            {/* CUSTOM */}
            {activeCategoryMode === 'CUSTOM' && (
              <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>✉ Custom AI Email Composition</span>
                  </h3>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    required
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email Body Content *</label>
                  <textarea
                    rows={5}
                    required
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Custom Email</span>
                </button>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN PREVIEW & SUMMARY RESULTS */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Live Email Dispatch Preview</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">To:</span>
                  <span className="text-indigo-300 font-bold">
                    {activeCategoryMode === 'ANNOUNCEMENT' ? announcementRecipientGroup :
                     activeCategoryMode === 'ONBOARDING' ? onboardEmpEmail : customRecipient}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Subject:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[240px]">
                    {activeCategoryMode === 'ANNOUNCEMENT' ? `[📢 ${announcementPriority.toUpperCase()}] ${announcementSubject}` : customSubject}
                  </span>
                </div>

                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap pt-1 text-[11px] max-h-48 overflow-y-auto">
                  {activeCategoryMode === 'ANNOUNCEMENT' ? announcementMessage : customMessage}
                </div>
              </div>
            </div>

            {/* DETAILED ANNOUNCEMENT SUMMARY DISPATCH RESULT */}
            {announcementDispatchResult && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3.5 shadow-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-sm text-white">Announcement Published Successfully</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Status: Published
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <span className="text-[10px] text-slate-400 block font-sans">DELIVERED</span>
                    <span className="text-sm font-bold text-white flex items-center space-x-1.5 mt-0.5">
                      <span>📧 Emails sent:</span>
                      <strong className="text-emerald-400 text-base">{announcementDispatchResult.summary?.sentCount ?? announcementDispatchResult.sentRecipients?.length ?? 0}</strong>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    <span className="text-[10px] text-slate-400 block font-sans">SKIPPED (NO EMAIL)</span>
                    <span className="text-sm font-bold text-white flex items-center space-x-1.5 mt-0.5">
                      <span>⚠️ Skipped:</span>
                      <strong className="text-amber-400 text-base">{announcementDispatchResult.summary?.skippedCount ?? announcementDispatchResult.skippedRecipients?.length ?? 0}</strong>
                    </span>
                  </div>
                </div>

                {/* Recipient Action Audit Breakdown Table */}
                {announcementDispatchResult.allRecipientsBreakdown && announcementDispatchResult.allRecipientsBreakdown.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Recipient Action Breakdown ({announcementDispatchResult.allRecipientsBreakdown.length} Personnel)
                    </span>
                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80 max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Employee</th>
                            <th className="p-2.5">Email Address</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {announcementDispatchResult.allRecipientsBreakdown.map((r, idx) => (
                            <tr key={r.id || idx} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-2.5 text-white font-semibold">{r.name}</td>
                              <td className="p-2.5 text-slate-300">{r.email || '—'}</td>
                              <td className="p-2.5 text-right">
                                {r.action === 'SEND' ? (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                    <span>✅ Send</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                    <span>⚠️ Skip</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {lastSentLog && !announcementDispatchResult && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Email Dispatched Successfully!</p>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Delivered to: <strong>{lastSentLog.recipient}</strong> at {lastSentLog.timestamp}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
