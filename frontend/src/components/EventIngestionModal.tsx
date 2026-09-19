import React, { useState } from 'react';
import { X, Send, ShieldAlert, Sparkles, Terminal, Database, Server, KeyRound, Globe } from 'lucide-react';
import { api } from '../services/api';
import { NormalizedEvent } from '../types';

interface EventIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventIngested: (event: NormalizedEvent) => void;
}

const PRESET_EVENTS = [
  {
    title: 'LSASS Memory Credential Dump',
    badge: 'Credential Access',
    data: {
      event_type: 'credential_access',
      user: 'alex',
      device: 'PC-017',
      source_ip: '10.0.0.15',
      destination: 'PC-017',
      action: 'process_memory_read',
      description: 'Suspicious process mimikatz.exe requested handle to lsass.exe process memory with PROCESS_VM_READ permissions',
      metadata: { target_process: 'lsass.exe', tool: 'mimikatz', privilege_requested: 'SeDebugPrivilege' }
    }
  },
  {
    title: 'Obfuscated PowerShell Dropper',
    badge: 'Execution',
    data: {
      event_type: 'process_execution',
      user: 'alex',
      device: 'PC-017',
      source_ip: '185.23.44.12',
      destination: 'PC-017',
      action: 'spawn_process',
      description: 'powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...',
      metadata: { command_line: 'powershell.exe -nop -enc base64payload', parent_process: 'explorer.exe' }
    }
  },
  {
    title: 'Lateral SMB Remote Execution',
    badge: 'Lateral Movement',
    data: {
      event_type: 'lateral_movement',
      user: 'alex',
      device: 'PC-017',
      source_ip: '10.0.0.15',
      destination: 'FILESERVER-02',
      action: 'remote_service_create',
      description: 'Host-to-host WinRM service spawn connecting PC-017 to FILESERVER-02 over SMB port 445',
      metadata: { protocol: 'SMB', port: 445, target_host: 'FILESERVER-02' }
    }
  },
  {
    title: 'Unauthorized Financial DB Query',
    badge: 'Database Access',
    data: {
      event_type: 'database_query',
      user: 'alex',
      device: 'FILESERVER-02',
      source_ip: '10.0.2.14',
      destination: 'DB-01',
      action: 'database_dump',
      description: 'SELECT * FROM corporate_customers_financial_records executed against primary production DB-01',
      metadata: { target_database: 'DB-01', rows_returned: 15400, table_accessed: 'financial_records' }
    }
  }
];

export const EventIngestionModal: React.FC<EventIngestionModalProps> = ({
  isOpen,
  onClose,
  onEventIngested,
}) => {
  const [eventType, setEventType] = useState('process_execution');
  const [user, setUser] = useState('alex');
  const [device, setDevice] = useState('PC-017');
  const [sourceIp, setSourceIp] = useState('185.23.44.12');
  const [destination, setDestination] = useState('FILESERVER-02');
  const [action, setAction] = useState('spawn_process');
  const [description, setDescription] = useState('Execution of obfuscated script payload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const loadPreset = (preset: typeof PRESET_EVENTS[0]) => {
    setEventType(preset.data.event_type);
    setUser(preset.data.user);
    setDevice(preset.data.device);
    setSourceIp(preset.data.source_ip);
    setDestination(preset.data.destination);
    setAction(preset.data.action);
    setDescription(preset.data.description);
    setFeedback({ type: 'success', message: `Loaded preset: "${preset.title}"` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const newEvent = await api.createEvent({
        event_type: eventType,
        user,
        device,
        source_ip: sourceIp,
        destination,
        action,
        description,
        status: 'detected',
        severity: 'high',
        metadata: {
          submitted_via: 'Interactive SOC Console Ingestor',
          ingested_at: new Date().toISOString()
        }
      });

      setFeedback({
        type: 'success',
        message: `Event ${newEvent.event_id} ingested! Risk score: ${newEvent.risk_score || 0}/100 (${newEvent.severity?.toUpperCase() || 'HIGH'})`
      });

      onEventIngested(newEvent);
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: `Ingestion failed: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyber-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Inject Custom Security Telemetry
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Ingestor
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Submit raw telemetry to test real-time detection, CTI enrichment, and correlation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-cyber-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="my-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Quick Attack Presets (Click to Load):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_EVENTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadPreset(preset)}
                className="text-left p-2.5 rounded-xl border border-cyber-800 bg-cyber-950/60 hover:bg-cyan-950/30 hover:border-cyan-500/40 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                    {preset.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyber-800 text-slate-400 font-mono">
                    {preset.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Ingestion Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="login">login (Authentication)</option>
                <option value="process_execution">process_execution (Execution)</option>
                <option value="credential_access">credential_access (Credentials)</option>
                <option value="lateral_movement">lateral_movement (Lateral Pivot)</option>
                <option value="database_query">database_query (Data Store Access)</option>
                <option value="network_activity">network_activity (Reconnaissance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">User Account</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="e.g. alex"
                required
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Origin Device / Workstation</label>
              <input
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="e.g. PC-017"
                required
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Source IP Address</label>
              <input
                type="text"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                placeholder="e.g. 185.23.44.12 (External)"
                required
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Destination Target</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. DB-01 or FILESERVER-02"
                required
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Action Name</label>
              <input
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. spawn_process"
                required
                className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description & Command Details</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              required
              placeholder="Detailed description or command line payload..."
              className="w-full bg-cyber-950 border border-cyber-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cyber-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-cyber-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:opacity-90 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Ingesting...' : 'Ingest & Trigger Detection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
