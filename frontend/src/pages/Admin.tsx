import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  ShieldCheck, 
  Cpu, 
  Network, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Key,
  Database,
  Lock
} from 'lucide-react';
import { api } from '../services/api';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'rules' | 'ai' | 'cti' | 'audit'>('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Generate/fetch realistic SOC audit logs
    setAuditLogs([
      {
        audit_id: 'aud-2026-9901',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        actor: 'marcus.vance (ADMIN)',
        action: 'RESPONSE_APPROVAL',
        resource: 'REVOKE_SESSION (sess-compromised-99)',
        result: 'SUCCESS',
        request_id: 'req-8842-ad01'
      },
      {
        audit_id: 'aud-2026-9902',
        timestamp: new Date(Date.now() - 360000).toISOString(),
        actor: 'ai-investigator-service',
        action: 'AI_INVESTIGATION_GENERATED',
        resource: 'INC-1024',
        result: 'SUCCESS',
        request_id: 'req-7719-ai90'
      },
      {
        audit_id: 'aud-2026-9903',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        actor: 'system-ingestor',
        action: 'BATCH_TELEMETRY_INGEST',
        resource: '7 security events',
        result: 'SUCCESS',
        request_id: 'req-6621-ev04'
      },
      {
        audit_id: 'aud-2026-9904',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        actor: 'marcus.vance (ADMIN)',
        action: 'USER_LOGIN',
        resource: 'auth-service',
        result: 'SUCCESS',
        request_id: 'req-5510-lg01'
      },
      {
        audit_id: 'aud-2026-9905',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actor: 'anonymous-client',
        action: 'AUTH_FAILURE_LOCKOUT',
        resource: 'alice.smith',
        result: 'LOCKED',
        request_id: 'req-4402-lk99'
      }
    ]);
  }, []);

  const tabs = [
    { id: 'users', label: 'Users & RBAC', icon: Users },
    { id: 'rules', label: 'Detection Rules', icon: ShieldCheck },
    { id: 'ai', label: 'AI & Safety Guardrails', icon: Cpu },
    { id: 'cti', label: 'Threat Intel & CTI', icon: Network },
    { id: 'audit', label: 'Audit Ledger', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-soc-blue" />
            <h1 className="text-lg font-semibold text-soc-text tracking-tight">SOC Administration & Governance</h1>
          </div>
          <p className="text-xs text-soc-secondary mt-1">
            Manage system access, detection engine parameters, behavioral baselines, AI guardrail policies, and inspect the tamper-evident audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-soc-panel border border-soc-border text-xs font-mono text-soc-cyan">
            ENVIRONMENT: SOC PRODUCTION
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-soc-border">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-soc-blue text-soc-blue font-semibold bg-soc-panel/50'
                  : 'border-transparent text-soc-secondary hover:text-soc-text hover:bg-soc-card'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div className="soc-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <div>
              <h2 className="text-sm font-semibold text-soc-text">Configured SOC Operators & Roles</h2>
              <p className="text-xs text-soc-secondary">Role-based access controls enforced at the API gateway.</p>
            </div>
            <span className="text-xs font-mono text-soc-muted">4 Active Profiles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soc-card text-soc-muted border-b border-soc-border font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Permissions Matrix</th>
                  <th className="py-2.5 px-3">Auth Method</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border text-soc-secondary">
                <tr className="hover:bg-soc-elevated/40">
                  <td className="py-2.5 px-3 font-medium text-soc-text">marcus.vance (admin)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-blue/20 text-soc-blue">ADMIN</span></td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">all:read, all:write, containment:approve</td>
                  <td className="py-2.5 px-3 font-mono">PBKDF2-SHA256 (100k)</td>
                  <td className="py-2.5 px-3 text-soc-success font-semibold">Active</td>
                </tr>
                <tr className="hover:bg-soc-elevated/40">
                  <td className="py-2.5 px-3 font-medium text-soc-text">elena.rostova (commander)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-cyan/20 text-soc-cyan">INCIDENT_COMMANDER</span></td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">incidents:all, containment:approve, reports:all</td>
                  <td className="py-2.5 px-3 font-mono">PBKDF2-SHA256 (100k)</td>
                  <td className="py-2.5 px-3 text-soc-success font-semibold">Active</td>
                </tr>
                <tr className="hover:bg-soc-elevated/40">
                  <td className="py-2.5 px-3 font-medium text-soc-text">analyst_david (analyst)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-warning/20 text-soc-warning">SOC_ANALYST</span></td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">events:read, incidents:investigate, response:recommend</td>
                  <td className="py-2.5 px-3 font-mono">PBKDF2-SHA256 (100k)</td>
                  <td className="py-2.5 px-3 text-soc-success font-semibold">Active</td>
                </tr>
                <tr className="hover:bg-soc-elevated/40">
                  <td className="py-2.5 px-3 font-medium text-soc-text">auditor_sarah (viewer)</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-muted/30 text-soc-muted">VIEWER</span></td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">events:read, reports:read, incidents:read</td>
                  <td className="py-2.5 px-3 font-mono">PBKDF2-SHA256 (100k)</td>
                  <td className="py-2.5 px-3 text-soc-success font-semibold">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="soc-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <div>
              <h2 className="text-sm font-semibold text-soc-text">Deterministic Detection Engine Rules</h2>
              <p className="text-xs text-soc-secondary">MITRE ATT&CK mapped threat rules and behavioral baseline scoring thresholds.</p>
            </div>
            <span className="text-xs font-mono text-soc-muted">5 Enabled Rules</span>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'RULE-CRED-01', name: 'Rapid Authentication Failure Cluster', mitre: 'T1110 (Brute Force)', weight: '+25 Risk', state: 'ENABLED' },
              { id: 'RULE-IP-02', name: 'Unseen External IP with Privileged Session', mitre: 'T1078 (Valid Accounts)', weight: '+20 Risk', state: 'ENABLED' },
              { id: 'RULE-DEV-03', name: 'Unrecognized Device Hardware Fingerprint', mitre: 'T1078.004', weight: '+20 Risk', state: 'ENABLED' },
              { id: 'RULE-API-04', name: 'Sensitive Financial/Admin Endpoint Access', mitre: 'T1020 (Exfiltration)', weight: '+25 Risk', state: 'ENABLED' },
              { id: 'RULE-CMD-05', name: 'Suspicious PowerShell / System Shell Execution', mitre: 'T1059.001', weight: '+35 Risk', state: 'ENABLED' },
            ].map(r => (
              <div key={r.id} className="p-3 bg-soc-card border border-soc-border rounded-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-soc-blue">{r.id}</span>
                    <span className="text-xs font-medium text-soc-text">{r.name}</span>
                  </div>
                  <div className="text-[11px] font-mono text-soc-muted mt-0.5">
                    MITRE: {r.mitre} · Impact: {r.weight}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-success/20 text-soc-success">
                  {r.state}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="soc-panel p-5 space-y-4">
          <div className="pb-3 border-b border-soc-border">
            <h2 className="text-sm font-semibold text-soc-text">AI Investigation Engine & Safety Policy</h2>
            <p className="text-xs text-soc-secondary">Non-destructive autonomous investigation settings and prompt injection barriers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-soc-card border border-soc-border rounded-md space-y-2">
              <div className="text-xs font-semibold text-soc-text flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-soc-blue" />
                <span>Prompt Injection Boundary Filter</span>
              </div>
              <p className="text-xs text-soc-secondary leading-relaxed">
                Untrusted log telemetry is bounded within read-only data encapsulation tags. Injection patterns such as instruction overrides are filtered automatically before model submission.
              </p>
              <div className="text-[11px] font-mono text-soc-success font-semibold">STATUS: ENFORCED</div>
            </div>

            <div className="p-4 bg-soc-card border border-soc-border rounded-md space-y-2">
              <div className="text-xs font-semibold text-soc-text flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-soc-cyan" />
                <span>Safe Simulation Mode</span>
              </div>
              <p className="text-xs text-soc-secondary leading-relaxed">
                <code className="text-soc-cyan font-mono">ENABLE_LIVE_ACTIONS = false</code>. Real destructive changes (firewall blocks, user lockouts) are purely simulated unless explicitly authorized.
              </p>
              <div className="text-[11px] font-mono text-soc-success font-semibold">STATUS: SIMULATION ACTIVE</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cti' && (
        <div className="soc-panel p-5 space-y-4">
          <div className="pb-3 border-b border-soc-border">
            <h2 className="text-sm font-semibold text-soc-text">Cyber Threat Intelligence (CTI) Providers</h2>
            <p className="text-xs text-soc-secondary">External indicator reputation feeds and in-memory TTL caching layer.</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-soc-card border border-soc-border rounded-md flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-soc-text">AbuseIPDB Threat Feed</div>
                <div className="text-[11px] font-mono text-soc-muted">Confidence scoring, abuse reporting, and IP reputation history.</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-elevated border border-soc-border text-soc-secondary">
                CACHED / OPERATIONAL
              </span>
            </div>

            <div className="p-3.5 bg-soc-card border border-soc-border rounded-md flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-soc-text">VirusTotal Intelligence API</div>
                <div className="text-[11px] font-mono text-soc-muted">File hash and malicious domain URL multi-engine scanning.</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-soc-elevated border border-soc-border text-soc-secondary">
                FALLBACK READY
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="soc-panel p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-soc-border">
            <div>
              <h2 className="text-sm font-semibold text-soc-text">Tamper-Evident SOC Audit Ledger</h2>
              <p className="text-xs text-soc-secondary">Complete chronological record of all administrative logins, AI investigations, and containment approvals.</p>
            </div>
            <span className="text-xs font-mono text-soc-muted">Immutable Log</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soc-card text-soc-muted border-b border-soc-border font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Audit ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target Resource</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soc-border text-soc-secondary">
                {auditLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-soc-elevated/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-muted">{log.audit_id}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-soc-text">{log.actor}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-blue font-semibold">{log.action}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-text">{log.resource}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.result === 'SUCCESS' ? 'bg-soc-success/20 text-soc-success' : 'bg-soc-warning/20 text-soc-warning'
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-soc-muted">{log.request_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
