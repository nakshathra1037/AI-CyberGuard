import React, { useState } from 'react';
import {
  Database, User, Laptop, Server, Globe, FileSearch,
  ChevronDown, ChevronUp, ShieldCheck, AlertCircle
} from 'lucide-react';
import { EvidenceItem, AffectedAssets } from '../types';

interface EvidenceTableProps {
  evidence: EvidenceItem[];
  affectedAssets: AffectedAssets;
}

export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  evidence,
  affectedAssets,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyber-800 space-y-6">
      {/* Affected Assets Summary */}
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Identified Affected Assets</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Users */}
          <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyber-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Users ({affectedAssets.users?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-white truncate">
              {affectedAssets.users?.join(', ') || 'None'}
            </div>
          </div>

          {/* Workstations */}
          <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyber-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Workstations ({affectedAssets.devices?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-white truncate">
              {affectedAssets.devices?.join(', ') || 'None'}
            </div>
          </div>

          {/* Servers */}
          <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyber-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Servers ({affectedAssets.servers?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-white truncate">
              {affectedAssets.servers?.join(', ') || 'None'}
            </div>
          </div>

          {/* Databases */}
          <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyber-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Database className="w-3.5 h-3.5 text-rose-400" />
              <span>Databases ({affectedAssets.databases?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-white truncate">
              {affectedAssets.databases?.join(', ') || 'None'}
            </div>
          </div>

          {/* Observed IPs */}
          <div className="p-3 rounded-xl bg-cyber-900/80 border border-cyber-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Observed IPs ({affectedAssets.ips?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-white truncate">
              {affectedAssets.ips?.join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Evidence Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-cyan-400" />
            <span>Traceable Incident Evidence ({evidence.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Strictly grounded telemetry records</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-cyber-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-cyber-900 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-cyber-800">
              <tr>
                <th className="p-3">Event ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Source / Dest</th>
                <th className="p-3 text-center">Risk</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/60 bg-cyber-950/60">
              {evidence.map((ev) => (
                <React.Fragment key={ev.event_id}>
                  <tr className="hover:bg-cyber-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-400">{ev.event_id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cyber-800 text-slate-300 font-mono text-[10px]">
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 max-w-xs truncate">{ev.description}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">
                      {ev.source || 'N/A'} &rarr; {ev.destination || 'N/A'}
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        +{ev.risk_contribution}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleExpand(ev.event_id)}
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
                      <td colSpan={6} className="p-4">
                        <div className="p-3 rounded-lg bg-cyber-950 border border-cyber-800 font-mono text-[11px] text-slate-300">
                          <div className="text-cyan-400 font-bold mb-1">
                            Relationship: {ev.relationship_to_incident}
                          </div>
                          <div className="text-slate-400 mb-2">Timestamp: {ev.timestamp}</div>
                          <pre className="text-[10px] overflow-x-auto text-emerald-400">
                            {JSON.stringify(ev.metadata || {}, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
