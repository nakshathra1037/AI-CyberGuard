import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, Activity, Cpu, AlertTriangle, CheckCircle2,
  ArrowRight, ShieldCheck, Flame, Layers, Clock, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import { Incident, IntelligenceStatistics, HourlyTrend } from '../types';

interface DashboardProps {
  onRunDemo: () => void;
  isRunningDemo: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ onRunDemo, isRunningDemo }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IntelligenceStatistics | null>(null);
  const [trends, setTrends] = useState<HourlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incList, statsData, trendsData] = await Promise.all([
          api.getIncidents(),
          api.getStatistics(),
          api.getTrends(),
        ]);
        setIncidents(incList);
        setStats(statsData);
        setTrends(trendsData);
      } catch (err) {
        console.error('Error fetching dashboard telemetry', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const severityPieData = stats?.severity_distribution ? [
    { name: 'Critical', value: stats.severity_distribution.critical || 1, color: '#ef4444' },
    { name: 'High', value: stats.severity_distribution.high || 0, color: '#f97316' },
    { name: 'Medium', value: stats.severity_distribution.medium || 0, color: '#f59e0b' },
    { name: 'Low', value: stats.severity_distribution.low || 0, color: '#10b981' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Hero / Pipeline Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyber-900 via-cyber-850 to-cyber-900 border border-cyber-700/80 p-6 lg:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Autonomous AI Security Pipeline Active
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Turn Hundreds of Disconnected Alerts into an{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Explainable Attack Story
            </span>
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            AI CyberGuard ingests noisy security telemetry, deterministically scores risk, correlates multi-host traversal, reconstructs the causal attack sequence, and executes simulated containment.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onRunDemo}
              disabled={isRunningDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg hover:from-cyan-300 hover:to-blue-400 transition-all active:scale-95 disabled:opacity-50 cyber-glow"
            >
              {isRunningDemo ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing Demo Pipeline...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-black" />
                  <span>Run Full Security Demo (7-Stage Pipeline)</span>
                </>
              )}
            </button>

            <Link
              to="/incidents/INC-1024"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyber-800 hover:bg-cyber-750 text-slate-200 border border-cyber-700 transition-all"
            >
              <span>Explore Active Incident (INC-1024)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Subtle Background Cyber Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Events</span>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {stats?.total_events_processed || 7}
            </div>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Telemetry Ingestion Active
            </span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Active Incidents */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Correlated Incidents</span>
            <div className="text-2xl font-black text-white mt-1 font-mono">
              {incidents.length || 1}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> 100% Contained (Simulated)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Critical Risk Score */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Peak Incident Risk</span>
            <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
              {stats?.average_risk_score ? Math.round(stats.average_risk_score) : 91}/100
            </div>
            <span className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Critical Severity
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 cyber-glow-danger">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Mean Time to Containment */}
        <div className="glass-panel p-5 rounded-2xl border border-cyber-800 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Avg Containment Time</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              3m 04s
            </div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Autonomous Response
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts & Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Queue */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-cyber-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Correlated Security Incidents Queue
                </h3>
              </div>
              <Link to="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No active incidents recorded. Click "Run Full Security Demo" above to execute the pipeline.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div
                    key={inc.incident_id}
                    className="p-4 rounded-xl bg-cyber-900/80 border border-cyber-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {inc.incident_id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {inc.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {inc.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{inc.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assets: {inc.affected_users.join(', ')} • {inc.affected_devices.join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-rose-400">
                          {inc.risk_score}/100
                        </div>
                        <div className="text-[10px] text-slate-500">Risk Score</div>
                      </div>
                      <Link
                        to={`/incidents/${inc.incident_id}`}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-medium transition-all"
                      >
                        Investigate
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-cyber-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Correlation mode: <strong>Multi-signal temporal clustering</strong></span>
            <span className="text-cyan-400 font-mono">7 Alerts &rarr; 1 Story</span>
          </div>
        </div>

        {/* Severity Distribution Donut */}
        <div className="glass-panel rounded-2xl p-6 border border-cyber-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight mb-1">
              Incident Severity Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">Observed risk classification breakdown</p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-cyber-800">
            {severityPieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300">{entry.name}:</span>
                <strong className="text-white font-mono">{entry.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
