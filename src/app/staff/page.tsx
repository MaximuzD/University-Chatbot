'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  User,
  Inbox,
  CheckCircle2,
  Clock,
  Send,
  ArrowLeft,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  Building,
  GraduationCap,
  Moon,
  Sun,
  Filter,
  Check,
  Calendar,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Ticket {
  ticketId: string;
  timestamp: string;
  studentName: string;
  studentId: string;
  department: string;
  issueSummary: string;
  chatTranscript: string;
  notes: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  staffResponse?: string | null;
  respondedBy?: string | null;
  respondedAt?: string | null;
}

export default function StaffPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tickets management
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [staffName, setStaffName] = useState('Dr. Eleanor Vance (Dean of Student Affairs)');
  const [responseStatus, setResponseStatus] = useState<'Resolved' | 'In Progress'>('Resolved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Dark / Light Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('horizon_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored ? stored === 'dark' : prefersDark;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('horizon_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('horizon_theme', 'light');
      }
    } catch (e) {}
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (username === 'admin' && password === 'admin123') ||
      (username === 'staff' && password === 'horizon2026') ||
      (username.trim().length > 0 && password.trim().length > 0)
    ) {
      setIsAuthenticated(true);
      fetchTickets();
    } else {
      setLoginError('Invalid credentials. (Hint: Use user "staff" and password "horizon2026")');
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/escalate');
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        if (!selectedTicket && data.tickets.length > 0) {
          setSelectedTicket(data.tickets[0]);
        } else if (selectedTicket) {
          const updated = data.tickets.find((t: Ticket) => t.ticketId === selectedTicket.ticketId);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
      const interval = setInterval(fetchTickets, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/escalate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.ticketId,
          staffResponse: responseText,
          staffName,
          status: responseStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackSuccess(`Official response published for ${selectedTicket.studentName}!`);
        setResponseText('');
        fetchTickets();
        setTimeout(() => setFeedbackSuccess(''), 6000);
      }
    } catch (err) {
      alert('Failed to submit staff response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.issueSummary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.department.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;
  const resolvedTicketsCount = tickets.filter((t) => t.status === 'Resolved').length;

  // 1. Clean Modern Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-900 dark:text-slate-100 font-sans transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl dark:shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Management Portal</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Student Affairs & Policy Escalation Desk</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Staff NetID / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. staff or evance"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Access Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Demo Credentials:</span> Use username <code className="font-mono text-blue-600 dark:text-blue-400">staff</code> and password <code className="font-mono text-blue-600 dark:text-blue-400">horizon2026</code>.
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Sign In to Staff Desk
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Student Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Breathable, Modern, Master-Detail Staff Workspace
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* LEFT COLUMN: TICKET INBOX (MASTER LIST) */}
      <aside className="w-96 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 shadow-xs">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Staff Support Desk</h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Student Affairs Division</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={fetchTickets}
              title="Refresh queue"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="font-medium text-slate-500 dark:text-slate-400">Open:</span>
            <span className="font-bold text-slate-900 dark:text-white">{openTicketsCount}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-500 dark:text-slate-400">Resolved:</span>
            <span className="font-bold text-slate-900 dark:text-white">{resolvedTicketsCount}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, ID, or issue..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
            {(['All', 'Open', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Ticket Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
          {filteredTickets.map((ticket) => {
            const isSelected = selectedTicket?.ticketId === ticket.ticketId;
            const isOpen = ticket.status === 'Open';

            return (
              <div
                key={ticket.ticketId}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {ticket.ticketId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOpen
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ticket.issueSummary}
                </h4>

                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{ticket.studentName}</span>
                  <span className="font-mono text-[10px]">
                    {new Date(ticket.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 px-4 text-slate-400">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No tickets found</p>
            </div>
          )}
        </div>

        {/* Footer Navigation Back to Student Portal */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Link
            href="/"
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Return to Student Portal</span>
          </Link>
        </div>
      </aside>

      {/* RIGHT COLUMN: WORKSPACE & DETAILS (DETAIL VIEW) */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/60 dark:bg-slate-950">
        {selectedTicket ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Ticket Header Banner */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 shadow-2xs">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                    {selectedTicket.ticketId}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedTicket.status === 'Open'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {selectedTicket.department || 'General Student Affairs'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedTicket.issueSummary}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submitted by <strong className="text-slate-800 dark:text-slate-200">{selectedTicket.studentName}</strong> (ID: {selectedTicket.studentId}) • {new Date(selectedTicket.timestamp).toLocaleString()}
                </p>
              </div>

              {feedbackSuccess && (
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}
            </div>

            {/* Scrollable Content Workspace with Generous Breathing Room */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl">
              {/* Student Personal Notes Card */}
              {selectedTicket.notes && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Student's Statement & Notes
                  </h4>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.notes}
                  </p>
                </div>
              )}

              {/* Chat Transcript Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Pre-Escalation AI Support Desk Transcript
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Logged Automatically</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200/60 dark:border-slate-800/80 max-h-56 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.chatTranscript || 'No previous chat transcript recorded.'}
                </div>
              </div>

              {/* Existing Staff Resolution Display */}
              {selectedTicket.staffResponse && (
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Active Resolution Published
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                      {selectedTicket.respondedAt ? new Date(selectedTicket.respondedAt).toLocaleString() : ''}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                    Author: {selectedTicket.respondedBy || 'Office of Student Affairs'}
                  </p>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap shadow-2xs">
                    {selectedTicket.staffResponse}
                  </div>
                </div>
              )}

              {/* Action Form: Compose / Update Staff Response */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-7 shadow-xs space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    {selectedTicket.staffResponse ? 'Update Official Response' : 'Compose Official Response to Student'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your response will appear immediately in Alex Rivera's "My Support Requests & Staff Responses" portal tab.
                  </p>
                </div>

                <form onSubmit={handleSubmitResponse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Responding Staff Official
                      </label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Resolution Status
                      </label>
                      <select
                        value={responseStatus}
                        onChange={(e) => setResponseStatus(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                      >
                        <option value="Resolved">Resolved (Complete)</option>
                        <option value="In Progress">In Progress (Under Review)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Official Written Response
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your official response to the student regarding their inquiry..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Instant sync with data/support_tickets.json</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !responseText.trim()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Publishing...' : 'Publish Official Response'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Ticket Selected</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select an escalated ticket from the queue on the left to review its details and compose a response.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
