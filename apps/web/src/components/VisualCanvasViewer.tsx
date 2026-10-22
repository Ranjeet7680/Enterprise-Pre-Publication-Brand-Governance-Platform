import React from 'react';
import { AlertCircle, Eye, Info, Check, RotateCw, ZoomIn } from 'lucide-react';

interface VisualCanvasViewerProps {
  imageMetadata: any;
  findings: any[];
}

export const VisualCanvasViewer: React.FC<VisualCanvasViewerProps> = ({
  imageMetadata,
  findings
}) => {
  if (!imageMetadata) return null;

  const visualFindings = findings.filter(f => f.visual_region || f.category === 'visual_identity' || f.category === 'accessibility');

  return (
    <div className="p-4 rounded-xl bg-[#09120e] border border-[#1b3427] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Visual Asset &amp; Geometry Inspector</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Canvas: {imageMetadata.width || 1080} x {imageMetadata.height || 1080} px
        </span>
      </div>

      {/* Simulated Canvas Viewport with Bounding Boxes */}
      <div className="w-full h-44 bg-[#050a07] border border-[#162a1e] rounded-lg relative overflow-hidden flex items-center justify-center">
        {/* Synthetic Background Graphic Preview */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-40 h-28 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-xs font-mono">
            [Product Graphic Mock]
          </div>
        </div>

        {/* Logo Misuse Bounding Box Overlay if present */}
        {imageMetadata.contains_logo && (
          <div
            style={{
              left: '20%',
              top: '20%',
              width: '55%',
              height: '35%'
            }}
            className="absolute border-2 border-rose-500 bg-rose-500/15 rounded flex flex-col justify-between p-1.5 animate-pulse"
          >
            <div className="flex items-center justify-between text-[9px] font-mono text-rose-300 font-bold bg-rose-950/90 px-1 py-0.5 rounded">
              <span>LOGO MISUSE: 1.75:1</span>
              <span>[Expected 3.50:1]</span>
            </div>
            <div className="text-[8px] font-mono text-rose-400 self-end bg-black/60 px-1 rounded">
              Stretched Aspect Ratio
            </div>
          </div>
        )}

        {/* Low Contrast Text Box Overlay if present */}
        {imageMetadata.text_color && (
          <div
            style={{
              left: '20%',
              bottom: '15%',
              width: '60%',
              height: '20%'
            }}
            className="absolute border border-amber-500 bg-amber-500/10 rounded flex items-center justify-between px-2"
          >
            <span className="text-[9px] font-mono text-amber-300 font-semibold">
              LOW CONTRAST: #B0A090 (2.3:1)
            </span>
            <span className="text-[8px] font-mono text-amber-400 bg-amber-950/80 px-1 rounded">
              WCAG AA Fail
            </span>
          </div>
        )}
      </div>

      {/* Visual Diagnostic Badges */}
      <div className="flex flex-wrap gap-2 text-[10px] font-mono">
        <span className="px-2 py-0.5 rounded bg-[#102418] text-emerald-300 border border-emerald-800">
          Master Spec: 3.50:1
        </span>
        <span className={`px-2 py-0.5 rounded border ${
          imageMetadata.logo_aspect_ratio && Math.abs(imageMetadata.logo_aspect_ratio - 3.5) > 0.2
            ? 'bg-rose-950 text-rose-300 border-rose-800'
            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
        }`}>
          Detected Ratio: {imageMetadata.logo_aspect_ratio || imageMetadata.aspect_ratio}:1
        </span>
        {imageMetadata.is_low_res && (
          <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
            OCR Confidence: 0.58 (Uncertain)
          </span>
        )}
      </div>
    </div>
  );
};
