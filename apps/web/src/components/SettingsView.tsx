import React, { useState } from 'react';
import { Settings, Shield, Cpu, Database, Users, Save, Check, RefreshCw, Key } from 'lucide-react';

interface SettingsViewProps {
  onSave?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSave }) => {
  const [externalAiAllowed, setExternalAiAllowed] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('ap-south-1');
  const [retentionDays, setRetentionDays] = useState(365);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (onSave) onSave();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">Workspace &amp; Tenant Governance Settings</h2>
          <p className="text-xs sm:text-sm text-slate-400">Manage data residency, AI provider gateways, and role permissions (IS 01, 16, 41).</p>
        </div>
        <button
          onClick={handleSave}
          className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Settings Saved' : 'Save Policies'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Provider Gateway (IS 16) */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0c1410]/85 backdrop-blur-md border border-[#1e3427]/80 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Model Provider Gateway (IS 16)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d0a] border border-[#172b1f]">
              <div>
                <div className="font-semibold text-slate-200">External Hosted AI Gateway</div>
                <div className="text-[11px] text-slate-400">Allow external cloud model providers for semantic tone</div>
              </div>
              <input
                type="checkbox"
                checked={externalAiAllowed}
                onChange={(e) => setExternalAiAllowed(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Approved Data Residency Region (IS 41)</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-[#080d0a] border border-[#172b1f] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ap-south-1">AWS Asia Pacific (Mumbai - ap-south-1)</option>
                <option value="asia-south1">GCP India (Mumbai - asia-south1)</option>
                <option value="eu-central-1">AWS Europe (Frankfurt - eu-central-1)</option>
                <option value="us-east-1">AWS US East (N. Virginia - us-east-1)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d0a] border border-[#172b1f]">
              <div>
                <div className="font-semibold text-slate-200">PII &amp; Secret Auto-Redaction</div>
                <div className="text-[11px] text-slate-400">Redact email addresses and phone numbers before model calls</div>
              </div>
              <input
                type="checkbox"
                checked={piiRedaction}
                onChange={(e) => setPiiRedaction(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Retention & Privacy Lifecycle (IS 18) */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#0c1410]/85 backdrop-blur-md border border-[#1e3427]/80 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Privacy &amp; Data Retention (IS 18)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Draft &amp; Artifact Retention Period</label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-full bg-[#080d0a] border border-[#172b1f] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value={90}>90 Days (Strict Corporate Policy)</option>
                <option value={180}>180 Days (Half-Year Retain)</option>
                <option value={365}>365 Days (1 Full Year Standard)</option>
              </select>
            </div>

            <div className="p-3 bg-[#080d0a] rounded-xl border border-[#172b1f] text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">Derived Stores Deletion Propagation:</div>
              <div className="text-emerald-400">
                • Original documents &amp; extracted chunks purged<br />
                • Embedding vectors de-indexed<br />
                • Immutable audit log retains minimal event metadata
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permission Matrix (IS 50) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0c1410]/85 backdrop-blur-md border border-[#1e3427]/80 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-sm">Role-Based Access Control Matrix (IS 01 &amp; IS 50)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#080d0a] text-slate-400 font-mono uppercase text-[10px] border-b border-[#182c20]">
              <tr>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Submit Draft</th>
                <th className="px-4 py-2.5">Approve Source</th>
                <th className="px-4 py-2.5">Override Blocker</th>
                <th className="px-4 py-2.5">Final Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#15261d]">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200">Creator (Ananya)</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-rose-400">No</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200">Reviewer (Rohit)</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200">Brand Manager (Priya)</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200">Admin / Legal (Kavita)</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-200">External Agency (Dev Lead)</td>
                <td className="px-4 py-3 text-emerald-400">Yes</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-rose-400">No</td>
                <td className="px-4 py-3 text-rose-400">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
