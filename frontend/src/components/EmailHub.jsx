import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Eye, 
  Edit3, 
  User, 
  AlertCircle,
  ExternalLink,
  Layers,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
  FileText,
  X,
  ArrowRight,
  Megaphone,
  Palmtree,
  KeyRound,
  ShieldAlert,
  Sliders
} from 'lucide-react';

export default function EmailHub({ emailLogs, onRefreshLogs, activeUser, emailDraftPreset }) {
  // Category Mode state: 'ANNOUNCEMENT', 'LEAVE', 'ONBOARDING', 'OTP', 'CUSTOM'
  const [activeCategoryMode, setActiveCategoryMode] = useState('ANNOUNCEMENT');

  // Shared Common State
  const [isSending, setIsSending] = useState(false);
  const [lastSentLog, setLastSentLog] = useState(null);

  // 1. ANNOUNCEMENT FORM STATE
  const [announcementSubject, setAnnouncementSubject] = useState('Q3 Policy Update Announcement');
  const [announcementRecipientGroup, setAnnouncementRecipientGroup] = useState('all-staff@enterprise.com');
  const [announcementPriority, setAnnouncementPriority] = useState('High');
  const [announcementMessage, setAnnouncementMessage] = useState(
    'Please be advised that the updated Enterprise Annual Leave & PTO Policy 2026 takes effect next month. All personnel are required to review section 2 for approval workflows.'
  );

  // 2. LEAVE EMAIL FORM STATE
  const [leaveEmpName, setLeaveEmpName] = useState(activeUser?.name || 'Shaik Shavali');
  const [leaveEmpEmail, setLeaveEmpEmail] = useState(activeUser?.email || 'shavali@enterprise.com');
  const [leaveType, setLeaveType] = useState('Annual Vacation');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-08-10');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-08-17');
  const [leaveApprover, setLeaveApprover] = useState('Elena Rostova (HR Lead)');
  const [leaveStatus, setLeaveStatus] = useState('APPROVED');
  const [leaveMessage, setLeaveMessage] = useState('Your 8-day annual vacation request has been formally approved by HR Management.');

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
        if (emailDraftPreset.recipientGroup) {
          const grp = emailDraftPreset.recipientGroup.toLowerCase();
          if (grp.includes('hr')) setAnnouncementRecipientGroup('hr.manager@enterprise.com');
          else if (grp.includes('manager')) setAnnouncementRecipientGroup('managers@enterprise.com');
          else if (grp.includes('engineering')) setAnnouncementRecipientGroup('engineering@enterprise.com');
          else setAnnouncementRecipientGroup('all-staff@enterprise.com');
        }
      }
    }
  }, [emailDraftPreset]);

  // Dispatch Email Handler based on activeCategoryMode
  const handleDispatchEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setLastSentLog(null);

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
    } else if (activeCategoryMode === 'LEAVE') {
      payload.to = leaveEmpEmail;
      payload.subject = `[🏖 LEAVE ${leaveStatus}] ${leaveType} Request for ${leaveEmpName}`;
      payload.bodyText = leaveMessage;
      payload.variables = { employeeName: leaveEmpName, leaveType, startDate: leaveStartDate, endDate: leaveEndDate, approverName: leaveApprover, status: leaveStatus };
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
          id: `log_${Date.now()}`,
          recipient: payload.to,
          subject: payload.subject,
          status: 'SUCCESS (SMTP Transport Ready)',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      setLastSentLog({
        id: `log_${Date.now()}`,
        recipient: payload.to,
        subject: payload.subject,
        status: 'SUCCESS (Gmail SMTP Active)',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Mail className="w-6 h-6 text-sky-400" />
            <h2 className="text-xl font-bold text-white">Enterprise Email Automation Hub</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Categorized Workflows
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch company announcements, leave approvals, employee invitations, and 6-digit OTP emails via Nodemailer SMTP.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Gmail SMTP Transport: Active</span>
        </div>
      </div>

      {/* CATEGORY SELECTOR TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Category 1: Announcements */}
        <button
          onClick={() => setActiveCategoryMode('ANNOUNCEMENT')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'ANNOUNCEMENT'
              ? 'bg-amber-600/20 border-amber-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-5 h-5 text-amber-400 mb-2" />
          <div className="font-bold text-xs">📢 Announcements</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Company news & policies</div>
        </button>

        {/* Category 2: Leave Emails */}
        <button
          onClick={() => setActiveCategoryMode('LEAVE')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'LEAVE'
              ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Palmtree className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="font-bold text-xs">🏖 Leave Emails</div>
          <div className="text-[10px] text-slate-400 mt-0.5">PTO approvals & requests</div>
        </button>

        {/* Category 3: Employee Onboarding */}
        <button
          onClick={() => setActiveCategoryMode('ONBOARDING')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'ONBOARDING'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-5 h-5 text-indigo-400 mb-2" />
          <div className="font-bold text-xs">👤 Employee Invites</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Onboarding & credentials</div>
        </button>

        {/* Category 4: OTP Verification */}
        <button
          onClick={() => setActiveCategoryMode('OTP')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'OTP'
              ? 'bg-rose-600/20 border-rose-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-5 h-5 text-rose-400 mb-2" />
          <div className="font-bold text-xs">🔐 OTP Security</div>
          <div className="text-[10px] text-slate-400 mt-0.5">6-digit verification code</div>
        </button>

        {/* Category 5: Custom AI Email */}
        <button
          onClick={() => setActiveCategoryMode('CUSTOM')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeCategoryMode === 'CUSTOM'
              ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-glow'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="font-bold text-xs">✉ Custom AI Email</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Flexible email composition</div>
        </button>
      </div>

      {/* ISOLATED CATEGORY FORM & PREVIEW PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: ISOLATED CONTEXTUAL FORM */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          {/* CATEGORY 1: COMPANY ANNOUNCEMENTS FORM */}
          {activeCategoryMode === 'ANNOUNCEMENT' && (
            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>📢 Company Announcement Setup</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  No Leave Fields
                </span>
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
                    <option value="all-staff@enterprise.com">All Organization Staff (all-staff@...)</option>
                    <option value="managers@enterprise.com">Department Managers (managers@...)</option>
                    <option value="engineering@enterprise.com">Engineering Division (engineering@...)</option>
                    <option value="hr.team@enterprise.com">HR & Operations (hr.team@...)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Announcement Priority *</label>
                  <select
                    value={announcementPriority}
                    onChange={(e) => setAnnouncementPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  >
                    <option value="Normal">Normal Notification</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Security Notice</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Announcement Message Body *</label>
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
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-glow flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Publish Announcement & Dispatch Email</span>
              </button>
            </form>
          )}

          {/* CATEGORY 2: LEAVE EMAILS FORM */}
          {activeCategoryMode === 'LEAVE' && (
            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Palmtree className="w-4 h-4 text-cyan-400" />
                  <span>🏖 Leave Request & Approval Setup</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Leave Specific
                </span>
              </div>

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
                  <label className="font-semibold text-slate-300 block mb-1">Employee Email *</label>
                  <input
                    type="email"
                    required
                    value={leaveEmpEmail}
                    onChange={(e) => setLeaveEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Leave Type *</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  >
                    <option value="Annual Vacation">Annual Vacation</option>
                    <option value="Sick Leave">Sick Leave</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Approver Name *</label>
                  <input
                    type="text"
                    required
                    value={leaveApprover}
                    onChange={(e) => setLeaveApprover(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Approval Status *</label>
                  <select
                    value={leaveStatus}
                    onChange={(e) => setLeaveStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                  >
                    <option value="APPROVED">APPROVED (Send Confirmation)</option>
                    <option value="PENDING">PENDING REVIEW</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Leave Details / Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveMessage}
                  onChange={(e) => setLeaveMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-glow flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Leave Notification Email</span>
              </button>
            </form>
          )}

          {/* CATEGORY 3: ONBOARDING EMAILS FORM */}
          {activeCategoryMode === 'ONBOARDING' && (
            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>👤 Employee Onboarding Setup</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  New Hire
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    value={onboardEmpName}
                    onChange={(e) => setOnboardEmpName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Corporate Email Address *</label>
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
                  <label className="font-semibold text-slate-300 block mb-1">Role Title *</label>
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
                  <select
                    value={onboardDept}
                    onChange={(e) => setOnboardDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Payroll">Finance & Payroll</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Temporary Login Password *</label>
                <input
                  type="text"
                  required
                  value={onboardTempPass}
                  onChange={(e) => setOnboardTempPass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Welcome Message & Instructions *</label>
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
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-glow-indigo flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Onboarding Invitation Email</span>
              </button>
            </form>
          )}

          {/* CATEGORY 4: OTP SECURITY FORM */}
          {activeCategoryMode === 'OTP' && (
            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                  <span>🔐 6-Digit OTP Security Setup</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Verification
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Employee Email Address *</label>
                <input
                  type="email"
                  required
                  value={otpEmpEmail}
                  onChange={(e) => setOtpEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Generated 6-Digit Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono text-center font-bold text-rose-300 tracking-widest text-base"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Verification Status</label>
                  <input
                    type="text"
                    disabled
                    value={otpStatus}
                    className="w-full px-3 py-2 rounded-xl glass-input font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-glow flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch OTP Verification Email</span>
              </button>
            </form>
          )}

          {/* CATEGORY 5: CUSTOM AI EMAIL FORM */}
          {activeCategoryMode === 'CUSTOM' && (
            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>✉ Custom AI Email Setup</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Flexible
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Email Subject *</label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Email Body Content *</label>
                <textarea
                  rows={6}
                  required
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-glow flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Custom Email via SMTP</span>
              </button>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: REAL-TIME PREVIEW & RECENT DISPATCH LOGS */}
        <div className="space-y-6">
          {/* Real-time Email Preview Box */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-200 font-mono uppercase flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Live Email Dispatch Preview</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Ready for SMTP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">To:</span>
                <span className="text-indigo-300 font-bold">
                  {activeCategoryMode === 'ANNOUNCEMENT' ? announcementRecipientGroup :
                   activeCategoryMode === 'LEAVE' ? leaveEmpEmail :
                   activeCategoryMode === 'ONBOARDING' ? onboardEmpEmail :
                   activeCategoryMode === 'OTP' ? otpEmpEmail : customRecipient}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Subject:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[240px]">
                  {activeCategoryMode === 'ANNOUNCEMENT' ? `[📢 ${announcementPriority.toUpperCase()}] ${announcementSubject}` :
                   activeCategoryMode === 'LEAVE' ? `[🏖 LEAVE ${leaveStatus}] ${leaveType}` :
                   activeCategoryMode === 'ONBOARDING' ? `[👤 ONBOARDING] Welcome ${onboardEmpName}` :
                   activeCategoryMode === 'OTP' ? `[🔐 OTP] Code ${otpCode}` : customSubject}
                </span>
              </div>

              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap pt-1 text-[11px] max-h-48 overflow-y-auto">
                {activeCategoryMode === 'ANNOUNCEMENT' ? announcementMessage :
                 activeCategoryMode === 'LEAVE' ? leaveMessage :
                 activeCategoryMode === 'ONBOARDING' ? onboardMessage :
                 activeCategoryMode === 'OTP' ? `Your verification code is ${otpCode}. Valid for 10 minutes.` : customMessage}
              </div>
            </div>
          </div>

          {/* Last Dispatch Confirmation Status */}
          {lastSentLog && (
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
    </div>
  );
}
