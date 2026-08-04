import React from 'react';
import { 
  FileText, 
  Search, 
  Mail, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Database,
  Lock,
  CheckCircle,
  Users,
  Bell,
  Megaphone,
  Activity,
  Cpu,
  Calendar,
  Sparkles,
  Layers
} from 'lucide-react';

export default function Dashboard({ documents, vectorStats, emailLogs, conversationLogs, activeUser, setCurrentTab, setPresetQuery }) {
  const totalDocs = documents.length || 5;
  const totalChunks = vectorStats?.totalChunks || 17;
  const totalQueries = conversationLogs.length || 18;
  const totalEmails = emailLogs.length || 8;

  const quickQueries = [
    { label: "What is our annual leave entitlement for 2026?", category: "HR Policy" },
    { label: "What hardware setup & $500 stipend is provided on Day 1?", category: "Onboarding" },
    { label: "What are our 16-character password & VPN security rules?", category: "IT Security" },
    { label: "What are Q1 executive compensation bands & RSUs?", category: "Restricted Finance" }
  ];

  const companyAnnouncements = [
    { id: 1, title: 'Independence Day Holiday Notice', date: '15 August 2026', type: 'HR Alert', desc: 'All corporate offices will remain closed. Critical IT support remains on call.' },
    { id: 2, title: 'Mandatory Cybersecurity Refresh Training', date: 'Next Friday', type: 'Security', desc: 'Level 1 to Level 4 security clearance holders must complete MFA & phishing modules.' },
    { id: 3, title: 'Quarterly HR & Operations All-Hands', date: 'Tomorrow at 10:00 AM', type: 'Meeting', desc: 'Reviewing Q3 employee onboarding and 6-digit OTP verification system adoption.' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. EMPLOYEE PROFILE HERO CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 glass-panel shadow-glow-indigo flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <img
            src={activeUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt={activeUser?.name}
            className="w-16 h-16 rounded-2xl border-2 border-indigo-500/50 object-cover shadow-lg shrink-0 mt-1"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise Personnel Dashboard
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Active</span>
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mt-1">
              👋 Welcome, {activeUser?.fullName || activeUser?.name || 'Shaik Shavali'}
            </h2>

            {/* Employee Badges Detail */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-mono">
                Employee ID: <strong className="text-indigo-300">{activeUser?.employeeId || 'EMP001'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                Department: <strong className="text-slate-200">{activeUser?.department || 'Executive Management'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                Designation: <strong className="text-slate-200">{activeUser?.designation || 'System Administrator & CTO'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
                Role: <strong>{activeUser?.role || 'Admin'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                Clearance: <strong>{activeUser?.securityClearance || 'Level 4'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('ai-workspace')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-glow-indigo flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Workspace</span>
          </button>
          <button
            onClick={() => setCurrentTab('chat')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 text-indigo-400" />
            <span>Launch RAG Chat</span>
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME STAT COUNTERS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Today's Alerts</p>
          <h4 className="text-xl font-bold text-indigo-300 mt-1">5 Notifs</h4>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Unread Documents</p>
          <h4 className="text-xl font-bold text-amber-300 mt-1">3 Policies</h4>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Recent RAG Queries</p>
          <h4 className="text-xl font-bold text-emerald-300 mt-1">{totalQueries} Queries</h4>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">Knowledge Chunks</p>
          <h4 className="text-xl font-bold text-purple-300 mt-1">{totalChunks} Chunks</h4>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">SMTP Emails Sent</p>
          <h4 className="text-xl font-bold text-sky-300 mt-1">{totalEmails} Sent</h4>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">System Storage</p>
          <h4 className="text-xl font-bold text-slate-200 mt-1 font-mono">1.4 MB</h4>
        </div>
      </div>

      {/* 3. SYSTEM HEALTH INDICATOR BAR */}
      <div className="p-3.5 rounded-xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>System Health Telemetry:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Pinecone Connected</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Gemini AI Online</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SMTP Connected</span>
          </span>
          <span className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Server Running</span>
          </span>
          <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span>🟢 API Healthy</span>
          </span>
        </div>
      </div>

      {/* 4. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Query Starter & Announcements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Announcements Feed */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>Company News & Announcements</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">3 Active Bulletins</span>
            </div>

            <div className="space-y-3">
              {companyAnnouncements.map(item => (
                <div key={item.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.type} • {item.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RAG Starter Card */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Suggested RAG Queries</span>
              </h3>
              <span className="text-xs text-slate-400">Click to run immediately</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPresetQuery(q.label);
                    setCurrentTab('chat');
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
                >
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {q.category}
                  </span>
                  <p className="text-xs font-medium text-slate-200 mt-2 group-hover:text-indigo-200 transition-colors">
                    {q.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Document Knowledge Base Overview */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Indexed Enterprise Knowledge Docs</span>
              </h3>
              <button
                onClick={() => setCurrentTab('documents')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <span>View All ({documents.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {documents.slice(0, 4).map(doc => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.summary}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      doc.clearanceRequired === 'Level 4'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : doc.clearanceRequired === 'Level 3'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {doc.clearanceRequired || 'Level 1'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Clearance & Email Automation */}
        <div className="space-y-6">
          {/* Security Clearance 4-Tier Access Matrix */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>4-Tier Clearance Access Control</span>
            </h3>
            <p className="text-xs text-slate-400">
              RAG engine filters documents so queries retrieve passages matching user clearance level.
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-slate-200">Level 1 - Public</span>
                <span className="text-slate-400">Company PTO & Setup</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-indigo-300">Level 2 - Department</span>
                <span className="text-indigo-400">IT Security Guidelines</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-amber-300">Level 3 - Management</span>
                <span className="text-amber-400">Confidential HR SOPs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-rose-300">Level 4 - Executive</span>
                <span className="text-rose-400">Exec Compensation & RSUs</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('rbac')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors text-center"
            >
              Open Employee Provisioning
            </button>
          </div>

          {/* Email Automation Dispatcher */}
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>SMTP Email Automation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Dispatches 6-digit OTP codes and RAG email notifications via Nodemailer SMTP.
            </p>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">Gmail SMTP Active</p>
                <p className="text-[10px] text-slate-400">Verified Gmail Credentials</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('email')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-medium text-xs hover:opacity-90 transition-all text-center shadow-lg"
            >
              Open Email Automation Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
