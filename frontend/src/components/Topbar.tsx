import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Search, 
  Radio, 
  Play, 
  PlusCircle, 
  User, 
  LogOut, 
  Bell, 
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { EventIngestionModal } from './EventIngestionModal';

interface TopbarProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  onRunDemo: () => void;
  isRunningDemo: boolean;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  onEventIngested?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentUser,
  onLogout,
  onOpenCommandPalette,
  onRunDemo,
  isRunningDemo,
  wsStatus,
  onEventIngested
}) => {
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-13 bg-soc-panel border-b border-soc-border px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Environment Identity */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-soc-elevated border border-soc-border flex items-center justify-center text-soc-blue group-hover:border-soc-blue transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-soc-text tracking-wide uppercase font-mono">
              AI-CyberGuard
            </span>
            <span className="text-[10px] text-soc-muted tracking-tight">
              Enterprise SOC Platform
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-3 border-l border-soc-border">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-soc-elevated text-soc-secondary border border-soc-border">
            PROD / SOC-US1
          </span>
        </div>
      </div>

      {/* Center Search / Command Palette Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-soc-card border border-soc-border rounded-md text-xs text-soc-muted hover:border-soc-borderMuted hover:text-soc-secondary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search incidents, entities, telemetry...</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-elevated border border-soc-border text-soc-muted">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center gap-2.5">
        {/* System & Stream Health Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-soc-card border border-soc-border rounded-md text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-soc-secondary">
            <span className={`w-2 h-2 rounded-full ${
              wsStatus === 'connected' ? 'bg-soc-success animate-status-pulse' :
              wsStatus === 'connecting' ? 'bg-soc-warning animate-pulse' : 'bg-soc-critical'
            }`} />
            {wsStatus === 'connected' ? 'STREAM: LIVE' : wsStatus === 'connecting' ? 'CONNECTING' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Ingest Telemetry Trigger */}
        <button
          onClick={() => setIsIngestModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-soc-elevated hover:bg-soc-panel border border-soc-border text-xs text-soc-text font-medium transition-colors"
          title="Inject normalized security telemetry"
        >
          <PlusCircle className="w-3.5 h-3.5 text-soc-cyan" />
          <span className="hidden sm:inline">Ingest Event</span>
        </button>

        {/* Attack Simulator Quick Trigger */}
        <button
          onClick={() => navigate('/simulator')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white text-xs font-semibold shadow-accent-subtle transition-colors"
          title="Open Simulation Lab"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Simulation Lab</span>
        </button>

        {/* User Role Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-md bg-soc-card border border-soc-border hover:border-soc-borderMuted text-xs transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-soc-elevated text-soc-secondary flex items-center justify-center font-mono text-[10px] font-bold">
              {currentUser?.username.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-medium text-soc-text text-[11px] leading-tight">
                {currentUser?.username || 'Guest'}
              </span>
              <span className="text-[9px] font-mono uppercase text-soc-blue leading-tight">
                {currentUser?.role || 'VIEWER'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-soc-muted" />
          </button>

          {isUserMenuOpen && (
            <div 
              className="absolute right-0 mt-1.5 w-52 bg-soc-panel border border-soc-border rounded-md shadow-elevated py-1.5 z-50 text-xs"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-soc-border">
                <div className="font-semibold text-soc-text">{currentUser?.full_name || currentUser?.username}</div>
                <div className="text-[10px] font-mono text-soc-muted">{currentUser?.email}</div>
                <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-soc-elevated border border-soc-border text-soc-cyan">
                  ROLE: {currentUser?.role.toUpperCase()}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full px-3 py-1.5 text-left text-soc-secondary hover:bg-soc-elevated hover:text-soc-text flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>SOC Administration</span>
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="w-full px-3 py-1.5 text-left text-soc-secondary hover:bg-soc-elevated hover:text-soc-text flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Telemetry Log</span>
                </button>
              </div>

              <div className="border-t border-soc-border pt-1">
                <button
                  onClick={onLogout}
                  className="w-full px-3 py-1.5 text-left text-soc-critical hover:bg-soc-elevated flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Ingestion Modal */}
      <EventIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onEventIngested={() => {
          if (onEventIngested) onEventIngested();
        }}
      />
    </header>
  );
};
