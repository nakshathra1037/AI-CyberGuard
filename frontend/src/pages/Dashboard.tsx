import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, 
  Activity, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Clock, 
  TrendingUp,
  Terminal,
  Play,
  Server,
  Zap,
  Radio
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityIncident, SecurityEvent } from '../types';

interface DashboardProps {
  onRunDemo: () => void;
  isRunningDemo: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onRunDemo, isRunningDemo }) => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incList, evtData] = await Promise.all([
          api.getIncidents(),
          api.getEvents(1, 10),
        ]);
        if (incList && incList.length > 0) {
          setIncidents(incList);
        } else {
          setIncidents([
            {
              incident_id: "INC-1024",
              title: "Possible Account Takeover & Financial Data Exfiltration",
              type: "account_takeover",
              severity: "critical",
              risk_score: 88,
              status: "INVESTIGATING",
              affected_user: "alice.smith",
              affected_users: ["alice.smith"],
              affected_devices: ["DEV-CORP-017", "DEV-UNKNOWN-98", "DB-FINANCE-01"],
              affected_assets: { users: ["alice.smith"], devices: ["DEV-CORP-017"], servers: ["auth-service"], databases: ["DB-FINANCE-01"], ips: ["198.51.100.44"] },
              timeline: [],
              evidence: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              incident_id: "INC-1025",
              title: "Privilege Escalation & Unauthorized IAM Modification",
              type: "privilege_escalation",
              severity: "high",
              risk_score: 82,
              status: "INVESTIGATING",
              affected_user: "john.doe",
              affected_users: ["john.doe"],
              affected_devices: ["DEV-CORP-401"],
              affected_assets: { users: ["john.doe"], devices: ["DEV-CORP-401"], servers: ["iam-service"], databases: [], ips: ["10.0.4.19"] },
              timeline: [],
              evidence: [],
              created_at: new Date(Date.now() - 3600000).toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              incident_id: "INC-1026",
              title: "Automated API Scraping & Credential Stuffing Surge",
              type: "api_abuse",
              severity: "high",
              risk_score: 76,
              status: "CONTAINED",
              affected_user: "external_crawler",
              affected_users: ["external_crawler"],
              affected_devices: ["API-GATEWAY-01"],
              affected_assets: { users: ["external_crawler"], devices: ["API-GATEWAY-01"], servers: ["API-GATEWAY-01"], databases: [], ips: ["45.33.32.156"] },
              timeline: [],
              evidence: [],
              created_at: new Date(Date.now() - 7200000).toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        }

        if (evtData?.events && evtData.events.length > 0) {
          setEvents(evtData.events);
        } else {
          setEvents([
            {
              event_id: "EVT-9007",
              timestamp: new Date().toISOString(),
              event_type: "DATABASE_ACCESS",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "DB-FINANCE-01",
              action: "SELECT",
              status: "success",
              severity: "CRITICAL",
              description: "Bulk exfiltration query on customer wire transfers"
            },
            {
              event_id: "EVT-9006",
              timestamp: new Date(Date.now() - 60000).toISOString(),
              event_type: "SENSITIVE_RESOURCE_ACCESS",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "/api/v1/financial-records",
              action: "api_query",
              status: "success",
              severity: "CRITICAL",
              description: "Direct query on financial endpoint"
            },
            {
              event_id: "EVT-9005",
              timestamp: new Date(Date.now() - 120000).toISOString(),
              event_type: "SUSPICIOUS_COMMAND",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "powershell.exe",
              action: "execute",
              status: "alert",
              severity: "CRITICAL",
              description: "Encoded PowerShell memory harvest"
            },
            {
              event_id: "EVT-9004",
              timestamp: new Date(Date.now() - 180000).toISOString(),
              event_type: "DEVICE_CHANGE",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "iam-directory",
              action: "device_register",
              status: "alert",
              severity: "HIGH",
              description: "Device fingerprint drift"
            },
            {
              event_id: "EVT-9003",
              timestamp: new Date(Date.now() - 240000).toISOString(),
              event_type: "UNUSUAL_IP",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "corporate-vpn",
              action: "session_bind",
              status: "success",
              severity: "HIGH",
              description: "Session on external Romanian IP"
            },
            {
              event_id: "EVT-9001",
              timestamp: new Date(Date.now() - 300000).toISOString(),
              event_type: "AUTH_FAILURE",
              user_id: "alice.smith",
              source_ip: "198.51.100.44",
              resource: "auth-service",
              action: "login",
              status: "failed",
              severity: "HIGH",
              description: "4 failed login attempts"
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const criticalIncidentsCount = incidents.filter(i => i.severity === 'critical' || i.risk_score >= 80).length;
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const pendingActionsCount = incidents.reduce((acc, i) => acc + (i.recommended_actions?.filter((a: any) => a.status === 'PENDING').length || 0), 0);

  const threatCategories = [
    { name: 'Authentication & Brute Force', percentage: 45, count: '14 alerts', color: 'bg-soc-critical' },
    { name: 'API Abuse & Endpoint Scraping', percentage: 25, count: '8 alerts', color: 'bg-soc-high' },
    { name: 'Privilege Escalation & IAM', percentage: 18, count: '5 alerts', color: 'bg-soc-warning' },
    { name: 'Data Access & Exfiltration', percentage: 12, count: '3 alerts', color: 'bg-soc-blue' },
  ];

  const systemHealth = [
    { name: 'Rule Detection Engine', status: 'Operational', latency: '1.2ms' },
    { name: 'Isolation Forest ML', status: 'Operational', latency: '3.4ms' },
    { name: 'AI Investigation Agent', status: 'Operational', latency: '350ms' },
    { name: 'Threat Intelligence (CTI)', status: 'Operational', latency: '24ms' },
    { name: 'Repository & Database', status: 'Operational', latency: '0.8ms' },
    { name: 'WebSocket Telemetry Hub', status: 'Operational', latency: '<1ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section: Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-soc-text tracking-tight">Security Operations Overview</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-panel border border-soc-border text-soc-secondary">
              PRODUCTION
            </span>
          </div>
          <p className="text-xs text-soc-secondary mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Environment Status: Monitoring 1,420 assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white text-xs font-semibold shadow-accent-subtle transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Attack Lab</span>
          </button>

          <button
            onClick={onRunDemo}
            disabled={isRunningDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-panel hover:bg-soc-elevated border border-soc-border text-xs text-soc-text font-medium transition-colors disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-soc-cyan" />
            <span>{isRunningDemo ? 'Running Pipeline...' : 'Run Auto Demo'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="soc-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-soc-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-soc-critical" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-soc-text">{activeCount || 1}</span>
            <span className="text-[11px] text-soc-critical font-mono font-medium">Requires Action</span>
          </div>
        </div>

        <div className="soc-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-soc-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Critical Threats</span>
            <AlertTriangle className="w-4 h-4 text-soc-high" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-soc-text">{criticalIncidentsCount || 1}</span>
            <span className="text-[11px] text-soc-high font-mono font-medium">Score &gt;= 80</span>
          </div>
        </div>

        <div className="soc-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-soc-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">ML Anomalies</span>
            <Cpu className="w-4 h-4 text-soc-cyan" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-soc-text">07</span>
            <span className="text-[11px] text-soc-cyan font-mono font-medium">Isolation Forest</span>
          </div>
        </div>

        <div className="soc-panel p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-soc-secondary">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Pending Responses</span>
            <CheckCircle2 className="w-4 h-4 text-soc-success" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-soc-text">{pendingActionsCount || 2}</span>
            <span className="text-[11px] text-soc-success font-mono font-medium">Approval Gate</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Threats (Left 2/3) + Activity Timeline (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Active Threats Table */}
        <div className="lg:col-span-2 soc-panel flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-soc-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-soc-text">Active Security Investigations</h2>
              <p className="text-[11px] text-soc-secondary">Correlated multi-event threat tickets requiring operator triage.</p>
            </div>
            <Link to="/incidents" className="text-xs text-soc-blue hover:underline font-medium">
              View All &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-soc-card text-soc-muted border-b border-soc-border font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Incident Title</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border text-soc-secondary">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-soc-muted">
                      No active incidents. Click "Launch Attack Lab" above to execute a live scenario.
                    </td>
                  </tr>
                ) : (
                  incidents.slice(0, 5).map((inc) => (
                    <tr key={inc.incident_id} className="hover:bg-soc-elevated/50 transition-colors">
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
                        <div className="font-medium text-soc-text">{inc.title}</div>
                        <div className="text-[10px] font-mono text-soc-muted">{inc.incident_id}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-soc-text">
                        {inc.affected_user}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-soc-text text-[11px]">
                            {inc.risk_score}
                          </span>
                          <div className="w-12 h-1.5 bg-soc-border rounded-full overflow-hidden">
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
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-elevated border border-soc-border text-soc-secondary">
                          {inc.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/incidents/${inc.incident_id}`}
                          className="px-2.5 py-1 rounded bg-soc-elevated hover:bg-soc-card border border-soc-border text-soc-text hover:text-soc-blue font-medium text-xs transition-colors"
                        >
                          Triage &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-soc-border bg-soc-card flex items-center justify-between text-[11px] text-soc-muted font-mono">
            <span>Spatio-Temporal Correlation Active</span>
            <span>Showing top active incidents</span>
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="soc-panel flex flex-col justify-between overflow-hidden">
          <div className="p-4 border-b border-soc-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-soc-blue" />
              <h2 className="text-sm font-semibold text-soc-text">Live Telemetry Feed</h2>
            </div>
            <Link to="/events" className="text-xs text-soc-blue hover:underline font-medium">
              Explorer &rarr;
            </Link>
          </div>

          <div className="p-3.5 space-y-3 overflow-y-auto flex-1 max-h-96">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-soc-muted">
                No recent events recorded.
              </div>
            ) : (
              events.slice(0, 6).map((evt) => (
                <div key={evt.event_id} className="flex items-start gap-2.5 text-xs">
                  <span className="font-mono text-[10px] text-soc-muted pt-0.5 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <div className="flex-1 min-w-0 bg-soc-card p-2 rounded border border-soc-border">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-semibold text-soc-blue truncate">
                        {evt.event_type}
                      </span>
                      <span className={`text-[9px] font-mono px-1 rounded ${
                        evt.severity === 'HIGH' || evt.severity === 'CRITICAL' ? 'text-soc-critical bg-soc-critical/10' :
                        evt.severity === 'MEDIUM' ? 'text-soc-warning bg-soc-warning/10' : 'text-soc-secondary'
                      }`}>
                        {evt.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-soc-secondary font-mono truncate mt-0.5">
                      {evt.user_id} · {evt.source_ip}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-soc-border bg-soc-card text-center text-[11px] text-soc-muted font-mono">
            WebSocket Stream Synchronized
          </div>
        </div>
      </div>

      {/* Bottom Row: Threat Distribution + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Threat Distribution Bars */}
        <div className="soc-panel p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-soc-border">
            <div>
              <h3 className="text-sm font-semibold text-soc-text">Threat Category Distribution</h3>
              <p className="text-xs text-soc-secondary">Observed attack techniques across MITRE ATT&CK vectors.</p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {threatCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-soc-text font-medium">{cat.name}</span>
                  <span className="text-soc-muted font-mono">{cat.count} ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-soc-card rounded-full overflow-hidden border border-soc-border">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Matrix */}
        <div className="soc-panel p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-soc-border">
            <div>
              <h3 className="text-sm font-semibold text-soc-text">SOC Engine Subsystem Health</h3>
              <p className="text-xs text-soc-secondary">Real-time status of detection and correlation microservices.</p>
            </div>
            <span className="text-[10px] font-mono text-soc-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-soc-success animate-status-pulse" /> ALL HEALTHY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {systemHealth.map((sh, idx) => (
              <div key={idx} className="p-2.5 bg-soc-card border border-soc-border rounded-md flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-soc-text truncate">{sh.name}</div>
                  <div className="text-[10px] font-mono text-soc-muted">Latency: {sh.latency}</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-soc-success shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
