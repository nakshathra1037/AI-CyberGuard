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
    <div className="soc-panel p-5 space-y-5">
      {/* Affected Assets Summary */}
      <div>
        <h3 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide mb-3 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-soc-blue" />
          <span>Affected Asset Topology</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Users */}
          <div className="p-2.5 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-secondary text-[11px] mb-0.5">
              <User className="w-3 h-3 text-soc-cyan" />
              <span>Users ({affectedAssets.users?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-soc-text truncate">
              {affectedAssets.users?.join(', ') || 'None'}
            </div>
          </div>

          {/* Workstations */}
          <div className="p-2.5 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-secondary text-[11px] mb-0.5">
              <Laptop className="w-3 h-3 text-soc-blue" />
              <span>Devices ({affectedAssets.devices?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-soc-text truncate">
              {affectedAssets.devices?.join(', ') || 'None'}
            </div>
          </div>

          {/* Servers */}
          <div className="p-2.5 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-secondary text-[11px] mb-0.5">
              <Server className="w-3 h-3 text-soc-secondary" />
              <span>Servers ({affectedAssets.servers?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-soc-text truncate">
              {affectedAssets.servers?.join(', ') || 'None'}
            </div>
          </div>

          {/* Databases */}
          <div className="p-2.5 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-secondary text-[11px] mb-0.5">
              <Database className="w-3 h-3 text-soc-critical" />
              <span>Databases ({affectedAssets.databases?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-soc-text truncate">
              {affectedAssets.databases?.join(', ') || 'None'}
            </div>
          </div>

          {/* Observed IPs */}
          <div className="p-2.5 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-secondary text-[11px] mb-0.5">
              <Globe className="w-3 h-3 text-soc-warning" />
              <span>Observed IPs ({affectedAssets.ips?.length || 0})</span>
            </div>
            <div className="font-mono text-xs font-semibold text-soc-text truncate">
              {affectedAssets.ips?.join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Correlated Evidence Table */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide flex items-center gap-2">
            <FileSearch className="w-3.5 h-3.5 text-soc-blue" />
            <span>Traceable Telemetry Evidence ({evidence.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-soc-muted">Grounded in raw log events</span>
        </div>

        <div className="overflow-x-auto rounded-md border border-soc-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-soc-card text-soc-muted uppercase tracking-wider text-[10px] font-mono border-b border-soc-border">
              <tr>
                <th className="py-2 px-3">Event ID</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3">Source &rarr; Dest</th>
                <th className="py-2 px-3 text-center">Risk</th>
                <th className="py-2 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border bg-soc-panel">
              {evidence.map((ev) => (
                <React.Fragment key={ev.event_id}>
                  <tr className="hover:bg-soc-elevated/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-soc-blue">{ev.event_id}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-soc-card border border-soc-border text-soc-text font-mono text-[10px]">
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-soc-text max-w-xs truncate">{ev.description}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-secondary">
                      {ev.source || 'N/A'} &rarr; {ev.destination || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-soc-critical/15 text-soc-critical border border-soc-critical/30">
                        +{ev.risk_contribution}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => toggleExpand(ev.event_id)}
                        className="p-1 rounded hover:bg-soc-elevated text-soc-muted hover:text-soc-text transition-colors"
                      >
                        {expandedId === ev.event_id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedId === ev.event_id && (
                    <tr className="bg-soc-card/50">
                      <td colSpan={6} className="p-3">
                        <div className="p-3 rounded bg-soc-bg border border-soc-border font-mono text-[11px] text-soc-secondary space-y-1">
                          <div className="text-soc-blue font-semibold">
                            Causal Relationship: {ev.relationship_to_incident}
                          </div>
                          <div className="text-soc-muted">Timestamp: {ev.timestamp}</div>
                          <pre className="text-[10px] overflow-x-auto text-soc-cyan pt-1">
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
