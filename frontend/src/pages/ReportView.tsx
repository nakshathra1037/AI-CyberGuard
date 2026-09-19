import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Download, Printer, ArrowLeft, ShieldAlert,
  CheckCircle2, Clock, Database, Terminal, ShieldCheck, Share2
} from 'lucide-react';
import { api } from '../services/api';
import { IncidentReport } from '../types';

export const ReportView: React.FC = () => {
  const { incidentId = 'INC-1024' } = useParams<{ incidentId: string }>();
  const defaultReport: IncidentReport = {
    report_id: 'RPT-INC-1024',
    incident_id: 'INC-1024',
    title: 'Possible Account Takeover & Financial Data Exfiltration',
    generated_at: '2026-09-19T09:48:00Z',
    status: 'investigating',
    executive_summary: "On September 19, 2026, AI-CyberGuard correlated multi-stage adversary telemetry targeting user 'alice.smith'. Following rapid credential authentication failures from an unrecorded external IP in Romania, the attacker achieved session establishment, shifted hardware device fingerprint to an unrecognized Linux workstation, spawned an encoded PowerShell command, and initiated bulk data exfiltration against DB-FINANCE-01 customer records.",
    incident_metadata: {
      event_count: 7,
      attack_stages: 5,
      correlated_at: '2026-09-19T09:46:30Z'
    },
    risk_assessment: {
      risk_score: 88,
      severity: 'CRITICAL',
      confidence_level: 'High (0.94)',
      potential_impact: 'Severe - Confidential customer financial accounts compromised',
      primary_factors: [
        'Rapid multi-attempt authentication failure cluster (+25)',
        'Anomalous foreign ingress IP with elevated abuse history (+20)',
        'Immediate hardware device fingerprint drift (+20)',
        'Unauthorized bulk querying of financial transaction table (+26)'
      ]
    },
    affected_assets: {
      users: ['alice.smith'],
      devices: ['DEV-CORP-017', 'DEV-UNKNOWN-98'],
      servers: ['auth-service', 'corporate-vpn'],
      databases: ['DB-FINANCE-01'],
      ips: ['198.51.100.44']
    },
    attack_timeline: [
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
    ai_analysis: "The attack sequence demonstrates high adversary intentionality conforming to an Account Takeover and Data Exfiltration playbook (MITRE ATT&CK T1078, T1059.001, T1020). Risk score is elevated by rapid spatial anomaly and immediate database interaction.",
    recommendations: [
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
      }
    ],
    response_actions: [
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
    ],
    disclaimer: 'This executive incident brief was automatically compiled by AI-CyberGuard from verified telemetry evidence.'
  };

  const [report, setReport] = useState<IncidentReport | null>(defaultReport);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await api.getReport(incidentId);
        if (data) {
          setReport(data);
        } else if (incidentId === 'INC-1024' || !report) {
          setReport(defaultReport);
        }
      } catch (err) {
        console.error('Failed to load incident report', err);
        if (incidentId === 'INC-1024' || !report) {
          setReport(defaultReport);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [incidentId]);

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-report-${report.incident_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSTIX = () => {
    if (!report) return;
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${report.incident_id.toLowerCase()}-stix21`,
      spec_version: '2.1',
      objects: [
        {
          type: 'incident',
          spec_version: '2.1',
          id: `incident--${report.incident_id.toLowerCase()}`,
          name: report.title,
          description: report.executive_summary,
          created: report.generated_at,
          confidence: 95,
          severity: report.risk_assessment.severity
        },
        {
          type: 'indicator',
          spec_version: '2.1',
          id: 'indicator--c2-ip-198-51-100-44',
          name: 'Untrusted Ingress C2 IP',
          pattern: "[ipv4-addr:value = '198.51.100.44']",
          pattern_type: 'stix',
          valid_from: report.generated_at
        },
        {
          type: 'attack-pattern',
          spec_version: '2.1',
          id: 'attack-pattern--t1078',
          name: 'Valid Accounts Abuse',
          external_references: [{ source_name: 'mitre-attack', external_id: 'T1078' }]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(stixBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stix21-threat-intel-${report.incident_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-soc-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-soc-secondary font-mono">Assembling Structured Incident Brief...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="soc-panel p-8 text-center space-y-3 max-w-md mx-auto">
        <ShieldAlert className="w-8 h-8 text-soc-critical mx-auto" />
        <h3 className="text-sm font-semibold text-soc-text">Report for {incidentId} Not Available</h3>
        <p className="text-xs text-soc-secondary">Execute an attack scenario to correlate incident evidence first.</p>
        <Link to="/" className="inline-block text-xs text-soc-blue font-mono">Return to Overview</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Actions */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/incidents/${incidentId}`}
          className="flex items-center gap-1.5 text-xs text-soc-secondary hover:text-soc-text font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSTIX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-card hover:bg-soc-elevated text-soc-cyan border border-soc-border text-xs font-mono transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>STIX 2.1 JSON</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-card hover:bg-soc-elevated text-soc-text border border-soc-border text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white font-semibold text-xs transition-colors shadow-accent-subtle"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Brief</span>
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="soc-panel p-8 space-y-7 bg-soc-card text-soc-text border border-soc-border">
        {/* Document Header */}
        <div className="border-b border-soc-border pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-elevated text-soc-blue border border-soc-border">
                {report.report_id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-soc-panel text-soc-secondary border border-soc-border">
                SOC INCIDENT BRIEF
              </span>
            </div>
            <h1 className="text-lg font-bold text-soc-text tracking-tight">{report.title}</h1>
            <p className="text-[11px] font-mono text-soc-muted mt-0.5">Generated: {report.generated_at}</p>
          </div>

          <div className="text-right sm:self-center">
            <div className="text-2xl font-bold font-mono text-soc-critical">
              {report.risk_assessment.risk_score}/100
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-soc-critical/20 text-soc-critical border border-soc-critical/30">
              {report.risk_assessment.severity} SEVERITY
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-blue border-b border-soc-border pb-1">
            1. Executive Summary
          </h2>
          <p className="text-xs text-soc-text leading-relaxed bg-soc-panel p-3.5 rounded-md border border-soc-border">
            {report.executive_summary}
          </p>
        </section>

        {/* Section 2: Incident Metadata & Risk Drivers */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-blue border-b border-soc-border pb-1">
            2. Incident Metadata & Compound Risk Factors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-md bg-soc-panel border border-soc-border space-y-1.5 font-mono">
              <div className="flex justify-between"><span className="text-soc-muted">Incident Ticket:</span><span className="text-soc-text font-bold">{report.incident_id}</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">Status:</span><span className="text-soc-success font-bold uppercase">{report.status}</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">Correlated Telemetry:</span><span className="text-soc-cyan font-bold">{report.incident_metadata?.event_count || 7} Events</span></div>
              <div className="flex justify-between"><span className="text-soc-muted">Confidence Rating:</span><span className="text-soc-text">{report.risk_assessment.confidence_level}</span></div>
            </div>

            <div className="p-3.5 rounded-md bg-soc-panel border border-soc-border space-y-1 text-xs font-mono">
              <div className="text-soc-muted uppercase text-[10px] mb-1">Primary Risk Drivers:</div>
              <ul className="list-disc list-inside text-soc-secondary space-y-0.5">
                {report.risk_assessment.primary_factors.map((factor, idx) => (
                  <li key={idx}><span className="text-soc-text">{factor}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Affected Assets */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-blue border-b border-soc-border pb-1">
            3. Affected Asset Topology
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded bg-soc-panel border border-soc-border">
              <div className="text-soc-muted text-[10px]">User Account</div>
              <div className="font-bold text-soc-text truncate">{report.affected_assets.users?.join(', ') || 'alice.smith'}</div>
            </div>
            <div className="p-2.5 rounded bg-soc-panel border border-soc-border">
              <div className="text-soc-muted text-[10px]">Workstation</div>
              <div className="font-bold text-soc-text truncate">{report.affected_assets.devices?.join(', ') || 'DEV-CORP-017'}</div>
            </div>
            <div className="p-2.5 rounded bg-soc-panel border border-soc-border">
              <div className="text-soc-muted text-[10px]">Target Service</div>
              <div className="font-bold text-soc-text truncate">{report.affected_assets.servers?.join(', ') || 'auth-service'}</div>
            </div>
            <div className="p-2.5 rounded bg-soc-panel border border-soc-border">
              <div className="text-soc-muted text-[10px]">Database Endpoint</div>
              <div className="font-bold text-soc-text truncate">{report.affected_assets.databases?.join(', ') || 'DB-FINANCE-01'}</div>
            </div>
          </div>
        </section>

        {/* Section 4: Timeline */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-blue border-b border-soc-border pb-1">
            4. Chronological Telemetry Sequence
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            {report.attack_timeline.map((item, idx) => (
              <div key={idx} className="p-2 rounded bg-soc-panel border border-soc-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-soc-blue text-[11px]">{item.timestamp.slice(11, 19)}</span>
                  <span className="text-soc-secondary text-[10px] uppercase bg-soc-elevated px-1.5 py-0.2 rounded border border-soc-border">{item.event_type}</span>
                  <span className="text-soc-text truncate">{item.description}</span>
                </div>
                <span className="text-soc-critical text-[10px] shrink-0 font-bold">+{item.risk_contribution}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Defensive Response Actions */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-soc-blue border-b border-soc-border pb-1">
            5. Defensive Containment Actions (Simulated)
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            {report.response_actions.map((act) => (
              <div key={act.action_id} className="p-2 rounded bg-soc-panel border border-soc-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-soc-success" />
                  <span className="font-bold text-soc-text">{act.action_type}</span>
                  <span className="text-soc-secondary">on target: <strong className="text-soc-text">{act.target}</strong></span>
                </div>
                <span className="text-[10px] uppercase bg-soc-success/15 text-soc-success border border-soc-success/30 px-2 py-0.2 rounded">
                  SIMULATED
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Disclaimer */}
        <div className="pt-3 border-t border-soc-border text-[10px] text-soc-muted font-mono flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-soc-warning" />
          <span>{report.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
