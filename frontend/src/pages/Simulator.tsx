import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  Cpu, 
  Terminal,
  ArrowRight,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

interface ScenarioMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  expected_severity: string;
  expected_risk_range: string;
  key_events: string[];
}

export const Simulator: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('scenario_a_account_takeover');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<any[]>([]);
  const [lastIncidentId, setLastIncidentId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to execute scenario.');
  const navigate = useNavigate();

  useEffect(() => {
    api.getScenarios().then(data => {
      setScenarios(data.scenarios || []);
    }).catch(() => {
      // Fallback scenarios if offline
      setScenarios([
        {
          id: 'scenario_a_account_takeover',
          name: 'Scenario A: Account Takeover',
          category: 'Credential Compromise',
          description: 'Multi-stage attack: Brute force login failures -> Success -> Unseen external IP -> New device -> Sensitive API access.',
          expected_severity: 'HIGH',
          expected_risk_range: '75-90',
          key_events: ['AUTH_FAILURE x4', 'AUTH_SUCCESS', 'UNUSUAL_IP', 'DEVICE_CHANGE', 'SENSITIVE_RESOURCE_ACCESS']
        },
        {
          id: 'scenario_b_false_positive',
          name: 'Scenario B: False Positive (Benign Traveler)',
          category: 'Baseline Validation',
          description: 'Legitimate employee login from coffee shop IP with known device and normal user behavior.',
          expected_severity: 'LOW',
          expected_risk_range: '10-25',
          key_events: ['AUTH_SUCCESS', 'UNUSUAL_IP (Benign)', 'API_ACCESS']
        },
        {
          id: 'scenario_c_privilege_escalation',
          name: 'Scenario C: Privilege Escalation',
          category: 'Access Abuse',
          description: 'Standard operator account modified to administrative permissions followed by sensitive configuration changes.',
          expected_severity: 'HIGH',
          expected_risk_range: '70-85',
          key_events: ['AUTH_SUCCESS', 'PRIVILEGE_CHANGE', 'ADMIN_ACTION', 'DATABASE_ACCESS']
        },
        {
          id: 'scenario_d_api_abuse',
          name: 'Scenario D: Automated API Scraping & Abuse',
          category: 'API Abuse',
          description: 'Rapid spike in unauthenticated API requests targeting customer data export endpoints.',
          expected_severity: 'HIGH',
          expected_risk_range: '75-90',
          key_events: ['RATE_ANOMALY', 'API_ACCESS x8', 'SENSITIVE_RESOURCE_ACCESS']
        },
        {
          id: 'scenario_e_data_exfiltration',
          name: 'Scenario E: Data Exfiltration Indicator',
          category: 'Data Security',
          description: 'Off-hours database access and anomalous volumetric data download from internal customer records.',
          expected_severity: 'HIGH',
          expected_risk_range: '80-95',
          key_events: ['DATABASE_ACCESS', 'DATA_ACCESS', 'RATE_ANOMALY']
        },
        {
          id: 'scenario_f_normal_user',
          name: 'Scenario F: Normal Daily Employee Routine',
          category: 'Baseline Activity',
          description: 'Routine workday activities within typical hours, standard corporate device, and normal internal resources.',
          expected_severity: 'LOW',
          expected_risk_range: '0-15',
          key_events: ['AUTH_SUCCESS', 'API_ACCESS', 'FILE_ACCESS']
        }
      ]);
    });
  }, []);

  const handleRunSimulation = async (scenarioId: string) => {
    setIsRunning(true);
    setSimulationLogs([]);
    setLastIncidentId(null);
    setStatusMessage(`Injecting telemetry for ${scenarioId}...`);

    try {
      const response = await api.runScenario(scenarioId);
      setSimulationLogs(response.injected_events || []);
      setLastIncidentId(response.incident_id || 'INC-1024');
      setStatusMessage(`Simulation complete. Ingested ${response.events_count || 0} events. Correlated into incident ${response.incident_id}.`);
    } catch (err: any) {
      setStatusMessage(`Simulation error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const currentScenarioMeta = scenarios.find(s => s.id === selectedScenario) || scenarios[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-soc-border">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-soc-blue" />
            <h1 className="text-lg font-semibold text-soc-text tracking-tight">Attack Simulation Lab</h1>
          </div>
          <p className="text-xs text-soc-secondary mt-1">
            Execute controlled cybersecurity scenarios to test detection rules, ML baseline anomaly scoring, AI investigation reasoning, and response simulation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-soc-card border border-soc-border text-xs font-mono text-soc-secondary">
            MODE: SAFE SIMULATION
          </span>
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-soc-panel border-soc-blue shadow-accent-subtle'
                  : 'bg-soc-card border-soc-border hover:border-soc-borderMuted'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-soc-elevated border border-soc-border text-soc-cyan">
                    {sc.category}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    sc.expected_severity === 'HIGH' || sc.expected_severity === 'CRITICAL'
                      ? 'bg-soc-critical/15 text-soc-critical border border-soc-critical/30'
                      : 'bg-soc-success/15 text-soc-success border border-soc-success/30'
                  }`}>
                    {sc.expected_severity} RISK
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-soc-text mb-1.5">{sc.name}</h3>
                <p className="text-xs text-soc-secondary line-clamp-2 mb-3 leading-relaxed">
                  {sc.description}
                </p>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-soc-muted uppercase">Key Telemetry Steps:</div>
                  <div className="flex flex-wrap gap-1">
                    {sc.key_events?.map((ev, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-soc-elevated border border-soc-border text-soc-text">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-soc-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-soc-muted">
                  Score: ~{sc.expected_risk_range}/100
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScenario(sc.id);
                    handleRunSimulation(sc.id);
                  }}
                  disabled={isRunning}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-soc-blue hover:bg-soc-blue/90 text-white'
                      : 'bg-soc-elevated hover:bg-soc-border text-soc-text'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution Console & Live Feed */}
      <div className="soc-panel p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-soc-border">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-soc-blue" />
            <h2 className="font-semibold text-sm text-soc-text">Telemetry Stream & Correlation Output</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-soc-secondary">
              Status: <span className="text-soc-text">{statusMessage}</span>
            </span>

            {lastIncidentId && (
              <button
                onClick={() => navigate(`/incidents/${lastIncidentId}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white text-xs font-semibold shadow-accent-subtle transition-colors"
              >
                <span>View Incident ({lastIncidentId})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Event Stream View */}
        <div className="bg-soc-bg border border-soc-border rounded-md p-3.5 min-h-48 max-h-80 overflow-y-auto space-y-2 font-mono text-xs">
          {simulationLogs.length === 0 ? (
            <div className="text-soc-muted text-center py-12">
              Select a scenario above and click "Execute" to inject real-time security events.
            </div>
          ) : (
            simulationLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-3 py-1 border-b border-soc-border/50 last:border-0">
                <span className="text-soc-muted shrink-0 text-[11px]">
                  {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold shrink-0 ${
                  log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'bg-soc-critical/20 text-soc-critical' :
                  log.severity === 'MEDIUM' ? 'bg-soc-warning/20 text-soc-warning' : 'bg-soc-blue/20 text-soc-blue'
                }`}>
                  {log.event_type || 'EVENT'}
                </span>
                <span className="text-soc-text truncate flex-1">
                  Actor: <span className="text-soc-cyan">{log.user_id}</span> · IP: <span className="text-soc-secondary">{log.source_ip}</span> · Resource: <span className="text-soc-muted">{log.resource}</span>
                </span>
                <span className="text-soc-success text-[11px] shrink-0">✓ INGESTED</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
