import React, { useState } from 'react';
import { Clock, ShieldAlert, MessageSquare, Search, FileText, Lock, ShieldCheck, UserCheck } from 'lucide-react';

export default function AuditLogs({ conversationLogs, auditLogs, activeUser }) {
  const [activeTab, setActiveTab] = useState('conversations');

  const isHrOrAdmin = activeUser?.role === 'Admin' || activeUser?.role === 'HR Manager';

  // SECURITY GUARD: If user is not Admin or HR Lead, restrict access
  if (!isHrOrAdmin) {
    return (
      <div className="space-y-6">
        <div className="p-8 rounded-3xl glass-panel border border-rose-500/30 text-center space-y-4 max-w-2xl mx-auto my-12 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Access Restricted: Admin & HR Only</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Security audit logs and RAG query conversation histories contain confidential enterprise telemetry and are strictly restricted to <strong>Admin</strong> and <strong>HR Lead</strong> personnel.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono">
            Active Persona: <strong>{activeUser?.name || 'Employee'}</strong> ({activeUser?.role || 'Employee'}) • Access Status: Restricted 🔒
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Conversation & Security Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log repository tracking RAG queries, vector context chunking, security access decisions, and email receipts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'conversations'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            RAG Queries ({conversationLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Security Events ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        {activeTab === 'conversations' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 px-2">Timestamp</th>
                  <th className="pb-3 px-2">User Persona</th>
                  <th className="pb-3 px-2">Role Clearance</th>
                  <th className="pb-3 px-2">Query</th>
                  <th className="pb-3 px-2">Sources Cited</th>
                  <th className="pb-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {conversationLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="py-3.5 px-2 font-semibold text-white">{log.userName}</td>
                    <td className="py-3.5 px-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-200 max-w-xs truncate">{log.query}</td>
                    <td className="py-3.5 px-2 font-mono text-indigo-400">{Array.isArray(log.citedDocuments) ? log.citedDocuments.length : (log.sourcesCount || 1)} chunks</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-3 px-2">Timestamp</th>
                  <th className="pb-3 px-2">Event Action</th>
                  <th className="pb-3 px-2">User Persona</th>
                  <th className="pb-3 px-2">Details & Context</th>
                  <th className="pb-3 px-2 text-right">Security Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(log => {
                  const eventType = log.type || log.action || 'SECURITY_EVENT';
                  const userDisplay = log.userName || log.user || 'System';
                  const roleDisplay = log.userRole || 'System';
                  const detailText = log.details || log.description || 'Security audit log entry created.';
                  
                  const isBlocked = log.decision === 'BLOCKED' || log.decision === 'DENIED' || eventType.includes('CHECK') || eventType.includes('BLOCK');
                  const decisionText = log.decision || (isBlocked ? 'RBAC GUARD' : 'ALLOWED');

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-[11px] text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3.5 px-2 font-bold text-white font-mono text-[11px] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300">
                          {eventType}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className="font-semibold text-white">{userDisplay}</span>
                        <span className="text-[10px] font-mono text-slate-400 block font-normal">{roleDisplay}</span>
                      </td>
                      <td className="py-3.5 px-2 text-slate-300 max-w-sm text-xs leading-snug">{detailText}</td>
                      <td className="py-3.5 px-2 text-right whitespace-nowrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          decisionText.includes('ALLOWED') || decisionText.includes('SUCCESS')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : decisionText.includes('GUARD') || decisionText.includes('RBAC')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {decisionText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
