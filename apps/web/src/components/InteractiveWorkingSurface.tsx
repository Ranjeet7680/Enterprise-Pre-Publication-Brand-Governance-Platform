import React, { useState } from 'react';
import {
  FileText, Sparkles, Mic, RefreshCw, SplitSquareVertical,
  Edit3, Eye, Check, AlertCircle, AlertTriangle, ChevronRight,
  Zap, Smartphone, ShieldCheck, BarChart2, Layers, CheckCircle2,
  Copy, ExternalLink, ArrowRight, CornerDownLeft
} from 'lucide-react';

export interface InteractiveWorkingSurfaceProps {
  currentText: string;
  onTextChange: (newText: string) => void;
  reviewRun: any;
  contentItem: any;
  limitConfig: { maxChars: number; label: string };
  isLoading: boolean;
  onTriggerAudit: (text: string, imgMeta?: any) => void;
  onOpenVoiceModal: () => void;
  onAcceptPatch: (finding: any) => void;
  onAutoFixAll: () => void;
  onLoadScenario: (scenarioKey: string) => void;
  selectedFindingId: string | null;
  onSelectFinding: (findingId: string | null) => void;
  onFixLogo?: () => void;
  onFixContrast?: () => void;
  onFixAltText?: () => void;
}

export const InteractiveWorkingSurface: React.FC<InteractiveWorkingSurfaceProps> = ({
  currentText,
  onTextChange,
  reviewRun,
  contentItem,
  limitConfig,
  isLoading,
  onTriggerAudit,
  onOpenVoiceModal,
  onAcceptPatch,
  onAutoFixAll,
  onLoadScenario,
  selectedFindingId,
  onSelectFinding,
  onFixLogo,
  onFixContrast,
  onFixAltText
}) => {
  const [viewMode, setViewMode] = useState<'linter' | 'raw' | 'diff'>('linter');
  const [activeBottomTab, setActiveBottomTab] = useState<'canvas' | 'instagram' | 'health'>('canvas');
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);

  const findings = reviewRun?.findings || [];
  const textFindings = findings.filter((f: any) => f.text_span && f.status === 'open');
  const autoFixableCount = textFindings.filter((f: any) => f.suggested_replacement).length;
  const isNearLimit = currentText.length > limitConfig.maxChars * 0.9;

  // Selected or hovered finding detail
  const activeFocusFinding = findings.find(
    (f: any) => f.id === (hoveredFindingId || selectedFindingId)
  );

  // Split text into tokens with highlighted spans
  const renderAnnotatedText = () => {
    if (!textFindings || textFindings.length === 0) {
      return (
        <p className="text-slate-100 text-base leading-relaxed font-sans whitespace-pre-wrap">
          {currentText}
        </p>
      );
    }

    // Sort spans by start_offset
    const sorted = [...textFindings].sort(
      (a, b) => (a.text_span.start_offset || 0) - (b.text_span.start_offset || 0)
    );

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((finding, idx) => {
      const span = finding.text_span;
      if (!span || span.start_offset === undefined || span.end_offset === undefined) return;
      if (span.start_offset < lastIndex) return; // skip overlapping for safety

      // Preceding normal text
      if (span.start_offset > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}`}>
            {currentText.substring(lastIndex, span.start_offset)}
          </span>
        );
      }

      const isBlocker = finding.severity === 'critical_blocker';
      const isSelected = selectedFindingId === finding.id || hoveredFindingId === finding.id;
      const flaggedText = currentText.substring(span.start_offset, span.end_offset);

      segments.push(
        <span
          key={`span-${finding.id}-${idx}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectFinding(selectedFindingId === finding.id ? null : finding.id);
          }}
          onMouseEnter={() => setHoveredFindingId(finding.id)}
          onMouseLeave={() => setHoveredFindingId(null)}
          title={`Click to inspect finding: ${finding.title}`}
          className={`inline-block px-1.5 py-0.5 my-0.5 rounded text-sm font-medium cursor-pointer transition-all ${
            isBlocker
              ? 'bg-rose-950/80 text-rose-200 border-b-2 border-rose-500 hover:bg-rose-900 shadow'
              : 'bg-amber-950/80 text-amber-200 border-b-2 border-amber-500 hover:bg-amber-900 shadow'
          } ${
            isSelected
              ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#070c09] scale-[1.02]'
              : ''
          }`}
        >
          {flaggedText}
          <span
            className={`ml-1 text-[9px] uppercase px-1 py-0.2 rounded font-mono font-bold ${
              isBlocker ? 'bg-rose-900/90 text-rose-300' : 'bg-amber-900/90 text-amber-300'
            }`}
          >
            {isBlocker ? 'Blocker' : 'Warning'}
          </span>
        </span>
      );

      lastIndex = span.end_offset;
    });

    if (lastIndex < currentText.length) {
      segments.push(
        <span key={`text-end-${lastIndex}`}>
          {currentText.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="text-slate-100 text-base leading-relaxed font-sans whitespace-pre-wrap select-text">
        {segments}
      </div>
    );
  };

  // Calculate Health Radar Metrics
  const blockersCount = reviewRun?.blockers_count || 0;
  const warningsCount = reviewRun?.warnings_count || 0;
  const totalFindings = reviewRun?.total_findings || 0;
  let healthScore = 100;
  if (blockersCount > 0) healthScore = Math.max(35, 100 - blockersCount * 14 - warningsCount * 5);
  else if (warningsCount > 0) healthScore = Math.max(75, 100 - warningsCount * 7);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 1. SURFACE HEADER & CONTROLS */}
      <div className="p-3.5 border-b border-[#182e22] bg-[#0a130e] flex flex-wrap items-center justify-between gap-2">
        {/* Left: Title & Mode Switchers */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 mr-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Pre-Publication Working Surface</span>
            <span className="sm:hidden">Working Surface</span>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex items-center bg-[#070c09] border border-[#1b3427] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('linter')}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'linter'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Interactive Visual Linter with inline highlighted spans"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Linter</span>
              {textFindings.length > 0 && (
                <span className="ml-1 text-[10px] bg-rose-900/90 text-rose-200 px-1 rounded-full font-mono">
                  {textFindings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setViewMode('raw')}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'raw'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Raw plain text editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Raw Editor</span>
            </button>

            <button
              onClick={() => setViewMode('diff')}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'diff'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Inspect Version Diff"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Diff</span>
            </button>
          </div>
        </div>

        {/* Right: Actions (Auto-Fix, Presets, Dictate, Run) */}
        <div className="flex items-center space-x-2">
          {/* Quick Demo Scenarios Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) onLoadScenario(e.target.value);
            }}
            defaultValue=""
            className="bg-[#101f17] border border-[#213d2d] text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-emerald-500"
            title="Load demo scenario"
          >
            <option value="" disabled>Load Demo Scenario...</option>
            <option value="risky">🚨 Risky Launch (5 Blockers, 2 Warnings)</option>
            <option value="clean">✅ 100% Compliant (Ready to Approve)</option>
            <option value="injection">🛡️ Prompt Injection Attack</option>
            <option value="hinglish">🇮🇳 Hinglish Nuance & Code-Switching</option>
          </select>

          {/* 1-Click Auto-Remediate All Fixable Spans */}
          {autoFixableCount > 0 && (
            <button
              onClick={onAutoFixAll}
              className="flex items-center space-x-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-emerald-950 transition-all animate-pulse"
              title="Apply all approved brand corrections in one click"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Fix ({autoFixableCount})</span>
            </button>
          )}

          {/* Voice Dictation (IS 12) */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-800/70 px-2.5 py-1.5 rounded-lg hover:bg-emerald-900/60 transition-colors shadow"
            title="Dictate content in Hindi or English (Voice Safety IS 38)"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Dictate</span>
          </button>

          {/* Run Governance Review */}
          <button
            onClick={() => onTriggerAudit(currentText)}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg shadow-lg shadow-emerald-950 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKING SURFACE AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Editor or Visual Annotation Surface */}
        <div className="relative min-h-[170px] bg-[#0a140f] border border-[#1a3325] rounded-xl p-4 shadow-inner flex flex-col justify-between">
          {isLoading && (
            <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/30 overflow-hidden rounded-t-xl">
              <div className="h-full bg-emerald-400 w-1/3 animate-scanline" />
            </div>
          )}

          {viewMode === 'linter' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-2 border-b border-[#14261d]">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Interactive Linter Active &bull; Click any flagged term to inspect &amp; resolve</span>
                </span>
                <button
                  onClick={() => setViewMode('raw')}
                  className="text-slate-400 hover:text-emerald-300 underline"
                >
                  Edit Raw Text
                </button>
              </div>

              {renderAnnotatedText()}
            </div>
          )}

          {viewMode === 'raw' && (
            <textarea
              value={currentText}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Enter or paste campaign copy here to evaluate against approved brand sources..."
              className="w-full min-h-[130px] bg-transparent text-slate-100 text-base leading-relaxed focus:outline-none resize-none font-sans"
            />
          )}

          {viewMode === 'diff' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono text-slate-400 uppercase">
                Version Diff Inspection (v1 Base vs v{contentItem?.current_version || 1} Active)
              </div>
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 text-xs">
                <span className="text-[10px] uppercase font-mono block text-rose-400 font-bold mb-0.5">
                  Base / Draft Phrasing:
                </span>
                "{contentItem?.versions?.[0]?.content_text || currentText}"
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-xs">
                <span className="text-[10px] uppercase font-mono block text-emerald-400 font-bold mb-0.5">
                  Active Approved Revision:
                </span>
                "{currentText}"
              </div>
            </div>
          )}

          {/* Char and Word Counter Bar */}
          <div className="pt-3 border-t border-[#14261d] flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className={isNearLimit ? 'text-amber-400 font-semibold' : ''}>
                {currentText.length} / {limitConfig.maxChars} chars
              </span>
              <span>&bull;</span>
              <span>{currentText.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            {textFindings.length > 0 && viewMode === 'raw' && (
              <span className="text-rose-400 text-[11px] font-mono">
                {textFindings.length} violations flagged &bull; Switch to Visual Linter to review
              </span>
            )}
          </div>
        </div>

        {/* Floating Quick Action Card when a finding is selected */}
        {activeFocusFinding && activeFocusFinding.text_span && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#121f18] to-[#0c1712] border border-emerald-700/60 shadow-xl flex items-center justify-between animate-fadeIn">
            <div className="space-y-0.5 max-w-lg">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                  activeFocusFinding.severity === 'critical_blocker'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {activeFocusFinding.severity === 'critical_blocker' ? 'Critical Blocker' : 'Warning'}
                </span>
                <span className="text-xs font-semibold text-slate-100">{activeFocusFinding.title}</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {activeFocusFinding.explanation}
              </p>
              {activeFocusFinding.suggested_replacement && (
                <div className="text-[11px] text-emerald-300 font-mono flex items-center space-x-1">
                  <span>Replace with:</span>
                  <span className="font-semibold underline">"{activeFocusFinding.suggested_replacement}"</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {activeFocusFinding.suggested_replacement && (
                <button
                  onClick={() => onAcceptPatch(activeFocusFinding)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow flex items-center space-x-1"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>1-Click Fix</span>
                </button>
              )}
              <button
                onClick={() => onSelectFinding(null)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 3. OMNICHANNEL & ASSET INSPECTION DECK (Tabs below editor) */}
        <div className="bg-[#08120d] border border-[#182e22] rounded-xl overflow-hidden shadow-lg">
          {/* Deck Tab Bar */}
          <div className="flex items-center justify-between border-b border-[#182e22] bg-[#0a150f] px-3 pt-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveBottomTab('canvas')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
                  activeBottomTab === 'canvas'
                    ? 'bg-[#08120d] text-emerald-400 border-[#182e22] -mb-px'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Visual Asset &amp; Logo Spec</span>
                {(reviewRun?.findings?.filter((f: any) => f.category === 'visual_identity' || f.category === 'accessibility').length || 0) > 0 && (
                  <span className="ml-1 text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1 rounded-full font-mono">
                    {reviewRun?.findings?.filter((f: any) => f.category === 'visual_identity' || f.category === 'accessibility').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveBottomTab('instagram')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
                  activeBottomTab === 'instagram'
                    ? 'bg-[#08120d] text-emerald-400 border-[#182e22] -mb-px'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Live Feed Preview (Instagram)</span>
              </button>

              <button
                onClick={() => setActiveBottomTab('health')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-t border-x ${
                  activeBottomTab === 'health'
                    ? 'bg-[#08120d] text-emerald-400 border-[#182e22] -mb-px'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Compliance Radar</span>
                <span className={`ml-1 text-[9px] font-mono px-1 rounded-full ${
                  healthScore === 100 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                }`}>
                  {healthScore}%
                </span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-slate-500 pb-1.5">
              Omnichannel Publishing Surface
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-3.5">
            {/* TAB 1: Visual Asset Inspector */}
            {activeBottomTab === 'canvas' && (
              <div>
                {/* Visual Diagnostics */}
                {contentItem?.image_metadata && (
                  <div className="space-y-3">
                    {/* Visual Asset Canvas */}
                    {/* Rendered through VisualCanvasViewer */}
                    <div className="w-full">
                      {/* Integrated Visual Asset View */}
                      <div className="p-3 bg-[#050a07] border border-[#162a1e] rounded-xl space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                          <span className="flex items-center space-x-1.5">
                            <Eye className="w-4 h-4 text-emerald-400" />
                            <span>Campaign Visual Media Bounding Box Analysis</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Canvas: {contentItem.image_metadata.width || 1080} x {contentItem.image_metadata.height || 1080} px
                          </span>
                        </div>

                        {/* Visual Asset Graphic Simulation */}
                        <div className="w-full h-36 bg-gradient-to-r from-[#0d1c15] via-[#13271d] to-[#0a1510] border border-[#1b3827] rounded-lg relative overflow-hidden flex items-center justify-around px-6">
                          {/* Logo on Left */}
                          <div className={`p-2 rounded border relative transition-all ${
                            contentItem.image_metadata.logo_aspect_ratio && Math.abs(contentItem.image_metadata.logo_aspect_ratio - 3.5) > 0.15
                              ? 'border-2 border-rose-500 bg-rose-500/10'
                              : 'border-emerald-600 bg-emerald-950/40'
                          }`}>
                            <div className="text-[11px] font-serif font-bold text-emerald-200 tracking-widest">
                              NADI NATURALS
                            </div>
                            {contentItem.image_metadata.logo_aspect_ratio && Math.abs(contentItem.image_metadata.logo_aspect_ratio - 3.5) > 0.15 && (
                              <div className="absolute -top-3 left-0 bg-rose-950 text-rose-300 text-[8px] font-mono px-1 rounded border border-rose-700 animate-pulse">
                                LOGO MISUSE: {contentItem.image_metadata.logo_aspect_ratio}:1 (Spec: 3.5:1)
                              </div>
                            )}
                          </div>

                          {/* Product Bottle Mock */}
                          <div className="w-12 h-24 bg-gradient-to-t from-emerald-900 to-emerald-600 rounded-lg shadow-xl border border-emerald-400/50 flex flex-col items-center justify-center p-1 text-center">
                            <span className="text-[7px] text-emerald-100 font-mono tracking-tighter uppercase font-bold">
                              Radiant Dew
                            </span>
                            <span className="text-[6px] text-emerald-200">Face Serum</span>
                          </div>

                          {/* Callout Text Box */}
                          <div
                            style={{
                              color: contentItem.image_metadata.text_color || '#B0A090',
                              backgroundColor: contentItem.image_metadata.bg_color || '#F7F4EB'
                            }}
                            className="p-2 rounded shadow text-xs font-semibold relative"
                          >
                            <span>98.5% Certified Organic</span>
                            {contentItem.image_metadata.text_color?.toUpperCase() === '#B0A090' && (
                              <div className="absolute -top-3 right-0 bg-amber-950 text-amber-200 text-[8px] font-mono px-1 rounded border border-amber-700">
                                WCAG AA FAIL (1.76:1)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Remediation Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {contentItem.image_metadata.logo_aspect_ratio && Math.abs(contentItem.image_metadata.logo_aspect_ratio - 3.5) > 0.15 && onFixLogo && (
                            <button
                              onClick={onFixLogo}
                              className="px-2.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700 text-xs text-rose-200 font-medium transition-colors flex items-center space-x-1"
                            >
                              <Zap className="w-3 h-3 text-rose-400 fill-current" />
                              <span>Fix Logo Aspect Ratio (3.50:1)</span>
                            </button>
                          )}

                          {contentItem.image_metadata.text_color?.toUpperCase() === '#B0A090' && onFixContrast && (
                            <button
                              onClick={onFixContrast}
                              className="px-2.5 py-1 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-700 text-xs text-amber-200 font-medium transition-colors flex items-center space-x-1"
                            >
                              <Zap className="w-3 h-3 text-amber-400 fill-current" />
                              <span>Set WCAG Contrast (#2C332D, 7.4:1)</span>
                            </button>
                          )}

                          {!contentItem.image_metadata.alt_text && onFixAltText && (
                            <button
                              onClick={onFixAltText}
                              className="px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700 text-xs text-emerald-200 font-medium transition-colors flex items-center space-x-1"
                            >
                              <Zap className="w-3 h-3 text-emerald-400 fill-current" />
                              <span>Apply AI Alt-Text Description</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Live Instagram Feed Mockup */}
            {activeBottomTab === 'instagram' && (
              <div className="max-w-md mx-auto bg-black rounded-2xl border border-slate-800 p-3 shadow-2xl space-y-2">
                {/* IG Post Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5">
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center font-bold text-xs text-emerald-400">
                        NN
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-white">nadinaturals</span>
                        <CheckCircle2 className="w-3 h-3 text-sky-400 fill-current" />
                      </div>
                      <span className="text-[10px] text-slate-400">Sponsored &bull; Pre-Publication</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">&bull;&bull;&bull;</span>
                </div>

                {/* IG Media Mockup */}
                <div className="w-full h-40 bg-gradient-to-tr from-emerald-950 to-teal-900 rounded-lg flex items-center justify-center relative overflow-hidden border border-emerald-900/60">
                  <div className="text-center space-y-1">
                    <div className="text-xs font-serif font-bold text-emerald-200 tracking-widest">
                      NADI NATURALS
                    </div>
                    <div className="text-[10px] text-emerald-300">Radiant Dew Botanical Serum</div>
                  </div>
                </div>

                {/* IG Action Buttons */}
                <div className="flex items-center justify-between text-slate-300 text-xs py-1">
                  <div className="flex space-x-3">
                    <span>&hearts; 1,842</span>
                    <span>&#x1F4AC; 94</span>
                    <span>&#x27A4; Share</span>
                  </div>
                  <span>&#x1F516; Save</span>
                </div>

                {/* Caption with Hashtags */}
                <div className="text-xs text-slate-200 leading-snug space-y-1">
                  <p>
                    <span className="font-bold mr-1">nadinaturals</span>
                    {currentText}
                  </p>
                  <p className="text-sky-400 text-[11px]">
                    #NadiRadiantDew #BotanicalSkincare #AyurvedaClean #IndianBeauty
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Governance Compliance Radar */}
            {activeBottomTab === 'health' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Score Dial */}
                <div className="p-4 rounded-xl bg-[#050a07] border border-[#162a1e] flex flex-col items-center justify-center text-center">
                  <div className={`text-4xl font-extrabold font-mono ${
                    healthScore === 100 ? 'text-emerald-400' : healthScore >= 70 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {healthScore}%
                  </div>
                  <span className="text-xs font-semibold text-slate-200 mt-1">Compliance Health Index</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {blockersCount === 0 ? 'Ready for formal approval' : `${blockersCount} active Critical Blockers`}
                  </span>
                </div>

                {/* Sub-check status breakdown */}
                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-[#0a1510] border border-[#162a1e]">
                    <span className="text-slate-300">1. Master Brand Glossary</span>
                    <span className={reviewRun?.findings?.some((f: any) => f.category === 'terminology') ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {reviewRun?.findings?.some((f: any) => f.category === 'terminology') ? 'Failed (Prohibited Term)' : 'Passed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[#0a1510] border border-[#162a1e]">
                    <span className="text-slate-300">2. Formulation &amp; Organic Specs</span>
                    <span className={reviewRun?.findings?.some((f: any) => f.category === 'factual_conflict') ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {reviewRun?.findings?.some((f: any) => f.category === 'factual_conflict') ? 'Failed (Factual Conflict)' : 'Passed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[#0a1510] border border-[#162a1e]">
                    <span className="text-slate-300">3. ASCI Advertising Claims</span>
                    <span className={reviewRun?.findings?.some((f: any) => f.category === 'unsupported_claim') ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {reviewRun?.findings?.some((f: any) => f.category === 'unsupported_claim') ? 'Warning (Unsubstantiated)' : 'Passed'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-[#0a1510] border border-[#162a1e]">
                    <span className="text-slate-300">4. Visual Geometry &amp; WCAG Contrast</span>
                    <span className={reviewRun?.findings?.some((f: any) => f.category === 'visual_identity' || f.category === 'accessibility') ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                      {reviewRun?.findings?.some((f: any) => f.category === 'visual_identity' || f.category === 'accessibility') ? 'Failed (Ratio / Contrast)' : 'Passed'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
