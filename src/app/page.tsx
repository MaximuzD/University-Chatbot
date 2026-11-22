'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CreditCard,
  FileText,
  LifeBuoy,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Sparkles,
  UserCheck,
  Building2,
  Send,
  X,
  Layers,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  Maximize2,
  Minimize2,
  Ticket,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import universityDocsData from '@data/universityDocs.json';

type ActiveSection = 'dashboard' | 'courses' | 'finance' | 'docs' | 'support' | 'tickets';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState<ActiveSection>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PDF Viewer Modal State
  const [selectedPdf, setSelectedPdf] = useState<{ filename: string; title: string; category: string } | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello Alex! 👋 I am your **Horizon University AI Support Desk Assistant**. 

I can help answer questions directly from our **10 official university policy handbooks** (academic deadlines, grading scales, tuition refund dates, IT credentials, library fines, and housing rules). 

How can I assist you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  // Escalation & Tickets Modal State
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateSummary, setEscalateSummary] = useState('');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [ticketsViewerOpen, setTicketsViewerOpen] = useState(false);
  const [savedTickets, setSavedTickets] = useState<any[]>([]);

  // Dark / Light Mode State
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

  // Periodically fetch student's tickets so replies from staff appear automatically
  const fetchStudentTickets = async () => {
    try {
      const res = await fetch('/api/escalate');
      const data = await res.json();
      if (data.tickets) {
        setSavedTickets(data.tickets);
      }
    } catch (e) {
      // ignore
    }
  };

  React.useEffect(() => {
    fetchStudentTickets();
    const interval = setInterval(fetchStudentTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger brief subtle toast
  const showDemoToast = (featureName?: string) => {
    setToastMessage(featureName ? `${featureName}: Demo module — use Support Desk for live assistance.` : 'Demo module — use Support Desk for live assistance.');
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Quick prompt chips
  const quickPrompts = [
    'What is the tuition refund deadline?',
    'How much is a student parking permit?',
    'How many free counseling sessions do I get?',
    'Can I waive my overdue library fine?'
  ];

  // Helper to render inline markdown: **bold**, `code`, and "Talk to a Human" buttons
  const renderFormattedLine = (line: string) => {
    // 1. First extract and handle TALK_TO_A_HUMAN_TOKEN
    const humanSegments = line.split('TALK_TO_A_HUMAN_TOKEN');
    
    return (
      <>
        {humanSegments.map((segment, sIdx) => {
          // Tokenize bold **...** and inline code `...`
          const parts: React.ReactNode[] = [];
          const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
          let lastIdx = 0;
          let match: RegExpExecArray | null;

          while ((match = regex.exec(segment)) !== null) {
            if (match.index > lastIdx) {
              parts.push(segment.substring(lastIdx, match.index));
            }
            const token = match[0];
            if (token.startsWith('**') && token.endsWith('**')) {
              parts.push(
                <strong key={`${sIdx}-${match.index}`} className="font-bold text-slate-900 dark:text-white">
                  {token.slice(2, -2)}
                </strong>
              );
            } else if (token.startsWith('`') && token.endsWith('`')) {
              parts.push(
                <code key={`${sIdx}-${match.index}`} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-300 rounded font-mono text-[12px] border border-slate-200 dark:border-slate-700">
                  {token.slice(1, -1)}
                </code>
              );
            }
            lastIdx = regex.lastIndex;
          }

          if (lastIdx < segment.length) {
            parts.push(segment.substring(lastIdx));
          }

          return (
            <React.Fragment key={sIdx}>
              {parts}
              {sIdx < humanSegments.length - 1 && (
                <button
                  type="button"
                  onClick={() => setEscalateModalOpen(true)}
                  className="inline-flex items-center font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 mx-1 cursor-pointer"
                  title="Click to open escalation ticket"
                >
                  Talk to a Human
                </button>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };

  // Helper to render message content with clean formatting and interactive PDF document buttons
  const renderMessageContent = (content: string, isUser: boolean) => {
    if (isUser) {
      return <div className="space-y-1 whitespace-pre-wrap">{content}</div>;
    }

    // 1. Identify referenced documents from universityDocsData
    const referencedDocs: typeof universityDocsData = [];
    universityDocsData.forEach((doc) => {
      const filenameMatch = content.includes(doc.filename);
      const titleMatch = content.toLowerCase().includes(doc.title.toLowerCase());
      if (filenameMatch || titleMatch) {
        if (!referencedDocs.some((d) => d.filename === doc.filename)) {
          referencedDocs.push(doc);
        }
      }
    });

    // 2. Clean out citation lines like "*Source: ...*", "Source: ...", `Source: ...`
    let cleaned = content.replace(/(?:\*|_)?Source:\s*([^\n\r*]+)(?:\*|_)?/gi, '').trim();

    // 3. Normalize "Talk to a Human" (removing surrounding ** or quotes) to a special marker
    cleaned = cleaned.replace(/\*\*Talk to a Human\*\*/gi, 'TALK_TO_A_HUMAN_TOKEN');
    cleaned = cleaned.replace(/Talk to a Human/gi, 'TALK_TO_A_HUMAN_TOKEN');

    // Split text into lines/paragraphs
    const lines = cleaned.split('\n');

    return (
      <div className="space-y-2">
        <div className="space-y-1.5 leading-relaxed">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-1" />;

            // If it's a bullet point, render a clean styled list item
            if (trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              const bulletText = trimmed.replace(/^(?:•|-|\*)\s*/, '');
              return (
                <div key={idx} className="flex items-start gap-2 ml-1 my-0.5">
                  <span className="text-blue-500 dark:text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                  <div className="flex-1">{renderFormattedLine(bulletText)}</div>
                </div>
              );
            }

            return (
              <p key={idx} className="leading-relaxed">
                {renderFormattedLine(line)}
              </p>
            );
          })}
        </div>

        {/* Interactive PDF Reference Buttons */}
        {referencedDocs.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Referenced Policy:
            </span>
            {referencedDocs.map((doc) => (
              <button
                key={doc.filename}
                type="button"
                onClick={() => setSelectedPdf({ filename: doc.filename, title: doc.title, category: doc.category })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform" />
                <span>{doc.title}</span>
                <span className="text-[10px] text-blue-500 dark:text-blue-400 font-mono">.pdf</span>
                <Eye className="w-3 h-3 text-blue-400 group-hover:text-blue-600 ml-0.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Send Chat message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isChatLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Thank you. If this requires staff review, please click Talk to a Human.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I encountered an issue connecting to the Support Desk service. Please try clicking "Talk to a Human" above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit Escalation Ticket
  const handleSubmitEscalation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEscalating(true);

    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    try {
      const res = await fetch('/api/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Alex Rivera',
          studentId: '#20268841',
          department: 'Academic & Student Affairs',
          issueSummary: escalateSummary || 'Inquiry escalated from Student Portal AI chat session',
          chatTranscript: transcript,
          notes: escalateNotes
        })
      });
      const data = await res.json();
      if (data.ticket) {
        setEscalateModalOpen(false);
        setEscalateSummary('');
        setEscalateNotes('');
        
        // Append confirmation in chat
        const confirmationMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Human Support Ticket Created Successfully!**\n\n• **Ticket ID:** \`${data.ticket.ticketId}\`\n• **Student:** Alex Rivera (#20268841)\n• **Status:** Open (Forwarded to Student Affairs Staff)\n• **Assigned Turnaround:** 1-2 business days\n\nYou can inspect saved tickets anytime using the **"View Saved Tickets (JSON)"** button in the Support Desk header.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, confirmationMsg]);
      }
    } catch (err) {
      alert('Failed to submit ticket. Please try again.');
    } finally {
      setIsEscalating(false);
    }
  };

  // Load and View Saved Tickets JSON
  const handleOpenTicketsViewer = async () => {
    try {
      const res = await fetch('/api/escalate');
      const data = await res.json();
      setSavedTickets(data.tickets || []);
      setTicketsViewerOpen(true);
    } catch (err) {
      alert('Could not load tickets file.');
    }
  };

  // Filtered documents
  const filteredDocs = universityDocsData.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                          doc.department.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Academics', 'Finance', 'Housing', 'Technology', 'Academic Support', 'Governance', 'Health & Wellness', 'Career', 'Transportation', 'Campus Life'];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-tight">Horizon University</h1>
            <p className="text-[11px] text-slate-400 font-normal">Student Academic Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses & Grades</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'finance'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Finance & Tuition</span>
          </button>

          <div className="pt-4 pb-1.5 px-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Services & Policies</p>
          </div>

          <button
            onClick={() => setActiveTab('docs')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Policy Handbooks</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              10
            </span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <LifeBuoy className="w-4 h-4 text-slate-400" />
              <span>AI Support Desk</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tickets'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 text-slate-400" />
              <span>Support Requests</span>
            </div>
            {savedTickets.filter(t => t.staffResponse).length > 0 && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                {savedTickets.filter(t => t.staffResponse).length}
              </span>
            )}
          </button>
        </nav>

        {/* System Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 space-y-2">
          <Link
            href="/staff"
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Staff Portal Login</span>
          </Link>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Fall 2026 Academic Term</span>
            <span>v3.8.4</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP STUDENT PROFILE HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              AR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Alex Rivera</h2>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">#20268841</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">B.Sc. Computer Science • Junior Standing</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link
              href="/staff"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Staff Login</span>
            </Link>

            <button
              onClick={() => showDemoToast('Notifications')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Campus Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>

            <button
              onClick={() => {
                setActiveTab('support');
              }}
              className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Support</span>
            </button>
          </div>
        </header>

        {/* MAIN BODY SECTIONS */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* 1. DASHBOARD (HOME) */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Academic Overview</h3>
                <p className="text-sm text-slate-500 mt-1">Semester Fall 2026 • Current Week 11</p>
              </div>

              {/* 4 Summary Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cumulative GPA</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">3.78</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                      <TrendingUp className="w-3 h-3" /> Dean's Honor Roll
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700">
                    A-
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">5</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">16 Graded Credits</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tuition Status</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Settled</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">$0.00 Balance</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Degree Progress</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">68%</p>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">82 of 120 credits</span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Deadlines & Campus Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Deadlines (2 Cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Upcoming Academic Deadlines</h4>
                    </div>
                    <button
                      onClick={() => showDemoToast('Calendar Export')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Full Calendar <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">CS 341 - Operating Systems Project 3</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Kernel Synchronization Primitives</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                          Nov 19
                        </span>
                        <button
                          onClick={() => showDemoToast('Course Submission')}
                          className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">Spring 2027 Course Pre-Registration</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Opens for Junior standing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                          Nov 24
                        </span>
                        <button
                          onClick={() => showDemoToast('Registration Portal')}
                          className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        >
                          Planner
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">CS 370 - Artificial Intelligence Final Exam</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Hall of Sciences, Lecture Hall A</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          Dec 16
                        </span>
                        <button
                          onClick={() => showDemoToast('Exam Seating')}
                          className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                        >
                          Seat Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campus Announcements (1 Col) */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Campus Notices</h4>
                    </div>

                    <div className="space-y-3">
                      <div className="border-l-2 border-blue-600 pl-3">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Library Policy Update</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Founders Library 24/7 Final Exam Hours</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Continuous 24-hour study room reservations commence December 1st.</p>
                      </div>

                      <div className="border-l-2 border-amber-500 pl-3">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Parking & Transit</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">North Garage EV Station Expansion</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">6 new Level-2 charging bays active with $0.14/kWh rate.</p>
                      </div>

                      <div className="border-l-2 border-emerald-500 pl-3">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Career Center</span>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">Spring 2027 Co-Op Recruitment</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Submit Form INT-101 before December 15 for approved credits.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('docs')}
                    className="w-full mt-4 py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Browse Official Policy PDFs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. COURSES & GRADES */}
          {activeTab === 'courses' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Current Semester Courses</h3>
                  <p className="text-sm text-slate-500 mt-1">Fall 2026 • 16 Registered Credits</p>
                </div>
                <button
                  onClick={() => showDemoToast('Official Transcript Download')}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-2xs"
                >
                  <Download className="w-4 h-4" /> Download Unofficial Transcript
                </button>
              </div>

              {/* Courses Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Course Code & Name</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Midterm Grade</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        CS 341: Operating Systems & Systems Programming
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Section 02 • Room Tech-204</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Dr. Marcus Vance</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">4.0</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">Mon/Wed 10:00 - 11:45 AM</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          A (94%)
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showDemoToast('CS 341 Syllabus')}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Syllabus
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        CS 370: Artificial Intelligence & Heuristics
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Section 01 • Room Sci-108</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Prof. Elena Rostova</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">3.0</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">Tue/Thu 1:00 - 2:20 PM</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          A- (91%)
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showDemoToast('CS 370 Syllabus')}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Syllabus
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        CS 355: Database Systems & Cloud Storage
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Section 03 • Room Tech-112</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Dr. Tariq Al-Mansoor</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">3.0</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">Mon/Wed 2:00 - 3:20 PM</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          B+ (88%)
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showDemoToast('CS 355 Syllabus')}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Syllabus
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        MATH 310: Linear Algebra & Differential Equations
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Section 01 • Room Hall-301</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Prof. Catherine Bell</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">3.0</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">Tue/Thu 9:30 - 10:50 AM</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          A (95%)
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showDemoToast('MATH 310 Syllabus')}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Syllabus
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        ENG 215: Technical Writing & Ethics in Computing
                        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">Section 04 • Room Lib-210</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">Dr. Julian Wright</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">3.0</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">Friday 10:00 AM - 12:45 PM</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          B+ (87%)
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => showDemoToast('ENG 215 Syllabus')}
                          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Syllabus
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. FINANCE & TUITION */}
          {activeTab === 'finance' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Student Account & Tuition Billing</h3>
                  <p className="text-sm text-slate-500 mt-1">Bursar Billing Account #STU-8841-B</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Account Good Standing
                </div>
              </div>

              {/* Billing Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Assessment</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$8,740.00</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">16 credits + campus fees</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scholarships & Aid</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">-$6,000.00</p>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium mt-0.5">Presidential Merit Grant</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Balance Due</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$0.00</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Settled Aug 16, 2026</p>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Fall 2026 Itemized Invoice</h4>
                <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-700 dark:text-slate-300">Undergraduate Resident Tuition (16 Credits @ $490/credit)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">$7,840.00</span>
                  </div>
                  <div className="flex justify-between pt-2.5">
                    <span className="text-slate-700 dark:text-slate-300">Computer Science Lab & Cloud Infrastructure Fee</span>
                    <span className="font-semibold text-slate-900 dark:text-white">$350.00</span>
                  </div>
                  <div className="flex justify-between pt-2.5">
                    <span className="text-slate-700 dark:text-slate-300">Campus Recreation & Student Union Health Fee</span>
                    <span className="font-semibold text-slate-900 dark:text-white">$325.00</span>
                  </div>
                  <div className="flex justify-between pt-2.5">
                    <span className="text-slate-700 dark:text-slate-300">Technology & High-Performance Computing Maintenance</span>
                    <span className="font-semibold text-slate-900 dark:text-white">$225.00</span>
                  </div>
                  <div className="flex justify-between pt-2.5 text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Horizon Presidential Merit Scholarship (Semester Credit)</span>
                    <span>-$6,000.00</span>
                  </div>
                  <div className="flex justify-between pt-2.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>Direct Electronic Payment via eCheck (Aug 16, 2026)</span>
                    <span>-$2,740.00</span>
                  </div>
                  <div className="flex justify-between pt-3 text-sm font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
                    <span>Total Current Balance</span>
                    <span className="text-emerald-600 dark:text-emerald-400">$0.00</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Need to inquire about tuition refund deadlines? Check Document #02 or ask AI Support.</p>
                  <button
                    onClick={() => showDemoToast('Payment Receipt Download')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Download PDF Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. UNIVERSITY INFORMATION (PDF REPOSITORY) - FULLY FUNCTIONAL */}
          {activeTab === 'docs' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    Official University Policy Handbooks
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    10 verified documents governing Horizon University student academic and residential life.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Search policies, rules, fees..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                  {docSearchQuery && (
                    <button
                      onClick={() => setDocSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 uppercase">
                          {doc.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{doc.lastUpdated}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2.5 leading-snug">
                        {doc.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {doc.department}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
                      <button
                        onClick={() => setSelectedPdf({ filename: doc.filename, title: doc.title, category: doc.category })}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview PDF
                      </button>

                      <a
                        href={`/docs/${doc.filename}`}
                        download={doc.filename}
                        className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors"
                        title="Download to device"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-700 font-bold">No documents matched your search</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "refund", "exam", "wifi", or "parking"</p>
                </div>
              )}
            </div>
          )}

          {/* 5. SUPPORT DESK (AI CHATBOT) - FULLY FUNCTIONAL */}
          {activeTab === 'support' && (
            <div className="max-w-4xl mx-auto h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-200 shadow-sm">
              {/* Chat Header */}
              <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Horizon Support Desk AI</h4>
                    <p className="text-[11px] text-slate-400">Grounded exclusively in 10 official University policy documents</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenTicketsViewer}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Inspect local data/support_tickets.json"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View JSON Log</span>
                  </button>

                  <button
                    onClick={() => setEscalateModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Talk to a Human</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Flow */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/70 dark:bg-slate-950/70">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-2xs ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 rounded-bl-xs'
                      }`}
                    >
                      {/* Markdown formatting simulation & interactive components */}
                      {renderMessageContent(m.content, m.role === 'user')}
                      <span
                        className={`text-[10px] block mt-2 ${
                          m.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-xs px-5 py-4 text-sm flex items-center gap-2.5 text-slate-500 dark:text-slate-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-xs font-medium ml-1">Searching official policy handbooks...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-6 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap">Suggested:</span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 rounded-lg whitespace-nowrap font-medium transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask any policy question (e.g. tuition refund, parking cost, counseling sessions)..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200 dark:border-slate-700"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatLoading}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}
          {/* 6. MY REQUESTS & STAFF RESPONSES */}
          {activeTab === 'tickets' && (
            <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    My Support Requests & Staff Responses
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Track requests escalated to Student Affairs and read official written responses.
                  </p>
                </div>
                <button
                  onClick={() => setEscalateModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  + New Request
                </button>
              </div>

              <div className="space-y-3">
                {savedTickets.map((ticket) => (
                  <div
                    key={ticket.ticketId}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                          {ticket.ticketId}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ticket.issueSummary}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.status === 'Open'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          {ticket.status}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(ticket.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {ticket.notes && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-white">Your Note:</strong> {ticket.notes}
                      </div>
                    )}

                    {/* Official Staff Response Box */}
                    {ticket.staffResponse ? (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Official Response from University Staff
                          </span>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                            {ticket.respondedAt ? new Date(ticket.respondedAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                          From: {ticket.respondedBy || 'Office of Student Affairs'}
                        </p>
                        <div className="mt-2 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                          {ticket.staffResponse}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Awaiting staff assignment. University staff review new inquiries every business day.</span>
                      </div>
                    )}
                  </div>
                ))}

                {savedTickets.length === 0 && (
                  <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                    <Ticket className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No support requests created yet</p>
                    <p className="text-xs text-slate-400 mt-0.5">Use the "Talk to a Human" button in the AI Support Desk to submit your first request.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FLOATING QUICK-CHAT WIDGET (BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!floatingChatOpen ? (
          <button
            onClick={() => setFloatingChatOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full border border-slate-700 shadow-lg text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Support Desk</span>
          </button>
        ) : (
          <div className="w-96 h-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-300 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs">Quick Support Desk</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTab('support');
                    setFloatingChatOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Expand to Full Page"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFloatingChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Compact Chat Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/70 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-xl p-3 ${
                      m.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {renderMessageContent(m.content, m.role === 'user')}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="text-slate-400 dark:text-slate-500 text-xs italic">Consulting university policies...</div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask policy question..."
                className="flex-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isChatLoading}
                className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PDF VIEWER MODAL */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[88vh] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden modal-content-animate">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="font-bold text-white text-xs">{selectedPdf.title}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedPdf.filename}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/docs/${selectedPdf.filename}`}
                  download={selectedPdf.filename}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2">
              <iframe
                src={`/docs/${selectedPdf.filename}#toolbar=0`}
                className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
                title={selectedPdf.title}
              />
            </div>
          </div>
        </div>
      )}

      {/* TALK TO A HUMAN ESCALATION MODAL */}
      {escalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden modal-content-animate">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="font-bold text-xs">Escalate to University Staff</h4>
                  <p className="text-[11px] text-slate-400">Formal Ticket Submission</p>
                </div>
              </div>
              <button
                onClick={() => setEscalateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEscalation} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Student Name</label>
                  <input
                    type="text"
                    disabled
                    value="Alex Rivera"
                    className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Student ID</label>
                  <input
                    type="text"
                    disabled
                    value="#20268841"
                    className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Issue Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Transfer credit appeal or medical exam deferral"
                  value={escalateSummary}
                  onChange={(e) => setEscalateSummary(e.target.value)}
                  className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Additional Student Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe your situation for the dean/registrar..."
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                <strong>Notice:</strong> Your conversation transcript will be automatically attached to this ticket.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalateModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors"
                >
                  {isEscalating ? 'Submitting...' : 'Submit Escalation Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKETS JSON VIEWER MODAL */}
      {ticketsViewerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop-animate">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden modal-content-animate">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <div>
                  <h4 className="font-bold text-xs">Local Escalation Queue</h4>
                  <p className="text-[10px] text-slate-400 font-mono">data/support_tickets.json ({savedTickets.length} records)</p>
                </div>
              </div>
              <button
                onClick={() => setTicketsViewerOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(savedTickets, null, 2)}
              </pre>
            </div>

            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Auto-synced with disk</span>
              <button
                onClick={() => setTicketsViewerOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
