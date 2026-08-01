import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Mail, 
  ShieldAlert, 
  Clock,
  Sparkles,
  Home
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, activeUser }) {
  const isHrOrAdmin = activeUser?.role === 'HR Manager' || activeUser?.role === 'Admin';

  const navItems = [
    { id: 'landing', label: 'Landing Page', icon: Home, badge: 'Home' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'chat', label: 'Knowledge Chat (RAG)', icon: MessageSquare, badge: 'AI' },
    { id: 'documents', label: 'Document Base', icon: FileText, badge: 'Vector' },
    { id: 'email', label: 'Email Automation', icon: Mail, badge: 'SMTP' },
    { id: 'rbac', label: 'RBAC Simulator', icon: ShieldAlert, badge: activeUser?.role },
    { id: 'logs', label: 'Audit & Logs', icon: Clock, badge: isHrOrAdmin ? 'Admin & HR' : '🔒 Restricted' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 glass-panel flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 px-3 py-1 border-b border-slate-800/60 pb-3">
          <div>
            <span className="font-bold text-xs text-white tracking-wider block uppercase">ENTERPRISE KNOWLEDGE</span>
            <span className="text-[9px] block text-indigo-400 font-semibold tracking-widest uppercase -mt-0.5">ASSISTANT</span>
          </div>
        </div>

        {/* Navigation Group Header */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Workspace Modules
          </p>
          <nav className="mt-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-glow-indigo'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isActive ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Quick Prompt Helper Box */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/20 text-xs space-y-2">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Active Access Guard</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Logged in as <strong className="text-slate-200">{activeUser?.name}</strong> with <strong className="text-indigo-300">{activeUser?.role}</strong> privileges.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/80 text-center flex flex-col items-center space-y-1">
        <p className="text-[11px] text-slate-300 font-bold">Enterprise Knowledge Assistant</p>
        <p className="text-[10px] font-mono text-slate-600">Pinecone • OpenAI • Nodemailer</p>
      </div>
    </aside>
  );
}
