import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert, Play, RotateCcw, Activity, ShieldCheck,
  Cpu, Terminal, FileText, BarChart3, User, LogOut, Radio
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  onRunDemo: () => void;
  onResetDemo: () => void;
  isRunningDemo: boolean;
  activeIncidentId?: string;
  currentUser?: UserProfile | null;
  wsStatus?: 'connected' | 'connecting' | 'disconnected';
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRunDemo,
  onResetDemo,
  isRunningDemo,
  activeIncidentId,
  currentUser,
  wsStatus = 'connected',
  onLogout
}) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/incidents', label: 'Incidents', icon: ShieldAlert },
    {
      path: activeIncidentId ? `/incidents/${activeIncidentId}` : '/incidents/INC-1024',
      label: 'Investigation',
      icon: Cpu,
      badge: activeIncidentId || 'INC-1024'
    },
    { path: '/events', label: 'Security Events', icon: Terminal },
    { path: '/intelligence', label: 'Intelligence', icon: BarChart3 },
    {
      path: activeIncidentId ? `/reports/${activeIncidentId}` : '/reports/INC-1024',
      label: 'Report',
      icon: FileText
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cyber-950/90 backdrop-blur-md border-b border-cyber-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 cyber-glow">
            <ShieldAlert className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                AI CyberGuard
              </span>
              {/* Simulation Mode Badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Simulation Mode
              </span>

              {/* WebSocket Live Stream Status */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-md border ${
                wsStatus === 'connected'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
              }`}>
                <Radio className={`w-2.5 h-2.5 ${wsStatus === 'connected' ? 'animate-pulse text-emerald-400' : 'text-rose-400'}`} />
                <span>{wsStatus === 'connected' ? 'LIVE STREAM' : 'OFFLINE'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Security Investigation & Response Platform</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path.startsWith('/incidents/') && location.pathname.startsWith('/incidents/'));
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-cyber-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-cyber-700 text-[10px] text-cyan-300 font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Demo Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* User Role Badge */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-cyber-900 border border-cyber-700/80 px-2.5 py-1 rounded-xl">
              <div className="flex flex-col text-right">
                <span className="text-[11px] font-semibold text-slate-200 leading-tight">{currentUser.full_name}</span>
                <span className="text-[9px] uppercase font-mono text-cyan-400 font-bold">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                className="p-1 rounded-lg hover:bg-cyber-800 text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-850 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium transition"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login</span>
            </Link>
          )}

          <button
            onClick={onResetDemo}
            title="Reset to clean baseline state"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-850 hover:bg-cyber-800 text-slate-400 hover:text-slate-200 border border-cyber-700 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onRunDemo}
            disabled={isRunningDemo}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-md transition-all active:scale-95 ${
              isRunningDemo ? 'opacity-75 cursor-not-allowed' : 'cyber-glow'
            }`}
          >
            {isRunningDemo ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Demo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
