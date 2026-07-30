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
  ArrowRight
} from 'lucide-react';

export default function EmailHub({ emailLogs, onRefreshLogs, activeUser, emailDraftPreset }) {
  const [recipient, setRecipient] = useState('shavali@enterprise.com');
  const [subject, setSubject] = useState('Annual Leave Request - Pending HR Review (Ref HR-2026-88)');
  const [senderName, setSenderName] = useState('shavali (Software Engineer)');
  const [templateType, setTemplateType] = useState('LEAVE_REQUEST');
  const [bodyText, setBodyText] = useState(
    'I am submitting a formal request for annual leave from August 10, 2026 to August 17, 2026. Please review and approve.'
  );

  const [variables, setVariables] = useState({
    employeeName: activeUser?.name || 'shavali',
    leaveType: 'Annual Vacation',
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    approverName: 'Elena Rostova (HR Lead)'
  });

  const [isSending, setIsSending] = useState(false);
  const [lastSentLog, setLastSentLog] = useState(null);

  // Selected request for full detail review modal
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);

  // Sample Pending Employee Requests Queue for HR Approval
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'req_101',
      employeeName: 'shavali',
      employeeEmail: 'shavali@enterprise.com',
      department: 'Engineering Division',
      requestType: 'Annual Vacation (Aug 10 - Aug 17, 2026)',
      policyRef: 'HR-2026-88 (Annual Leave & PTO Policy)',
      fullDetails: 'Employee shavali has requested 8 working days of annual vacation leave from August 10 to August 17, 2026. Coverage has been arranged with team lead. Project deliverables are scheduled ahead of departure.',
      variables: {
        employeeName: 'shavali',
        leaveType: 'Annual Vacation',
        startDate: '2026-08-10',
        endDate: '2026-08-17',
        approverName: 'Elena Rostova (HR Lead)'
      },
      status: 'PENDING HR APPROVAL',
      dateSubmitted: '2026-07-28'
    },
    {
      id: 'req_102',
      employeeName: 'John Doe',
      employeeEmail: 'dev.john@enterprise.com',
      department: 'Software Engineering',
      requestType: '$500 Ergonomic Hardware Stipend',
      policyRef: 'IT-2026-04 (Remote Office Stipend Policy)',
      fullDetails: 'Employee John Doe has requested reimbursement for an ergonomic office chair and dual 4K monitors under the $500 Day 1 Remote Setup Stipend.',
      variables: {
        newHireName: 'John Doe',
        roleTitle: 'Software Engineer',
        startDate: '2026-08-01',
        mentorName: 'Sarah Connor',
        stipendAmount: '$500 USD'
      },
      status: 'PENDING HR APPROVAL',
      dateSubmitted: '2026-07-29'
    }
  ]);

  // Sync variables when activeUser changes
  useEffect(() => {
    setVariables(prev => ({
      ...prev,
      employeeName: activeUser?.name || 'shavali',
      approverName: activeUser?.role === 'HR Manager' || activeUser?.role === 'Admin' ? activeUser?.name : 'Elena Rostova (HR Lead)'
    }));
    if (activeUser?.role === 'HR Manager' || activeUser?.role === 'Admin') {
      setSenderName(activeUser?.name || 'Elena Rostova (HR Lead)');
    }
  }, [activeUser]);

  // Apply draft preset passed from RAG query action trigger
  useEffect(() => {
    if (emailDraftPreset) {
      if (emailDraftPreset.suggestedRecipient) setRecipient(emailDraftPreset.suggestedRecipient);
      if (emailDraftPreset.suggestedSubject) setSubject(emailDraftPreset.suggestedSubject);
      if (emailDraftPreset.type) setTemplateType(emailDraftPreset.type);
      if (emailDraftPreset.templateVariables) setVariables(emailDraftPreset.templateVariables);
    }
  }, [emailDraftPreset]);

  const handleTemplateChange = (type) => {
    setTemplateType(type);
    if (type === 'LEAVE_REQUEST') {
      setSubject('Annual Leave Request - Pending HR Review (Ref HR-2026-88)');
      setRecipient('hr.manager@enterprise.com');
      setBodyText('I am submitting a formal request for annual leave from August 10, 2026 to August 17, 2026. Please review and approve.');
      setVariables({
        employeeName: activeUser?.name || 'shavali',
        leaveType: 'Annual Vacation',
        startDate: '2026-08-10',
        endDate: '2026-08-17',
        approverName: 'Elena Rostova (HR Lead)'
      });
    } else if (type === 'ONBOARDING_WELCOME') {
      setSubject('Welcome to Enterprise Team! Your Day 1 Orientation Schedule');
      setRecipient('alex.mercer@enterprise.com');
      setBodyText('We are thrilled to welcome you to the Engineering team. Please review your Day 1 schedule and IT setup checklist.');
      setVariables({
        newHireName: 'Alex Mercer',
        roleTitle: 'Senior Frontend Developer',
        startDate: '2026-08-01',
        mentorName: 'Sarah Connor',
        stipendAmount: '$500 USD'
      });
    } else if (type === 'POLICY_NOTICE') {
      setSubject('Important Security Policy Notice: 16-Char Password Mandate');
      setRecipient('all-staff@enterprise.com');
      setBodyText('Pursuant to Global Cybersecurity Guidelines 2026, all employees must update internal SSO passwords to 16+ characters.');
      setVariables({
        policyTitle: 'Global Cybersecurity 16-Char Password Update',
        effectiveDate: '2026-08-15',
        complianceUrl: 'https://security.enterprise.com/mfa-setup'
      });
    }
  };

  const handleOpenReviewModal = (req) => {
    setSelectedRequestForReview(req);
    // Pre-fill fields for email composer
    setRecipient(req.employeeEmail);
    setSubject(`APPROVED: ${req.requestType} - HR Reference #${req.id}`);
    setSenderName(activeUser?.role === 'HR Manager' || activeUser?.role === 'Admin' ? activeUser.name : 'Elena Rostova (HR Lead)');
    setBodyText(`Your request for "${req.requestType}" submitted on ${req.dateSubmitted} has been formally APPROVED by HR Management.`);
    if (req.variables) setVariables(req.variables);
  };

  const handleConfirmApprovalFromModal = async () => {
    if (!selectedRequestForReview) return;
    const req = selectedRequestForReview;

    setIsSending(true);
    setLastSentLog(null);

    try {
      // 1. Dispatch email via API
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: req.employeeEmail,
          subject: `APPROVED: ${req.requestType} - HR Reference #${req.id}`,
          type: templateType,
          body: `Your request for "${req.requestType}" submitted on ${req.dateSubmitted} has been formally APPROVED by HR Management.`,
          variables: req.variables || variables,
          senderName: activeUser?.name || 'Elena Rostova (HR Lead)'
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastSentLog(data.emailLog);
        onRefreshLogs();

        // 2. Update request status in queue
        setPendingRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'APPROVED & NOTIFIED' } : item));
        setSelectedRequestForReview(null);
      } else {
        alert(`Error sending email via SMTP: ${data.message}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipient || !subject) return;

    setIsSending(true);
    setLastSentLog(null);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          type: templateType,
          body: bodyText,
          variables,
          senderName
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastSentLog(data.emailLog);
        onRefreshLogs();
      } else {
        alert(`Error sending email via SMTP: ${data.message}`);
      }
    } catch (err) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const isHrOrAdmin = activeUser?.role === 'HR Manager' || activeUser?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-lime-500/20 shadow-glow-lime flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Mail className="w-5 h-5 text-lime-400" />
            <span>AI Email Generator & SMTP Delivery Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate formal policy notifications, leave approvals, and onboarding emails powered by RAG context.
          </p>
        </div>

        {/* Template Selectors */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTemplateChange('LEAVE_REQUEST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              templateType === 'LEAVE_REQUEST'
                ? 'lime-pill-btn text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            Leave Request
          </button>
          <button
            onClick={() => handleTemplateChange('ONBOARDING_WELCOME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              templateType === 'ONBOARDING_WELCOME'
                ? 'lime-pill-btn text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            Onboarding Welcome
          </button>
          <button
            onClick={() => handleTemplateChange('POLICY_NOTICE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              templateType === 'POLICY_NOTICE'
                ? 'lime-pill-btn text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            Policy Notice
          </button>
        </div>
      </div>

      {/* Conditional HR & Admin Employee Approval Queue */}
      {isHrOrAdmin ? (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm">HR & Admin Employee Approval Queue</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Approver: {activeUser?.name} ({activeUser?.role})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <div key={req.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-white flex items-center space-x-1.5">
                    <span>{req.employeeName}</span>
                    <span className="text-[10px] font-mono text-indigo-400">({req.employeeEmail})</span>
                  </div>
                  <div className="text-slate-300 mt-1">{req.requestType}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Submitted: {req.dateSubmitted}</div>
                </div>

                <div className="shrink-0 text-right">
                  {req.status === 'APPROVED & NOTIFIED' ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approved & Sent</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenReviewModal(req)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review Details & Email</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-xs flex items-center justify-between gap-3 font-sans">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <Mail className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong className="text-white">Employee Email Console ({activeUser?.name}):</strong> Compose policy inquiries or email dispatches. Official leave requests and formal employee notifications submitted here are routed to HR & Admin Management for approval.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 shrink-0">
            Standard Employee Mode
          </span>
        </div>
      )}

      {/* Main Email Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>Email Composer & SMTP Parameters</span>
          </h3>

          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Recipient Email (To) *</label>
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Main Email Message</label>
              <textarea
                rows={3}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-slate-200"
              />
            </div>

            {/* Dynamic Context Variables Editor */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="font-mono text-[10px] uppercase text-indigo-400 block tracking-wider font-semibold">
                Context Variables
              </span>
              <div className="space-y-2">
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between space-x-2">
                    <span className="text-[11px] font-mono text-slate-400 capitalize w-28 shrink-0">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        setVariables(prev => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition-all shadow-glow-indigo flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSending ? (
                <span>Dispatching Email via SMTP...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Email via SMTP</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live HTML Preview & Receipt Banner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live HTML Email Render</span>
              </h3>
              <span className="text-[10px] text-slate-400">WYSIWYG Preview</span>
            </div>

            {/* Email Box Mockup */}
            <div className="rounded-xl border border-slate-700 bg-white text-slate-900 overflow-hidden text-xs shadow-xl">
              <div className="bg-indigo-600 p-4 text-center text-white">
                <h4 className="font-bold text-base">Nexus Knowledge Hub</h4>
                <p className="text-[11px] text-indigo-200">Automated HR / Policy Notification</p>
              </div>

              <div className="p-5 space-y-3 leading-relaxed">
                <h5 className="font-bold text-sm text-slate-900">{subject}</h5>
                <p className="text-slate-700">{bodyText}</p>

                {Object.keys(variables).length > 0 && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-lg border-l-4 border-indigo-600">
                    <p className="font-bold text-[11px] text-slate-800 uppercase tracking-wider mb-1">
                      Summary Parameters
                    </p>
                    <div className="space-y-1 text-[11px]">
                      {Object.entries(variables).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="font-semibold text-slate-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-slate-900 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 mt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
                  This email was dispatched via Nexus Knowledge Hub SMTP Gateway.
                </div>
              </div>
            </div>
          </div>

          {/* Last Sent Delivery Receipt Banner */}
          {lastSentLog && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-2 animate-pulse-subtle">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Email Dispatched Successfully!</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">{lastSentLog.status}</span>
              </div>
              <p className="text-slate-300">
                Message ID: <span className="font-mono text-slate-200">{lastSentLog.messageId}</span>
              </p>
              {lastSentLog.etherealUrl && (
                <a
                  href={lastSentLog.etherealUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-emerald-300 underline hover:text-emerald-200 mt-1"
                >
                  <span>View Dispatched Email in Ethereal Sandbox</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email History Logs Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>SMTP Email Dispatch History Logs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <th className="py-2.5 px-3">Message ID</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-slate-500">
                    No emails dispatched yet. Send your first email above!
                  </td>
                </tr>
              ) : (
                emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 font-mono text-[11px]">
                    <td className="py-2.5 px-3 text-indigo-300 font-semibold">{log.messageId?.substring(0, 14)}...</td>
                    <td className="py-2.5 px-3 text-slate-200">{log.to}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{log.subject}</td>
                    <td className="py-2.5 px-3 text-slate-400">{log.type}</td>
                    <td className="py-2.5 px-3">
                      {log.status === 'APPROVED' || log.subject?.toUpperCase().includes('APPROVED') ? (
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          APPROVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          SENT
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(log.sentAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL REQUEST DETAIL & EMAIL REVIEW MODAL WITH BOTTOM APPROVE BUTTON */}
      {selectedRequestForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Full Request Review & Approval</h3>
                  <p className="text-xs text-slate-400">Reference #{selectedRequestForReview.id} • Submitted {selectedRequestForReview.dateSubmitted}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequestForReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Profile & Request Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-wider block">Employee Information</span>
                <p className="font-bold text-sm text-white">{selectedRequestForReview.employeeName}</p>
                <p className="text-slate-300">Email: <span className="font-mono text-slate-200">{selectedRequestForReview.employeeEmail}</span></p>
                <p className="text-slate-400">Department: {selectedRequestForReview.department || 'Engineering'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-mono text-[10px] text-purple-400 uppercase tracking-wider block">Request & Policy Guidelines</span>
                <p className="font-bold text-sm text-white">{selectedRequestForReview.requestType}</p>
                <p className="text-slate-300">Policy: <span className="font-mono text-indigo-300">{selectedRequestForReview.policyRef || 'HR-2026-88'}</span></p>
                <p className="text-amber-400 font-semibold">Status: {selectedRequestForReview.status}</p>
              </div>
            </div>

            {/* Submitted Message Details */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Submitted Message & Justification</span>
              <p className="text-slate-200 leading-relaxed font-sans">{selectedRequestForReview.fullDetails}</p>
            </div>

            {/* Summary Parameters Table */}
            {selectedRequestForReview.variables && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">Summary Parameters & Variables</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                  {Object.entries(selectedRequestForReview.variables).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-white font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HTML Email Preview Card */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block">
                Official HTML Approval Email (To be Dispatched via SMTP Gateway)
              </span>
              <div className="rounded-xl border border-slate-700 bg-white text-slate-900 overflow-hidden text-xs shadow-xl">
                <div className="bg-indigo-600 p-3.5 text-center text-white">
                  <h4 className="font-bold text-sm">Nexus Knowledge Hub</h4>
                  <p className="text-[10px] text-indigo-200">Automated HR Management Approval Notification</p>
                </div>
                <div className="p-4 space-y-2.5 leading-relaxed">
                  <h5 className="font-bold text-xs text-slate-900">APPROVED: {selectedRequestForReview.requestType} - HR Reference #{selectedRequestForReview.id}</h5>
                  <p className="text-slate-700">Your request for "{selectedRequestForReview.requestType}" submitted on {selectedRequestForReview.dateSubmitted} has been formally APPROVED by HR Management.</p>
                  <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 text-center">
                    Dispatched via Nexus Knowledge Hub SMTP Gateway • Approver: {activeUser?.name || 'Elena Rostova (HR Lead)'}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ACTION FOOTER WITH APPROVE BUTTON */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setSelectedRequestForReview(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
              >
                Close Review
              </button>

              <button
                onClick={handleConfirmApprovalFromModal}
                disabled={isSending || selectedRequestForReview.status === 'APPROVED & NOTIFIED'}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition-all shadow-xl shadow-indigo-500/25 flex items-center space-x-2 disabled:opacity-50"
              >
                {isSending ? (
                  <span>Dispatching Approval Email...</span>
                ) : selectedRequestForReview.status === 'APPROVED & NOTIFIED' ? (
                  <span>Already Approved</span>
                ) : (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-white" />
                    <span>Approve & Dispatch Email via SMTP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
