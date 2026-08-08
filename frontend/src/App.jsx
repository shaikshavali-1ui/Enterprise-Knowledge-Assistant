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
import AIWorkspace from './components/AIWorkspace';
import Footer from './components/Footer';

// Enterprise Knowledge Assistant - Core App Component
export default function App() {
  const initialDefaultUsers = [
    {
      id: 'usr_admin',
      email: 'admin@enterprise.com',
      name: 'Sarah Connor (System Admin)',
      role: 'Admin',
      securityClearance: 'Level 6',
      department: 'Executive Management',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_ceo',
      email: 'ceo@enterprise.com',
      name: 'Vikram Malhotra (CEO)',
      role: 'CEO',
      securityClearance: 'Level 6',
      department: 'Executive Board',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_hr',
      email: 'hr.manager@enterprise.com',
      name: 'Elena Rostova (HR Lead)',
      role: 'HR',
      securityClearance: 'Level 5',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_director',
      email: 'director@enterprise.com',
      name: 'Marcus Vance (Engineering Director)',
      role: 'Director',
      securityClearance: 'Level 4',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_manager',
      email: 'manager@enterprise.com',
      name: 'Priya Sharma (Operations Manager)',
      role: 'Manager',
      securityClearance: 'Level 3',
      department: 'Operations',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_lead',
      email: 'lead@enterprise.com',
      name: 'Alex Mercer (Team Lead)',
      role: 'Team Lead',
      securityClearance: 'Level 2',
      department: 'Software Engineering',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_shavali',
      email: 'shavali@enterprise.com',
      name: 'Shaik Shavali (Software Engineer)',
      role: 'Employee',
      securityClearance: 'Level 1',
      department: 'Engineering Division',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const [currentTab, setCurrentTab] = useState('landing');
  const initialDefaultDocuments = [
    {
      id: 'doc_hr_leave_2026',
      title: 'Enterprise Annual Leave & Paid Time Off (PTO) Policy 2026',
      category: 'Leave Policy',
      minimumAccessRole: 'Employee',
      accessRole: 'Employee',
      author: 'Elena Rostova',
      summary: 'Comprehensive policy detailing paid vacation, sick leave entitlements, parental leave, and approval workflows.',
      content: 'SECTION 1: ANNUAL LEAVE ENTITLEMENT\nFull-time employees are entitled to 22 working days of paid annual leave per calendar year.'
    },
    {
      id: 'doc_onboarding_guide',
      title: 'New Hire Employee Onboarding & Workplace Setup Manual',
      category: 'Onboarding Documents',
      minimumAccessRole: 'Employee',
      accessRole: 'Employee',
      author: 'HR Operations',
      summary: 'Step-by-step onboarding guide for newly hired personnel, IT equipment issuance, and week-1 orientation checklist.',
      content: 'SECTION 1: DAY 1 ORIENTATION & WELCOME\n09:00 AM: Check-in at main reception / Join virtual orientation call with HR representative.'
    },
    {
      id: 'doc_it_security_2026',
      title: 'Corporate IT Security, VPN Guidelines & Access Control Policy',
      category: 'IT Security',
      minimumAccessRole: 'Team Lead',
      accessRole: 'Team Lead',
      author: 'System Admin',
      summary: 'Mandatory security protocol for remote VPN access, 2FA hardware keys, and password rotation schedules.',
      content: 'SECTION 1: VPN & REMOTE ACCESS PROTOCOLS\nAll remote sessions must route through Enterprise WireGuard VPN.'
    },
    {
      id: 'doc_exec_comp_2026',
      title: 'Q1 Executive Compensation Bands & Bonus Multipliers 2026',
      category: 'Budget Reports',
      minimumAccessRole: 'Director',
      accessRole: 'Director',
      author: 'Sarah Connor (CTO)',
      summary: 'Confidential executive salary scale, performance bonus tiers, and stock option vesting schedule.',
      content: 'CONFIDENTIAL EXECUTIVE DOCUMENT\nLevel 4 Executive Salary Bands and Q1 Performance Multipliers.'
    }
  ];

  const [users, setUsers] = useState(initialDefaultUsers);
  const [activeUser, setActiveUser] = useState(initialDefaultUsers[0]);
  const [documents, setDocuments] = useState(initialDefaultDocuments);
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

  const isJsonResponse = (res) => {
    const contentType = res.headers.get('content-type');
    return res.ok && contentType && contentType.includes('application/json');
  };

  const fetchUsers = async (newEmp = null) => {
    if (newEmp) {
      if (Array.isArray(newEmp)) {
        setUsers(newEmp);
      } else {
        setUsers(prev => [newEmp, ...prev.filter(u => u.id !== newEmp.id)]);
      }
      return;
    }
    try {
      const res = await fetch('/api/auth/users');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
    }
  };

  const fetchDocuments = async (actionItem = null, isDelete = false) => {
    if (actionItem) {
      if (isDelete) {
        setDocuments(prev => prev.filter(d => d.id !== actionItem));
      } else {
        setDocuments(prev => [actionItem, ...prev]);
      }
      return;
    }
    try {
      const res = await fetch('/api/documents');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents);
          setVectorStats(data.stats);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
    }
  };

  const fetchEmailLogs = async (newLog = null) => {
    if (newLog) {
      setEmailLogs(prev => [newLog, ...prev]);
      return;
    }
    try {
      const res = await fetch('/api/email/logs');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setEmailLogs(data.logs);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
    }
  };

  const fetchConversationLogs = async () => {
    try {
      const res = await fetch('/api/logs/conversations');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setConversationLogs(data.logs);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/logs/audit');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setAuditLogs(data.logs);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
    }
  };

  const handleSwitchUser = async (userId) => {
    const matched = users.find(u => u.id === userId);
    if (matched) {
      setActiveUser(matched);
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.success) {
          setActiveUser(data.user);
        }
      }
    } catch (err) {
      // Suppress static HTML rewrite fetch warnings
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
              onTriggerEmailDraft={handleTriggerEmailDraft}
            />
          )}

          {currentTab === 'ai-workspace' && (
            <AIWorkspace
              documents={documents}
              activeUser={activeUser}
              onTriggerEmailDraft={handleTriggerEmailDraft}
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
              users={users}
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

          {/* Footer Banner */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
