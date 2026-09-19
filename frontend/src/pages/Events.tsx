import React, { useState, useEffect } from 'react';
import {
  Terminal, Search, Filter, RefreshCw, Play,
  ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { NormalizedEvent } from '../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<NormalizedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Custom analyzer state
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [customEventJson, setCustomEventJson] = useState(
    JSON.stringify(
      {
        event_id: 'EVT-TEST',
        event_type: 'credential_access',
        user: 'alex',
        device: 'PC-017',
        action: 'memory_read',
        description: 'Suspicious memory dump attempt on lsass.exe',
        metadata: { target_process: 'lsass.exe' }
      },
      null,
      2
    )
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents(200);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAnalyzeCustom = async () => {
    try {
      const parsed = JSON.parse(customEventJson);
      const res = await api.analyzeEvent(parsed);
      setAnalysisResult(res);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.user && ev.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.device && ev.device.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || ev.event_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>Normalized Security Telemetry Events</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ingested logs, normalized with deterministic risk evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzerOpen ? 'Close Analyzer' : 'Analyze Event Sandbox'}</span>
          </button>

          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Analyzer Sandbox Drawer */}
      {isAnalyzerOpen && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Security Event Detection Sandbox</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">POST /api/detection/analyze</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Event JSON Payload
              </label>
              <textarea
                value={customEventJson}
                onChange={(e) => setCustomEventJson(e.target.value)}
                rows={7}
                className="w-full bg-cyber-950 border border-cyber-700 rounded-xl p-3 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAnalyzeCustom}
                className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Evaluate Detection Rules</span>
              </button>
            </div>

            <div className="bg-cyber-950 p-4 rounded-xl border border-cyber-800 font-mono text-xs overflow-y-auto max-h-56">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Engine Output:</div>
              {analysisResult ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Calculated Risk:</span>
                    <strong className="text-rose-400 font-bold">{analysisResult.risk_score}/100</strong>
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-cyber-800 text-slate-300">
                      {analysisResult.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Triggered Rules: </span>
                    <span className="text-cyan-300">
                      {analysisResult.triggered_rules?.map((r: any) => r.name).join(', ') || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Reasons: </span>
                    <span className="text-slate-200">
                      {analysisResult.reasons?.join('; ') || 'No anomalous indicators'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">Click "Evaluate Detection Rules" to test scoring logic.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by keyword, device, or user..."
            className="w-full bg-cyber-950 border border-cyber-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Type:</span>
          {['all', 'login', 'process_execution', 'credential_access', 'network_activity', 'lateral_movement', 'file_access'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-cyber-900 text-slate-400 hover:text-white border border-cyber-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel rounded-2xl border border-cyber-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-900 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-cyber-800">
              <tr>
                <th className="p-3.5">Event ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">User / Host</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5 text-center">Score</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/60 bg-cyber-950/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No security events available. Run the demo to ingest sample events.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => (
                  <React.Fragment key={ev.event_id}>
                    <tr className="hover:bg-cyber-900/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-400">{ev.event_id}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {ev.timestamp.slice(11, 19)}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-cyber-850 text-slate-300 font-mono text-[10px]">
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-200 max-w-xs truncate">{ev.description}</td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        {ev.user || '-'} @ {ev.device || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-cyan-300">
                        {ev.source_ip || '-'}
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (ev.risk_score || 0) >= 20
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-cyber-800 text-slate-400'
                          }`}
                        >
                          +{ev.risk_score || 0}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setExpandedId(expandedId === ev.event_id ? null : ev.event_id)}
                          className="p-1 rounded hover:bg-cyber-800 text-slate-400 hover:text-white"
                        >
                          {expandedId === ev.event_id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {expandedId === ev.event_id && (
                      <tr className="bg-cyber-900/40">
                        <td colSpan={8} className="p-4">
                          <div className="p-3 rounded-xl bg-cyber-950 border border-cyber-800 font-mono text-xs space-y-1">
                            <div className="text-cyan-400 font-bold">
                              Triggered Rules: {ev.triggered_rules?.join(', ') || 'None'}
                            </div>
                            <pre className="text-[11px] text-emerald-400 overflow-x-auto mt-2">
                              {JSON.stringify(ev.metadata || {}, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
