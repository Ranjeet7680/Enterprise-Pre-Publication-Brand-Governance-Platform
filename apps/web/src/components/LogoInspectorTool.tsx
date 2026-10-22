import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, Eye, RefreshCw, ZoomIn } from 'lucide-react';

export const LogoInspectorTool: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const masterRatio = 3.50;
  const tolerance = 0.15;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('analyzing');
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = Number((w / h).toFixed(2));
        setDimensions({ width: w, height: h });
        setAspectRatio(ratio);
        setStatus('complete');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const isDistorted = aspectRatio !== null && Math.abs(aspectRatio - masterRatio) > tolerance;

  return (
    <div className="p-6 rounded-2xl bg-[#0b1410] border border-[#1b3426] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-100 text-sm">Interactive Logo Distortion Analyzer (IS 10)</h3>
          <p className="text-xs text-slate-400">Upload or drop an asset to verify compliance against the master 3.50:1 logo specification.</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-1.5 bg-[#12241a] hover:bg-[#1a3527] border border-[#234533] text-emerald-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {imageSrc ? (
        <div className="space-y-4">
          <div className="h-48 bg-[#060a08] border border-[#172b1f] rounded-xl relative overflow-hidden flex items-center justify-center p-4">
            <img
              src={imageSrc}
              alt="Uploaded brand asset"
              className="max-h-full max-w-full object-contain rounded"
            />
            {/* Visual Measurement Overlay */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/80 rounded border border-slate-700 text-[10px] font-mono text-slate-300">
              {dimensions?.width} x {dimensions?.height} px
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#070d0a] rounded-xl border border-[#162a1e]">
              <div className="text-[10px] text-slate-400 uppercase">Master Spec</div>
              <div className="text-base font-bold text-emerald-400 mt-1">3.50 : 1</div>
            </div>
            <div className="p-3 bg-[#070d0a] rounded-xl border border-[#162a1e]">
              <div className="text-[10px] text-slate-400 uppercase">Measured Ratio</div>
              <div className={`text-base font-bold mt-1 ${isDistorted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {aspectRatio} : 1
              </div>
            </div>
            <div className="p-3 bg-[#070d0a] rounded-xl border border-[#162a1e]">
              <div className="text-[10px] text-slate-400 uppercase">Status</div>
              <div className={`text-sm font-bold mt-1 ${isDistorted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isDistorted ? 'DISTORTED (Blocker)' : 'CONFORMANT (Pass)'}
              </div>
            </div>
          </div>

          {isDistorted ? (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>Aspect Ratio Distortion Detected:</strong> Logo deviates by more than the permitted tolerance (0.15).
                Non-uniform stretching violates trademark standards.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>Master Geometry Verified:</strong> Asset maintains uniform scaling and aspect ratio integrity.
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-36 border-2 border-dashed border-[#1e3a2b] hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080e0a]/50"
        >
          <UploadCloud className="w-8 h-8 text-emerald-500/60 mb-2" />
          <p className="text-xs font-semibold text-slate-300">Click to upload brand logo or campaign graphic</p>
          <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, SVG, WebP supported</p>
        </div>
      )}
    </div>
  );
};
