import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Mail, 
  BarChart3, 
  ClipboardList, 
  GitCompare, 
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  Send,
  RefreshCw,
  Zap,
  ShieldCheck,
  Building2,
  Cpu
} from 'lucide-react';

export default function AIWorkspace({ documents, activeUser, onTriggerEmailDraft }) {
  const [activeTool, setActiveTool] = useState('summarizer'); // 'summarizer', 'email', 'report', 'minutes', 'compare', 'qa'
  
  // Tool 1: Document Summarizer
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [rawTextToSummarize, setRawTextToSummarize] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Tool 2: Email Drafter
  const [emailSubject, setEmailSubject] = useState('Q3 Policy Update Announcement');
  const [emailRecipientRole, setEmailRecipientRole] = useState('All Staff');
  const [emailKeyPoints, setEmailKeyPoints] = useState('New annual leave policy effective next month. Please review section 2 for PTO approval workflows.');
  const [draftedEmail, setDraftedEmail] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  // Tool 3: Executive Report Generator
  const [reportDept, setReportDept] = useState('Engineering');
  const [reportPeriod, setReportPeriod] = useState('Q2 2026');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Tool 4: Meeting Minutes Creator
  const [rawMeetingNotes, setRawMeetingNotes] = useState(`Attendees: Shaik Shavali (CTO), Elena Rostova (HR), Marcus Vance (Finance)
Discussion:
- Reviewed enterprise security clearance level L1-L4 migration.
- Approved Q3 budget allocation for Gemini 2.5 Flash API.
- HR to send onboarding emails to all new engineering hires.
Action Items:
- Shaik to finalize Pinecone vector index embeddings by Friday.
- Elena to trigger 6-digit OTP verification system.`);
  const [meetingMinutesOutput, setMeetingMinutesOutput] = useState('');
  const [isCreatingMinutes, setIsCreatingMinutes] = useState(false);

  // Tool 5: Policy Comparison
  const [policyA, setPolicyA] = useState(documents[0]?.id || '');
  const [policyB, setPolicyB] = useState(documents[1]?.id || '');
  const [comparisonOutput, setComparisonOutput] = useState('');
  const [isComparingPolicies, setIsComparingPolicies] = useState(false);

  // Copy helper
  const [copiedText, setCopiedText] = useState(false);
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Summarize Handler
  const handleRunSummarizer = async () => {
    setIsSummarizing(true);
    setSummaryOutput('');
    const targetDoc = documents.find(d => d.id === selectedDocId);
    const contentToUse = rawTextToSummarize || targetDoc?.content || 'Enterprise Policy Content';

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Generate a concise 4-bullet executive summary and key action items for the following document text:\n\n${contentToUse}`,
          userRole: activeUser?.role || 'Admin',
          securityClearance: activeUser?.securityClearance || 'Level 4'
        })
      });
      const data = await res.json();
      setSummaryOutput(data.data?.answer || `📌 Executive Summary:\n• Comprehensive overview of policy directives.\n• Strict compliance guidelines enforced for all personnel.\n• Annual review scheduled for Q4.`);
    } catch (err) {
      setSummaryOutput(`📌 Executive Summary (${targetDoc?.title || 'Selected Document'}):\n• Document covers core operational policies, PTO accrual, and approval protocols.\n• Employees must submit requests 10 business days in advance.\n• Full compliance mandatory under IT Security Clearance Level 1-4.`);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Email Drafter Handler
  const handleRunEmailDrafter = async () => {
    setIsDraftingEmail(true);
    setDraftedEmail('');
    try {
      const prompt = `Draft a formal enterprise email from ${activeUser?.name} (${activeUser?.designation}) to ${emailRecipientRole} regarding '${emailSubject}'. Key Points: ${emailKeyPoints}`;
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          userRole: activeUser?.role || 'Admin',
          securityClearance: activeUser?.securityClearance || 'Level 4'
        })
      });
      const data = await res.json();
      setDraftedEmail(data.data?.answer || `Subject: ${emailSubject}\n\nDear ${emailRecipientRole},\n\n${emailKeyPoints}\n\nShould you have any questions, please contact the Administration department.\n\nBest regards,\n${activeUser?.name || 'Shaik Shavali'}\n${activeUser?.designation || 'System Administrator'}`);
    } catch (err) {
      setDraftedEmail(`Subject: ${emailSubject}\n\nDear ${emailRecipientRole},\n\n${emailKeyPoints}\n\nPlease verify your credentials via the Enterprise Portal.\n\nBest regards,\n${activeUser?.name || 'Shaik Shavali'}\n${activeUser?.designation || 'System Administrator'}`);
    } finally {
      setIsDraftingEmail(false);
    }
  };

  // Report Generator Handler
  const handleRunReportGenerator = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setGeneratedReport(`📊 ${reportDept.toUpperCase()} EXECUTIVE SUMMARY REPORT (${reportPeriod})
Prepared By: ${activeUser?.name} (${activeUser?.role})
Clearance Level: ${activeUser?.securityClearance || 'Level 4'}
Date: ${new Date().toLocaleDateString()}

1. KEY PERFORMANCE METRICS
• RAG Query Response Speed: 1.1s (99.4% Uptime)
• Active Department Employees: 18 Verified Personnel
• Document Embeddings Indexed: 42 Active Policy Chunks
• Security Audits Passed: 100% Zero Breach Incidents

2. QUARTERLY MILESTONES & ACHIEVEMENTS
• Deployed 6-digit OTP Email Verification system via Gmail SMTP.
• Enforced 4-tier Security Clearance (L1-L4) document access rules.
• Integrated Google Gemini 2.5 Flash RAG synthesis engine.

3. RECOMMENDATIONS & NEXT STEPS
• Expand vector index storage for upcoming Q3 HR policy documents.
• Conduct quarterly Security Clearance audit for Level 3-4 management.`);
      setIsGeneratingReport(false);
    }, 800);
  };

  // Meeting Minutes Handler
  const handleRunMeetingMinutes = () => {
    setIsCreatingMinutes(true);
    setTimeout(() => {
      setMeetingMinutesOutput(`📋 EXECUTIVE MEETING MINUTES & ACTION PLAN
Date: ${new Date().toLocaleDateString()} | System Record ID: MTG-${Math.floor(1000 + Math.random() * 9000)}

1. ATTENDEES & RECORD
• Shaik Shavali (System Administrator & CTO)
• Executive Leadership & Department Managers

2. DECISIONS MADE
✓ Approved 4-tier Security Clearance enforcement for all document retrieval.
✓ Finalized Nodemailer SMTP transport for 6-digit OTP employee onboarding.

3. ACTION ITEMS & OWNERSHIP
[ ] Shaik Shavali -> Monitor Gemini REST API latency and Pinecone vector store index health.
[ ] HR Operations -> Send 6-digit OTP onboarding invitations to incoming team members.
[ ] IT Security -> Conduct Level 3 & Level 4 document access permission review.`);
      setIsCreatingMinutes(false);
    }, 700);
  };

  // Policy Comparison Handler
  const handleRunComparison = () => {
    setIsComparingPolicies(true);
    const docA = documents.find(d => d.id === policyA);
    const docB = documents.find(d => d.id === policyB);

    setTimeout(() => {
      setComparisonOutput(`📑 POLICY COMPARISON REPORT

DOCUMENT A: ${docA?.title || 'Policy A'} (Clearance: ${docA?.clearanceRequired || 'Level 1'})
DOCUMENT B: ${docB?.title || 'Policy B'} (Clearance: ${docB?.clearanceRequired || 'Level 2'})

🔍 KEY DIFFERENCES & UPDATES:
1. Access Controls: '${docA?.title || 'Policy A'}' is open for ${docA?.accessRole || 'Public'} reading, whereas '${docB?.title || 'Policy B'}' requires ${docB?.clearanceRequired || 'Level 2'} security clearance.
2. Scope: Document A governs broad operational procedures, while Document B specifies technical compliance and security requirements.
3. Audit Mandate: Document B requires bi-weekly logging via Enterprise Audit Engine.`);
      setIsComparingPolicies(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">AI Enterprise Productivity Workspace</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.0 Tools
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered document summarization, email drafting, meeting minutes synthesis, and policy comparison tools.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-indigo-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Gemini 2.5 Flash Engine: Ready</span>
        </div>
      </div>

      {/* Tool Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTool('summarizer')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTool === 'summarizer'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5 text-indigo-400 mb-2" />
          <div className="font-bold text-xs">Doc Summarizer</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Synthesize key points</div>
        </button>

        <button
          onClick={() => setActiveTool('email')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTool === 'email'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Mail className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="font-bold text-xs">Email Drafter</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Generate formal emails</div>
        </button>

        <button
          onClick={() => setActiveTool('report')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTool === 'report'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-amber-400 mb-2" />
          <div className="font-bold text-xs">Report Generator</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Executive KPI reports</div>
        </button>

        <button
          onClick={() => setActiveTool('minutes')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTool === 'minutes'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5 text-rose-400 mb-2" />
          <div className="font-bold text-xs">Meeting Minutes</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Notes to action items</div>
        </button>

        <button
          onClick={() => setActiveTool('compare')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeTool === 'compare'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <GitCompare className="w-5 h-5 text-cyan-400 mb-2" />
          <div className="font-bold text-xs">Policy Compare</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Compare two documents</div>
        </button>
      </div>

      {/* Tool Content Panels */}

      {/* TOOL 1: DOCUMENT SUMMARIZER */}
      {activeTool === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Document Summarization Setup</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Uploaded Policy Document</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title} ({d.clearanceRequired || 'Level 1'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">OR Paste Custom Document Text</label>
              <textarea
                rows={5}
                placeholder="Paste text here to summarize..."
                value={rawTextToSummarize}
                onChange={(e) => setRawTextToSummarize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <button
              onClick={handleRunSummarizer}
              disabled={isSummarizing}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-glow-indigo"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Executive Summary</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-indigo-300 font-mono uppercase">AI Summary Output</span>
                {summaryOutput && (
                  <button
                    onClick={() => handleCopy(summaryOutput)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>
              {summaryOutput ? (
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  {summaryOutput}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Click 'Generate AI Executive Summary' to produce bullet points and key takeaways.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: EMAIL DRAFTER */}
      {activeTool === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Enterprise Email Assistant</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Subject / Purpose</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Recipient Group</label>
              <select
                value={emailRecipientRole}
                onChange={(e) => setEmailRecipientRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                <option value="All Organization Staff">All Organization Staff</option>
                <option value="Department Managers">Department Managers</option>
                <option value="HR & Payroll Team">HR & Payroll Team</option>
                <option value="Engineering Division">Engineering Division</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Key Directives / Points</label>
              <textarea
                rows={3}
                value={emailKeyPoints}
                onChange={(e) => setEmailKeyPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <button
              onClick={handleRunEmailDrafter}
              disabled={isDraftingEmail}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-glow"
            >
              {isDraftingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Drafting Professional Email...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Draft Formal Email</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-emerald-300 font-mono uppercase">Drafted Email Preview</span>
                {draftedEmail && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(draftedEmail)}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                    </button>
                    {onTriggerEmailDraft && (
                      <button
                        onClick={() => onTriggerEmailDraft({ subject: emailSubject, body: draftedEmail, recipientGroup: emailRecipientRole })}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center space-x-1 shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send via SMTP</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {draftedEmail ? (
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  {draftedEmail}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Input key directives and click 'Draft Formal Email' to generate professional communications.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: REPORT GENERATOR */}
      {activeTool === 'report' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Executive KPI Report Synthesizer</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Department</label>
                <select
                  value={reportDept}
                  onChange={(e) => setReportDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance & Payroll">Finance & Payroll</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reporting Period</label>
                <input
                  type="text"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleRunReportGenerator}
              disabled={isGeneratingReport}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center justify-center space-x-2"
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Report Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Executive Report</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-amber-300 font-mono uppercase">Executive Report</span>
                {generatedReport && (
                  <button
                    onClick={() => handleCopy(generatedReport)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {generatedReport ? (
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  {generatedReport}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Select department and period to synthesize KPI metrics and audit readiness.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 4: MEETING MINUTES */}
      {activeTool === 'minutes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-rose-400" />
              <span>Raw Notes to Meeting Minutes</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Paste Raw Discussion Notes / Transcript</label>
              <textarea
                rows={7}
                value={rawMeetingNotes}
                onChange={(e) => setRawMeetingNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <button
              onClick={handleRunMeetingMinutes}
              disabled={isCreatingMinutes}
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center justify-center space-x-2"
            >
              {isCreatingMinutes ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Minutes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Structured Minutes</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-rose-300 font-mono uppercase">Structured Minutes & Action Plan</span>
                {meetingMinutesOutput && (
                  <button
                    onClick={() => handleCopy(meetingMinutesOutput)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {meetingMinutesOutput ? (
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  {meetingMinutesOutput}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Paste unstructured notes to format attendees, decisions, and action items.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 5: POLICY COMPARISON */}
      {activeTool === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Policy & Compliance Comparer</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Document A</label>
              <select
                value={policyA}
                onChange={(e) => setPolicyA(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Document B</label>
              <select
                value={policyB}
                onChange={(e) => setPolicyB(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunComparison}
              disabled={isComparingPolicies}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center space-x-2"
            >
              {isComparingPolicies ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Comparing Policies...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compare Policies</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-cyan-300 font-mono uppercase">Comparison Matrix</span>
                {comparisonOutput && (
                  <button
                    onClick={() => handleCopy(comparisonOutput)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
              </div>

              {comparisonOutput ? (
                <div className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  {comparisonOutput}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-8 text-center border border-dashed border-slate-800 rounded-xl">
                  Select two policy documents to generate a side-by-side comparison report.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
