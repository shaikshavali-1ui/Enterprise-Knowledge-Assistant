import React from 'react';
import { Shield, Sparkles, Cpu, Mail, UserCheck, LogOut } from 'lucide-react';

export default function Navbar({ activeUser, vectorStats, onSelectTab }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HR Manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Finance':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab && onSelectTab('landing')}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Enterprise Knowledge Assistant
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0 RAG
            </span>
          </div>
          <p className="text-xs text-slate-400">AI-Powered Enterprise Knowledge & Email Automation</p>
        </div>
      </div>

      {/* System Badges & Persona Profile */}
      <div className="flex items-center space-x-4">
        {/* Vector Engine Telemetry */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Vector Index:</span>
          <span className="text-indigo-300 font-semibold">{vectorStats?.totalChunks || 14} Chunks</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        {/* SMTP Status */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">SMTP:</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>

        {/* Active Security Persona & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <img
            src={activeUser?.avatar}
            alt={activeUser?.name}
            className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
          />
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-200">{activeUser?.name}</div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getRoleBadge(activeUser?.role)}`}>
                {activeUser?.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('landing')}
            title="Log out & return to Landing Page"
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-rose-300 text-slate-400 transition-colors flex items-center space-x-1.5 text-xs font-medium ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
