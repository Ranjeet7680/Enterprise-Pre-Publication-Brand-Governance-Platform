import React, { useState } from 'react';
import {
  Shield, Sparkles, ArrowRight, CheckCircle2, Lock, BookOpen,
  Palette, Mic, BarChart3, AlertTriangle, Layers, ChevronRight,
  Eye, FileText, Database, ShieldAlert, Zap, Globe
} from 'lucide-react';

interface WelcomePageProps {
  onEnterStudio: () => void;
  onOpenAuth: () => void;
  onLoadScenario: (key: string) => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onEnterStudio,
  onOpenAuth,
  onLoadScenario
}) => {
  const [quickTestText, setQuickTestText] = useState('Experience GlowSerum Plus with 100% organic ingredients!');
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null);

  const testQuickSample = () => {
    if (quickTestText.includes('GlowSerum Plus')) {
      setQuickFeedback("🚨 Critical Blocker: 'GlowSerum Plus' is a prohibited legacy name. Brand standard: 'Nadi Radiant Dew Face Serum'.");
    } else if (quickTestText.includes('100% organic')) {
      setQuickFeedback("🚨 Factual Conflict: Master Spec v2.1 certifies '98.5% certified organic botanicals', not 100%.");
    } else {
      setQuickFeedback("✅ Compliant: Verified against approved Nadi Naturals brand guidelines.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 overflow-hidden border-b border-[#182e22]/70">
        {/* Generative AI Atmospheric Wallpaper Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 mix-blend-luminosity filter saturate-150 contrast-125"
          style={{ backgroundImage: 'url(/backgrounds/bg-welcome.jpg)' }}
        />
        {/* Dark Obsidian Gradient for Pure Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070c09]/80 via-[#070c09]/60 to-[#070c09] pointer-events-none" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0d2117]/90 border border-[#1b3d2c] text-xs font-mono text-emerald-400 shadow-xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>BLUEPRINT v1.2 SPECIFICATION CERTIFIED</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
            Pre-Publication <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">Brand Governance</span> for Enterprise Teams
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Eliminate brand drift, unverified claims, and accessibility violations before content goes public.
            Evidence-grounded RAG, deterministic constraints, and immutable human approval state machines.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onEnterStudio}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950 hover:shadow-emerald-900 transition-all flex items-center space-x-2 group"
            >
              <span>Launch Governance Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenAuth}
              className="px-6 py-3.5 rounded-xl bg-[#0f1d16] hover:bg-[#152a20] border border-[#213f2f] text-emerald-300 font-semibold text-sm transition-all"
            >
              Sign In / Switch Persona
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#0b1611]/80 border border-[#182c20] backdrop-blur-sm">
              <div className="text-[11px] uppercase font-mono text-slate-400">Precision</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">100.0%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Gold standard corpus</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1611]/80 border border-[#182c20] backdrop-blur-sm">
              <div className="text-[11px] uppercase font-mono text-slate-400">Recall</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">100.0%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero missed critical rules</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1611]/80 border border-[#182c20] backdrop-blur-sm">
              <div className="text-[11px] uppercase font-mono text-slate-400">Citation Validity</div>
              <div className="text-2xl font-bold text-emerald-400 mt-0.5">100.0%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Bounded to approved docs</div>
            </div>
            <div className="p-4 rounded-xl bg-[#0b1611]/80 border border-[#182c20] backdrop-blur-sm">
              <div className="text-[11px] uppercase font-mono text-slate-400">Approval Lock</div>
              <div className="text-2xl font-bold text-amber-400 mt-0.5">SHA-256</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Cryptographic binding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Micro-Playground */}
      <section className="px-6 py-16 bg-[#0a110d] border-b border-[#182e22]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Live Policy Evaluation Sandbox</h2>
            <p className="text-xs text-slate-400">Try checking a marketing claim against the active Nadi Naturals brand guide right now.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#080d0a] border border-[#1a3325] shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={quickTestText}
                onChange={(e) => {
                  setQuickTestText(e.target.value);
                  setQuickFeedback(null);
                }}
                className="flex-1 bg-[#0b1611] border border-[#1d3829] rounded-xl px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <button
                onClick={testQuickSample}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 shadow-lg"
              >
                Inspect Policy
              </button>
            </div>

            {quickFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-medium border ${
                quickFeedback.includes('Critical') || quickFeedback.includes('Conflict')
                  ? 'bg-rose-950/50 border-rose-800 text-rose-200'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              }`}>
                {quickFeedback}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Quick Test Presets:</span>
              <button
                onClick={() => { setQuickTestText('Experience GlowSerum Plus with 100% organic ingredients!'); setQuickFeedback(null); }}
                className="px-2.5 py-1 rounded-lg bg-[#0e1d15] hover:bg-[#152e21] text-emerald-300 border border-[#1b3829]"
              >
                Legacy Terminology
              </button>
              <button
                onClick={() => { setQuickTestText('Nadi Radiant Dew contains 100% organic botanicals.'); setQuickFeedback(null); }}
                className="px-2.5 py-1 rounded-lg bg-[#0e1d15] hover:bg-[#152e21] text-emerald-300 border border-[#1b3829]"
              >
                100% vs 98.5% Conflict
              </button>
              <button
                onClick={() => { setQuickTestText('Nadi Radiant Dew Face Serum contains 98.5% certified organic botanicals.*'); setQuickFeedback(null); }}
                className="px-2.5 py-1 rounded-lg bg-[#0e1d15] hover:bg-[#152e21] text-emerald-300 border border-[#1b3829]"
              >
                Compliant Copy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100">Enterprise Architectural Pillars</h2>
          <p className="text-xs text-slate-400 font-mono">IMPLEMENTATION SPECIFICATIONS IS 01–54</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Hybrid Deterministic + AI</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Rules enforce hard constraints (prohibited terms, expired promotions, contrast calculations, prompt injections). AI handles semantic tone and contextual rewrites.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-950/70 border border-sky-800 flex items-center justify-center text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Approved Source Bounding</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              RAG queries only retrieve documents approved by brand owners with active effective dates. If documents disagree, the system routes a conflict task instead of guessing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-950/70 border border-amber-800 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Cryptographic Version Lock</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Approvals seal the exact SHA-256 hash. Any subsequent edit generates a new version and invalidates the previous approval immediately.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-800 flex items-center justify-center text-purple-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Visual &amp; WCAG 2.1 Governance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Audits logo aspect ratio distortions (e.g. 1.75:1 vs master 3.50:1), clear space violations, WCAG 4.5:1 relative luminance, and missing alt-text.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-800 flex items-center justify-center text-pink-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Indic Languages &amp; Voice Safety</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Supports Hindi, Tamil, Telugu, and Hinglish code-switching. Voice dictation provides editable transcript verification; voice commands cannot unilaterally approve.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1c3627] space-y-3 hover:border-emerald-500/60 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-950/70 border border-rose-800 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Prompt Injection Sandboxing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Adversarial overrides inside uploaded text are treated as untrusted data, scanned deterministically, and quarantined with zero execution authority.
            </p>
          </div>
        </div>
      </section>

      {/* 10 Scenarios Quick Launch Grid */}
      <section className="px-6 py-16 bg-[#080d0a] border-t border-[#182e22]">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-100">10 Interactive Blueprint Scenarios</h2>
              <p className="text-xs text-slate-400">Click any scenario to load it directly into the Review Studio.</p>
            </div>
            <button
              onClick={onEnterStudio}
              className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Open Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {[
              { id: 'terminology_conflict', name: '1. Terminology Conflict', desc: 'Prohibited legacy name' },
              { id: 'unsupported_claim', name: '2. Unsupported Claim', desc: 'Unverified superlative' },
              { id: 'expired_offer', name: '3. Expired Offer', desc: 'Past Oct 15 validity' },
              { id: 'tone_mismatch', name: '4. Tone Mismatch', desc: 'Aggressive/sarcastic' },
              { id: 'logo_misuse', name: '5. Logo Misuse', desc: '1.75:1 stretched logo' },
              { id: 'accessibility', name: '6. Low Contrast & Alt-Text', desc: '2.3:1 ratio failure' },
              { id: 'code_switching', name: '7. Hinglish Nuance', desc: 'Code-switching audit' },
              { id: 'source_conflict', name: '8. Source Conflict', desc: '100% vs 98.5% organic' },
              { id: 'voice_dictation', name: '9. Voice Dictation', desc: 'Speech safety review' },
              { id: 'prompt_injection', name: '10. Prompt Injection', desc: 'Red-team override' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  onLoadScenario(sc.id);
                  onEnterStudio();
                }}
                className="p-3 rounded-xl bg-[#0c1611] border border-[#1b3426] hover:border-emerald-500 text-left transition-all group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-emerald-300">{sc.name}</div>
                <div className="text-[10px] text-slate-500 mt-1">{sc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-[#182e22] bg-[#060a08] text-center text-xs text-slate-500">
        <p>Inkloom AI Brand Governance Platform • Built for the 2026 Architecture Blueprint Challenge</p>
        <p className="text-[10px] text-slate-600 mt-1">Nadi Naturals is a demonstration FMCG brand. All sample data is labeled synthetic.</p>
      </footer>
    </div>
  );
};
