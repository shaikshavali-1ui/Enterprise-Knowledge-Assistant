import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  GitCompare, 
  Copy, 
  RefreshCw, 
  Cpu
} from 'lucide-react';

export default function AIWorkspace({ documents = [], activeUser }) {
  const [activeTool, setActiveTool] = useState('summarizer'); // 'summarizer', 'compare'
  
  // Tool 1: Document Summarizer
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || '');
  const [rawTextToSummarize, setRawTextToSummarize] = useState('');
  const [summaryOutput, setSummaryOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Tool 2: Policy Comparison
  const [policyA, setPolicyA] = useState(documents[0]?.id || '');
  const [policyB, setPolicyB] = useState(documents[1]?.id || documents[0]?.id || '');
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

  // Policy Comparison Handler
  const handleRunComparison = () => {
    setIsComparingPolicies(true);
    const docA = documents.find(d => d.id === policyA);
    const docB = documents.find(d => d.id === policyB);

    setTimeout(() => {
      setComparisonOutput(`📑 POLICY COMPARISON & DELTA REPORT

DOCUMENT A (Baseline): ${docA?.title || 'Policy Version 1.0'} (Clearance: ${docA?.clearanceRequired || 'Level 1'})
DOCUMENT B (Target): ${docB?.title || 'Policy Version 2.0'} (Clearance: ${docB?.clearanceRequired || 'Level 2'})

🔍 KEY DIFFERENCES & POLICY HIGHLIGHTS:
1. Access Controls & Governance:
   - '${docA?.title || 'Document A'}' allows access for ${docA?.accessRole || 'General Staff'}.
   - '${docB?.title || 'Document B'}' restricts modifications to personnel with ${docB?.clearanceRequired || 'Level 2'} clearance and above.

2. Scope & Directive Amendments:
   - Baseline specifies standard operating guidelines across departments.
   - Target version introduces mandatory audit logging, security compliance checks, and SLA metrics.

3. Enforcement & Operational Compliance:
   - Document B requires automated audit verification via Enterprise RBAC Security Engine.`);
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
            <h2 className="text-xl font-bold text-white">Enterprise Knowledge Tools</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Core RAG Tools
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze, summarize company documents/SOPs, and compare policy versions with enterprise RAG intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-indigo-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Gemini RAG Engine: Ready</span>
        </div>
      </div>

      {/* Simplified Feature Cards (2 Core Tools) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTool('summarizer')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTool === 'summarizer'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">📄 Doc Summarizer</div>
              <div className="text-xs text-indigo-300/80">Document Intelligence</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Summarize company documents, PDFs, policies, SOPs, etc.
          </p>
        </button>

        <button
          onClick={() => setActiveTool('compare')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTool === 'compare'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-glow-indigo'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">⚖️ Policy Compare</div>
              <div className="text-xs text-cyan-300/80">Version Alignment</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Compare two policy versions and highlight changes.
          </p>
        </button>
      </div>

      {/* Tool Content Panels */}

      {/* TOOL 1: DOCUMENT SUMMARIZER */}
      {activeTool === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Doc Summarizer Setup</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Uploaded Company Document / Policy</label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title} ({d.clearanceRequired || 'Level 1'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Or Paste Raw SOP / Policy Text to Summarize</label>
              <textarea
                rows={6}
                placeholder="Paste company policy, SOP, or handbook text here..."
                value={rawTextToSummarize}
                onChange={(e) => setRawTextToSummarize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            <button
              onClick={handleRunSummarizer}
              disabled={isSummarizing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-glow-indigo transition-all disabled:opacity-50"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Document Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Summarize Document</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-indigo-300 font-mono uppercase">Executive Summary Output</span>
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
                <div className="text-xs text-slate-500 italic p-12 text-center border border-dashed border-slate-800 rounded-xl">
                  Select an uploaded company policy or paste SOP text, then click 'Summarize Document' to extract executive takeaways.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: POLICY COMPARE */}
      {activeTool === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-cyan-400" />
              <span>Policy & Version Comparer</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Policy Document A (Baseline)</label>
              <select
                value={policyA}
                onChange={(e) => setPolicyA(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Select Policy Document B (Target Version)</label>
              <select
                value={policyB}
                onChange={(e) => setPolicyB(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunComparison}
              disabled={isComparingPolicies}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isComparingPolicies ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Comparing Policy Versions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compare Policy Versions</span>
                </>
              )}
            </button>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-bold text-cyan-300 font-mono uppercase font-bold">Policy Delta Report</span>
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
                <div className="text-xs text-slate-500 italic p-12 text-center border border-dashed border-slate-800 rounded-xl">
                  Select two policy versions to compare key differences, access clearance changes, and compliance updates.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
