import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShieldAlert, Activity, FileText, Cpu, 
  Terminal, ArrowRight, X, User, Network, Radio
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityIncident, SecurityEvent } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario?: (scenarioId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onRunScenario }) => {
  const [query, setQuery] = useState('');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      api.getIncidents().then(setIncidents).catch(() => {});
      api.getEvents(1, 20).then(res => setEvents(res.events)).catch(() => {});
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter(i => 
    i.incident_id.toLowerCase().includes(query.toLowerCase()) ||
    i.title.toLowerCase().includes(query.toLowerCase()) ||
    i.affected_user.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredEvents = events.filter(e =>
    e.event_id.toLowerCase().includes(query.toLowerCase()) ||
    e.event_type.toLowerCase().includes(query.toLowerCase()) ||
    e.source_ip.toLowerCase().includes(query.toLowerCase()) ||
    e.user_id.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const quickNav = [
    { label: 'Security Overview Dashboard', path: '/', icon: Activity, category: 'Navigation' },
    { label: 'Active Incidents Center', path: '/incidents', icon: ShieldAlert, category: 'Navigation' },
    { label: 'Security Events Explorer', path: '/events', icon: Terminal, category: 'Navigation' },
    { label: 'Threat Intelligence Workspace', path: '/intelligence', icon: Network, category: 'Navigation' },
    { label: 'Attack Simulation Lab', path: '/simulator', icon: Cpu, category: 'Navigation' },
    { label: 'System Administration & Audit', path: '/admin', icon: FileText, category: 'Navigation' },
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-soc-panel border border-soc-border shadow-elevated rounded-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-soc-border gap-3 bg-soc-card">
          <Search className="w-4 h-4 text-soc-secondary shrink-0" />
          <input
            type="text"
            placeholder="Search incidents, IPs, users, events, or navigate..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-soc-text placeholder-soc-muted focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-soc-muted">
            <kbd className="px-1.5 py-0.5 rounded bg-soc-elevated border border-soc-border">ESC</kbd>
          </div>
          <button onClick={onClose} className="text-soc-muted hover:text-soc-text p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Nav */}
          {quickNav.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-soc-muted uppercase tracking-wider px-2.5 py-1">
                Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {quickNav.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-soc-elevated text-left text-sm text-soc-text transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-soc-secondary group-hover:text-soc-blue" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-soc-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incidents Section */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-soc-muted uppercase tracking-wider px-2.5 py-1">
                Incidents
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredIncidents.map(inc => (
                  <button
                    key={inc.incident_id}
                    onClick={() => handleSelect(`/incidents/${inc.incident_id}`)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-soc-elevated text-left text-sm text-soc-text transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        inc.severity === 'critical' ? 'bg-soc-critical' :
                        inc.severity === 'high' ? 'bg-soc-high' :
                        inc.severity === 'medium' ? 'bg-soc-warning' : 'bg-soc-blue'
                      }`} />
                      <div className="truncate">
                        <div className="font-medium text-xs text-soc-text truncate">{inc.title}</div>
                        <div className="text-[11px] font-mono text-soc-muted truncate">
                          {inc.incident_id} · User: {inc.affected_user}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-soc-secondary bg-soc-card px-2 py-0.5 rounded border border-soc-border shrink-0 ml-2">
                      Risk {inc.risk_score}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {filteredEvents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-soc-muted uppercase tracking-wider px-2.5 py-1">
                Security Telemetry
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredEvents.map(evt => (
                  <button
                    key={evt.event_id}
                    onClick={() => handleSelect('/events')}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-soc-elevated text-left text-sm text-soc-text transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Terminal className="w-3.5 h-3.5 text-soc-secondary shrink-0" />
                      <div className="truncate">
                        <span className="font-mono text-xs text-soc-blue font-semibold mr-2">{evt.event_type}</span>
                        <span className="text-xs text-soc-secondary font-mono">{evt.source_ip}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-soc-muted shrink-0 ml-2">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {quickNav.length === 0 && filteredIncidents.length === 0 && filteredEvents.length === 0 && (
            <div className="py-8 text-center text-xs text-soc-muted">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-soc-border bg-soc-card flex items-center justify-between text-[11px] text-soc-muted">
          <span>AI-CyberGuard SOC Navigation</span>
          <span className="font-mono">Use ↑ ↓ to navigate, ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
