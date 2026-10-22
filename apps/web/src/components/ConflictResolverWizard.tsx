import React, { useState } from 'react';
import { AlertTriangle, Check, X, Shield, ArrowRight, FileText } from 'lucide-react';

interface ConflictResolverWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onResolved: (preferredDoc: string) => void;
}

export const ConflictResolverWizard: React.FC<ConflictResolverWizardProps> = ({
  isOpen,
  onClose,
  onResolved
}) => {
  const [selectedDoc, setSelectedDoc] = useState<'spec' | 'legacy'>('spec');
  const [resolutionRationale, setResolutionRationale] = useState('Superceded legacy 2025 brief to reflect ECOCERT certified 98.5% formulation standard.');

  if (!isOpen) return null;

  const handleConfirmResolution = () => {
    onResolved(selectedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-[#0b1410] border border-amber-600/50 rounded-2xl max-w-xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-100 text-sm">Source Conflict Resolution Wizard (IS 33)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The governance engine identified contradictory guidance between two active source documents.
          Select the authoritative document to enforce across all downstream campaign audits.
        </p>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div
            onClick={() => setSelectedDoc('spec')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedDoc === 'spec'
                ? 'bg-[#0f2419] border-emerald-500 shadow-lg'
                : 'bg-[#070d0a] border-[#162a1e] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 mb-1">
              <span>Formulation Spec v2.1</span>
              {selectedDoc === 'spec' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-lg font-bold text-slate-100 mt-1">98.5% Organic</div>
            <p className="text-[10px] text-slate-400 mt-1">
              Master lab specification. Formulated with 98.5% certified organic botanicals.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono border border-emerald-800">
              Recommended (Lab Certified)
            </span>
          </div>

          <div
            onClick={() => setSelectedDoc('legacy')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedDoc === 'legacy'
                ? 'bg-[#24170f] border-amber-500 shadow-lg'
                : 'bg-[#070d0a] border-[#162a1e] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 mb-1">
              <span>Legacy Marketing Brief 2025</span>
              {selectedDoc === 'legacy' && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-lg font-bold text-slate-100 mt-1">100% Organic</div>
            <p className="text-[10px] text-slate-400 mt-1">
              Historical promotional brief. Contains unqualified 100% claim.
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[9px] font-mono border border-rose-800">
              Legacy Contradiction
            </span>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Governance Resolution Note:</label>
          <input
            type="text"
            value={resolutionRationale}
            onChange={(e) => setResolutionRationale(e.target.value)}
            className="w-full bg-[#070d0a] border border-[#1a3325] rounded-xl p-2.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#172a1e]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white border border-[#21382b] rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmResolution}
            className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg flex items-center space-x-1.5"
          >
            <span>Standardize on {selectedDoc === 'spec' ? '98.5%' : '100%'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
