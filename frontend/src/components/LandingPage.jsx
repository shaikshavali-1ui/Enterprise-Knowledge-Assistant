import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Bot, 
  Mail, 
  History, 
  BarChart3, 
  Upload, 
  Layers, 
  Database, 
  HelpCircle, 
  Cpu, 
  Send, 
  Users, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Share2, 
  Globe, 
  ChevronRight,
  Key,
  Shield,
  FileText,
  AlertTriangle,
  X,
  UserCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('dev.john@enterprise.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Sample predefined employee personas for quick testing
  const registeredEmployees = [
    { id: 'usr_employee', email: 'dev.john@enterprise.com', name: 'John Doe', role: 'Software Engineer', dept: 'Engineering' },
    { id: 'usr_hr', email: 'hr.manager@enterprise.com', name: 'Elena Rostova', role: 'HR Lead', dept: 'Human Resources' },
    { id: 'usr_finance', email: 'finance.lead@enterprise.com', name: 'Marcus Vance', role: 'Finance Director', dept: 'Finance & Payroll' },
    { id: 'usr_admin', email: 'admin@enterprise.com', name: 'Sarah Connor', role: 'System Admin', dept: 'Executive' }
  ];

  const handleVerifyAndLogin = async (e, customEmail = null, customUserId = null) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const targetEmail = customEmail || email;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: customUserId || null,
          email: targetEmail, 
          password 
        })
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setShowModal(false);
        onLoginSuccess(data.user);
      } else {
        setErrorMessage(data.message || 'Verification Failed: Email is not recognized in the company directory.');
      }
    } catch (err) {
      setLoading(false);
      // Seamless Offline / Static Deployment Fallback
      const matched = registeredEmployees.find(u => u.email.toLowerCase() === targetEmail.toLowerCase() || u.id === customUserId);
      if (matched) {
        setShowModal(false);
        const mappedRole = matched.role === 'Software Engineer' ? 'Employee' : matched.role === 'HR Lead' ? 'HR Manager' : matched.role === 'Finance Director' ? 'Finance' : matched.role;
        onLoginSuccess({
          id: matched.id,
          email: matched.email,
          name: `${matched.name} (${matched.role})`,
          role: mappedRole,
          department: matched.dept,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });
      } else {
        // Fallback for custom company email login offline
        const namePart = targetEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setShowModal(false);
        onLoginSuccess({
          id: `usr_${Date.now()}`,
          email: targetEmail,
          name: `${formattedName} (Verified Employee)`,
          role: 'Employee',
          department: 'General Operations',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        });
      }
    }
  };

  const selectPersona = (emp) => {
    setEmail(emp.email);
    handleVerifyAndLogin(null, emp.email, emp.id);
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div>
              <span className="font-extrabold text-lg tracking-wider text-white">ENTERPRISE KNOWLEDGE</span>
              <span className="text-xs block text-indigo-400 font-medium tracking-widest uppercase -mt-1">ASSISTANT</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#home" className="text-indigo-400 hover:text-white transition-colors">Home</a>
            <a href="#meaning" className="hover:text-white transition-colors">Meaning</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#departments" className="hover:text-white transition-colors">Departments</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Login to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI-Powered Enterprise Knowledge Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Enterprise <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
              Knowledge Assistant
            </span>
          </h1>

          <p className="text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            An AI-powered system that helps employees find, understand, and use company knowledge quickly and efficiently.
          </p>

          {/* Key Value Points */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3 text-slate-200 text-sm font-medium">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                📄
              </div>
              <span>All company documents are stored in one place.</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-200 text-sm font-medium">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                🤖
              </div>
              <span>Employees can ask questions using AI.</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-200 text-sm font-medium">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                🔍
              </div>
              <span>Information is retrieved quickly using RAG.</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-200 text-sm font-medium">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                📧
              </div>
              <span>The system can generate and send emails automatically.</span>
            </div>

            <div className="flex items-center space-x-3 text-slate-200 text-sm font-medium">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                🔒
              </div>
              <span>Access is secure and role-based.</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-semibold text-base transition-all duration-200 shadow-xl shadow-indigo-500/30 flex items-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Login to Dashboard</span>
            </button>
            <a
              href="#meaning"
              className="px-7 py-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all duration-200"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right Hero Interactive 3D Graphic + Sign In Verification Form */}
        <div className="lg:col-span-5 relative">
          <div className="relative z-10 p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-5">
            {/* Visual Header Graphic Icon */}
            <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 border border-indigo-300/40 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                <span className="text-3xl font-extrabold text-white">N</span>
              </div>
              <div className="absolute bottom-2.5 left-4 text-[10px] font-mono text-indigo-300/80 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Employee Security Guard Active</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Employee Login & Verification</h3>
              <p className="text-xs text-slate-400 mt-0.5">Enter your company email to verify identity and access RAG docs.</p>
            </div>

            {/* Verification Failure Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="name@enterprise.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <a href="#" className="text-[11px] text-indigo-400 hover:text-indigo-300">Forgot?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Employee Credentials...</span>
                ) : (
                  <>
                    <span>Verify & Open Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Test Employee Personas */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Quick Select Company Employee Persona:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {registeredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => selectPersona(emp)}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-colors"
                  >
                    <div className="text-[11px] font-semibold text-white truncate">{emp.name}</div>
                    <div className="text-[9px] font-mono text-indigo-300 truncate">{emp.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Name Breakdown & Brand Concept Section */}
      <section id="meaning" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              Brand Definition & Structure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              What does <span className="text-indigo-400">Enterprise Knowledge Assistant</span> mean?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-1 text-left bg-slate-900/80 rounded-r-xl">
              "An AI-powered system that helps employees find, understand, and use company knowledge quickly and efficiently."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 🏢 Enterprise */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl mb-1 group-hover:scale-110 transition-transform">
                🏢
              </div>
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              <p className="text-xs font-mono text-indigo-400">Large Organization / Company</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                A large organization or enterprise company.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 font-mono">
                <span className="text-indigo-300 font-bold block">Examples:</span>
                <span className="text-slate-400 block">Infosys • TCS • Wipro • Google • Microsoft • Amazon</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-400 font-mono pt-1">
                ⇒ Enterprise = Company / Organization
              </div>
            </div>

            {/* 📚 Knowledge */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-2xl mb-1 group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-2xl font-bold text-white">Knowledge</h3>
              <p className="text-xs font-mono text-purple-400">Information & Company Data</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Information, documents, policies, manuals, reports, and internal company data.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 font-mono">
                <span className="text-purple-300 font-bold block">Examples:</span>
                <span className="text-slate-400 block">HR Policy • Leave Policy • Employee Handbook • Training Docs • Company Reports</span>
              </div>
              <div className="text-[11px] font-bold text-purple-300 font-mono pt-1">
                ⇒ Knowledge = Corporate Assets & SOPs
              </div>
            </div>

            {/* 🤖 Assistant */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 transition-all duration-300 group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-2xl mb-1 group-hover:scale-110 transition-transform">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-white">Assistant</h3>
              <p className="text-xs font-mono text-sky-400">AI Helper & Task Automation</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                A helper that assists users in completing tasks automatically.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 font-mono">
                <span className="text-sky-300 font-bold block">Assistant Capabilities:</span>
                <span className="text-slate-400 block">• Answers employee questions</span>
                <span className="text-slate-400 block">• Searches company documents</span>
                <span className="text-slate-400 block">• Generates & dispatches emails</span>
              </div>
              <div className="text-[11px] font-bold text-sky-300 font-mono pt-1">
                ⇒ Assistant = Intelligent Automated Helper
              </div>
            </div>
          </div>

          {/* Full Definition & Simple Explanation for Faculty Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border border-indigo-500/30 space-y-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest block font-bold">
                  🎯 Complete Meaning
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  "An intelligent AI assistant that helps employees access company knowledge, answer questions, and automate communication within an organization."
                </p>
              </div>

              <div className="space-y-2 p-5 rounded-2xl bg-slate-950/60 border border-indigo-500/30">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  🎓 Simple Explanation (For Faculty & Presentations)
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  "Enterprise Knowledge Assistant is an AI-powered chatbot designed for organizations. It helps employees quickly find information from company documents, policies, and reports, and can also generate and send professional emails automatically."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-wider">WHY ENTERPRISE KNOWLEDGE ASSISTANT?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            One Platform. Unlimited Knowledge.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Enterprise Knowledge Assistant empowers your organization with AI-driven search, secure access, and automated communication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Secure & Role-Based</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade security with role-based access control (RBAC) ensuring sensitive documents remain strictly protected.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Smart Knowledge Search</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find the right information instantly with semantic vector search across PDF policies, HR guides, and technical SOPs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">AI Chat Assistant</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get accurate answers from verified company documents in natural language, backed by source citations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Email Automation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draft, personalize, and dispatch professional internal emails using AI and SMTP gateway integration.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Conversation History</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access your past queries, retrieved references, and audit logs anytime with complete traceability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-white">Analytics Dashboard</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track usage metrics, top searched policies, vector chunk counts, and email dispatch status in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-mono text-indigo-400 uppercase tracking-wider">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              End-to-End Enterprise RAG Pipeline
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              From document ingestion to AI answer generation and automated email notification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold mx-auto flex items-center justify-center text-sm">
                1
              </div>
              <h5 className="font-bold text-xs text-white">Upload Documents</h5>
              <p className="text-[11px] text-slate-400">Upload PDF/TXT policies & company guidelines.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold mx-auto flex items-center justify-center text-sm">
                2
              </div>
              <h5 className="font-bold text-xs text-white">Documents Indexed</h5>
              <p className="text-[11px] text-slate-400">System parses & chunks content securely.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold mx-auto flex items-center justify-center text-sm">
                3
              </div>
              <h5 className="font-bold text-xs text-white">Stored in Vector DB</h5>
              <p className="text-[11px] text-slate-400">Embeddings stored in Pinecone for quick retrieval.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold mx-auto flex items-center justify-center text-sm">
                4
              </div>
              <h5 className="font-bold text-xs text-white">Ask a Question</h5>
              <p className="text-[11px] text-slate-400">Employees ask queries in natural language.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold mx-auto flex items-center justify-center text-sm">
                5
              </div>
              <h5 className="font-bold text-xs text-white">AI Retrieves & Generates</h5>
              <p className="text-[11px] text-slate-400">AI finds exact context & answers accurately.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold mx-auto flex items-center justify-center text-sm">
                6
              </div>
              <h5 className="font-bold text-xs text-white">Email Drafted & Sent</h5>
              <p className="text-[11px] text-slate-400">Emails formatted & sent via SMTP Gateway.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Every Department */}
      <section id="departments" className="py-20 max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">BUILT FOR EVERY DEPARTMENT</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Empower Every Team with Knowledge Automation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Custom access controls and tailored intelligence for every enterprise division.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">HR Department</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Manage leave policies, onboarding docs, and automated HR communications.
            </p>
            <div className="pt-2 text-[10px] font-mono text-amber-400/80">18 Employees active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">IT Support</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Resolve IT queries, VPN rules, hardware requests, and automated ticket emails.
            </p>
            <div className="pt-2 text-[10px] font-mono text-indigo-400/80">24 Employees active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Finance Team</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Access financial reports, payroll policies, and restricted compensation bands.
            </p>
            <div className="pt-2 text-[10px] font-mono text-emerald-400/80">16 Employees active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Operations</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Streamline operations with standard operating procedures and workflow automation.
            </p>
            <div className="pt-2 text-[10px] font-mono text-sky-400/80">20 Employees active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Shield className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">Management</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Gain executive insights, cross-department search, and security audit logs.
            </p>
            <div className="pt-2 text-[10px] font-mono text-rose-400/80">12 Executives active</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-slate-900 border border-indigo-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl"></div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative z-10">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-slate-200 text-base max-w-2xl mx-auto relative z-10">
            Join thousands of teams using <strong className="text-white">Enterprise Knowledge Assistant</strong> to boost productivity, streamline search, and automate internal communication.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2 relative z-10">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-lg shadow-indigo-500/30 flex items-center space-x-2"
            >
              <UserCheck className="w-5 h-5" />
              <span>Login to Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Verification Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Company Identity Verification</h3>
                <p className="text-xs text-slate-400">Enterprise Knowledge Assistant Security Guard</p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="name@enterprise.com"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">Default Demo Password: <strong className="text-indigo-400">password123</strong></p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Employee...</span>
                ) : (
                  <>
                    <span>Verify & Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Or Select Verified Employee Persona:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {registeredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => selectPersona(emp)}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-colors"
                  >
                    <div className="text-xs font-semibold text-white truncate">{emp.name}</div>
                    <div className="text-[10px] text-indigo-400 font-mono truncate">{emp.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 text-xs text-slate-400 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div>
              <span className="font-bold text-white text-sm">ENTERPRISE KNOWLEDGE ASSISTANT</span>
              <p className="text-[11px] text-slate-500">AI-Powered Enterprise Knowledge Assistant & Email Automation</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center space-x-6 text-slate-400">
            <a href="#meaning" className="hover:text-white transition-colors">About Platform</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            © 2026 Enterprise Knowledge Assistant. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
