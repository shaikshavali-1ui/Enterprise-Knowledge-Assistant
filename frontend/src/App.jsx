import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import EmailHub from './components/EmailHub';
import RoleSimulator from './components/RoleSimulator';
import AuditLogs from './components/AuditLogs';
import LandingPage from './components/LandingPage';

// Enterprise Knowledge Assistant - Core App Component
export default function App() {
  const initialDefaultUsers = [
    {
      id: 'usr_admin',
      email: 'admin@enterprise.com',
      name: 'Sarah Connor (System Admin)',
      role: 'Admin',
      department: 'Executive Management',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_hr',
      email: 'hr.manager@enterprise.com',
      name: 'Elena Rostova (HR Lead)',
      role: 'HR Manager',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_finance',
      email: 'finance.lead@enterprise.com',
      name: 'Marcus Vance (Finance Director)',
      role: 'Finance',
      department: 'Finance & Payroll',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_employee',
      email: 'dev.john@enterprise.com',
      name: 'John Doe (Software Engineer)',
      role: 'Employee',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_shavali',
      email: 'shavali@enterprise.com',
      name: 'Shavali (Software Engineer)',
      role: 'Employee',
      department: 'Engineering Division',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const [currentTab, setCurrentTab] = useState('landing');
  const [users, setUsers] = useState(initialDefaultUsers);
  const [activeUser, setActiveUser] = useState(initialDefaultUsers[3]);
  const [documents, setDocuments] = useState([]);
  const [vectorStats, setVectorStats] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [conversationLogs, setConversationLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // State for passing query from dashboard to chat
  const [presetQuery, setPresetQuery] = useState('');
  // State for passing RAG action suggestion to Email Hub
  const [emailDraftPreset, setEmailDraftPreset] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
    fetchDocuments();
    fetchEmailLogs();
    fetchConversationLogs();
    fetchAuditLogs();
  }, []);

  const fetchUsers = async (newEmp = null) => {
    if (newEmp) {
      setUsers(prev => [newEmp, ...prev]);
      return;
    }
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
        setVectorStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await fetch('/api/email/logs');
      const data = await res.json();
      if (data.success) {
        setEmailLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching email logs:', err);
    }
  };

  const fetchConversationLogs = async () => {
    try {
      const res = await fetch('/api/logs/conversations');
      const data = await res.json();
      if (data.success) {
        setConversationLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching conversation logs:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/logs/audit');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const handleSwitchUser = async (userId) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setActiveUser(data.user);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error('Error switching user persona:', err);
    }
  };

  const handleTriggerEmailDraft = (emailAction) => {
    setEmailDraftPreset(emailAction);
    setCurrentTab('email');
  };

  const handleLoginSuccess = (verifiedUser) => {
    if (verifiedUser) {
      setActiveUser(verifiedUser);
    }
    setCurrentTab('dashboard');
    fetchAuditLogs();
  };

  if (currentTab === 'landing') {
    return (
      <LandingPage 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Header Navbar */}
      <Navbar 
        activeUser={activeUser} 
        vectorStats={vectorStats} 
        onSelectTab={setCurrentTab}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeUser={activeUser}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentTab === 'dashboard' && (
            <Dashboard
              documents={documents}
              vectorStats={vectorStats}
              emailLogs={emailLogs}
              conversationLogs={conversationLogs}
              activeUser={activeUser}
              setCurrentTab={setCurrentTab}
              setPresetQuery={setPresetQuery}
            />
          )}

          {currentTab === 'chat' && (
            <ChatInterface
              activeUser={activeUser}
              presetQuery={presetQuery}
              setPresetQuery={setPresetQuery}
              onTriggerEmailDraft={handleTriggerEmailDraft}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentManager
              documents={documents}
              vectorStats={vectorStats}
              onRefreshDocs={fetchDocuments}
              activeUser={activeUser}
            />
          )}

          {currentTab === 'email' && (
            <EmailHub
              emailLogs={emailLogs}
              onRefreshLogs={fetchEmailLogs}
              activeUser={activeUser}
              emailDraftPreset={emailDraftPreset}
            />
          )}

          {currentTab === 'rbac' && (
            <RoleSimulator
              users={users}
              activeUser={activeUser}
              onSwitchUser={handleSwitchUser}
              documents={documents}
              onRefreshUsers={fetchUsers}
            />
          )}

          {currentTab === 'logs' && (
            <AuditLogs
              conversationLogs={conversationLogs}
              auditLogs={auditLogs}
              activeUser={activeUser}
            />
          )}
        </main>
      </div>
    </div>
  );
}
