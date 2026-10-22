import React, { useState } from 'react';
import { UploadCloud, FileText, X, Check, Calendar, AlertCircle } from 'lucide-react';

interface SourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export const SourceUploadModal: React.FC<SourceUploadModalProps> = ({ isOpen, onClose, onUploaded }) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('product_factsheet');
  const [content, setContent] = useState('');
  const [effectiveUntil, setEffectiveUntil] = useState('2027-12-31');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/v1/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: 'ws-nadi-naturals-main',
          tenant_id: 'tenant-nadi-naturals-01',
          title,
          doc_type: docType,
          raw_content: content,
          owner_id: 'usr-priya',
          owner_name: 'Priya Nair',
          effective_until: effectiveUntil ? `${effectiveUntil}T23:59:59Z` : null
        })
      });
      if (res.ok) {
        onUploaded();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4">
      <div className="bg-[#0b1410] border border-[#1e382a] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b2f23] pb-3">
          <div className="flex items-center space-x-2 text-emerald-400">
            <UploadCloud className="w-5 h-5" />
            <h3 className="font-bold text-slate-100 text-sm">Upload Candidate Brand Source</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-[#080d0a] border border-[#172b1f] rounded-xl text-xs text-amber-300 space-y-1">
          <div className="font-semibold flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Candidate Quarantine Policy (IS 02)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Uploaded sources are placed in a quarantined Candidate state. They will not enter the production retrieval index until an authorized owner formally reviews and approves them.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nadi Ayurvedic Hair Cleanser Specification v1.0"
              className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl p-2.5 text-slate-200 focus:outline-none"
              >
                <option value="product_factsheet">Product Factsheet</option>
                <option value="brand_guide">Brand Guidelines</option>
                <option value="claims_register">Claims Register</option>
                <option value="channel_policy">Channel Policy</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Effective Until</label>
              <input
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl p-2.5 text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Canonical Content (Text / Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste or extract document text here..."
              className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl p-3 text-slate-100 focus:border-emerald-500 focus:outline-none h-32 resize-none font-sans"
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#172a1e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#21382b] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg flex items-center space-x-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isSubmitting ? 'Ingesting...' : 'Ingest Candidate Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
