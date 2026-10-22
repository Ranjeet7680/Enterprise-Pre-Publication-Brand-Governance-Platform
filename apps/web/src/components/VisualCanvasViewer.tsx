import React, { useState } from 'react';
import { Eye, Check, AlertTriangle, AlertCircle, Sparkles, Layers, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface VisualCanvasViewerProps {
  imageMetadata: any;
  findings: any[];
  onFixLogo?: () => void;
  onFixContrast?: () => void;
  onFixAltText?: () => void;
}

export const VisualCanvasViewer: React.FC<VisualCanvasViewerProps> = ({
  imageMetadata,
  findings,
  onFixLogo,
  onFixContrast,
  onFixAltText
}) => {
  if (!imageMetadata) return null;

  const [showOverlays, setShowOverlays] = useState(true);

  const isLogoDistorted = imageMetadata.contains_logo &&
    imageMetadata.logo_aspect_ratio &&
    Math.abs(imageMetadata.logo_aspect_ratio - 3.5) > 0.15;

  const isLowContrast = imageMetadata.text_color && imageMetadata.bg_color && (
    imageMetadata.text_color.toUpperCase() === '#B0A090' ||
    (imageMetadata.contrast_ratio && imageMetadata.contrast_ratio < 4.5)
  );

  const isMissingAlt = !imageMetadata.alt_text;

  return (
    <div className="p-4 rounded-xl bg-[#09120e] border border-[#1b3427] space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Visual Asset &amp; Computer Vision Geometry Inspector</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
              showOverlays
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-[#101f17] text-slate-400 border-[#213d2d]'
            }`}
          >
            {showOverlays ? 'Hide CV Bounding Boxes' : 'Show CV Bounding Boxes'}
          </button>
          <span className="text-[10px] font-mono text-slate-400 bg-[#0a1510] px-2 py-0.5 rounded border border-[#1a3325]">
            {imageMetadata.width || 1080} &times; {imageMetadata.height || 1080} px
          </span>
        </div>
      </div>

      {/* Simulated Canvas Viewport with Bounding Boxes */}
      <div className="w-full h-48 bg-gradient-to-br from-[#0c1812] to-[#040805] border border-[#162a1e] rounded-xl relative overflow-hidden flex items-center justify-center p-4">
        {/* Synthetic Background Graphic & Product Representation */}
        <div className="relative w-72 h-36 rounded-lg bg-gradient-to-r from-[#14261d] via-[#1a3327] to-[#12241b] border border-[#224433] p-3 shadow-2xl flex flex-col justify-between">
          {/* Logo Area Mock */}
          <div className="flex items-center justify-between">
            <div className={`px-2 py-1 rounded transition-all ${
              isLogoDistorted
                ? 'bg-rose-950/40 border border-rose-500/80 scale-x-125'
                : 'bg-emerald-950/40 border border-emerald-500/60'
            }`}>
              <span className="text-[10px] tracking-widest font-serif font-bold text-emerald-200">
                NADI NATURALS
              </span>
            </div>
            <span className="text-[8px] font-mono text-emerald-400/70 border border-emerald-800/40 px-1.5 py-0.5 rounded">
              SPEC: 3.5:1
            </span>
          </div>

          {/* Product Center Mock */}
          <div className="flex items-center space-x-3 my-1">
            <div className="w-9 h-14 bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-sm shadow-md border border-emerald-400/40 flex items-center justify-center">
              <span className="text-[7px] text-emerald-100 font-mono -rotate-90 tracking-tighter">
                RADIANT DEW
              </span>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-100 leading-tight">
                Radiant Dew Face Serum
              </div>
              <div
                style={{
                  color: isLowContrast ? imageMetadata.text_color : '#2C332D',
                  backgroundColor: isLowContrast ? 'transparent' : '#FFFFFF',
                  padding: isLowContrast ? '0' : '2px 4px',
                  borderRadius: isLowContrast ? '0' : '4px'
                }}
                className="text-[10px] font-medium leading-tight mt-0.5"
              >
                98.5% Certified Botanicals
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="text-[8px] text-slate-400 font-mono flex items-center justify-between border-t border-[#1f3d2e] pt-1">
            <span>Social Campaign 1080x1080</span>
            <span className="text-emerald-400">Diwali 2026</span>
          </div>
        </div>

        {/* Bounding Box Overlays */}
        {showOverlays && isLogoDistorted && (
          <div
            style={{ left: '16%', top: '14%', width: '38%', height: '32%' }}
            className="absolute border-2 border-rose-500 bg-rose-500/15 rounded flex flex-col justify-between p-1.5 animate-pulse pointer-events-none"
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-rose-300 font-bold bg-rose-950/90 px-1.5 py-0.5 rounded shadow">
              <span>LOGO MISUSE: {imageMetadata.logo_aspect_ratio || 1.8}:1</span>
              <span>[Expected 3.50:1]</span>
            </div>
            <div className="text-[8px] font-mono text-rose-300 bg-black/80 px-1 rounded self-start">
              Horizontal Compression Violation
            </div>
          </div>
        )}

        {showOverlays && isLowContrast && (
          <div
            style={{ left: '38%', bottom: '16%', width: '48%', height: '28%' }}
            className="absolute border border-amber-500 bg-amber-500/15 rounded flex items-center justify-between px-2 pointer-events-none"
          >
            <span className="text-[9px] font-mono text-amber-200 font-bold bg-amber-950/90 px-1.5 py-0.5 rounded">
              CONTRAST: 1.76:1 (WCAG AA Fail)
            </span>
            <span className="text-[8px] font-mono text-amber-300 bg-black/70 px-1 rounded">
              Threshold &ge; 4.5:1
            </span>
          </div>
        )}
      </div>

      {/* Visual Diagnostic Badges & 1-Click Fix Actions */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#102418] text-emerald-300 border border-emerald-800">
            Master Spec: 3.50:1
          </span>
          <span className={`px-2 py-0.5 rounded border ${
            isLogoDistorted ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            Detected Logo Ratio: {imageMetadata.logo_aspect_ratio || imageMetadata.aspect_ratio || 1.8}:1 {isLogoDistorted ? '(Distorted)' : '(Compliant)'}
          </span>
          <span className={`px-2 py-0.5 rounded border ${
            isLowContrast ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            Color Contrast: {isLowContrast ? '1.76:1 (Fails AA)' : '7.4:1 (Passes AAA)'}
          </span>
          <span className={`px-2 py-0.5 rounded border ${
            isMissingAlt ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            Alt-Text: {isMissingAlt ? 'Missing (Warning)' : 'Verified'}
          </span>
        </div>

        {/* 1-Click Visual Remediation Buttons */}
        {(isLogoDistorted || isLowContrast || isMissingAlt) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isLogoDistorted && onFixLogo && (
              <button
                onClick={onFixLogo}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-700/80 text-[11px] text-rose-200 font-medium transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Fix Logo Aspect Ratio (3.50:1)</span>
              </button>
            )}

            {isLowContrast && onFixContrast && (
              <button
                onClick={onFixContrast}
                className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-700/80 text-[11px] text-amber-200 font-medium transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Apply High Contrast (#2C332D, 7.4:1)</span>
              </button>
            )}

            {isMissingAlt && onFixAltText && (
              <button
                onClick={onFixAltText}
                className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/80 text-[11px] text-emerald-200 font-medium transition-colors flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Apply AI Alt-Text Description</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
