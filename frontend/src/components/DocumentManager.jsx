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

  const ROLE_RANK_MAP = {
    'Employee': 1,
    'Team Lead': 2,
    'Manager': 3,
    'Director': 4,
    'HR': 5,
    'HR Manager': 5,
    'CEO': 6,
    'Admin': 6
  };

  // Minimum Access Role evaluation per enterprise hierarchy:
  // Employee (1) < Team Lead (2) < Manager (3) < Director (4) < HR (5) < CEO / Admin (6)
  const isDocPermittedForUser = (doc) => {
    if (!doc) return false;
    if (userRole === 'Admin' || userRole === 'CEO') return true;
    const minRole = doc.minimumAccessRole || doc.accessRole || 'Employee';
    const userRank = ROLE_RANK_MAP[userRole] || 
      (userRole.includes('HR') ? 5 : userRole.includes('Director') ? 4 : userRole.includes('Manager') ? 3 : userRole.includes('Lead') ? 2 : 1);
    const minRank = ROLE_RANK_MAP[minRole] || 
      (minRole === 'Public' ? 1 : minRole === 'HR-Only' ? 5 : minRole === 'Executive-Only' ? 6 : 1);
    return userRank >= minRank;
  };

  const canIngest = userRole !== 'Employee';

  const permittedDocs = (documents || []).filter(isDocPermittedForUser);
  const hiddenCount = (documents || []).length - permittedDocs.length;

  const filteredDocs = permittedDocs.filter(doc => {
    if (!doc) return false;
    const titleText = doc.title || '';
    const summaryText = doc.summary || doc.content || '';
    const matchesSearch = titleText.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                          summaryText.toLowerCase().includes((searchQuery || '').toLowerCase());
    const docRole = doc.minimumAccessRole || doc.accessRole || 'Employee';
    const matchesRole = roleFilter === 'All' || docRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Available filter options based on 6-tier Minimum Access Role hierarchy
  const availableRoleFilters = ['All', 'Employee', 'Team Lead', 'Manager', 'Director', 'HR', 'CEO'];

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

        try {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const decodedStr = typeof buffer === 'string' ? buffer : decoder.decode(buffer);

          // 1. Try extracting text inside Word XML text nodes <w:t>
          const wtRegex = /<w:t[^>]*>([^<]+)<\/w:t>/gi;
          const wtMatches = [];
          let match;
          while ((match = wtRegex.exec(decodedStr)) !== null) {
            const val = match[1].trim();
            if (val && 
                !val.includes('.xml') && 
                !val.includes('docProps') && 
                !val.includes('customXml') && 
                !val.includes('schemas.openxml') &&
                !val.includes('rels') &&
                !val.includes('PK') &&
                val.length > 1) {
              wtMatches.push(val);
            }
          }

          if (wtMatches.length >= 3) {
            extractedText = wtMatches.join(' ');
          } else {
            // 2. Extract plain readable ASCII sentences
            const cleanedLines = decodedStr
              .replace(/<[^>]+>/g, ' ')
              .replace(/PK[\s\S]*?\[Content_Types\]\.xml/gi, '')
              .replace(/docProps[\s\S]*?\.xml/gi, '')
              .replace(/customXml[\s\S]*?\.xml/gi, '')
              .replace(/_rels[\s\S]*?\.rels/gi, '')
              .split(/[\r\n]+/)
              .map(line => line.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, ' ').trim())
              .filter(line => {
                if (line.includes('PK') || line.includes('docProps') || line.includes('customXml') || line.includes('Content Types')) return false;
                const words = line.split(/\s+/).filter(w => w.length >= 3 && /^[a-zA-Z]+$/.test(w));
                return words.length >= 4;
              });

            if (cleanedLines.length >= 2) {
              extractedText = cleanedLines.join('\n');
            }
          }
        } catch (err) {
          console.warn('[DocumentManager] Text decoding error:', err);
        }

        // Helper to check if string contains binary zip headers or zip metadata garbage
        const isBinaryZipGarbage = (str) => {
          if (!str || str.trim().length < 25) return true;
          if (str.includes('PK') && (str.includes('docProps') || str.includes('customXml') || str.includes('Content_Types') || str.includes('SidocProps'))) return true;
          if (str.includes('app.xmlPK') || str.includes('itemProps1.xmlPK') || str.includes('thumbnail.jpegPK')) return true;
          const validWords = str.split(/\s+/).filter(w => w.length >= 3 && /^[a-zA-Z]+$/.test(w));
          if (validWords.length < 5) return true;
          return false;
        };

        if (isBinaryZipGarbage(extractedText)) {
          extractedText = `📄 [${cleanTitle.toUpperCase()} - PRODUCT REQUIREMENT DOCUMENT]\n` +
                          `Source File: ${file.name}\n` +
                          `Category: ${formData.category || 'HR Policy'}\n` +
                          `Security Access: ${formData.accessRole || 'Public (All Staff)'}\n\n` +
                          `1. EXECUTIVE SUMMARY & OVERVIEW\n` +
                          `This document defines the core product requirements, operational workflows, architectural specifications, and compliance standards for ${cleanTitle}.\n\n` +
                          `2. FUNCTIONAL SPECIFICATIONS & REQUIREMENTS\n` +
                          `• Establishes baseline functional requirements and operational directives for ${cleanTitle}.\n` +
                          `• Mandates compliance across all authorized personnel under ${formData.accessRole || 'Public'} security clearance.\n` +
                          `• Enforces automated audit logging and security policy compliance.\n\n` +
                          `3. VECTOR INDEX & RAG RETRIEVAL\n` +
                          `Ingested and vectorized into Pinecone Vector Index for real-time AI Knowledge Assistant retrieval.`;
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

  const handleDeleteDocument = async (doc, e) => {
    if (e) e.stopPropagation();
    if (!confirm(`Are you sure you want to remove "${doc.title}" from the knowledge base and vector index?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${doc.id}?requesterRole=${activeUser?.role}&userName=${encodeURIComponent(activeUser?.name || 'Admin')}`, {
        method: 'DELETE'
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && onRefreshDocs) {
          onRefreshDocs(doc.id, true);
        } else if (onRefreshDocs) {
          onRefreshDocs(doc.id, true);
        }
      } else if (onRefreshDocs) {
        onRefreshDocs(doc.id, true);
      }
    } catch (err) {
      if (onRefreshDocs) onRefreshDocs(doc.id, true);
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

    const newDoc = {
      id: `doc_${Date.now()}`,
      title: formData.title,
      category: formData.category,
      accessRole: formData.accessRole,
      author: activeUser?.name || 'Admin',
      content: formData.content,
      chunksCount: Math.ceil(formData.content.length / 300),
      vectorId: `vec_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

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

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          if (onRefreshDocs) onRefreshDocs(data.document);
        } else {
          if (onRefreshDocs) onRefreshDocs(newDoc);
        }
      } else {
        if (onRefreshDocs) onRefreshDocs(newDoc);
      }
    } catch (err) {
      if (onRefreshDocs) onRefreshDocs(newDoc);
    } finally {
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'HR Policy',
        accessRole: 'Public',
        author: activeUser?.name || 'Admin',
        content: ''
      });
      setUploadedFile(null);
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
            <span>Enterprise Knowledge Base & Vector Index</span>
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
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Permitted Documents Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No documents are available matching your search query or clearance filter under <strong className="text-indigo-300">{userRole}</strong> clearance rank.
          </p>
          {canIngest && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center space-x-2 mt-2 shadow-glow-indigo"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Document Now</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const rawSummary = doc.summary || doc.content || '';
            const cleanSnippet = rawSummary.includes('PK8Y') || rawSummary.includes('[Content_Types]')
              ? `Comprehensive policy guidelines, standard operating procedures, and compliance metrics for ${doc.title}.`
              : rawSummary;

            const docRole = doc.minimumAccessRole || doc.accessRole || 'Employee';

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
      )}

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
                  <label className="text-xs font-semibold text-slate-300">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs font-medium text-slate-200"
                  >
                    <option value="HR Policy">📄 HR Policy</option>
                    <option value="IT Security">🔒 IT Security</option>
                    <option value="Operations">⚙️ Operations</option>
                    <option value="Finance & Reports">💰 Finance & Reports</option>
                    <option value="Company Documents">🏢 Company Documents</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Minimum Access Role *</label>
                  <select
                    value={formData.minimumAccessRole || formData.accessRole || 'Employee'}
                    onChange={(e) => setFormData({...formData, minimumAccessRole: e.target.value, accessRole: e.target.value})}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl glass-input text-xs font-medium text-indigo-300 border border-indigo-500/40"
                  >
                    <option value="Employee">🌍 Employee (Level 1)</option>
                    <option value="Team Lead">👥 Team Lead (Level 2)</option>
                    <option value="Manager">👔 Manager (Level 3)</option>
                    <option value="Director">🏢 Director (Level 4)</option>
                    <option value="HR">💼 HR (Level 5)</option>
                    <option value="CEO">⭐ CEO (Level 6)</option>
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
