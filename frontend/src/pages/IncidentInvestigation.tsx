import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert, 
  Cpu, 
  Clock, 
  Database, 
  Terminal,
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  RefreshCw,
  Sparkles, 
  ShieldCheck, 
  UserX, 
  Network,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Incident, ResponseRecommendation, SimulatedAction } from '../types';
import { AttackStoryGraph } from '../components/AttackStoryGraph';
import { Timeline } from '../components/Timeline';
import { EvidenceTable } from '../components/EvidenceTable';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { ResponseConsole } from '../components/ResponseConsole';

export const IncidentInvestigation: React.FC = () => {
  const { incidentId = 'INC-1024' } = useParams<{ incidentId: string }>();
  const fallbackInc1024: Incident = {
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
    timeline: [
      {
        timestamp: '2026-09-19T09:41:12Z',
        event_id: 'EVT-9001',
        event_type: 'AUTH_FAILURE',
        description: '4 failed login attempts from external IP 198.51.100.44',
        risk_contribution: 25,
        relationship_to_incident: 'Initial Brute Force Access Attempt',
        source: '198.51.100.44',
        destination: 'auth-service'
      },
      {
        timestamp: '2026-09-19T09:43:08Z',
        event_id: 'EVT-9002',
        event_type: 'AUTH_SUCCESS',
        description: 'Valid authentication established session sess-compromised-99',
        risk_contribution: 10,
        relationship_to_incident: 'Credential Compromise / Login Success',
        source: '198.51.100.44',
        destination: 'auth-service'
      },
      {
        timestamp: '2026-09-19T09:44:31Z',
        event_id: 'EVT-9003',
        event_type: 'UNUSUAL_IP',
        description: 'Session active on unseen Romanian IP 198.51.100.44',
        risk_contribution: 20,
        relationship_to_incident: 'Egress/Ingress Anomaly',
        source: '198.51.100.44',
        destination: 'corporate-vpn'
      },
      {
        timestamp: '2026-09-19T09:44:50Z',
        event_id: 'EVT-9004',
        event_type: 'DEVICE_CHANGE',
        description: 'Session transferred to Linux hardware signature',
        risk_contribution: 20,
        relationship_to_incident: 'Device Identity Drift',
        source: 'DEV-UNKNOWN-98',
        destination: 'iam-directory'
      },
      {
        timestamp: '2026-09-19T09:45:15Z',
        event_id: 'EVT-9005',
        event_type: 'SUSPICIOUS_COMMAND',
        description: 'PowerShell execution with base64 encoded payload',
        risk_contribution: 35,
        relationship_to_incident: 'Memory & Token Harvest',
        source: 'DEV-UNKNOWN-98',
        destination: 'powershell.exe'
      },
      {
        timestamp: '2026-09-19T09:46:10Z',
        event_id: 'EVT-9007',
        event_type: 'DATABASE_ACCESS',
        description: 'Bulk SQL query executed on customer wire transfers',
        risk_contribution: 26,
        relationship_to_incident: 'Data Exfiltration Impact',
        source: '198.51.100.44',
        destination: 'DB-FINANCE-01'
      }
    ],
    evidence: [
      {
        event_id: 'EVT-9001',
        timestamp: '2026-09-19T09:41:12Z',
        event_type: 'AUTH_FAILURE',
        description: '4 consecutive failed password attempts on Okta gateway',
        risk_contribution: 25,
        source: '198.51.100.44',
        destination: 'auth-service',
        relationship_to_incident: 'Credential Brute Force',
        metadata: { reason: 'bad_password', attempt_count: 4 }
      },
      {
        event_id: 'EVT-9003',
        timestamp: '2026-09-19T09:44:31Z',
        event_type: 'UNUSUAL_IP',
        description: 'Unregistered external ISP IP 198.51.100.44',
        risk_contribution: 20,
        source: '198.51.100.44',
        destination: 'corporate-vpn',
        relationship_to_incident: 'External Network Ingress',
        metadata: { reputation_score: 78, country: 'Romania' }
      },
      {
        event_id: 'EVT-9005',
        timestamp: '2026-09-19T09:45:15Z',
        event_type: 'SUSPICIOUS_COMMAND',
        description: 'Base64 encoded PowerShell invocation',
        risk_contribution: 35,
        source: 'DEV-UNKNOWN-98',
        destination: 'powershell.exe',
        relationship_to_incident: 'Execution Technique T1059.001',
        metadata: { pid: 4820, encoded: true }
      },
      {
        event_id: 'EVT-9007',
        timestamp: '2026-09-19T09:46:10Z',
        event_type: 'DATABASE_ACCESS',
        description: '14,200 wire transfer records dumped via SQL query',
        risk_contribution: 26,
        source: '198.51.100.44',
        destination: 'DB-FINANCE-01',
        relationship_to_incident: 'Exfiltration Target',
        metadata: { records: 14200, table: 'customer_accounts' }
      }
    ],
    attack_story: {
      incident_id: 'INC-1024',
      summary_text: "An external entity conducted rapid credential brute-forcing against user 'alice.smith' from IP 198.51.100.44. Following a successful login, the session was bound to an unrecognized Linux workstation, spawned an encoded PowerShell execution, and queried 14,200 sensitive records on DB-FINANCE-01.",
      stages: ['Initial Access', 'Credential Abuse', 'Device Drift', 'Execution', 'Data Access'],
      nodes: [
        { id: 'node-user', label: 'alice.smith', type: 'user', details: { role: 'Finance Analyst', dept: 'Treasury' } },
        { id: 'node-ip', label: '198.51.100.44', type: 'ip', details: { country: 'Romania', reputation: 'Suspicious (78%)' } },
        { id: 'node-device', label: 'DEV-UNKNOWN-98', type: 'device', details: { os: 'Linux x86_64', first_seen: 'Today' } },
        { id: 'node-process', label: 'PowerShell Cradle', type: 'process', details: { pid: 4820, cmd: 'enc -bypass' } },
        { id: 'node-cred', label: 'Auth Token Access', type: 'credential', details: { tech: 'T1078 (Valid Accounts)' } },
        { id: 'node-server', label: 'API Gateway', type: 'server', details: { endpoint: '/api/v1/customers' } },
        { id: 'node-database', label: 'Financial DB-01', type: 'database', details: { table: 'wire_transfers' } }
      ],
      edges: [
        { id: 'e1', source: 'node-user', target: 'node-ip', label: 'logged_from' },
        { id: 'e2', source: 'node-ip', target: 'node-device', label: 'used_device' },
        { id: 'e3', source: 'node-device', target: 'node-process', label: 'spawned' },
        { id: 'e4', source: 'node-process', target: 'node-cred', label: 'harvested' },
        { id: 'e5', source: 'node-cred', target: 'node-server', label: 'targeted' },
        { id: 'e6', source: 'node-server', target: 'node-database', label: 'exfiltrated_from' }
      ]
    },
    created_at: '2026-09-19T09:41:12Z',
    updated_at: '2026-09-19T09:46:30Z'
  };

  const defaultRecommendations: ResponseRecommendation[] = [
    {
      action_type: 'revoke_session',
      target: 'sess-compromised-99 (alice.smith)',
      priority: 'P1 (Critical)',
      description: 'Immediately terminate active OAuth & SSO tokens for session sess-compromised-99.',
      rationale: 'Prevents continued access to internal resources with stolen credentials.',
      requires_approval: true,
      status: 'PENDING'
    },
    {
      action_type: 'block_ip',
      target: '198.51.100.44',
      priority: 'P2 (High)',
      description: 'Apply firewall drop rule for 198.51.100.44 across perimeter edge routers.',
      rationale: 'Severes attacker ingress connection and prevents exfiltration continuation.',
      requires_approval: true,
      status: 'PENDING'
    },
    {
      action_type: 'lock_user',
      target: 'alice.smith',
      priority: 'P2 (High)',
      description: 'Suspend user directory account until password reset and hardware token reprovisioning.',
      rationale: 'Halts unauthorized automated actions and lateral account traversal.',
      requires_approval: true,
      status: 'PENDING'
    },
    {
      action_type: 'isolate_host',
      target: 'DEV-UNKNOWN-98',
      priority: 'P1 (Critical)',
      description: 'Issue network isolation via EDR agent on DEV-UNKNOWN-98.',
      rationale: 'Contains lateral pivot and memory harvesting malware.',
      requires_approval: true,
      status: 'PENDING'
    }
  ];

  const defaultHistory: SimulatedAction[] = [
    {
      action_id: 'ACT-REVOKE-01',
      incident_id: 'INC-1024',
      action_type: 'revoke_session',
      target: 'sess-compromised-99 (alice.smith)',
      status: 'APPROVED',
      simulation: true,
      timestamp: '2026-09-19T09:47:00Z',
      executed_by: 'marcus.vance (ADMIN)',
      command_simulated: "IAM.revokeSession(session_id='sess-compromised-99')"
    },
    {
      action_id: 'ACT-BLOCK-02',
      incident_id: 'INC-1024',
      action_type: 'block_ip',
      target: '198.51.100.44',
      status: 'APPROVED',
      simulation: true,
      timestamp: '2026-09-19T09:47:15Z',
      executed_by: 'marcus.vance (ADMIN)',
      command_simulated: "Firewall.addBlockRule(ip='198.51.100.44', duration='24h')"
    }
  ];

  const [incident, setIncident] = useState<Incident | null>(fallbackInc1024);
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>(defaultRecommendations);
  const [responseHistory, setResponseHistory] = useState<SimulatedAction[]>(defaultHistory);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncidentData = async () => {
    setIsLoading(true);
    try {
      const [incData, recsData, historyData] = await Promise.all([
        api.getIncident(incidentId).catch(() => null),
        api.getRecommendations(incidentId).catch(() => []),
        api.getResponseHistory(incidentId).catch(() => []),
      ]);

      if (incData) {
        setIncident(incData);
      } else if (incidentId === 'INC-1024' || !incident) {
        setIncident(fallbackInc1024);
      }
      if (recsData && recsData.length > 0) {
        setRecommendations(recsData);
      }
      if (historyData && historyData.length > 0) {
        setResponseHistory(historyData);
      }
    } catch (err) {
      console.error('Failed to load incident investigation', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();
  }, [incidentId]);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-soc-blue animate-spin" />
        <p className="text-xs text-soc-secondary font-mono">Reconstructing Attack Story & Correlating Telemetry...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="soc-panel p-8 text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-8 h-8 text-soc-warning mx-auto" />
        <h3 className="text-sm font-semibold text-soc-text">Incident {incidentId} Not Found</h3>
        <p className="text-xs text-soc-secondary">
          No correlated telemetry exists for this incident ID in memory.
        </p>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Incidents
        </Link>
      </div>
    );
  }

  const riskFactors = [
    { label: 'Authentication anomaly cluster', weight: '+25', color: 'bg-soc-critical' },
    { label: 'Previously unseen source IP', weight: '+20', color: 'bg-soc-high' },
    { label: 'Unrecognized device profile', weight: '+20', color: 'bg-soc-warning' },
    { label: 'Sensitive customer DB access', weight: '+26', color: 'bg-soc-critical' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-soc-border">
        <div className="flex items-center gap-2 text-xs text-soc-secondary font-mono">
          <Link to="/incidents" className="hover:text-soc-text flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Incidents
          </Link>
          <span>/</span>
          <span className="text-soc-text font-bold">{incident.incident_id}</span>
          <span>/</span>
          <span className="text-soc-blue">Investigation Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports/${incident.incident_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-card hover:bg-soc-elevated text-soc-text border border-soc-border text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-soc-blue" />
            <span>Generate Executive Report</span>
          </Link>

          <button
            onClick={fetchIncidentData}
            className="p-1.5 rounded-md bg-soc-card text-soc-secondary hover:text-soc-text border border-soc-border transition-colors"
            title="Refresh incident"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Incident Header & Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Incident Metadata */}
        <div className="lg:col-span-2 soc-panel p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-soc-blue bg-soc-card px-2 py-0.5 rounded border border-soc-border">
                {incident.incident_id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-soc-critical/20 text-soc-critical border border-soc-critical/30">
                {incident.severity} SEVERITY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-card text-soc-secondary border border-soc-border">
                STATUS: {incident.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-elevated text-soc-cyan border border-soc-border">
                SIMULATION SAFE
              </span>
            </div>

            <h1 className="text-lg font-bold text-soc-text tracking-tight">
              {incident.title}
            </h1>

            <p className="text-xs text-soc-secondary mt-1.5 leading-relaxed">
              {incident.attack_story?.summary_text ||
                "Multi-stage credential attack and unauthorized lateral progression attempting access to customer data."}
            </p>
          </div>

          <div className="pt-3 border-t border-soc-border flex items-center justify-between text-[11px] font-mono text-soc-muted">
            <span>Actor: <strong className="text-soc-text">{incident.affected_users?.join(', ') || 'alice.smith'}</strong></span>
            <span>Target: <strong className="text-soc-text">{incident.affected_devices?.join(', ') || 'DEV-CORP-017'}</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Explainable Risk Score Card */}
        <div className="soc-panel p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-soc-border">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-soc-muted">
              Explainable Risk Score
            </span>
            <span className="text-xs font-mono font-bold text-soc-critical">HIGH RISK</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-soc-text">{incident.risk_score}</span>
            <span className="text-xs font-mono text-soc-muted">/ 100</span>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-1.5">
            {riskFactors.map((rf, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-soc-secondary truncate">{rf.label}</span>
                <span className="text-soc-critical font-semibold ml-2">{rf.weight}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-soc-border text-[10px] font-mono text-soc-muted">
            Computed via Deterministic & ML Weights
          </div>
        </div>
      </div>

      {/* Flagship: Dynamic Attack Story Graph */}
      <AttackStoryGraph
        attackStory={incident.attack_story}
        incidentTitle={incident.title}
        riskScore={incident.risk_score}
      />

      {/* Main Workspace: Left (Evidence & Response) / Right (AI Assistant) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Evidence, Timeline, Containment Console */}
        <div className="lg:col-span-7 space-y-6">
          {/* Structured AI Investigation Card */}
          <div className="soc-panel p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-soc-border">
              <Sparkles className="w-4 h-4 text-soc-blue" />
              <h2 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide">
                Structured AI Reasoning & Evidence Grounding
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-soc-card border border-soc-border">
                <div className="text-[10px] font-mono uppercase font-bold text-soc-blue mb-1">
                  FACT (Verified Telemetry)
                </div>
                <p className="text-soc-text leading-relaxed">
                  Multiple consecutive authentication failures occurred from IP <code className="text-soc-cyan font-mono">198.51.100.44</code> followed by a successful login for <code className="text-soc-text font-mono">alice.smith</code>. The session originated from an unrecorded device hardware signature.
                </p>
              </div>

              <div className="p-3 rounded-md bg-soc-card border border-soc-border">
                <div className="text-[10px] font-mono uppercase font-bold text-soc-warning mb-1">
                  INFERENCE (Deduction)
                </div>
                <p className="text-soc-text leading-relaxed">
                  The sequential pattern is consistent with credential compromise and potential valid account abuse (MITRE T1078) leading to unauthorized database probing.
                </p>
              </div>

              <div className="p-3 rounded-md bg-soc-card border border-soc-border">
                <div className="text-[10px] font-mono uppercase font-bold text-soc-success mb-1">
                  RECOMMENDATION (Containment Guidance)
                </div>
                <p className="text-soc-text leading-relaxed">
                  Revoke active session token <code className="text-soc-cyan font-mono">sess-compromised-99</code>, require mandatory MFA re-authentication, and place source IP <code className="text-soc-cyan font-mono">198.51.100.44</code> under perimeter monitoring.
                </p>
              </div>

              <div className="p-3 rounded-md bg-soc-card border border-soc-border">
                <div className="text-[10px] font-mono uppercase font-bold text-soc-muted mb-1">
                  UNCERTAINTY & LIMITATIONS
                </div>
                <p className="text-soc-secondary leading-relaxed">
                  Whether credentials were harvested via phishing or credential stuffing cannot be definitively established without external mail gateway telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Table */}
          <EvidenceTable
            evidence={incident.evidence || []}
            affectedAssets={incident.affected_assets}
          />

          {/* Chronological Timeline */}
          <Timeline items={incident.timeline || []} />

          {/* Response Console */}
          <ResponseConsole
            incidentId={incident.incident_id}
            recommendations={recommendations}
            simulatedHistory={responseHistory}
            onActionSimulated={fetchIncidentData}
          />
        </div>

        {/* Right Column (5 cols): Embedded AI Chat Analyst */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            <AIChatDrawer
              incidentId={incident.incident_id}
              initialSummary={incident.attack_story?.summary_text}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
