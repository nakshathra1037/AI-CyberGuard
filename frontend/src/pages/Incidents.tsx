import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, 
  Filter, 
  Search, 
  ArrowRight, 
  RefreshCw, 
  Layers,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityIncident } from '../types';

export const Incidents: React.FC = () => {
  const defaultIncidents: SecurityIncident[] = [
    {
      incident_id: 'INC-1024',
      title: 'Possible Account Takeover & Financial Data Exfiltration',
      type: 'account_takeover',
      severity: 'critical',
      risk_score: 88,
      status: 'investigating',
      affected_user: 'alice.smith',
      affected_users: ['alice.smith'],
      affected_devices: ['DEV-CORP-017', 'DEV-UNKNOWN-98', 'DB-FINANCE-01'],
      affected_assets: {
        users: ['alice.smith'],
        devices: ['DEV-CORP-017', 'DEV-UNKNOWN-98'],
        servers: ['auth-service', 'corporate-vpn'],
        databases: ['DB-FINANCE-01'],
        ips: ['198.51.100.44']
      },
      timeline: [],
      evidence: [],
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      incident_id: 'INC-1025',
      title: 'Privilege Escalation & Unauthorized IAM Modification',
      type: 'privilege_escalation',
      severity: 'high',
      risk_score: 82,
      status: 'investigating',
      affected_user: 'john.doe',
      affected_users: ['john.doe'],
      affected_devices: ['DEV-CORP-401'],
      affected_assets: {
        users: ['john.doe'],
        devices: ['DEV-CORP-401'],
        servers: ['iam-service'],
        databases: [],
        ips: ['10.0.4.19']
      },
      timeline: [],
      evidence: [],
      created_at: new Date(Date.now() - 110 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 105 * 60000).toISOString()
    },
    {
      incident_id: 'INC-1026',
      title: 'Automated API Scraping & Credential Stuffing Surge',
      type: 'api_abuse',
      severity: 'high',
      risk_score: 76,
      status: 'contained',
      affected_user: 'external_crawler',
      affected_users: ['external_crawler'],
      affected_devices: ['API-GATEWAY-01'],
      affected_assets: {
        users: ['external_crawler'],
        devices: ['API-GATEWAY-01'],
        servers: ['API-GATEWAY-01'],
        databases: [],
        ips: ['45.33.32.156']
      },
      timeline: [],
      evidence: [],
      created_at: new Date(Date.now() - 240 * 60000).toISOString(),
      updated_at: new Date(Date.now() - 225 * 60000).toISOString()
    }
  ];

  const [incidents, setIncidents] = useState<SecurityIncident[]>(defaultIncidents);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await api.getIncidents();
      if (data && data.length > 0) {
        setIncidents(data);
      }
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
      (inc.affected_user && inc.affected_user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.affected_users && inc.affected_users.some(u => u.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSeverity =
      severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' || inc.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-soc-blue" />
            <h1 className="text-lg font-semibold text-soc-text tracking-tight">Incident Investigation Center</h1>
          </div>
          <p className="text-xs text-soc-secondary mt-0.5">
            Correlated multi-stage attack clusters requiring security analyst review and containment.
          </p>
        </div>

        <button
          onClick={fetchIncidents}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-panel hover:bg-soc-elevated text-soc-text border border-soc-border text-xs font-medium self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Incidents</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="soc-panel p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-soc-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by incident ID, entity, or title..."
            className="w-full bg-soc-card border border-soc-border rounded-md pl-8 pr-3 py-1.5 text-xs text-soc-text placeholder-soc-muted focus:outline-none focus:border-soc-blue font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-soc-muted shrink-0 font-mono">Severity:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded text-xs font-medium capitalize font-mono transition-colors ${
                severityFilter === sev
                  ? 'bg-soc-blue/20 text-soc-blue border border-soc-blue/40 font-semibold'
                  : 'bg-soc-card text-soc-secondary hover:text-soc-text border border-soc-border'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="soc-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-soc-card text-soc-muted uppercase tracking-wider text-[11px] font-mono border-b border-soc-border">
              <tr>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Incident</th>
                <th className="py-2.5 px-3">Affected Entity</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Detected</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border text-soc-secondary">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-soc-muted">
                    No matching incidents found. Execute an attack simulation or ingest events to populate this queue.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.incident_id} className="hover:bg-soc-elevated/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          inc.severity === 'critical' ? 'bg-soc-critical' :
                          inc.severity === 'high' ? 'bg-soc-high' :
                          inc.severity === 'medium' ? 'bg-soc-warning' : 'bg-soc-blue'
                        }`} />
                        <span className="font-mono text-[11px] uppercase font-bold text-soc-text">
                          {inc.severity}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-soc-text">{inc.title}</div>
                      <div className="text-[10px] font-mono text-soc-muted">{inc.incident_id}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-soc-text">
                      {inc.affected_user || inc.affected_users?.join(', ') || 'N/A'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-soc-text text-[11px]">
                          {inc.risk_score}/100
                        </span>
                        <div className="w-16 h-1.5 bg-soc-card rounded-full overflow-hidden border border-soc-border">
                          <div 
                            className={`h-full ${
                              inc.risk_score >= 80 ? 'bg-soc-critical' :
                              inc.risk_score >= 60 ? 'bg-soc-high' : 'bg-soc-warning'
                            }`}
                            style={{ width: `${inc.risk_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-card border border-soc-border text-soc-secondary">
                        {inc.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-soc-muted">
                      {new Date(inc.created_at || Date.now()).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/incidents/${inc.incident_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-soc-elevated hover:bg-soc-card border border-soc-border text-soc-text hover:text-soc-blue font-medium text-xs transition-colors"
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

        <div className="p-3 border-t border-soc-border bg-soc-card flex items-center justify-between text-[11px] text-soc-muted font-mono">
          <span>Total Incidents: {filteredIncidents.length}</span>
          <span>Spatio-Temporal Graph Correlation</span>
        </div>
      </div>
    </div>
  );
};
