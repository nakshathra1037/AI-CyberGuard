import React, { useState, useEffect } from 'react';
import {
  Terminal, 
  Search, 
  Filter, 
  RefreshCw, 
  PlusCircle, 
  X,
  Code,
  Network,
  Cpu,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityEvent } from '../types';
import { EventIngestionModal } from '../components/EventIngestionModal';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEvents(1, 100);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Error fetching events', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.event_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.source_ip && ev.source_ip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.user_id && ev.user_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.resource && ev.resource.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'all' || ev.event_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-soc-blue" />
            <h1 className="text-lg font-semibold text-soc-text tracking-tight">Security Telemetry Explorer</h1>
          </div>
          <p className="text-xs text-soc-secondary mt-0.5">
            Normalized SIEM security events, threat rule evaluation, and behavioral anomaly markers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white font-semibold text-xs transition-colors shadow-accent-subtle"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ingest Telemetry</span>
          </button>

          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-panel hover:bg-soc-elevated text-soc-text border border-soc-border text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ingestion Modal */}
      <EventIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onEventIngested={fetchEvents}
      />

      {/* Filter Bar */}
      <div className="soc-panel p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-soc-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event ID, IP, user, resource..."
            className="w-full bg-soc-card border border-soc-border rounded-md pl-8 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-blue font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-soc-muted shrink-0 font-mono">Type:</span>
          {['all', 'AUTH_FAILURE', 'AUTH_SUCCESS', 'UNUSUAL_IP', 'DEVICE_CHANGE', 'API_ACCESS', 'SUSPICIOUS_COMMAND'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-soc-blue/20 text-soc-blue border border-soc-blue/40 font-semibold'
                  : 'bg-soc-card text-soc-secondary hover:text-soc-text border border-soc-border'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Events Table + Contextual Side Drawer */}
      <div className="flex gap-5 relative">
        {/* Events Table */}
        <div className="soc-panel flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soc-card text-soc-muted uppercase tracking-wider text-[10px] font-mono border-b border-soc-border">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border text-soc-secondary">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-soc-muted">
                      No matching security telemetry events found. Click "Ingest Telemetry" or launch a scenario.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => (
                    <tr
                      key={ev.event_id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setShowRawJson(false);
                      }}
                      className={`cursor-pointer transition-colors ${
                        selectedEvent?.event_id === ev.event_id
                          ? 'bg-soc-blue/15 border-l-2 border-soc-blue'
                          : 'hover:bg-soc-elevated/40'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-soc-muted">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs font-semibold text-soc-blue">
                        {ev.event_type}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-soc-text font-medium">
                        {ev.user_id || ev.user || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-soc-cyan">
                        {ev.source_ip || '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-soc-text truncate max-w-xs">
                        {ev.resource || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          ev.severity === 'HIGH' || ev.severity === 'CRITICAL' ? 'bg-soc-critical/20 text-soc-critical' :
                          ev.severity === 'MEDIUM' ? 'bg-soc-warning/20 text-soc-warning' : 'bg-soc-blue/20 text-soc-blue'
                        }`}>
                          {ev.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[11px] font-mono text-soc-blue hover:underline">
                          View &rarr;
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-soc-border bg-soc-card flex items-center justify-between text-[11px] text-soc-muted font-mono">
            <span>Showing {filteredEvents.length} events</span>
            <span>Real-time Ingestion Layer</span>
          </div>
        </div>

        {/* Side Event Drawer */}
        {selectedEvent && (
          <div className="w-80 lg:w-96 soc-panel p-4 flex flex-col justify-between shrink-0 animate-in slide-in-from-right duration-150">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-soc-border">
                <div>
                  <div className="text-[10px] font-mono uppercase text-soc-muted">Event Detail Inspector</div>
                  <div className="text-xs font-bold text-soc-text font-mono">{selectedEvent.event_id}</div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1 rounded text-soc-muted hover:text-soc-text hover:bg-soc-elevated"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formatted Key-Value Telemetry */}
              {!showRawJson ? (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-2.5 rounded bg-soc-card border border-soc-border space-y-1.5">
                    <div className="text-[10px] uppercase text-soc-muted">Event Metadata</div>
                    <div><span className="text-soc-muted">Timestamp:</span> <span className="text-soc-text">{new Date(selectedEvent.timestamp).toISOString()}</span></div>
                    <div><span className="text-soc-muted">Event Type:</span> <span className="text-soc-blue font-bold">{selectedEvent.event_type}</span></div>
                    <div><span className="text-soc-muted">Action:</span> <span className="text-soc-text">{selectedEvent.action}</span></div>
                    <div><span className="text-soc-muted">Severity:</span> <span className="text-soc-warning font-bold">{selectedEvent.severity}</span></div>
                  </div>

                  <div className="p-2.5 rounded bg-soc-card border border-soc-border space-y-1.5">
                    <div className="text-[10px] uppercase text-soc-muted">Entity Context</div>
                    <div><span className="text-soc-muted">User ID:</span> <span className="text-soc-cyan">{selectedEvent.user_id || selectedEvent.user}</span></div>
                    <div><span className="text-soc-muted">Source IP:</span> <span className="text-soc-text">{selectedEvent.source_ip}</span></div>
                    <div><span className="text-soc-muted">Device ID:</span> <span className="text-soc-text">{selectedEvent.device_id || selectedEvent.device || 'N/A'}</span></div>
                    <div><span className="text-soc-muted">Session ID:</span> <span className="text-soc-text">{selectedEvent.session_id || 'N/A'}</span></div>
                    <div><span className="text-soc-muted">Resource:</span> <span className="text-soc-text">{selectedEvent.resource}</span></div>
                  </div>

                  {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                    <div className="p-2.5 rounded bg-soc-card border border-soc-border space-y-1">
                      <div className="text-[10px] uppercase text-soc-muted">Extended Telemetry Fields</div>
                      {Object.entries(selectedEvent.metadata).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-soc-muted">{k}:</span> <span className="text-soc-text">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Raw JSON view */
                <div className="bg-soc-bg p-3 rounded border border-soc-border max-h-96 overflow-y-auto font-mono text-[10px] text-soc-cyan">
                  <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-soc-border flex items-center justify-between">
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-soc-elevated hover:bg-soc-card border border-soc-border text-xs text-soc-text font-mono transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-soc-blue" />
                <span>{showRawJson ? 'Formatted View' : 'Raw JSON'}</span>
              </button>

              <span className="text-[10px] font-mono text-soc-muted">Validated Telemetry</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
