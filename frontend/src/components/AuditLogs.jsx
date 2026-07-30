import React, { useState } from 'react';
import { Clock, ShieldAlert, MessageSquare, Search, FileText } from 'lucide-react';

export default function AuditLogs({ conversationLogs, auditLogs }) {
  const [activeTab, setActiveTab] = useState('conversations');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-lime-500/20 shadow-glow-lime flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-lime-400" />
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'conversations'
                ? 'lime-pill-btn text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            RAG Queries ({conversationLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'lime-pill-btn text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            Security Events ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-6 rounded-2xl glass-panel border border-lime-500/20">
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
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-500/20 text-lime-300 border border-lime-500/30 font-semibold">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-slate-200 max-w-xs truncate">{log.query}</td>
                    <td className="py-3.5 px-2 font-mono text-lime-400">{log.sourcesCount} chunks</td>
                    <td className="py-3.5 px-2 text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
                  <th className="pb-3 px-2">User</th>
                  <th className="pb-3 px-2">Security Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-2 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                    <td className="py-3.5 px-2 font-bold text-white">{log.action}</td>
                    <td className="py-3.5 px-2 text-slate-300">{log.user}</td>
                    <td className="py-3.5 px-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        log.decision === 'ALLOWED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
