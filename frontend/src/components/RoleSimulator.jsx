import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  Lock, 
  Unlock, 
  Search, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Eye,
  EyeOff,
  Key,
  X,
  Mail,
  User,
  ArrowRight
} from 'lucide-react';

export default function RoleSimulator({ users, activeUser, onSwitchUser, documents, onRefreshUsers }) {
  const [testQuery, setTestQuery] = useState('What are Q1 executive compensation bands & bonus multipliers?');
  const [employeeResult, setEmployeeResult] = useState(null);
  const [adminResult, setAdminResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Persona Auth Verification Modal state
  const [selectedUserForAuth, setSelectedUserForAuth] = useState(null);
  const [authPassword, setAuthPassword] = useState('password123');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // New Employee Onboarding state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Engineering');
  const [addStatusMessage, setAddStatusMessage] = useState('');

  const canOnboard = activeUser?.role === 'Admin' || activeUser?.role === 'HR Manager';

  const handleOpenAuthModal = (u) => {
    setSelectedUserForAuth(u);
    setAuthPassword('password123');
    setShowAuthPassword(false);
    setAuthError('');
  };

  const handleConfirmSwitchPersona = (e) => {
    e.preventDefault();
    if (!authPassword) {
      setAuthError('Please enter password to verify user identity.');
      return;
    }
    if (selectedUserForAuth) {
      onSwitchUser(selectedUserForAuth.id);
      setSelectedUserForAuth(null);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddStatusMessage('');

    if (!canOnboard) {
      setAddStatusMessage("❌ Access Denied: Only Admin and HR Lead personnel can onboard new employees.");
      return;
    }

    try {
      const res = await fetch('/api/auth/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          department: newDept,
          requesterRole: activeUser?.role
        })
      });

      const data = await res.json();
      if (data.success) {
        setAddStatusMessage(`✅ ${data.message}`);
        setNewName('');
        setNewEmail('');
        if (onRefreshUsers) onRefreshUsers();
        setTimeout(() => setShowAddModal(false), 1500);
      } else {
        setAddStatusMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setAddStatusMessage(`❌ Failed to connect to server.`);
    }
  };

  const handleCompareRBAC = async () => {
    setIsComparing(true);
    try {
      // 1. Run search as Employee
      const empRes = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, userRole: 'Employee' })
      });
      const empData = await empRes.json();
      setEmployeeResult(empData.data);

      // 2. Run search as Admin / HR Manager
      const admRes = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, userRole: 'Admin' })
      });
      const admData = await admRes.json();
      setAdminResult(admData.data);
    } catch (err) {
      alert(`Error comparing RBAC: ${err.message}`);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with HR Onboarding CTA */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Role-Based Access Control (RBAC) & User Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Switch active user persona or onboard new organization personnel to simulate document security clearance.
          </p>
        </div>

        {canOnboard ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg flex items-center space-x-2 shrink-0"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ Onboard New Employee</span>
          </button>
        ) : (
          <button
            onClick={() => alert("Access Denied: Only Admin and HR Lead personnel are authorized to onboard new employees. Switch your active persona to Elena Rostova (HR Lead) or Sarah Connor (Admin) to test.")}
            className="px-4 py-2.5 rounded-xl bg-slate-900/80 text-amber-300 border border-amber-500/30 font-medium text-xs transition-all flex items-center space-x-2 shrink-0 cursor-pointer hover:bg-slate-800"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Onboarding Restricted (Admin & HR Only)</span>
          </button>
        )}
      </div>

      {/* RBAC Simulation Explanation Banner */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Security Clearance Testing Mode:</strong> Click <strong>"Simulate Persona"</strong> to verify employee credentials (Email & Password) and simulate how RAG AI answers adapt to that user's security clearance.
          </span>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
          Current Active: {activeUser?.name} ({activeUser?.role})
        </span>
      </div>

      {/* User Persona Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map(u => {
          const isActive = activeUser?.id === u.id;
          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-900/80 to-purple-900/60 border-2 border-indigo-500 shadow-glow-indigo'
                  : 'glass-panel glass-panel-hover border border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center space-x-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full border border-indigo-500/40 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{u.name}</h4>
                    <p className="text-xs text-slate-400">{u.department}</p>
                  </div>
                </div>

                {/* Display Official Corporate Email */}
                <div className="mt-3 text-[11px] font-mono text-indigo-300 bg-slate-950/80 p-1.5 px-2.5 rounded-lg border border-slate-800 truncate">
                  {u.email}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    u.role === 'Admin'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : u.role === 'HR Manager'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : u.role === 'Finance'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}>
                    {u.role}
                  </span>
                  {isActive && (
                    <span className="text-[11px] text-indigo-300 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                {/* EXPLICIT PERSONA SWITCH BUTTON */}
                <button
                  onClick={() => handleOpenAuthModal(u)}
                  disabled={isActive}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200 cursor-default border border-indigo-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo'
                  }`}
                >
                  {isActive ? 'Active Persona' : 'Simulate Persona'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREDENTIAL AUTHENTICATION & PERSONA SWITCH MODAL */}
      {selectedUserForAuth && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-indigo-500/40 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-400" />
                <span>Verify Employee Credentials</span>
              </h3>
              <button
                onClick={() => setSelectedUserForAuth(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target User Info Header */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-3.5">
              <img
                src={selectedUserForAuth.avatar}
                alt={selectedUserForAuth.name}
                className="w-12 h-12 rounded-full border-2 border-indigo-500/50 object-cover shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{selectedUserForAuth.name}</h4>
                <p className="text-xs text-slate-400">{selectedUserForAuth.department} • <span className="text-indigo-300 font-semibold">{selectedUserForAuth.role}</span></p>
                <p className="text-xs font-mono text-indigo-400 mt-0.5">{selectedUserForAuth.email}</p>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleConfirmSwitchPersona} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Company Email</label>
                <input
                  type="email"
                  disabled
                  value={selectedUserForAuth.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Account Password *</label>
                <div className="relative">
                  <input
                    type={showAuthPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl glass-input text-slate-100 font-mono"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAuthPassword(!showAuthPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                    title={showAuthPassword ? "Hide Password" : "Show Password"}
                  >
                    {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Default Demo Password: <strong className="text-indigo-400">password123</strong></p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAuth(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo flex items-center space-x-2"
                >
                  <span>Authenticate & Switch Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Security Benchmark & Comparison Tool */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Live Security Clearance Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Run a search query concurrently as <strong className="text-slate-200">Employee</strong> vs <strong className="text-rose-300">Admin</strong> to verify security boundaries.
            </p>
          </div>

          <button
            onClick={handleCompareRBAC}
            disabled={isComparing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-xs hover:opacity-90 transition-all shadow-glow-indigo shrink-0"
          >
            {isComparing ? 'Comparing Vector Results...' : 'Run Security Benchmark'}
          </button>
        </div>

        {/* Input Query for Comparison */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Test Query String</label>
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Comparison Side-by-Side Results */}
        {(employeeResult || adminResult) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Employee Result */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-300 uppercase tracking-wider font-mono">Employee Search Output</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Public Rules Only
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{employeeResult?.answer}</p>
              {employeeResult?.filteredOutDueToRBAC > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Hidden: {employeeResult.filteredOutDueToRBAC} executive documents</span>
                </div>
              )}
            </div>

            {/* Admin Result */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-300 uppercase tracking-wider font-mono">Admin Search Output</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Full Un-gated Access
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{adminResult?.answer}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Onboard New Employee */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-indigo-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Onboard New Organization Personnel</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addStatusMessage && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                {addStatusMessage}
              </div>
            )}

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300">Full Employee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="alex.m@enterprise.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300">Role Security Clearance</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                  >
                    <option value="Employee">Employee (Public Only)</option>
                    <option value="HR Manager">HR Manager (HR-Only)</option>
                    <option value="Finance">Finance (Executive-Only)</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Payroll">Finance & Payroll</option>
                    <option value="Executive Management">Executive Management</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-glow-indigo"
                >
                  Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
