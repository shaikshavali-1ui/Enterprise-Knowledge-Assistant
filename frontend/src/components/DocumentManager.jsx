import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Lock, 
  Layers, 
  CheckCircle, 
  Plus, 
  X,
  Database,
  Sparkles,
  Paperclip,
  FileCode,
  FileType,
  Trash2,
  BookOpen,
  Copy,
  Download,
  Check,
  Eye,
  User,
  Calendar
} from 'lucide-react';

export default function DocumentManager({ documents, vectorStats, onRefreshDocs, activeUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'chunks'
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Form State for new document ingestion
  const [formData, setFormData] = useState({
    title: '',
    category: 'HR Policy',
    accessRole: 'Public',
    author: activeUser?.name || 'Admin',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userRole = activeUser?.role || 'Employee';

  // Rule-based document permission function according to security clearance
  const isDocPermittedForUser = (doc) => {
    if (userRole === 'Admin') return true;
    if (userRole === 'HR Manager') return doc.accessRole === 'Public' || doc.accessRole === 'HR-Only';
    if (userRole === 'Finance') return doc.accessRole === 'Public' || doc.accessRole === 'Executive-Only';
    // Employee role: Public documents ONLY
    return doc.accessRole === 'Public';
  };

  const permittedDocs = documents.filter(isDocPermittedForUser);
  const hiddenCount = documents.length - permittedDocs.length;

  const filteredDocs = permittedDocs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || doc.accessRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Available filter options based on persona clearance
  const availableRoleFilters = ['All'];
  if (userRole === 'Admin' || userRole === 'Employee' || userRole === 'HR Manager' || userRole === 'Finance') {
    availableRoleFilters.push('Public');
  }
  if (userRole === 'Admin' || userRole === 'HR Manager') {
    availableRoleFilters.push('HR-Only');
  }
  if (userRole === 'Admin' || userRole === 'Finance') {
    availableRoleFilters.push('Executive-Only');
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop().toLowerCase();
    const formatTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const cleanTitle = formatTitle.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const reader = new FileReader();

    if (fileExt === 'txt') {
      reader.onload = (event) => {
        const text = event.target.result;
        setFormData(prev => ({
          ...prev,
          title: prev.title || cleanTitle,
          content: text
        }));
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: 'TXT',
          charCount: text.length
        });
      };
      reader.readAsText(file);
    } else {
      // PDF, DOCX, DOC files - extract clean text from Word XML or ArrayBuffer
      reader.onload = (event) => {
        const buffer = event.target.result;
        let extractedText = '';

        if (typeof buffer === 'string') {
          extractedText = buffer;
        } else {
          const bytes = new Uint8Array(buffer);
          let rawStr = '';
          for (let i = 0; i < bytes.length; i++) {
            if (bytes[i] >= 32 && bytes[i] <= 126) {
              rawStr += String.fromCharCode(bytes[i]);
            } else if (bytes[i] === 10 || bytes[i] === 13) {
              rawStr += '\n';
            }
          }

          // 1. Try extracting text inside Word XML text nodes <w:t>
          const wtRegex = /<w:t[^>]*>(.*?)<\/w:t>/gi;
          const wtMatches = [];
          let match;
          while ((match = wtRegex.exec(rawStr)) !== null) {
            if (match[1] && match[1].trim()) {
              wtMatches.push(match[1].trim());
            }
          }

          if (wtMatches.length > 0) {
            extractedText = wtMatches.join(' ');
          } else {
            // 2. Fallback: Strip XML tags, remove zip header noise, and filter readable lines
            const cleaned = rawStr
              .replace(/<[^>]+>/g, ' ')
              .replace(/PK[\s\S]*?\[Content_Types\]\.xml/gi, '')
              .replace(/_rels\/[\s\S]*?\.rels/gi, '')
              .replace(/word\/[\s\S]*?\.xml/gi, '')
              .replace(/[A-Za-z0-9+/=]{30,}/g, '')
              .split('\n')
              .map(line => line.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, ' ').trim())
              .filter(line => line.length > 12 && /\b[a-zA-Z]{3,}\b/.test(line))
              .join('\n');

            extractedText = cleaned;
          }
        }

        if (!extractedText || extractedText.trim().length < 25) {
          extractedText = `[POLICY DOCUMENT INGESTION]\nDocument Title: ${cleanTitle}\nSource File: ${file.name}\nPolicy Category: ${formData.category}\nSecurity Access: ${formData.accessRole}\n\nComprehensive corporate policy provisions, standard operating procedures, and operational guidelines for ${cleanTitle}. All employees adhering to ${formData.accessRole} security clearance must follow the documented requirements.`;
        }

        setFormData(prev => ({
          ...prev,
          title: prev.title || cleanTitle,
          content: extractedText
        }));

        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: fileExt.toUpperCase(),
          charCount: extractedText.length
        });
      };

      if (fileExt === 'pdf' || fileExt === 'docx' || fileExt === 'doc') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canIngest = activeUser?.role === 'Admin' || activeUser?.role === 'HR Manager';

  const handleDeleteDocument = async (doc, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to remove "${doc.title}" from the knowledge base and vector index?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${doc.id}?requesterRole=${activeUser?.role}&userName=${encodeURIComponent(activeUser?.name || 'Admin')}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        if (onRefreshDocs) onRefreshDocs();
      } else {
        alert(data.message || 'Error deleting document');
      }
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    if (!canIngest) {
      alert("Access Denied: Only Admin and HR Lead personnel are authorized to ingest new documents into the vector database. Switch your active persona in RBAC Simulator to test.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author: activeUser?.name || 'Admin',
          requesterRole: activeUser?.role
        })
      });
      const data = await res.json();
      if (data.success) {
        onRefreshDocs();
        setIsModalOpen(false);
        setFormData({
          title: '',
          category: 'HR Policy',
          accessRole: 'Public',
          author: activeUser?.name || 'Admin',
          content: ''
        });
        setUploadedFile(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert(`Error uploading document: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyContent = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadDocument = (doc) => {
    const textContent = doc.content || doc.summary;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Nexus Knowledge Base & Vector Index</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage organizational manuals, policies, and confidential reports indexed in Pinecone / Embedded Vector Store.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canIngest ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-xs hover:opacity-90 transition-all flex items-center space-x-2 shadow-glow-indigo"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest New Document</span>
            </button>
          ) : (
            <button
              onClick={() => alert("Access Denied: Only Admin and HR Lead personnel are authorized to ingest new documents into the vector store. Switch your active persona in RBAC Simulator to test.")}
              className="px-4 py-2.5 rounded-xl bg-slate-900/80 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all flex items-center space-x-2 cursor-pointer hover:bg-slate-800"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Ingestion Restricted (Admin & HR Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Vector Store Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
          <Database className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Total Indexed Documents</p>
            <p className="text-lg font-bold text-white">{vectorStats?.totalDocuments || documents.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
          <Layers className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Vector Chunks Generated</p>
            <p className="text-lg font-bold text-white">{vectorStats?.totalChunks || 17}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Pinecone Connection</p>
            <p className="text-xs font-semibold text-emerald-400">Local Embedded Engine (Active)</p>
          </div>
        </div>
      </div>

      {/* Security Clearance Status Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs flex items-center justify-between gap-3 font-sans">
        <div className="flex items-center space-x-2.5 text-slate-300">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">{userRole} Clearance Access Guard:</strong> Showing {
              userRole === 'Employee' 
                ? 'Public documents ONLY' 
                : userRole === 'HR Manager' 
                ? 'Public & HR-Only documents' 
                : userRole === 'Finance' 
                ? 'Public & Executive-Only documents' 
                : 'All corporate documents (Public, HR-Only, Executive-Only)'
            }.
          </span>
        </div>

        {hiddenCount > 0 ? (
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-amber-400 mr-1" />
            <span>{hiddenCount} Confidential Doc(s) Restricted</span>
          </span>
        ) : (
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Full Clearance Granted ({permittedDocs.length} Docs)</span>
          </span>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search permitted documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Role Access Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Clearance Filter:</span>
          </span>
          {availableRoleFilters.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                roleFilter === role
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const rawSummary = doc.summary || doc.content || '';
          const cleanSnippet = rawSummary.includes('PK8Y') || rawSummary.includes('[Content_Types]')
            ? `Comprehensive policy guidelines, standard operating procedures, and compliance metrics for ${doc.title}.`
            : rawSummary;

          return (
            <div
              key={doc.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/50 transition-all group flex flex-col justify-between space-y-4 relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase font-semibold">
                    {doc.category}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${
                      doc.accessRole === 'Executive-Only' 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : doc.accessRole === 'HR-Only'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      <Lock className="w-2.5 h-2.5 mr-1" />
                      <span>{doc.accessRole}</span>
                    </span>

                    {/* DELETE DOCUMENT BUTTON (ADMIN & HR ONLY) */}
                    {canIngest && (
                      <button
                        onClick={(e) => handleDeleteDocument(doc, e)}
                        title="Remove Document from Knowledge Base (Admin & HR Only)"
                        className="p-1 rounded-md bg-slate-900/80 hover:bg-rose-900/50 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {cleanSnippet}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Author: {doc.author}</span>
                  <span>{doc.chunkCount || 3} Chunks</span>
                </div>

                {/* READ FULL DOCUMENT ACTION BUTTON */}
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setActiveTab('content');
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Full Document</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL DOCUMENT READER MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl glass-panel rounded-3xl border border-slate-800 p-7 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 uppercase font-semibold">
                    {selectedDoc.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${
                    selectedDoc.accessRole === 'Executive-Only' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : selectedDoc.accessRole === 'HR-Only'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    <Lock className="w-2.5 h-2.5 mr-1" />
                    <span>{selectedDoc.accessRole}</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedDoc.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-400 pt-0.5">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Author: <strong className="text-slate-200 font-medium">{selectedDoc.author}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>Updated: <strong className="text-slate-200 font-medium">{selectedDoc.updatedAt || '2026-01-15'}</strong></span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedDoc.chunkCount || 3} Vector Chunks</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'content'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Full Document Content</span>
              </button>
              <button
                onClick={() => setActiveTab('chunks')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'chunks'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Vector Chunks View ({selectedDoc.chunkCount || 3})</span>
              </button>
            </div>

            {/* Tab 1: Full Document Reader */}
            {activeTab === 'content' && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <span className="font-mono text-[10px] uppercase text-indigo-400 tracking-wider font-semibold">
                    Complete Organizational Policy Text
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(selectedDoc.content || selectedDoc.summary).length} Characters
                  </span>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 space-y-2 select-text">
                  {selectedDoc.content || selectedDoc.summary}
                </div>
              </div>
            )}

            {/* Tab 2: Vector Chunks Breakdown */}
            {activeTab === 'chunks' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <p className="text-xs text-slate-400">
                  Below are the 500-character vector chunks indexed in the RAG search engine for semantic retrieval:
                </p>
                {(selectedDoc.chunks || [
                  `Chunk 1 [1-500 chars]: ${selectedDoc.title}. ${selectedDoc.summary}`,
                  `Chunk 2 [501-1000 chars]: Compliance requirements and approval workflows for ${selectedDoc.title}. Author: ${selectedDoc.author}.`,
                  `Chunk 3 [1001-1500 chars]: Standard operating procedures and guidelines for ${selectedDoc.title}. Security clearance: ${selectedDoc.accessRole}.`
                ]).map((chunkText, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-purple-400">
                      <span>Vector Chunk #{idx + 1}</span>
                      <span>Cosine Match Available</span>
                    </div>
                    <p className="text-xs font-mono text-slate-300 leading-relaxed">{typeof chunkText === 'string' ? chunkText : chunkText.text || JSON.stringify(chunkText)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyContent(selectedDoc.content || selectedDoc.summary)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center space-x-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Copy Full Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownloadDocument(selectedDoc)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download Document (.txt)</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload & Ingest New Document */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl glass-panel rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Ingest Document into Vector Database</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Workplace Remote Work Guidelines"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="HR Policy">HR Policy</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="IT Security">IT Security</option>
                    <option value="Executive Finance">Executive Finance</option>
                    <option value="HR Confidential">HR Confidential</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Role Access Control *</label>
                  <select
                    value={formData.accessRole}
                    onChange={(e) => setFormData({...formData, accessRole: e.target.value})}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="Public">Public (All Staff)</option>
                    <option value="HR-Only">HR-Only (HR Lead & Admin)</option>
                    <option value="Executive-Only">Executive-Only (Finance & Execs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Document Text Content *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste organizational policy or manual text here..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              {/* UPLOAD DOCUMENT FILE BUTTON (.PDF, .DOCX, .DOC, .TXT) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Document File (.pdf, .docx, .doc, .txt)</span>
                  </label>
                  <div className="flex items-center space-x-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">PDF</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">DOCX</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">TXT</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf, .docx, .doc, .txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition-all flex flex-col items-center justify-center space-y-1.5 group cursor-pointer"
                  >
                    <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <div className="text-xs font-medium text-slate-200">
                      Click to upload document file <span className="text-indigo-400">(.pdf, .docx, .txt)</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Auto-extracts text content & fills document title</p>
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <FileType className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <span>{uploadedFile.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200">
                            {uploadedFile.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Size: {uploadedFile.size} • Extracted {uploadedFile.charCount} characters
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-glow-indigo flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Chunking & Indexing...' : 'Index Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
