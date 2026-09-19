import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Terminal, Layers } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const DEMO_PRESETS = [
  {
    roleName: 'SOC Lead (Admin)',
    roleTag: 'Full Containment & Policy Access',
    username: 'admin',
    pass: 'Password123!',
    name: 'Marcus Vance',
    roleBadge: 'ADMIN',
  },
  {
    roleName: 'Incident Commander',
    roleTag: 'Response Authorization & Incident Triage',
    username: 'commander',
    pass: 'Commander123!',
    name: 'Elena Rostova',
    roleBadge: 'COMMANDER',
  },
  {
    roleName: 'SOC Analyst (Tier-2)',
    roleTag: 'AI Investigation & Telemetry Analysis',
    username: 'analyst',
    pass: 'Analyst123!',
    name: 'David Sterling',
    roleBadge: 'ANALYST',
  },
  {
    roleName: 'Compliance Auditor',
    roleTag: 'Read-Only Telemetry & Report Audit',
    username: 'viewer',
    pass: 'Viewer123!',
    name: 'Sarah Connor',
    roleBadge: 'VIEWER',
  }
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login(username, password);
      onLoginSuccess(res.user);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setUsername(preset.username);
    setPassword(preset.pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 rounded-lg border border-soc-border bg-soc-panel overflow-hidden shadow-elevated">
        {/* Left: Enterprise Platform Manifesto */}
        <div className="p-8 bg-soc-bg border-b lg:border-b-0 lg:border-r border-soc-border flex flex-col justify-between space-y-6 relative overflow-hidden soc-grid-bg">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-md bg-soc-panel border border-soc-border flex items-center justify-center text-soc-blue">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-wide text-soc-text uppercase font-mono">
                  AI-CyberGuard
                </span>
                <span className="text-[10px] text-soc-muted font-mono">
                  SOC INVESTIGATION SUITE
                </span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-soc-text tracking-tight leading-snug">
              Autonomous Cybersecurity Investigation Platform
            </h1>

            <p className="text-xs text-soc-secondary mt-2.5 leading-relaxed">
              Synthesizing millions of disconnected telemetry alerts into explainable, evidence-grounded attack stories.
            </p>

            <div className="mt-6 space-y-2.5 text-xs font-mono">
              <div className="flex items-center gap-2 text-soc-text">
                <span className="w-1.5 h-1.5 rounded-full bg-soc-blue" />
                <span>Deterministic Rule & Behavioral Baselines</span>
              </div>
              <div className="flex items-center gap-2 text-soc-text">
                <span className="w-1.5 h-1.5 rounded-full bg-soc-cyan" />
                <span>Isolation Forest Unsupervised Anomaly Engine</span>
              </div>
              <div className="flex items-center gap-2 text-soc-text">
                <span className="w-1.5 h-1.5 rounded-full bg-soc-success" />
                <span>Human-in-the-Loop Safe Simulation Containment</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-soc-border text-[11px] font-mono text-soc-muted flex items-center justify-between">
            <span>SOC Production Node</span>
            <span>PBKDF2-SHA256 (100k)</span>
          </div>
        </div>

        {/* Right: Sign-In Form & Role Presets */}
        <div className="p-8 bg-soc-panel flex flex-col justify-between space-y-6">
          <div>
            <div className="mb-5">
              <h2 className="text-sm font-bold text-soc-text uppercase font-mono tracking-wide">
                Security Portal Authentication
              </h2>
              <p className="text-xs text-soc-secondary mt-0.5">
                Sign in with enterprise credentials or choose a quick role profile.
              </p>
            </div>

            {/* Role Presets */}
            <div className="mb-5 space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-soc-muted tracking-wider">
                Quick Role Presets:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPreset(p)}
                    className={`p-2 rounded text-left border transition-colors ${
                      username === p.username
                        ? 'border-soc-blue bg-soc-elevated text-soc-text'
                        : 'border-soc-border bg-soc-card text-soc-secondary hover:border-soc-borderMuted hover:text-soc-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold truncate font-mono">{p.name}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-soc-panel border border-soc-border text-soc-blue">
                        {p.roleBadge}
                      </span>
                    </div>
                    <div className="text-[10px] text-soc-muted truncate mt-0.5">{p.roleTag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-2.5 mb-4 rounded bg-soc-critical/15 border border-soc-critical/30 text-soc-critical text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-soc-muted mb-1 uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-soc-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-soc-card border border-soc-border rounded-md pl-8 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-blue font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-soc-muted mb-1 uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-soc-muted absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-soc-card border border-soc-border rounded-md pl-8 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-blue font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-accent-subtle disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Security Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="pt-3 border-t border-soc-border text-center text-[10px] font-mono text-soc-muted">
            Strict RBAC &bull; PBKDF2-SHA256 &bull; JWT Token Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};
