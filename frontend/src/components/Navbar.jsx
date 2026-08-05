import React, { useState } from 'react';
import { 
  Shield, 
  Sparkles, 
  Cpu, 
  Mail, 
  UserCheck, 
  LogOut, 
  Bell, 
  User, 
  X, 
  CheckCircle2, 
  Lock, 
  Calendar, 
  Phone, 
  Building2, 
  ShieldAlert 
} from 'lucide-react';

export default function Navbar({ activeUser, vectorStats, onSelectTab }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const notificationsList = [
    { id: 1, text: 'Password expires in 5 days. Update in Security Settings.', time: '10m ago', unread: true },
    { id: 2, text: 'HR Operations uploaded Leave Policy 2026 (Level 1 Clearance).', time: '1h ago', unread: true },
    { id: 3, text: 'Admin approved your Level 4 Executive Clearance request.', time: '3h ago', unread: true },
    { id: 4, text: 'New 6-digit OTP Email verification protocol deployed.', time: 'Yesterday', unread: false }
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HR Manager':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Finance':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Brand & v2.0 Tag */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab && onSelectTab('dashboard')}>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Enterprise Knowledge Assistant
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v2.0 Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-400">AI-Powered Enterprise Knowledge & Employee Productivity Platform</p>
        </div>
      </div>

      {/* System Telemetry, Notifications & Persona Profile */}
      <div className="flex items-center space-x-4">
        {/* Vector Engine Telemetry */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-400">Vector Index:</span>
          <span className="text-indigo-300 font-semibold">{vectorStats?.totalChunks || 17} Chunks</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
        </div>

        {/* SMTP Status */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">SMTP:</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>

        {/* 🔔 Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-slate-300 relative transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-indigo-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-indigo-500/30 p-4 space-y-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Employee Notifications</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-300">3 Unread</span>
              </div>

              <div className="space-y-2 text-xs">
                {notificationsList.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-medium">{n.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono">{n.time}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNotifications(false)}
                className="w-full py-1.5 rounded-xl bg-slate-800 text-[11px] text-slate-300 text-center hover:bg-slate-700"
              >
                Mark All as Read
              </button>
            </div>
          )}
        </div>

        {/* Active Security Persona Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div
            onClick={() => setShowProfileModal(true)}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Click to view full Employee Profile"
          >
            <img
              src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={activeUser?.name}
              className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover group-hover:border-indigo-400 transition-all"
            />
            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {activeUser?.fullName || activeUser?.name}
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getRoleBadge(activeUser?.role)}`}>
                  {activeUser?.role}
                </span>
                <span className="text-[10px] font-mono text-amber-300">
                  {activeUser?.securityClearance || 'Level 4'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('landing')}
            title="Log out & return to Landing Page"
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-rose-300 text-slate-400 transition-colors flex items-center space-x-1.5 text-xs font-medium ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 👤 EMPLOYEE PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-indigo-500/30 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Employee Security Profile</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Header */}
            <div className="flex items-center space-x-4">
              <img
                src={activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={activeUser?.name}
                className="w-16 h-16 rounded-2xl border-2 border-indigo-500/50 object-cover"
              />
              <div>
                <h4 className="text-lg font-bold text-white">{activeUser?.fullName || activeUser?.name}</h4>
                <p className="text-xs text-indigo-300 font-mono">{activeUser?.designation || 'System Administrator & CTO'}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified Employee
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Record Fields */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Employee ID:</span>
                <span className="font-mono text-indigo-300 font-bold">{activeUser?.employeeId || 'EMP001'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-200 font-medium">{activeUser?.department || 'Executive Management'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">System Role:</span>
                <span className="font-mono text-rose-300 font-bold">{activeUser?.role || 'Admin'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Security Clearance Level:</span>
                <span className="font-mono text-amber-300 font-bold">{activeUser?.securityClearance || 'Level 4'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="font-mono text-slate-200">{activeUser?.email || 'shaikshavali05335@gmail.com'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono text-slate-200">{activeUser?.phone || '+91 9876543210'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Date of Joining:</span>
                <span className="font-mono text-slate-200">{activeUser?.dateOfJoining || '2025-01-01'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs text-center shadow-glow-indigo"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
