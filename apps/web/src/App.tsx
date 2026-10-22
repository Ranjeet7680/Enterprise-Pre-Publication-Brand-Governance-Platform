import React, { useState, useEffect } from 'react';
import {
  Shield, CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles,
  FileText, History, ArrowRight, Play, RefreshCw, Volume2, Mic,
  Download, Eye, ExternalLink, HelpCircle, UserCheck, Lock,
  ChevronRight, Database, Settings, BarChart3, Layers, Palette,
  MessageSquare, Send, Check, X, ThumbsUp, ThumbsDown, BookOpen,
  Sliders, Search, Filter, ShieldAlert, Cpu, Home, UploadCloud,
  LogOut, User, SplitSquareVertical
} from 'lucide-react';

import { CelebrationFX } from './components/CelebrationFX';
import { VoiceDictationModal } from './components/VoiceDictationModal';
import { AuthModal } from './components/AuthModal';
import { WelcomePage } from './components/WelcomePage';
import { VisualCanvasViewer } from './components/VisualCanvasViewer';
import { SettingsView } from './components/SettingsView';
import { SourceUploadModal } from './components/SourceUploadModal';

const API_BASE = 'http://localhost:8000';

export default function App() {
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState<'welcome' | 'studio' | 'queue' | 'sources' | 'assets' | 'analytics' | 'audit' | 'settings'>('welcome');
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-ananya',
    name: 'Ananya Sharma',
    role: 'creator',
    email: 'ananya@nadinaturals.com'
  });

  // Content Item & Review State
  const [contentItem, setContentItem] = useState<any>(null);
  const [currentText, setCurrentText] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('social');
  const [locale, setLocale] = useState('en-IN');
  const [reviewRun, setReviewRun] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [activeSourceDrawer, setActiveSourceDrawer] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDiffView, setShowDiffView] = useState(false);

  // Modals & Extras
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideRationale, setOverrideRationale] = useState('');
  const [targetOverrideFinding, setTargetOverrideFinding] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Additional Data
  const [sources, setSources] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [contrastTest, setContrastTest] = useState({ text: '#B0A090', bg: '#F7F4EB', result: null as any });

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const resItem = await fetch(`${API_BASE}/v1/content-items/content-nadi-social-launch`);
      if (resItem.ok) {
        const item = await resItem.json();
        setContentItem(item);
        setCurrentText(item.current_text);
        setTitle(item.title);
        setChannel(item.channel);
        setLocale(item.locale);
      }

      const resReview = await fetch(`${API_BASE}/v1/content-items/content-nadi-social-launch/reviews/latest`);
      if (resReview.ok) {
        const review = await resReview.json();
        setReviewRun(review);
      }

      const resSources = await fetch(`${API_BASE}/v1/sources`);
      if (resSources.ok) setSources(await resSources.json());

      const resFacts = await fetch(`${API_BASE}/v1/facts`);
      if (resFacts.ok) setFacts(await resFacts.json());

      const resTerms = await fetch(`${API_BASE}/v1/terms`);
      if (resTerms.ok) setTerms(await resTerms.json());

      const resConflicts = await fetch(`${API_BASE}/v1/sources/conflicts`);
      if (resConflicts.ok) {
        const cData = await resConflicts.json();
        setConflicts(cData.conflicts || []);
      }

      const resAnalytics = await fetch(`${API_BASE}/v1/analytics`);
      if (resAnalytics.ok) setAnalytics(await resAnalytics.json());

      const resAudit = await fetch(`${API_BASE}/v1/audit`);
      if (resAudit.ok) setAuditLogs(await resAudit.json());

      const resBench = await fetch(`${API_BASE}/v1/evaluation/benchmark`);
      if (resBench.ok) setBenchmark(await resBench.json());
    } catch (err) {
      console.warn("Backend loading notice:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run Manual Review
  const handleTriggerReview = async () => {
    if (!contentItem) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/content-items/${contentItem.id}/text`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_text: currentText,
          author_id: currentUser.id,
          author_name: currentUser.name,
          change_summary: 'Manual edit in review studio',
          image_metadata: contentItem.image_metadata
        })
      });
      if (res.ok) {
        showToast("Review completed! New immutable version generated.", "success");
        await fetchData();
      } else {
        showToast("Failed to process review run", "error");
      }
    } catch (e) {
      showToast("Error connecting to server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Accept a suggestion patch
  const handleAcceptPatch = async (findingId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/findings/${findingId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finding_id: findingId,
          actor_id: currentUser.id,
          actor_name: currentUser.name
        })
      });
      if (res.ok) {
        showToast("Suggestion accepted! New version created.", "success");
        await fetchData();
      } else {
        const err = await res.json();
        showToast(err.detail || "Could not apply suggestion", "error");
      }
    } catch (e) {
      showToast("Error connecting to server", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Human Override
  const handleOverrideSubmit = async () => {
    if (!targetOverrideFinding) return;
    try {
      const res = await fetch(`${API_BASE}/v1/findings/${targetOverrideFinding.id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          override_reason: overrideRationale
        })
      });
      if (res.ok) {
        showToast("Finding overridden with recorded audit rationale.", "success");
        setShowOverrideModal(false);
        setOverrideRationale('');
        setTargetOverrideFinding(null);
        await fetchData();
      } else {
        const err = await res.json();
        showToast(err.detail || "Override denied", "error");
      }
    } catch (e) {
      showToast("Error submitting override", "error");
    }
  };

  // State Transition (e.g. Approve)
  const handleTransition = async (newStatus: string) => {
    if (!contentItem) return;
    try {
      const res = await fetch(`${API_BASE}/v1/content-items/${contentItem.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          rationale: `Transitioned to ${newStatus} by ${currentUser.name}`
        })
      });
      if (res.ok) {
        showToast(`Workflow status updated to: ${newStatus.toUpperCase()}`, "success");
        if (newStatus === 'approved') {
          setShowCelebration(true);
        }
        await fetchData();
      } else {
        const err = await res.json();
        showToast(err.detail || "Status transition blocked", "error");
      }
    } catch (e) {
      showToast("Error transitioning status", "error");
    }
  };

  // Load Blueprint Scenario
  const handleLoadScenario = async (key: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/demo/load-scenario/${key}`, { method: 'POST' });
      if (res.ok) {
        showToast(`Loaded Blueprint Scenario: ${key.replace('_', ' ').toUpperCase()}`, "info");
        await fetchData();
      } else {
        showToast("Failed to load scenario", "error");
      }
    } catch (e) {
      showToast("Error loading scenario", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Export Compliance Report
  const handleExportClick = async () => {
    if (!contentItem) return;
    try {
      const res = await fetch(`${API_BASE}/v1/content-items/${contentItem.id}/export`);
      if (res.ok) {
        const data = await res.json();
        setExportData(data);
        setShowExportModal(true);
      }
    } catch (e) {
      showToast("Failed to generate export report", "error");
    }
  };

  // Text to Speech Read-Aloud
  const speakText = (title: string, explanation: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${title}. ${explanation}`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      showToast("Reading finding aloud...", "info");
    } else {
      showToast("Speech synthesis not supported in this browser", "error");
    }
  };

  // Contrast calculator test
  const runContrastTest = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/tools/contrast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text_color: contrastTest.text,
          bg_color: contrastTest.bg
        })
      });
      if (res.ok) {
        const data = await res.json();
        setContrastTest(prev => ({ ...prev, result: data }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtering findings
  const filteredFindings = reviewRun?.findings?.filter((f: any) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'blockers') return f.severity === 'critical_blocker';
    if (categoryFilter === 'warnings') return f.severity === 'major_warning';
    return f.category === categoryFilter;
  }) || [];

  return (
    <div className="min-h-screen bg-[#070c09] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Restrained Completion Particle Effect (IS 22) */}
      <CelebrationFX active={showCelebration} onComplete={() => setShowCelebration(false)} />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200' :
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500 text-rose-200' :
          'bg-slate-900/90 border-slate-600 text-slate-200'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-16 border-b border-[#182e22] bg-[#0c1611] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div
            onClick={() => setActiveTab('welcome')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider text-slate-100">INKLOOM AI</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Blueprint v1.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enterprise Brand Governance &amp; Explainable AI</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Workspace Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#112219] border border-[#213f2f] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-emerald-300">Nadi Naturals</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Master Brand</span>
          </div>
        </div>

        {/* Controls: Persona Switcher, Blueprint Scenarios, Auth */}
        <div className="flex items-center space-x-3">
          {/* Blueprint Scenarios Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden xl:inline">Test Scenario:</span>
            <select
              className="bg-[#101f17] border border-[#213d2d] text-emerald-300 text-xs rounded-lg px-3 py-1.5 focus:border-emerald-500 focus:outline-none cursor-pointer"
              onChange={(e) => {
                handleLoadScenario(e.target.value);
                if (activeTab === 'welcome') setActiveTab('studio');
              }}
              defaultValue=""
            >
              <option value="" disabled>Select Blueprint Scenario (1-10)...</option>
              <option value="terminology_conflict">1. Terminology Conflict (Legacy Product Name)</option>
              <option value="unsupported_claim">2. Unsupported Claim ("Most Trusted in India")</option>
              <option value="expired_offer">3. Expired Offer (Festive discount past Oct 15)</option>
              <option value="tone_mismatch">4. Tone Mismatch (Sarcastic &amp; Pushy Copy)</option>
              <option value="logo_misuse">5. Logo Misuse (Stretched 1.8:1 Aspect Ratio)</option>
              <option value="accessibility">6. Accessibility &amp; Low Contrast (#B0A090)</option>
              <option value="code_switching">7. Hinglish Nuance &amp; Code-Switching</option>
              <option value="source_conflict">8. Source Conflict (100% vs 98.5% Organic)</option>
              <option value="voice_dictation">9. Voice Dictation &amp; Audio Review</option>
              <option value="prompt_injection">10. Security: Adversarial Prompt Injection</option>
            </select>
          </div>

          {/* User Persona Button & Sign-In */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#112219] border border-[#213f2f] hover:border-emerald-500 text-xs text-slate-200 transition-colors"
            title="Switch User Persona or Authenticate SSO"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium hidden sm:inline">{currentUser.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {currentUser.role}
            </span>
          </button>
        </div>
      </header>

      {/* NAVIGATION BAR */}
      <nav className="border-b border-[#182e22] bg-[#0c1611] px-6 flex items-center justify-between overflow-x-auto">
        <div className="flex space-x-1 shrink-0">
          {[
            { id: 'welcome', label: 'Welcome & Tour', icon: Home },
            { id: 'studio', label: 'Review Studio', icon: FileText },
            { id: 'queue', label: 'Review Queue', icon: Layers },
            { id: 'sources', label: 'Brand Library & Sources', icon: BookOpen },
            { id: 'assets', label: 'Visual & Asset Governance', icon: Palette },
            { id: 'analytics', label: 'Governance Analytics', icon: BarChart3 },
            { id: 'audit', label: 'Security & Audit Trail', icon: ShieldAlert },
            { id: 'settings', label: 'Settings & Policy', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-xs text-slate-300 hover:text-emerald-300 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#213f2f] bg-[#0e1d15] transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Ingest Source</span>
          </button>

          <button
            onClick={async () => {
              await fetch(`${API_BASE}/v1/demo/reset`, { method: 'POST' });
              showToast("Workspace state reset to default Nadi Naturals baseline.", "info");
              await fetchData();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#213f2f] bg-[#0e1d15]"
            title="Reset database to fresh default state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </nav>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 overflow-auto bg-[#070c09]">
        {/* TAB 0: WELCOME & TOUR PAGE */}
        {activeTab === 'welcome' && (
          <WelcomePage
            onEnterStudio={() => setActiveTab('studio')}
            onOpenAuth={() => setShowAuthModal(true)}
            onLoadScenario={(sc) => handleLoadScenario(sc)}
          />
        )}

        {/* TAB 1: REVIEW STUDIO */}
        {activeTab === 'studio' && (
          <div className="h-full flex flex-col">
            {/* Top Studio Bar */}
            <div className="px-6 py-3 border-b border-[#182e22] bg-[#0a130e] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent font-semibold text-slate-100 text-sm border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1"
                />
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs text-slate-400 font-mono">v{contentItem?.current_version || 1}</span>
                <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-[#102218] border border-[#213f2f]">
                  SHA-256: {contentItem?.current_hash?.substring(0, 10)}...
                </span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Diff View Toggle */}
                <button
                  onClick={() => setShowDiffView(!showDiffView)}
                  className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center space-x-1 transition-colors ${
                    showDiffView ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-[#101f17] text-slate-400 border-[#213d2d]'
                  }`}
                  title="Toggle Visual Diff against original version"
                >
                  <SplitSquareVertical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Diff Mode</span>
                </button>

                {/* Channel Selector */}
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="bg-[#101f17] border border-[#213d2d] text-xs text-slate-300 rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="social">Channel: Social Media</option>
                  <option value="web">Channel: Web Landing Page</option>
                  <option value="email">Channel: Email Campaign</option>
                  <option value="support">Channel: Support Article</option>
                  <option value="ad">Channel: Digital Ad</option>
                  <option value="print">Channel: Packaging / Print</option>
                </select>

                {/* Locale Selector */}
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="bg-[#101f17] border border-[#213d2d] text-xs text-slate-300 rounded px-2.5 py-1 focus:outline-none"
                >
                  <option value="en-IN">Locale: English (India)</option>
                  <option value="hi-IN">Locale: Hindi (हिन्दी)</option>
                  <option value="ta-IN">Locale: Tamil (தமிழ்)</option>
                  <option value="te-IN">Locale: Telugu (తెలుగు)</option>
                  <option value="bn-IN">Locale: Bengali (বাংলা)</option>
                </select>

                {/* Status Indicator */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  contentItem?.status === 'approved' ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/60' :
                  contentItem?.status === 'changes_requested' ? 'bg-amber-950/70 text-amber-400 border-amber-500/60' :
                  contentItem?.status === 'rejected' ? 'bg-rose-950/70 text-rose-400 border-rose-500/60' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {contentItem?.status || 'in_review'}
                </div>
              </div>
            </div>

            {/* Studio Main Split (Editor on Left, Findings on Right) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
              {/* LEFT COLUMN: CONTENT EDITOR & ATTACHMENTS (7 Cols) */}
              <div className="lg:col-span-7 border-r border-[#182e22] flex flex-col h-full bg-[#070c09]">
                <div className="p-4 border-b border-[#182e22] bg-[#0a130e] flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">Pre-Publication Working Surface</span>
                    <span>•</span>
                    <span>{currentText.length} characters</span>
                    <span>•</span>
                    <span>{currentText.split(/\s+/).filter(Boolean).length} words</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Voice Dictation (IS 12) */}
                    <button
                      onClick={() => setShowVoiceModal(true)}
                      className="flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800/70 px-3 py-1.5 rounded-lg hover:bg-emerald-900/60 transition-colors shadow"
                      title="Dictate content in Hindi or English (Voice Safety IS 38)"
                    >
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dictate</span>
                    </button>

                    {/* Run Review Button */}
                    <button
                      onClick={handleTriggerReview}
                      disabled={isLoading}
                      className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Auditing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Governance Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Editor or Diff View */}
                <div className="flex-1 p-6 flex flex-col relative overflow-y-auto space-y-4">
                  {isLoading && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/30 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-1/3 animate-scanline" />
                    </div>
                  )}

                  {!showDiffView ? (
                    <textarea
                      value={currentText}
                      onChange={(e) => setCurrentText(e.target.value)}
                      placeholder="Enter or paste campaign copy here to evaluate against approved brand sources..."
                      className="flex-1 min-h-[220px] w-full bg-[#0a140f] border border-[#1a3325] rounded-xl p-5 text-slate-100 text-base leading-relaxed focus:border-emerald-500 focus:outline-none resize-none font-sans shadow-inner"
                    />
                  ) : (
                    <div className="flex-1 min-h-[220px] w-full bg-[#0a140f] border border-[#1a3325] rounded-xl p-5 text-slate-100 text-sm leading-relaxed font-sans space-y-3">
                      <div className="text-[11px] font-mono text-slate-400 uppercase">Version Diff Inspection</div>
                      <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300">
                        <span className="text-[10px] uppercase font-mono block text-rose-400">Previous / Flagged Phrasing:</span>
                        "{contentItem?.versions?.[0]?.content_text || currentText}"
                      </div>
                      <div className="p-3 rounded bg-emerald-950/20 border border-emerald-900/40 text-emerald-300">
                        <span className="text-[10px] uppercase font-mono block text-emerald-400">Active Approved Revisions:</span>
                        "{currentText}"
                      </div>
                    </div>
                  )}

                  {/* Attached Visual Asset Canvas Viewer with Bounding Boxes */}
                  {contentItem?.image_metadata && (
                    <VisualCanvasViewer
                      imageMetadata={contentItem.image_metadata}
                      findings={reviewRun?.findings || []}
                    />
                  )}
                </div>

                {/* BOTTOM WORKFLOW ACTIONS BAR */}
                <div className="p-4 border-t border-[#182e22] bg-[#0a130e] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Review Decision:</span>
                    {contentItem?.approved_version ? (
                      <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Signed &amp; Approved (v{contentItem.approved_version})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Pending formal sign-off</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleTransition('changes_requested')}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 border border-amber-800/70 hover:bg-amber-950/50 transition-colors"
                    >
                      Request Changes
                    </button>

                    <button
                      onClick={() => handleTransition('approved')}
                      disabled={reviewRun?.blockers_count > 0}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
                      title={reviewRun?.blockers_count > 0 ? "Cannot approve: active critical blockers must be resolved or overridden." : "Sign off on this immutable version"}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Approve Content</span>
                    </button>

                    <button
                      onClick={handleExportClick}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-[#213f2f] hover:bg-[#112219] transition-colors flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Certificate</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FINDINGS STREAM & EVIDENCE CITATIONS (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col h-full bg-[#070c09] overflow-hidden">
                {/* Findings Summary Header */}
                <div className="p-4 border-b border-[#182e22] bg-[#0a130e]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
                        Governance Findings
                      </span>
                      <span className="text-xs text-slate-400">({reviewRun?.total_findings || 0})</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {reviewRun?.duration_ms || 0}ms execution
                    </div>
                  </div>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      onClick={() => setCategoryFilter(categoryFilter === 'blockers' ? 'all' : 'blockers')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        categoryFilter === 'blockers'
                          ? 'bg-rose-950/70 border-rose-500'
                          : 'bg-[#150d10] border-rose-900/40 hover:border-rose-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold text-rose-400">Blockers</div>
                      <div className="text-lg font-bold text-rose-200">{reviewRun?.blockers_count || 0}</div>
                    </div>

                    <div
                      onClick={() => setCategoryFilter(categoryFilter === 'warnings' ? 'all' : 'warnings')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        categoryFilter === 'warnings'
                          ? 'bg-amber-950/70 border-amber-500'
                          : 'bg-[#17140e] border-amber-900/40 hover:border-amber-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold text-amber-400">Warnings</div>
                      <div className="text-lg font-bold text-amber-200">{reviewRun?.warnings_count || 0}</div>
                    </div>

                    <div
                      onClick={() => setCategoryFilter('all')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        categoryFilter === 'all'
                          ? 'bg-emerald-950/70 border-emerald-500'
                          : 'bg-[#0e1813] border-[#1e382a] hover:border-emerald-700'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold text-emerald-400">Total Checks</div>
                      <div className="text-lg font-bold text-emerald-200">{reviewRun?.checks_executed?.length || 9}</div>
                    </div>
                  </div>
                </div>

                {/* Findings Cards Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredFindings.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-2" />
                      <p className="text-sm font-medium text-slate-300">Zero Governance Violations Detected</p>
                      <p className="text-xs text-slate-500 mt-1">This version complies with all approved brand guidelines and sources.</p>
                    </div>
                  ) : (
                    filteredFindings.map((finding: any) => {
                      const isBlocker = finding.severity === 'critical_blocker';
                      const isWarning = finding.severity === 'major_warning';
                      const isOverridden = finding.status === 'overridden';

                      return (
                        <div
                          key={finding.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isOverridden
                              ? 'bg-[#0f1411] border-slate-700 opacity-60'
                              : isBlocker
                              ? 'bg-[#150d10] border-rose-900/80 hover:border-rose-500'
                              : isWarning
                              ? 'bg-[#17140e] border-amber-900/80 hover:border-amber-500'
                              : 'bg-[#0b1410] border-[#1c3627] hover:border-emerald-500'
                          }`}
                        >
                          {/* Finding Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {isBlocker ? (
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              ) : (
                                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-slate-100">{finding.title}</span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* TTS Listen Button */}
                              <button
                                onClick={() => speakText(finding.title, finding.explanation)}
                                className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-[#14261d]"
                                title="Listen to finding explanation (IS 12)"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium ${
                                isOverridden ? 'bg-slate-800 text-slate-400' :
                                isBlocker ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                isWarning ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                'bg-sky-950 text-sky-300 border border-sky-800'
                              }`}>
                                {isOverridden ? 'OVERRIDDEN' : finding.severity.replace('_', ' ')}
                              </span>
                            </div>
                          </div>

                          {/* Quoted Text Span Highlight */}
                          {finding.text_span && (
                            <div className="mt-2 text-xs bg-[#070d0a] border border-[#162a1e] rounded p-2 text-slate-300">
                              <span className="text-slate-500 text-[10px] uppercase block font-mono mb-0.5">Flagged Span</span>
                              <span className="text-rose-300 font-medium">"{finding.text_span.highlight_text}"</span>
                            </div>
                          )}

                          {/* Visual Region Note */}
                          {finding.visual_region && (
                            <div className="mt-2 text-xs bg-[#070d0a] border border-[#162a1e] rounded p-2 text-slate-300 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-mono text-slate-500">Visual Region Detected</span>
                              <span className="text-amber-400 text-xs font-mono font-semibold">
                                [{finding.visual_region.x}, {finding.visual_region.y} {finding.visual_region.width}x{finding.visual_region.height}]
                              </span>
                            </div>
                          )}

                          {/* Explanation */}
                          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                            {finding.explanation}
                          </p>

                          {/* Evidence Citation (RAG IS 06) */}
                          {finding.source_references && finding.source_references.length > 0 && (
                            <div className="mt-3 p-2.5 rounded-lg bg-[#08120d] border border-emerald-950 flex flex-col space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                                <span className="flex items-center space-x-1">
                                  <BookOpen className="w-3 h-3" />
                                  <span>{finding.source_references[0].source_title}</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  v{finding.source_references[0].source_version}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 italic">
                                "{finding.source_references[0].excerpt}"
                              </p>
                              <button
                                onClick={() => {
                                  const s = sources.find(x => x.id === finding.source_references[0].source_id);
                                  if (s) setActiveSourceDrawer(s);
                                }}
                                className="text-[10px] text-emerald-400 hover:underline flex items-center space-x-1 pt-1"
                              >
                                <span>Inspect full source document</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Suggested Replacement Patch */}
                          {finding.suggested_replacement && !isOverridden && (
                            <div className="mt-3 p-2.5 rounded-lg bg-[#0c1a13] border border-emerald-800/50">
                              <div className="text-[10px] font-mono text-emerald-400 uppercase mb-1 flex items-center justify-between">
                                <span>Suggested Brand Correction</span>
                                <span className="text-[10px] text-slate-500">Creates new version</span>
                              </div>
                              <div className="text-xs text-emerald-200 font-medium">
                                "{finding.suggested_replacement}"
                              </div>
                              <div className="mt-2 flex items-center space-x-2">
                                <button
                                  onClick={() => handleAcceptPatch(finding.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-all flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Accept Suggestion</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Finding Action Footer (Override & Feedback) */}
                          <div className="mt-3 pt-2 border-t border-[#172a1e] flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              {/* Override Button (IS 36) */}
                              {!isOverridden && (
                                <button
                                  onClick={() => {
                                    setTargetOverrideFinding(finding);
                                    setShowOverrideModal(true);
                                  }}
                                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                                    ['manager', 'administrator'].includes(currentUser.role)
                                      ? 'text-amber-400 border-amber-800/60 hover:bg-amber-950/40'
                                      : 'text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                                  }`}
                                  title={['manager', 'administrator'].includes(currentUser.role) ? "Record formal override" : "Only Managers or Admins can override"}
                                >
                                  Override...
                                </button>
                              )}

                              {isOverridden && (
                                <span className="text-[10px] text-slate-400 italic">
                                  Overridden by {finding.overridden_by}: "{finding.override_reason}"
                                </span>
                              )}
                            </div>

                            {/* Guideline Feedback (IS 34) */}
                            <div className="flex items-center space-x-1 text-slate-400">
                              <span className="text-[10px] mr-1">Feedback:</span>
                              <button
                                onClick={async () => {
                                  await fetch(`${API_BASE}/v1/findings/${finding.id}/feedback`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ user_id: currentUser.id, feedback_type: 'helpful' })
                                  });
                                  showToast("Marked as helpful. Thank you!", "success");
                                }}
                                className="p-1 hover:text-emerald-400"
                                title="Mark helpful"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={async () => {
                                  await fetch(`${API_BASE}/v1/findings/${finding.id}/feedback`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ user_id: currentUser.id, feedback_type: 'unclear_guidance' })
                                  });
                                  showToast("Marked as Unclear Guidance. Flagged for Brand Owner.", "info");
                                }}
                                className="p-1 hover:text-amber-400"
                                title="Guideline is unclear or contradictory"
                              >
                                <HelpCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEW QUEUE */}
        {activeTab === 'queue' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Governance Review Queue</h2>
                <p className="text-sm text-slate-400">Prioritized pre-publication assets awaiting brand, legal, and regional approval.</p>
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 rounded-lg bg-[#0e1d15] border border-[#1e392a] text-xs font-mono text-emerald-300">
                  Active SLA: 4.0 Hours
                </span>
              </div>
            </div>

            <div className="bg-[#0b1410] border border-[#1c3426] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0f1f16] text-slate-400 font-mono uppercase text-[10px] border-b border-[#1c3426]">
                  <tr>
                    <th className="px-6 py-3.5">Campaign Asset</th>
                    <th className="px-4 py-3.5">Channel</th>
                    <th className="px-4 py-3.5">Locale</th>
                    <th className="px-4 py-3.5">Version &amp; Hash</th>
                    <th className="px-4 py-3.5">Blockers</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15271d]">
                  <tr className="hover:bg-[#0e1b13] transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {contentItem?.title || "Nadi Radiant Dew Instagram & Social Campaign"}
                    </td>
                    <td className="px-4 py-4 uppercase font-mono">{contentItem?.channel || 'social'}</td>
                    <td className="px-4 py-4 font-mono">{contentItem?.locale || 'en-IN'}</td>
                    <td className="px-4 py-4 font-mono text-slate-400">
                      v{contentItem?.current_version} ({contentItem?.current_hash?.substring(0, 8)}...)
                    </td>
                    <td className="px-4 py-4">
                      {reviewRun?.blockers_count > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono font-semibold">
                          {reviewRun.blockers_count} Blocker{reviewRun.blockers_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-semibold">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 uppercase font-semibold text-emerald-400">
                      {contentItem?.status || 'in_review'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveTab('studio')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow"
                      >
                        Open in Studio
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BRAND LIBRARY & SOURCES */}
        {activeTab === 'sources' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Approved Brand Knowledge Library</h2>
                <p className="text-sm text-slate-400">Governed data products: formulation specs, claims register, and glossary (IS 02).</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Candidate Source</span>
              </button>
            </div>

            {/* Source Conflict Alert Banner (IS 33) */}
            {conflicts.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/70 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-amber-200 text-sm">
                    Source Conflict Detected: Active Guidelines Disagree (IS 33)
                  </div>
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    Two active documents disagree on '{conflicts[0]?.attribute}' for '{conflicts[0]?.subject}'.
                    The system halts automated verification and routes this task to Brand Owner Priya Nair.
                  </p>
                  <div className="mt-2 flex space-x-4 text-xs font-mono">
                    <span className="text-slate-300">Spec v2.1: <strong className="text-emerald-400">98.5%</strong></span>
                    <span className="text-slate-300">Legacy Brief: <strong className="text-rose-400">100%</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sources.map((src) => (
                <div key={src.id} className="p-5 rounded-xl bg-[#0b1410] border border-[#1b3426] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-100 text-sm">{src.title}</h3>
                      <p className="text-xs text-slate-400">Owner: {src.owner_name} • v{src.current_version}</p>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      src.approval_state === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {src.approval_state}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#070d0a] p-3 rounded-lg font-mono border border-[#15281d] line-clamp-3">
                    {src.raw_content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#17271e]">
                    <span className="font-mono text-[10px]">
                      Hash: {src.content_hash.substring(0, 10)}...
                    </span>
                    <button
                      onClick={() => setActiveSourceDrawer(src)}
                      className="text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <span>View Chunks</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL & ASSET GOVERNANCE */}
        {activeTab === 'assets' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Visual &amp; Accessibility Brand Governance</h2>
              <p className="text-sm text-slate-400">Master logo geometry, aspect ratio constraints, and WCAG 2.1 AA/AAA contrast.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Geometry Governance */}
              <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1b3426] space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">Master Logo Specifications</h3>
                </div>

                <div className="p-4 rounded-xl bg-[#070d0a] border border-[#16291e] space-y-2">
                  <div className="text-xs text-slate-300 flex justify-between">
                    <span>Master Aspect Ratio:</span>
                    <span className="font-mono text-emerald-400 font-semibold">3.50 : 1</span>
                  </div>
                  <div className="text-xs text-slate-300 flex justify-between">
                    <span>Minimum Clear Space:</span>
                    <span className="font-mono text-slate-400">24px padding all sides</span>
                  </div>
                  <div className="text-xs text-slate-300 flex justify-between">
                    <span>Permitted Backgrounds:</span>
                    <span className="font-mono text-slate-400">#F7F4EB (Cream), #FFFFFF, #1E4D2B</span>
                  </div>
                  <div className="text-xs text-slate-300 flex justify-between">
                    <span>Prohibited Manipulations:</span>
                    <span className="text-rose-400">Non-uniform scaling, stretching, shadows</span>
                  </div>
                </div>

                {/* Stretched logo demonstration alert */}
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Logo Distortion Guard Active</span>
                  </div>
                  <p className="text-rose-300/80">
                    In Scenario 5, an Instagram story asset with aspect ratio 1.75:1 is flagged as a Critical Blocker,
                    preventing brand deformation in public campaigns.
                  </p>
                </div>
              </div>

              {/* Interactive WCAG Contrast Tool (IS 11) */}
              <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1b3426] space-y-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-100 text-sm">WCAG 2.1 Color Contrast Evaluator</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Text Color (Hex)</label>
                    <input
                      type="text"
                      value={contrastTest.text}
                      onChange={(e) => setContrastTest(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-[#070d0a] border border-[#16291e] rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Background Color (Hex)</label>
                    <input
                      type="text"
                      value={contrastTest.bg}
                      onChange={(e) => setContrastTest(prev => ({ ...prev, bg: e.target.value }))}
                      className="w-full bg-[#070d0a] border border-[#16291e] rounded-lg p-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={runContrastTest}
                  className="w-full py-2 bg-[#0f2117] hover:bg-[#142d1f] border border-[#20402e] text-emerald-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  Calculate Ratio
                </button>

                {contrastTest.result && (
                  <div className="p-3.5 rounded-xl bg-[#070d0a] border border-[#16291e] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Contrast Ratio:</span>
                      <span className="font-mono font-bold text-amber-400">{contrastTest.result.contrast_ratio} : 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WCAG AA Normal Text (&gt;= 4.5):</span>
                      <span className={contrastTest.result.passes_wcag_aa_normal_text ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                        {contrastTest.result.passes_wcag_aa_normal_text ? 'PASS' : 'FAIL (Blocker)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GOVERNANCE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Governance Analytics &amp; Guideline Clarity</h2>
                <p className="text-sm text-slate-400">Aggregated insights into recurring defects, cycle time, and ambiguous rules (IS 15 &amp; IS 34).</p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-[#0e1d15] text-emerald-400 text-xs font-mono border border-[#1f3a2b]">
                Synthetic Demo Data Labeled
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#1b3426]">
                <div className="text-xs text-slate-400 uppercase font-medium">Reviews Conducted</div>
                <div className="text-2xl font-bold text-slate-100 mt-1">{analytics?.metrics?.total_reviews_conducted || 14}</div>
                <div className="text-[11px] text-emerald-400 mt-1">100% pre-publication gate</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#1b3426]">
                <div className="text-xs text-slate-400 uppercase font-medium">Avg First Feedback</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{analytics?.metrics?.avg_first_feedback_time_seconds || 1.4}s</div>
                <div className="text-[11px] text-slate-400 mt-1">Instant deterministic engine</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#1b3426]">
                <div className="text-xs text-slate-400 uppercase font-medium">Suggestion Acceptance</div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">{analytics?.metrics?.suggestion_acceptance_rate || '72.4%'}</div>
                <div className="text-[11px] text-slate-400 mt-1">Single-click patch application</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#0b1410] border border-[#1b3426]">
                <div className="text-xs text-slate-400 uppercase font-medium">Stale Sources Flagged</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{analytics?.metrics?.stale_sources_count || 1}</div>
                <div className="text-[11px] text-amber-400/80 mt-1">Festive Glow Kit promo expired</div>
              </div>
            </div>

            {/* Guideline Clarity Analysis (IS 34) */}
            <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1b3426] space-y-4">
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Guideline Clarity Gaps &amp; System Recommendations</span>
              </h3>
              <p className="text-xs text-slate-400">
                Identifies rules with high creator dispute rates or contradictory source documentation.
              </p>

              <div className="space-y-3">
                {analytics?.guideline_clarity_alerts?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#070d0a] border border-[#162a1e] space-y-1">
                    <div className="text-xs font-semibold text-amber-300">{item.rule}</div>
                    <div className="text-xs text-slate-300">{item.issue}</div>
                    <div className="text-xs text-emerald-400 font-medium pt-1">
                      Action: {item.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY & AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Security, Audit &amp; Quality Benchmark Gates</h2>
              <p className="text-sm text-slate-400">Immutable audit log, prompt injection telemetry, and gold corpus benchmark scores (IS 23 &amp; IS 32).</p>
            </div>

            {/* Quality Benchmark Scores (IS 23) */}
            {benchmark && (
              <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1b3426] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Quality Gates Benchmark Results (IS 23)</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{benchmark.timestamp?.substring(0, 19)}</span>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 bg-[#070d0a] rounded-xl border border-[#172b1f]">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Precision</div>
                    <div className="text-lg font-bold text-emerald-400">{benchmark.metrics.precision}%</div>
                  </div>
                  <div className="p-3.5 bg-[#070d0a] rounded-xl border border-[#172b1f]">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Recall</div>
                    <div className="text-lg font-bold text-emerald-400">{benchmark.metrics.recall}%</div>
                  </div>
                  <div className="p-3.5 bg-[#070d0a] rounded-xl border border-[#172b1f]">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Citation Validity</div>
                    <div className="text-lg font-bold text-emerald-400">{benchmark.metrics.citation_validity_rate}%</div>
                  </div>
                  <div className="p-3.5 bg-[#070d0a] rounded-xl border border-[#172b1f]">
                    <div className="text-[10px] uppercase text-slate-400 font-mono">Weighted Accuracy</div>
                    <div className="text-lg font-bold text-emerald-400">{benchmark.metrics.severity_weighted_accuracy}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Log Table */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200 text-sm">Immutable Audit Trail</h3>
              <div className="bg-[#0b1410] border border-[#1c3426] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0f1f16] text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Request ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15271d] font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#0e1b13]">
                        <td className="px-4 py-3 text-slate-400">{log.timestamp?.substring(11, 19)}</td>
                        <td className="px-4 py-3 text-slate-200 font-medium">{log.actor_name}</td>
                        <td className="px-4 py-3 text-slate-400">{log.actor_role}</td>
                        <td className="px-4 py-3 text-emerald-400">{log.action}</td>
                        <td className="px-4 py-3 text-slate-300">{log.target_type}</td>
                        <td className="px-4 py-3 text-slate-500">{log.request_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & TENANT PROFILE */}
        {activeTab === 'settings' && (
          <SettingsView onSave={() => showToast("Tenant governance policy updated.", "success")} />
        )}
      </main>

      {/* MODAL: AUTH / LOGIN / SSO (IS 01 & IS 50) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          showToast(`Authenticated session active: ${u.name} (${u.role.toUpperCase()})`, "success");
        }}
      />

      {/* MODAL: SOURCE UPLOAD (IS 02) */}
      <SourceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={() => {
          showToast("Candidate source uploaded into quarantine.", "info");
          fetchData();
        }}
      />

      {/* MODAL: VOICE DICTATION & EDITABLE TRANSCRIPT (IS 12 & IS 38) */}
      <VoiceDictationModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onApply={(text) => {
          setCurrentText(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + text);
          showToast("Voice transcript inserted into editor.", "info");
        }}
      />

      {/* MODAL: HUMAN OVERRIDE (IS 36) */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0b1410] border border-[#1e382a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-slate-100 text-sm">Human Override Authorization</h3>
              </div>
              <button onClick={() => setShowOverrideModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are overriding a <strong className="text-rose-400 font-mono">CRITICAL BLOCKER</strong> on finding:
              <br />
              <span className="text-emerald-300 font-semibold">"{targetOverrideFinding?.title}"</span>.
              <br />
              This action will be permanently recorded in the immutable audit trail with your name and role.
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Mandatory Audit Rationale (min 10 characters):
              </label>
              <textarea
                value={overrideRationale}
                onChange={(e) => setOverrideRationale(e.target.value)}
                placeholder="e.g. Legal counsel approved exception for festive promotional exception #891."
                className="w-full bg-[#070d0a] border border-[#1a3325] rounded-xl p-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none h-24 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-[#213f2f]"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                disabled={overrideRationale.length < 10}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 shadow-lg"
              >
                Confirm Recorded Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT COMPLIANCE CERTIFICATE (IS 31) */}
      {showExportModal && exportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0b1410] border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100 text-base">Brand Governance Certificate</h3>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#070d0a] border border-[#172b1f] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Certificate Number:</span>
                <span className="text-emerald-400 font-bold">{exportData.certificate_id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Timestamp (UTC):</span>
                <span>{exportData.timestamp}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Content Version:</span>
                <span>v{exportData.version_number}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cryptographic SHA-256 Hash:</span>
                <span className="text-slate-300 text-[10px]">{exportData.content_hash_sha256}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Workflow State:</span>
                <span className="text-emerald-400 uppercase font-bold">{exportData.governance_status}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200">Review Summary</h4>
              <p className="text-slate-300">
                Audited against approved Nadi Naturals brand guide, formulation specs, claims register, and WCAG accessibility standards.
              </p>
              <div className="p-3 bg-[#070d0a] rounded-lg border border-[#172b1f] text-[11px] text-slate-400">
                Checks executed: {exportData.review_summary?.checks_run_count || 9} | Total findings identified: {exportData.review_summary?.findings_count || 0}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic border-t border-[#172a1e] pt-3">
              {exportData.disclaimer}
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: SOURCE DOCUMENT CHUNKS INSPECTOR */}
      {activeSourceDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#0b1410] border-l border-[#1b3426] shadow-2xl p-6 flex flex-col space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">{activeSourceDrawer.title}</h3>
              <p className="text-xs text-slate-400">Version: {activeSourceDrawer.current_version} • {activeSourceDrawer.owner_name}</p>
            </div>
            <button onClick={() => setActiveSourceDrawer(null)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs font-mono bg-[#070d0a] p-3 rounded-xl border border-[#16291e] text-slate-400 space-y-1">
            <div>Source ID: {activeSourceDrawer.id}</div>
            <div>Content Hash: {activeSourceDrawer.content_hash}</div>
            <div>Approval State: {activeSourceDrawer.approval_state}</div>
          </div>

          <div className="space-y-3 flex-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Canonical Content</h4>
            <div className="p-4 rounded-xl bg-[#070d0a] border border-[#16291e] text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {activeSourceDrawer.raw_content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
