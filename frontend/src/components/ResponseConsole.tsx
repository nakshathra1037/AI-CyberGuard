import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Terminal, Play, CheckCircle2,
  AlertTriangle, Lock, RefreshCw, Radio, UserX, Network, Bell
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
      case 'isolate_endpoint': return <Network className="w-4 h-4 text-rose-400" />;
      case 'revoke_session': return <UserX className="w-4 h-4 text-amber-400" />;
      case 'reset_credentials': return <Lock className="w-4 h-4 text-blue-400" />;
      case 'block_ip': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'notify_security_team': return <Bell className="w-4 h-4 text-purple-400" />;
      default: return <Terminal className="w-4 h-4 text-cyan-400" />;
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
    <div className="glass-panel rounded-2xl p-6 border border-cyber-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Simulated Defensive Containment Console
            </h3>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Simulation Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Safe dry-run execution environment. No real firewall or host configurations are altered.
          </p>
        </div>

        <button
          onClick={handleSimulateAll}
          disabled={isSimulatingAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-semibold text-xs shadow hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSimulatingAll ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating Containment...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Execute All Containment (Simulated)</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendations Grid */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
          Contextual Response Recommendations
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec, idx) => {
            const isExecuted = simulatedHistory.some((h) => h.action_type === rec.action_type);
            const isLoading = activeActionLoading === rec.action_type;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-cyber-900/90 border border-cyber-800 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-cyber-800 border border-cyber-700">
                        {getActionIcon(rec.action_type)}
                      </div>
                      <span className="text-xs font-bold text-white uppercase tracking-tight">
                        {rec.action_type.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-950 text-cyan-400 border border-cyber-800">
                      Target: {rec.target}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{rec.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{rec.rationale}</p>
                </div>

                <div className="pt-3 border-t border-cyber-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">
                    Priority: <strong className="text-amber-400 uppercase">{rec.priority}</strong>
                  </span>

                  {isExecuted ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Simulated
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSimulateSingle(rec)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 fill-cyan-300" />
                      )}
                      <span>Simulate Action</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulated Execution Audit Log */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Simulation Audit & Dry-Run Logs ({simulatedHistory.length})</span>
        </h4>
        <div className="bg-cyber-950 rounded-xl p-3 border border-cyber-800 max-h-48 overflow-y-auto font-mono text-[11px] space-y-2">
          {simulatedHistory.length === 0 ? (
            <p className="text-slate-500 italic">No simulated containment actions executed yet.</p>
          ) : (
            simulatedHistory.map((act) => (
              <div key={act.action_id} className="p-2 rounded bg-cyber-900/90 border border-cyber-800/80">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-cyan-400 font-bold">{act.action_id}</span>
                  <span className="text-slate-500">{act.timestamp.slice(11, 19)}</span>
                </div>
                <div className="text-emerald-400 text-xs truncate">
                  [SIMULATION SUCCESS] {act.command_simulated || `${act.action_type} on ${act.target}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
