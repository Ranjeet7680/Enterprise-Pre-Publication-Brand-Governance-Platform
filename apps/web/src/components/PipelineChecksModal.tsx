import React from 'react';
import { Shield, CheckCircle2, AlertCircle, AlertTriangle, Clock, X, Cpu, Check, Layers } from 'lucide-react';

interface PipelineChecksModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewRun: any;
}

export const PipelineChecksModal: React.FC<PipelineChecksModalProps> = ({
  isOpen,
  onClose,
  reviewRun
}) => {
  if (!isOpen) return null;

  const checks = reviewRun?.checks_executed || [];
  const duration = reviewRun?.duration_ms || 14;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0b1410] border border-[#1e3c2b] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#182e22] bg-[#0d1a13] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span className="hidden sm:inline">9-Stage Inspection Dependency Pipeline</span>
                <span className="sm:hidden">9-Stage Pipeline</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                  {checks.length} Checks
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 sm:line-clamp-none">
                Hybrid evaluation tree combining deterministic code and bounded evidence RAG.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#14261d] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[#08110c] border-b border-[#14261d] flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Latency: <strong className="text-emerald-300">{duration}ms</strong></span>
          </span>
          <span>Engine: <strong className="text-slate-200">{reviewRun?.model_version || 'inkloom-edge-v1.2'}</strong></span>
        </div>

        {/* Checks List */}
        <div className="p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-[#13241b]">
          {checks.map((check: any, idx: number) => {
            const isFailed = check.status === 'failed_with_findings';
            return (
              <div key={idx} className="pt-2.5 first:pt-0 flex items-start justify-between">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {check.check_name.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#102217] text-slate-400 border border-[#1e3d2c]">
                      {check.check_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {check.details}
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-1 shrink-0 ml-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center space-x-1 ${
                    isFailed
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {isFailed ? (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>Failed ({check.findings_count})</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Passed</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {check.duration_ms}ms
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#182e22] bg-[#0a130e] flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between text-xs">
          <span className="text-[11px] sm:text-xs text-slate-400">
            All checks run deterministically on the edge or via bounded semantic verification.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition-all text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
