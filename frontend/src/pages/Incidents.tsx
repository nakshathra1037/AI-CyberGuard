import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Filter, Search, ArrowRight, ShieldCheck,
  AlertTriangle, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Incident } from '../types';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.affected_users.some((u) => u.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inc.affected_devices.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity =
      severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Correlated Security Incidents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-stage attack clusters synthesized from isolated security events
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-cyber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by incident ID, asset, or title..."
            className="w-full bg-cyber-950 border border-cyber-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 shrink-0">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-cyber-900 text-slate-400 hover:text-white border border-cyber-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="glass-panel rounded-2xl border border-cyber-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-900 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-cyber-800">
              <tr>
                <th className="p-3.5">Incident ID</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Affected Assets</th>
                <th className="p-3.5">Detected Time</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/60 bg-cyber-950/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No incidents match your filter. Run the demo to populate the incident queue.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.incident_id} className="hover:bg-cyber-900/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {inc.incident_id}
                    </td>
                    <td className="p-3.5 font-semibold text-white max-w-xs truncate">
                      {inc.title}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-rose-400">
                      {inc.risk_score}/100
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-300">
                      {inc.affected_users.join(', ')} • {inc.affected_devices.join(', ')}
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {inc.created_at?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="p-3.5 text-right">
                      <Link
                        to={`/incidents/${inc.incident_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
