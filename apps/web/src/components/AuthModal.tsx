import React, { useState } from 'react';
import { Shield, Lock, Mail, Key, User, ArrowRight, X, Check, Building2, Smartphone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'sso'>('login');
  const [email, setEmail] = useState('priya.brand@nadinaturals.com');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('892014');
  const [requireMfa, setRequireMfa] = useState(false);
  const [ssoDomain, setSsoDomain] = useState('nadinaturals.com');

  if (!isOpen) return null;

  const handleQuickRoleLogin = (role: string) => {
    let userData = {
      id: 'usr-priya',
      name: 'Priya Nair',
      role: 'manager',
      email: 'priya.brand@nadinaturals.com'
    };
    if (role === 'creator') {
      userData = { id: 'usr-ananya', name: 'Ananya Sharma', role: 'creator', email: 'ananya@nadinaturals.com' };
    } else if (role === 'reviewer') {
      userData = { id: 'usr-rohit', name: 'Rohit Verma', role: 'reviewer', email: 'rohit.review@nadinaturals.com' };
    } else if (role === 'administrator') {
      userData = { id: 'usr-kavita', name: 'Kavita Iyer', role: 'administrator', email: 'kavita.legal@nadinaturals.com' };
    } else if (role === 'agency') {
      userData = { id: 'usr-agency', name: 'Dev Agency Lead', role: 'agency', email: 'campaigns@socialagency.in' };
    }
    onLoginSuccess(userData);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login' && email.includes('kavita') && !requireMfa) {
      setRequireMfa(true);
      return;
    }
    onLoginSuccess({
      id: 'usr-priya',
      name: 'Priya Nair',
      role: 'manager',
      email: email
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0b1410] border border-[#1e382a] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Inkloom AI Gateway</h3>
            <p className="text-xs text-slate-400">Tenant &amp; Identity Access Management (IS 01 &amp; IS 50)</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#080d0a] p-1 rounded-xl border border-[#16271e]">
          <button
            onClick={() => { setAuthMode('login'); setRequireMfa(false); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'login' ? 'bg-[#12241b] text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthMode('sso'); setRequireMfa(false); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'sso' ? 'bg-[#12241b] text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SAML / SSO
          </button>
          <button
            onClick={() => { setAuthMode('signup'); setRequireMfa(false); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              authMode === 'signup' ? 'bg-[#12241b] text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        {authMode === 'login' && !requireMfa && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Authenticate Workspace Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* MFA Prompt for Admins (Blueprint Section 8) */}
        {authMode === 'login' && requireMfa && (
          <div className="space-y-3.5">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Admin MFA Required (IS 08 &amp; IS 19)</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Administrator accounts require mandatory hardware or TOTP multi-factor token verification.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">6-Digit Authenticator Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl p-2.5 text-center text-lg font-mono tracking-widest text-emerald-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                onLoginSuccess({
                  id: 'usr-kavita',
                  name: 'Kavita Iyer',
                  role: 'administrator',
                  email: 'kavita.legal@nadinaturals.com'
                });
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
            >
              Verify Token &amp; Enter Admin Console
            </button>
          </div>
        )}

        {/* SAML / Enterprise SSO */}
        {authMode === 'sso' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Company Identity Domain</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={ssoDomain}
                  onChange={(e) => setSsoDomain(e.target.value)}
                  className="w-full bg-[#080d0a] border border-[#1a3325] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080d0a] border border-[#15281e] text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">Configured Identity Providers:</div>
              <div className="flex space-x-2 pt-1">
                <span className="px-2 py-0.5 rounded bg-[#102419] text-emerald-300 border border-emerald-800 text-[10px]">Okta OIDC</span>
                <span className="px-2 py-0.5 rounded bg-[#102419] text-emerald-300 border border-emerald-800 text-[10px]">Azure AD SAML 2.0</span>
                <span className="px-2 py-0.5 rounded bg-[#102419] text-emerald-300 border border-emerald-800 text-[10px]">Google Workspace</span>
              </div>
            </div>

            <button
              onClick={() => handleQuickRoleLogin('manager')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
            >
              <span>Redirect to Corporate IdP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Quick Persona Switcher for Evaluation */}
        <div className="pt-2 border-t border-[#172a1e]">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            1-Click Demo Personas:
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleQuickRoleLogin('creator')}
              className="p-2 rounded-lg bg-[#080d0a] border border-[#16271e] hover:border-emerald-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">Ananya Sharma</div>
              <div className="text-[10px] text-emerald-400">Role: Creator</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('reviewer')}
              className="p-2 rounded-lg bg-[#080d0a] border border-[#16271e] hover:border-emerald-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">Rohit Verma</div>
              <div className="text-[10px] text-sky-400">Role: Reviewer</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('manager')}
              className="p-2 rounded-lg bg-[#080d0a] border border-[#16271e] hover:border-emerald-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">Priya Nair</div>
              <div className="text-[10px] text-amber-400">Role: Brand Manager</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('administrator')}
              className="p-2 rounded-lg bg-[#080d0a] border border-[#16271e] hover:border-emerald-500 text-left transition-colors"
            >
              <div className="font-semibold text-slate-200">Kavita Iyer</div>
              <div className="text-[10px] text-purple-400">Role: Administrator</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
