import React from 'react';
import { ShieldCheck, Cpu, Mail, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 glass-panel py-4 px-6 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3 mt-auto">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="font-bold text-slate-200">Enterprise Knowledge Assistant</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          v2.0 Enterprise
        </span>
        <span className="text-slate-500">| Build 2026.08</span>
      </div>

      <div className="flex items-center space-x-4 text-[11px]">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>4-Tier Security RBAC</span>
        </span>
        <span className="flex items-center space-x-1">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini 2.5 Flash RAG</span>
        </span>
        <span className="flex items-center space-x-1">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span>Gmail SMTP</span>
        </span>
      </div>

      <div className="text-slate-500 text-[11px]">
        © 2026 Enterprise Knowledge Platform. All rights reserved.
      </div>
    </footer>
  );
}
