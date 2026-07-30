import React from 'react';
import { X, FileText, Lock, Sparkles } from 'lucide-react';

export default function SourceCitationModal({ citation, onClose }) {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl animate-pulse-subtle">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{citation.title}</h3>
              <p className="text-xs text-slate-400">Category: {citation.category} • Chunk ID: {citation.chunkId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Relevance Score:</span>
              <p className="text-base font-bold text-indigo-300 mt-0.5">{citation.relevanceScore}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-slate-400">Security Clearance Level:</span>
              <p className="text-xs font-mono font-semibold text-emerald-400 mt-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>{citation.accessRole}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Raw Extracted Passage (Vector Search Payload)
            </label>
            <div className="mt-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {citation.snippet}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center space-x-1 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pinecone Semantic Match Verified</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
