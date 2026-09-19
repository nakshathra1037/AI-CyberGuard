import React, { useState } from 'react';
import {
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Play, 
  CheckCircle2,
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Radio, 
  UserX, 
  Network, 
  Bell,
  XCircle
} from 'lucide-react';
import { ResponseRecommendation, SimulatedAction } from '../types';
import { api } from '../services/api';

interface ResponseConsoleProps {
  incidentId: string;
  recommendations: ResponseRecommendation[];
  simulatedHistory: SimulatedAction[];
  onActionSimulated: () => void;
}

export const ResponseConsole: React.FC<ResponseConsoleProps> = ({
  incidentId,
  recommendations,
  simulatedHistory,
  onActionSimulated,
}) => {
  const [isSimulatingAll, setIsSimulatingAll] = useState(false);
  const [activeActionLoading, setActiveActionLoading] = useState<string | null>(null);

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'isolate_endpoint': return <Network className="w-3.5 h-3.5 text-soc-critical" />;
      case 'revoke_session': return <UserX className="w-3.5 h-3.5 text-soc-warning" />;
      case 'reset_credentials': return <Lock className="w-3.5 h-3.5 text-soc-blue" />;
      case 'block_ip': return <ShieldAlert className="w-3.5 h-3.5 text-soc-critical" />;
      case 'notify_security_team': return <Bell className="w-3.5 h-3.5 text-soc-cyan" />;
      default: return <Terminal className="w-3.5 h-3.5 text-soc-blue" />;
    }
  };

  const handleSimulateSingle = async (rec: ResponseRecommendation) => {
    setActiveActionLoading(rec.action_type);
    try {
      await api.simulateAction(incidentId, rec.action_type, rec.target);
      onActionSimulated();
    } catch (err) {
      console.error('Failed to simulate action', err);
    } finally {
      setActiveActionLoading(null);
    }
  };

  const handleSimulateAll = async () => {
    setIsSimulatingAll(true);
    try {
      await api.simulateAllActions(incidentId, 'automatic');
      onActionSimulated();
    } catch (err) {
      console.error('Failed to simulate all actions', err);
    } finally {
      setIsSimulatingAll(false);
    }
  };

  return (
    <div className="soc-panel p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-soc-border pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-soc-success" />
            <h3 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide">
              Defensive Containment & Human Approval Gate
            </h3>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-soc-card text-soc-secondary border border-soc-border">
              SIMULATION ONLY
            </span>
          </div>
          <p className="text-xs text-soc-secondary mt-0.5">
            Safe dry-run containment actions. Live firewall and directory mutations remain disabled by policy.
          </p>
        </div>

        <button
          onClick={handleSimulateAll}
          disabled={isSimulatingAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-blue hover:bg-soc-blue/90 text-white font-semibold text-xs transition-colors shadow-accent-subtle disabled:opacity-50"
        >
          {isSimulatingAll ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Authorizing Containment...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-white" />
              <span>Approve & Simulate All</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendations Cards */}
      <div>
        <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-soc-muted mb-2.5">
          AI Suggested Defensive Actions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {recommendations.map((rec, idx) => {
            const isExecuted = simulatedHistory.some((h) => h.action_type === rec.action_type);
            const isLoading = activeActionLoading === rec.action_type;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-md bg-soc-card border border-soc-border flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded bg-soc-elevated border border-soc-border">
                        {getActionIcon(rec.action_type)}
                      </div>
                      <span className="text-xs font-semibold text-soc-text uppercase font-mono">
                        {rec.action_type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-soc-panel text-soc-cyan border border-soc-border">
                      {rec.target}
                    </span>
                  </div>

                  <p className="text-xs text-soc-text font-medium">{rec.description}</p>
                  <p className="text-[11px] text-soc-secondary mt-0.5">{rec.rationale}</p>
                </div>

                <div className="pt-2.5 border-t border-soc-border flex items-center justify-between">
                  <span className="text-[10px] font-mono text-soc-muted">
                    Priority: <strong className="text-soc-warning uppercase">{rec.priority}</strong>
                  </span>

                  {isExecuted ? (
                    <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-soc-success bg-soc-success/10 px-2 py-0.5 rounded border border-soc-success/30">
                      <CheckCircle2 className="w-3 h-3" />
                      SIMULATED
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSimulateSingle(rec)}
                        disabled={isLoading}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-soc-blue hover:bg-soc-blue/90 text-white font-medium text-xs transition-colors"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                        <span>Approve Simulation</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulation Audit Ledger */}
      <div>
        <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-soc-muted mb-2 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-soc-blue" />
          <span>Simulated Containment Audit Ledger ({simulatedHistory.length})</span>
        </h4>
        <div className="bg-soc-bg rounded-md p-3 border border-soc-border max-h-40 overflow-y-auto font-mono text-[11px] space-y-1.5">
          {simulatedHistory.length === 0 ? (
            <p className="text-soc-muted italic">No containment actions authorized or simulated yet.</p>
          ) : (
            simulatedHistory.map((act) => (
              <div key={act.action_id} className="p-2 rounded bg-soc-card border border-soc-border flex items-center justify-between">
                <div>
                  <span className="text-soc-blue font-semibold mr-2">{act.action_id}</span>
                  <span className="text-soc-text truncate">
                    [SIMULATION_SUCCESS] {act.command_simulated || `${act.action_type} on ${act.target}`}
                  </span>
                </div>
                <span className="text-soc-muted text-[10px] shrink-0 ml-2">
                  {act.timestamp.slice(11, 19)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
