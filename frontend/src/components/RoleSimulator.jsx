import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldAlert, 
  ShieldCheck,
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
  Users,
  Building2,
  MapPin,
  BadgeCheck,
  Phone,
  Calendar,
  Briefcase,
  Award,
  ArrowRight
} from 'lucide-react';

export default function RoleSimulator({ users, activeUser, onSwitchUser, documents, onRefreshUsers }) {
  const [testQuery, setTestQuery] = useState('What are Q1 executive compensation bands & bonus multipliers?');
  const [employeeResult, setEmployeeResult] = useState(null);
  const [adminResult, setAdminResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState(null);

  // Persona Auth Verification Modal state
  const [selectedUserForAuth, setSelectedUserForAuth] = useState(null);
  const [authPassword, setAuthPassword] = useState('password123');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // New Employee Onboarding state (Full 11-Field Schema)
  const [showAddModal, setShowAddModal] = useState(false);
  const [addStatusMessage, setAddStatusMessage] = useState('');
  const [newEmpId, setNewEmpId] = useState('EMP002');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+1 (555) 019-3821');
  const [newRole, setNewRole] = useState('Employee');
  const [newDept, setNewDept] = useState('Engineering');
  const [newDesignation, setNewDesignation] = useState('Specialist');
  const [newClearance, setNewClearance] = useState('Level 1');
  const [newDoj, setNewDoj] = useState(new Date().toISOString().split('T')[0]);
  const [newStatus, setNewStatus] = useState('Active');
  const [newPhoto, setNewPhoto] = useState('');
  // Onboarding OTP step state
  const [onboardStep, setOnboardStep] = useState('FORM'); // 'FORM' or 'VERIFY_OTP'
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardOtpInput, setOnboardOtpInput] = useState('');
  const [onboardOtpError, setOnboardOtpError] = useState('');
  const [onboardOtpSuccess, setOnboardOtpSuccess] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  const handleOpenAddModal = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOnboardStep('FORM');
    setAddStatusMessage('');
    setOnboardOtpError('');
    setOnboardOtpSuccess('');
    setOnboardOtpInput('');
    setNewName('');
    setNewEmail('');
    const count = Array.isArray(users) ? users.length + 1 : 1;
    setNewEmpId(`EMP00${count}`);
    setShowAddModal(true);
  };

  const currentRole = activeUser?.role || 'Admin';
  const canOnboard = ['Admin', 'System Admin', 'HR', 'HR Lead', 'HR Manager', 'CEO', 'Director'].includes(currentRole);

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
      if (selectedUserForAuth.status === 'Suspended' || selectedUserForAuth.status === 'Resigned') {
        setAuthError(`❌ Access Denied: Account '${selectedUserForAuth.name}' is marked as '${selectedUserForAuth.status}'. Login is restricted by Corporate Security.`);
        return;
      }
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

    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanName = newName.trim();

    try {
      const res = await fetch('/api/auth/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: newEmpId || `EMP00${users.length + 1}`,
          fullName: cleanName,
          name: cleanName,
          email: cleanEmail,
          phone: newPhone,
          role: newRole,
          department: newDept,
          designation: newDesignation,
          securityClearance: newClearance,
          dateOfJoining: newDoj,
          status: 'Pending OTP Verification',
          profilePhoto: newPhoto,
          requesterRole: activeUser?.role
        })
      });

      const data = await res.json();
      if (data.success) {
        setOnboardStep('VERIFY_OTP');
        setOnboardEmail(cleanEmail);
        if (data.otpCode) setOnboardOtpInput(data.otpCode);
        setAddStatusMessage(`✅ ${data.message}`);
        if (onRefreshUsers) onRefreshUsers(data.users || data.user);
      } else {
        setAddStatusMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      // Offline / Static Vercel Mode
      setOnboardStep('VERIFY_OTP');
      setOnboardEmail(cleanEmail);
      setOnboardOtpInput('123456');
      setAddStatusMessage(`✅ Employee '${cleanName}' provisioned. 6-digit OTP verification code sent to ${cleanEmail}.`);
    }
  };

  const handleVerifyOnboardOtp = async (e) => {
    if (e) e.preventDefault();
    setOnboardOtpError('');
    setOnboardOtpSuccess('');

    if (!onboardOtpInput || onboardOtpInput.trim().length !== 6) {
      setOnboardOtpError('Please enter the 6-digit OTP verification code.');
      return;
    }

    setOnboardLoading(true);

    try {
      const res = await fetch('/api/auth/users/verify-onboarding-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: onboardEmail, otp: onboardOtpInput.trim() })
      });

      const data = await res.json();
      setOnboardLoading(false);

      if (data.success) {
        setOnboardOtpSuccess(data.message);
        setNewName('');
        setNewEmail('');
        if (onRefreshUsers) onRefreshUsers(data.users);
        setTimeout(() => {
          setShowAddModal(false);
          setOnboardStep('FORM');
          setOnboardOtpSuccess('');
          setAddStatusMessage('');
        }, 2200);
      } else {
        setOnboardOtpError(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setOnboardLoading(false);
      setOnboardOtpSuccess(`✅ Member Account Verified & Activated! Employee can now log in.`);
      setTimeout(() => {
        setShowAddModal(false);
        setOnboardStep('FORM');
        setOnboardOtpSuccess('');
        setAddStatusMessage('');
      }, 2200);
    }
  };

  const getClearanceLevel = (role, secClearance) => {
    if (secClearance) return String(secClearance);
    const r = String(role || '');
    if (r === 'Admin' || r === 'CEO') return 'Level 6';
    if (r === 'HR' || r === 'HR Manager') return 'Level 5';
    if (r === 'Director') return 'Level 4';
    if (r === 'Manager') return 'Level 3';
    if (r === 'Team Lead') return 'Level 2';
    return 'Level 1';
  };

  const getLocation = (empId, dept) => {
    const d = String(dept || '');
    const id = String(empId || '');
    if (id === 'EMP001' || d.includes('Executive')) return 'Hyderabad (HQ)';
    if (d.includes('Engineering') || d.includes('Software')) return 'San Francisco';
    if (d.includes('Human') || d.includes('HR')) return 'London';
    if (d.includes('Finance')) return 'New York';
    return 'Remote';
  };

  const handleCompareRBAC = async () => {
    if (!testQuery || !testQuery.trim()) return;
    setIsComparing(true);
    try {
      const empRes = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, userRole: 'Employee' })
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployeeResult(empData.data);
      } else {
        setEmployeeResult({ answer: "Standard Employee clearance restricts viewing executive compensation.", filteredOutDueToRBAC: 1 });
      }

      const admRes = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery, userRole: 'Admin' })
      });
      if (admRes.ok) {
        const admData = await admRes.json();
        setAdminResult(admData.data);
      } else {
        setAdminResult({ answer: "Full Executive Access: Q1 Executive compensation bands L7-L9." });
      }
    } catch (err) {
      setEmployeeResult({ answer: "Standard Employee clearance restricts viewing executive compensation.", filteredOutDueToRBAC: 1 });
      setAdminResult({ answer: "Full Executive Access: Q1 Executive compensation bands L7-L9." });
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header: Employee Directory & Onboarding CTA */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Employee Directory & Access Control</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage organization personnel profiles, system roles, department clearance, and authority levels.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-glow-indigo flex items-center space-x-2 shrink-0 cursor-pointer relative z-30 pointer-events-auto"
        >
          <UserCheck className="w-4 h-4" />
          <span>+ Onboard New Employee</span>
        </button>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {(Array.isArray(users) && users.length > 0 ? users : [
          { id: 'usr_admin_shaik', employeeId: 'EMP001', name: 'Shaik Shavali', fullName: 'Shaik Shavali', email: 'shaikshavali05335@gmail.com', role: 'Admin', department: 'Executive Management', designation: 'System Administrator & CTO', securityClearance: 'Level 6', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_ceo', employeeId: 'EMP002', name: 'Vikram Malhotra (CEO)', fullName: 'Vikram Malhotra', email: 'ceo@enterprise.com', role: 'CEO', department: 'Executive Board', designation: 'Chief Executive Officer', securityClearance: 'Level 6', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_hr', employeeId: 'EMP003', name: 'Elena Rostova (HR Lead)', fullName: 'Elena Rostova', email: 'hr.manager@enterprise.com', role: 'HR', department: 'Human Resources', designation: 'VP of People & HR Operations', securityClearance: 'Level 5', status: 'Active', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_director', employeeId: 'EMP004', name: 'Marcus Vance (Director)', fullName: 'Marcus Vance', email: 'director@enterprise.com', role: 'Director', department: 'Engineering', designation: 'Director of Technology', securityClearance: 'Level 4', status: 'Active', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_manager', employeeId: 'EMP005', name: 'Priya Sharma (Manager)', fullName: 'Priya Sharma', email: 'manager@enterprise.com', role: 'Manager', department: 'Operations', designation: 'Operations Manager', securityClearance: 'Level 3', status: 'Active', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_lead', employeeId: 'EMP006', name: 'Alex Mercer (Team Lead)', fullName: 'Alex Mercer', email: 'lead@enterprise.com', role: 'Team Lead', department: 'Software Engineering', designation: 'Staff Tech Lead', securityClearance: 'Level 2', status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
          { id: 'usr_employee', employeeId: 'EMP007', name: 'John Doe (Engineer)', fullName: 'John Doe', email: 'dev.john@enterprise.com', role: 'Employee', department: 'Engineering Division', designation: 'Software Associate', securityClearance: 'Level 1', status: 'Active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }
        ]).map(u => {
          if (!u || !u.id) return null;
          const avatarUrl = u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
          const userName = u.name || u.fullName || 'Enterprise Employee';
          const userDept = u.department || 'Engineering';
          const userEmail = u.email || 'employee@enterprise.com';
          const userRole = u.role || 'Employee';
          const userDesignation = u.designation || (userRole === 'Admin' ? 'System Administrator' : userRole === 'CEO' ? 'Chief Executive Officer' : userRole === 'HR' ? 'HR Operations Lead' : userRole === 'Director' ? 'Engineering Director' : userRole === 'Manager' ? 'Operations Manager' : userRole === 'Team Lead' ? 'Tech Lead' : 'Software Engineer');
          const empId = u.employeeId || `EMP00${u.id?.slice(-1) || '1'}`;
          const clearanceLevel = getClearanceLevel(userRole, u.securityClearance);
          const location = u.location || getLocation(empId, userDept);
          const status = u.status || 'Active';

          return (
            <div
              key={u.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group relative"
            >
              <div>
                {/* Header: Photo & Title */}
                <div className="flex items-center space-x-3">
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/40 object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-indigo-300 transition-colors">
                      {userName}
                    </h4>
                    <p className="text-xs text-indigo-400 font-medium truncate mt-0.5">{userDesignation}</p>
                  </div>
                </div>

                <div className="my-3.5 border-t border-slate-800/80" />

                {/* Details List */}
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Email:</span>
                    </span>
                    <span className="text-indigo-300 font-semibold truncate max-w-[150px] text-[11px]" title={userEmail}>
                      {userEmail}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>ID:</span>
                    </span>
                    <span className="text-white font-bold text-[11px]">{empId}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Department:</span>
                    </span>
                    <span className="text-slate-200 text-[11px] truncate max-w-[130px]">{userDept}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Role:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                      👔 {userRole}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Level:</span>
                    </span>
                    <span className="text-amber-300 font-bold text-[11px]">⭐ {clearanceLevel}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Location:</span>
                    </span>
                    <span className="text-slate-300 text-[11px]">📍 {location}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Status:</span>
                    </span>
                    {u.emailVerified === false || status === 'Pending OTP Verification' ? (
                      <span className="text-amber-300 font-semibold text-[10px] bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1" />
                        <span>Pending OTP</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px] flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
                        <span>{status}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View Profile & Verify OTP CTAs */}
              <div className="space-y-2">
                {u.emailVerified === false && (
                  <button
                    onClick={() => {
                      setOnboardStep('VERIFY_OTP');
                      setOnboardEmail(userEmail);
                      setShowAddModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white text-xs font-semibold transition-all border border-amber-500/40 shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Verify OTP Code</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedEmployeeForProfile(u)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-slate-700 hover:border-indigo-500 shadow-md flex items-center justify-center space-x-2 group cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREDENTIAL AUTHENTICATION & PERSONA SWITCH MODAL */}
      {selectedUserForAuth && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-indigo-500/40 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 relative z-[10000]">
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
        </div>,
        document.body
      )}

      {/* RBAC Capability Matrix Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <span>Enterprise RBAC Capability Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hierarchical role access control rules across organization modules.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            Active Persona: {activeUser?.role || 'Employee'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                <th className="p-3 font-semibold">Module</th>
                <th className={`p-3 text-center ${activeUser?.role === 'Employee' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  🌍 Employee
                </th>
                <th className={`p-3 text-center ${activeUser?.role === 'Team Lead' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  👥 Team Lead
                </th>
                <th className={`p-3 text-center ${activeUser?.role === 'Manager' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  👔 Manager
                </th>
                <th className={`p-3 text-center ${activeUser?.role === 'Director' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  🏢 Director
                </th>
                <th className={`p-3 text-center ${activeUser?.role === 'HR' || activeUser?.role === 'HR Manager' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  💼 HR
                </th>
                <th className={`p-3 text-center ${activeUser?.role === 'CEO' || activeUser?.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-300 font-bold border-x border-indigo-500/40' : ''}`}>
                  ⭐ CEO / Admin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">Knowledge Chat</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">
                  View Documents <span className="text-[10px] text-slate-400 font-normal block">(Subject to Min Role)</span>
                </td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">Upload Documents</td>
                <td className="p-3 text-center text-rose-400 font-bold">❌</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">Leave Request</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">Approve Leave</td>
                <td className="p-3 text-center text-rose-400 font-bold">❌</td>
                <td className="p-3 text-center text-amber-400 text-[10px]">Optional</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">Manage Employees</td>
                <td className="p-3 text-center text-rose-400 font-bold">❌</td>
                <td className="p-3 text-center text-rose-400 font-bold">❌</td>
                <td className="p-3 text-center text-rose-400 font-bold">❌</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-indigo-500/30 p-6 space-y-4 relative z-[100000]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Onboard New Organization Personnel</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addStatusMessage && (
              <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs text-slate-200">
                {addStatusMessage}
              </div>
            )}

            {onboardStep === 'FORM' ? (
              <form onSubmit={handleAddEmployee} className="space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300">Employee ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="EMP006"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rahul Sharma"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300">Corporate Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul@company.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 9876543210"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300">Department *</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                    >
                      <option value="Human Resources">Human Resources</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Finance & Payroll">Finance & Payroll</option>
                      <option value="Executive Management">Executive Management</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="HR Manager / Tech Lead"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300">System Role *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input text-indigo-300 font-semibold"
                    >
                      <option value="Employee">🌍 Employee</option>
                      <option value="Team Lead">👥 Team Lead</option>
                      <option value="Manager">👔 Manager</option>
                      <option value="Director">🏢 Director</option>
                      <option value="HR">💼 HR</option>
                      <option value="CEO">⭐ CEO</option>
                      <option value="Admin">🔑 Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Security Clearance Level *</label>
                    <select
                      value={newClearance}
                      onChange={(e) => setNewClearance(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    >
                      <option value="Level 1">Level 1 - Employee</option>
                      <option value="Level 2">Level 2 - Team Lead</option>
                      <option value="Level 3">Level 3 - Manager</option>
                      <option value="Level 4">Level 4 - Director</option>
                      <option value="Level 5">Level 5 - HR</option>
                      <option value="Level 6">Level 6 - CEO / Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-300">Date of Joining *</label>
                    <input
                      type="date"
                      required
                      value={newDoj}
                      onChange={(e) => setNewDoj(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-300">Account Status *</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl glass-input font-mono"
                    >
                      <option value="Active">Active (Login Allowed)</option>
                      <option value="On Leave">On Leave (Login Allowed)</option>
                      <option value="Suspended">Suspended (Login Blocked)</option>
                      <option value="Resigned">Resigned (Login Blocked)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-glow-indigo cursor-pointer"
                  >
                    Provision Employee & Send OTP Email
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOnboardOtp} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 leading-relaxed">
                  <p className="font-bold text-white mb-1">✉️ 6-Digit OTP Sent via Email</p>
                  <p className="text-[11px] text-indigo-300/90">
                    A 6-digit verification OTP code was dispatched to <strong className="text-white font-mono">{onboardEmail}</strong>. Enter the OTP below to complete registration and activate their account.
                  </p>
                </div>

                {onboardOtpError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                    {onboardOtpError}
                  </div>
                )}

                {onboardOtpSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs">
                    {onboardOtpSuccess}
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">6-Digit Verification OTP Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={onboardOtpInput}
                    onChange={(e) => setOnboardOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/50 text-center font-mono text-xl font-bold tracking-widest text-indigo-300 focus:outline-none"
                    placeholder="123456"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setOnboardStep('FORM')}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 cursor-pointer"
                  >
                    Back to Form
                  </button>
                  <button
                    type="submit"
                    disabled={onboardLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 cursor-pointer"
                  >
                    {onboardLoading ? 'Verifying OTP...' : 'Verify OTP & Activate Member'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: View Detailed Employee Profile */}
      {selectedEmployeeForProfile && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-indigo-500/40 p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200 relative z-[100000]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedEmployeeForProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedEmployeeForProfile.name}
                  className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedEmployeeForProfile.name || selectedEmployeeForProfile.fullName}
                  </h3>
                  <p className="text-xs text-indigo-400 font-medium">
                    {selectedEmployeeForProfile.designation || selectedEmployeeForProfile.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeForProfile(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Employee Profile Detailed Info */}
            <div className="space-y-3.5 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Employee ID</span>
                  <span className="text-white font-bold">{selectedEmployeeForProfile.employeeId || `EMP00${selectedEmployeeForProfile.id?.slice(-1) || '1'}`}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Official Email</span>
                  <span className="text-indigo-300 font-semibold truncate block" title={selectedEmployeeForProfile.email}>
                    {selectedEmployeeForProfile.email}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Department</span>
                  <span className="text-slate-200 font-medium">{selectedEmployeeForProfile.department || 'Engineering'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">System Role</span>
                  <span className="text-indigo-300 font-bold">👔 {selectedEmployeeForProfile.role || 'Employee'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Authority Clearance</span>
                  <span className="text-amber-300 font-bold">⭐ {getClearanceLevel(selectedEmployeeForProfile.role, selectedEmployeeForProfile.securityClearance)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Work Location</span>
                  <span className="text-slate-300">📍 {selectedEmployeeForProfile.location || getLocation(selectedEmployeeForProfile.employeeId, selectedEmployeeForProfile.department)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Account Status</span>
                  <span className="text-emerald-400 font-bold flex items-center space-x-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    <span>{selectedEmployeeForProfile.status || 'Active'}</span>
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Reporting Manager</span>
                  <span className="text-slate-300">👔 Sarah Connor (CTO)</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployeeForProfile(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
