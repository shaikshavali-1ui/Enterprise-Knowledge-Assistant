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
  Users
} from 'lucide-react';

export default function Dashboard({ documents, vectorStats, emailLogs, conversationLogs, activeUser, setCurrentTab, setPresetQuery }) {
  const totalDocs = documents.length || 5;
  const totalChunks = vectorStats?.totalChunks || 18;
  const totalQueries = conversationLogs.length || 12;
  const totalEmails = emailLogs.length || 8;

  const quickQueries = [
    { label: "What is our annual leave entitlement for 2026?", category: "HR Policy" },
    { label: "What hardware setup & $500 stipend is provided on Day 1?", category: "Onboarding" },
    { label: "What are our 16-character password & VPN security rules?", category: "IT Security" },
    { label: "What are Q1 executive compensation bands & RSUs?", category: "Restricted Finance" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/30 glass-panel shadow-glow-indigo flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise Knowledge Assistant
            </span>
            <span className="text-xs text-slate-400">• Security Filter: Active</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-2">
            Welcome back, {activeUser?.name}
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Query corporate policies, retrieve verified document context, and dispatch automated emails via SMTP.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('chat')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Launch RAG Assistant</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Indexed Documents */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Indexed Knowledge Base</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalDocs} Documents</h3>
            <p className="text-xs text-indigo-400 mt-1 font-mono">{totalChunks} Vector Chunks</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Database className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: RAG Queries Processed */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">RAG Queries Handled</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalQueries} Conversations</h3>
            <p className="text-xs text-emerald-400 mt-1 font-mono">Avg Latency ~120ms</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Search className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Emails Sent via SMTP */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Automated Emails Sent</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalEmails} Emails</h3>
            <p className="text-xs text-sky-400 mt-1 font-mono">100% SMTP Deliverability</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Role Guard */}
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Security Clearance</p>
            <h3 className="text-2xl font-bold text-amber-300 mt-1">{activeUser?.role}</h3>
            <p className="text-xs text-slate-400 mt-1 font-mono">RBAC Guard Active</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Query Starter & Document Overview */}
        <div className="lg:col-span-2 space-y-6">
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
                <span>Indexed Nexus Knowledge Docs</span>
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
                      doc.accessRole === 'Public'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : doc.accessRole === 'HR-Only'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}>
                      {doc.accessRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Security Access Matrix & Automation Hub */}
        <div className="space-y-6">
          {/* RBAC Security Policy Matrix */}
          <div className="p-6 rounded-2xl glass-panel space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Role Security Access Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              RAG vector search enforces real-time document filtering based on active employee role.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-slate-200">Employee</span>
                <span className="text-slate-400">Public Policies Only</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-amber-300">HR Manager</span>
                <span className="text-amber-400">Public + HR Confidential</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-emerald-300">Finance</span>
                <span className="text-emerald-400">Public + Executive Comp</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                <span className="font-semibold text-rose-300">Admin</span>
                <span className="text-rose-400">Full Unrestricted Access</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('rbac')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors text-center"
            >
              Test Persona Switching
            </button>
          </div>

          {/* Email Automation Quick Status */}
          <div className="p-6 rounded-2xl glass-panel space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>SMTP Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-400">
              Generate AI email drafts directly from RAG search context and dispatch to employees.
            </p>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-200">Nodemailer SMTP Active</p>
                <p className="text-[10px] text-slate-400">Ethereal / Custom Enterprise SMTP Transport</p>
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
