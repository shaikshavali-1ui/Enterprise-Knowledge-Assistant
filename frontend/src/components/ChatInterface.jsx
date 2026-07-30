import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  FileText, 
  ShieldAlert, 
  Mail, 
  Clock, 
  User, 
  ExternalLink,
  Bot,
  Info,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';
import SourceCitationModal from './SourceCitationModal';

export default function ChatInterface({ activeUser, presetQuery, setPresetQuery, onTriggerEmailDraft }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const messagesEndRef = useRef(null);

  const userId = activeUser?.id || 'usr_employee';
  const userName = activeUser?.name || 'Employee';
  const userRole = activeUser?.role || 'Employee';

  const promptChips = [
    "What is our annual leave & PTO entitlement for 2026?",
    "What hardware setup & $500 stipend is provided for onboarding?",
    "What are our 16-character password & VPN security guidelines?",
    "What are Q1 2026 executive compensation & RSU bands?"
  ];

  // Load user-isolated personal chat history from localStorage when activeUser changes
  useEffect(() => {
    if (!userId) return;

    const storageKey = `nexus_user_chat_${userId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (err) {
        setMessages(getInitialGreeting());
      }
    } else {
      const initial = getInitialGreeting();
      setMessages(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [userId]);

  function getInitialGreeting() {
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: `Hello ${userName}! I am your AI Knowledge Assistant. Ask me any policy or process question. Your active security clearance is [${userRole}].`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: []
      }
    ];
  }

  function saveUserMessages(newMsgs) {
    setMessages(newMsgs);
    if (userId) {
      localStorage.setItem(`nexus_user_chat_${userId}`, JSON.stringify(newMsgs));
    }
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your personal chat history?")) {
      const initial = getInitialGreeting();
      saveUserMessages(initial);
    }
  };

  useEffect(() => {
    if (presetQuery) {
      setInputValue(presetQuery);
      handleSendMessage(presetQuery);
      if (setPresetQuery) setPresetQuery('');
    }
  }, [presetQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = null) => {
    const queryText = textToSend || inputValue;
    if (!queryText.trim() || loading) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgsWithUser = [...messages, userMsg];
    saveUserMessages(updatedMsgsWithUser);
    setInputValue('');
    setLoading(true);

    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          userId,
          userRole
        })
      });

      const data = await res.json();

      if (data.success && data.data) {
        const botMsg = {
          id: `msg_${Date.now()}_bot`,
          sender: 'assistant',
          text: data.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.data.sources || [],
          suggestEmail: data.data.suggestEmail,
          filteredOut: data.data.filteredOutDueToRBAC || 0
        };
        saveUserMessages([...updatedMsgsWithUser, botMsg]);
      } else {
        const errorMsg = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ ${data.message || 'Error processing query'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        saveUserMessages([...updatedMsgsWithUser, errorMsg]);
      }
    } catch (err) {
      const networkErrorMsg = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ Network Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      saveUserMessages([...updatedMsgsWithUser, networkErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
      {/* Header Banner */}
      <div className="p-4 px-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Enterprise RAG Query Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-400">Pinecone Vector Search • Role Access Guard: <strong className="text-indigo-300">{userRole}</strong></p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 font-mono flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Personal Private Chat • {userName}</span>
          </span>

          <button
            onClick={handleClearHistory}
            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 hover:border-rose-500/40 border border-slate-700 text-slate-300 hover:text-rose-300 transition-all flex items-center space-x-1 font-medium"
            title="Clear My Personal Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            {msg.sender === 'user' ? (
              <img
                src={activeUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={userName}
                className="w-9 h-9 rounded-full border border-indigo-500/40 object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {/* Content Bubble */}
            <div className={`max-w-2xl rounded-2xl p-4 space-y-2 text-sm ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                <span className="font-bold uppercase tracking-wider">{msg.sender === 'user' ? userName : 'Nexus AI Assistant'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* RBAC Restricted Notification Pill */}
              {msg.filteredOut > 0 && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>RBAC Guard:</strong> {msg.filteredOut} confidential document chunk(s) restricted under your <strong>{userRole}</strong> clearance.
                  </span>
                </div>
              )}

              {/* Verified Sources Cards */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Verified Citation Sources ({msg.sources.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.sources.map((src, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCitation(src)}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-bold text-slate-200 truncate">{src.title}</div>
                          <div className="text-[10px] text-indigo-400 font-mono">Similarity: {(src.similarity * 100).toFixed(1)}%</div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Automation Action Suggestion */}
              {msg.suggestEmail && onTriggerEmailDraft && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-indigo-500/30 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    Need official confirmation for this policy query?
                  </div>
                  <button
                    onClick={() => onTriggerEmailDraft(msg.text)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shrink-0 transition-colors shadow-sm"
                  >
                    Draft Email
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Searching vector embeddings and checking role clearance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Prompts:</span>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Query Input Footer Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask a corporate question as ${userName} (${userRole})...`}
            className="flex-1 px-4 py-3 rounded-xl glass-input text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5"
          >
            <span>Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Source Citation Drawer/Modal */}
      {selectedCitation && (
        <SourceCitationModal
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
}
