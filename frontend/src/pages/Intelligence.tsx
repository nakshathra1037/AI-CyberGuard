import React, { useState, useEffect } from 'react';
import {
  BarChart3, RefreshCw, AlertTriangle, Layers, TrendingUp,
  Cpu, ShieldAlert, CheckCircle2, Globe, Clock
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { api } from '../services/api';
import { PatternItem, HourlyTrend, IntelligenceStatistics } from '../types';

export const Intelligence: React.FC = () => {
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [trends, setTrends] = useState<HourlyTrend[]>([]);
  const [stats, setStats] = useState<IntelligenceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIntelligence = async () => {
    setIsLoading(true);
    try {
      const [pats, trnds, stts] = await Promise.all([
        api.getPatterns(),
        api.getTrends(),
        api.getStatistics(),
      ]);
      setPatterns(pats);
      setTrends(trnds);
      setStats(stts);
    } catch (err) {
      console.error('Failed to load intelligence metrics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Security Intelligence & Recurring Threat Patterns</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Observed historical telemetry analysis, recurring behavioral chains, and SOC operational metrics
          </p>
        </div>

        <button
          onClick={fetchIntelligence}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Intelligence</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyber-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Total Telemetry Processed</span>
          <div className="text-xl font-mono font-bold text-white mt-1">
            {stats?.total_events_processed || 7} Events
          </div>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">Zero Unhandled Alerts</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Mean Time to Contain</span>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
            {stats?.average_containment_time_seconds ? `${Math.round(stats.average_containment_time_seconds)}s` : '184s'}
          </div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Automated Simulation Mode</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">False Positive Rate</span>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
            {stats?.false_positive_rate || 0.0}%
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Context-Weighted Accuracy</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyber-800">
          <span className="text-[11px] uppercase font-bold text-slate-400">Average Risk Score</span>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1">
            {stats?.average_risk_score || 91}/100
          </div>
          <span className="text-[10px] text-rose-400 font-bold mt-0.5 block">High Compound Threat</span>
        </div>
      </div>

      {/* Hourly Trends Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Hourly Ingestion & Incident Correlation Trends
            </h3>
            <p className="text-xs text-slate-400">Observed events volume versus correlated incidents generated</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="event_count" name="Security Events" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="incident_count" name="Correlated Incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 23: Recurring Pattern Detection */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-800 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Recurring Suspicious Pattern Signatures
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-stage combinations detected across disparate hosts and user sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {patterns.map((pat) => (
            <div
              key={pat.pattern_id}
              className="p-4 rounded-xl bg-cyber-900/90 border border-cyber-800 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{pat.pattern_id}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {pat.severity}
                  </span>
                </div>

                <div className="font-mono text-xs font-bold text-white bg-cyber-950 p-2 rounded-lg border border-cyber-800 mb-2">
                  {pat.pattern_signature}
                </div>

                <p className="text-xs text-slate-300">{pat.description}</p>
              </div>

              <div className="pt-3 border-t border-cyber-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Occurrences: <strong className="text-cyan-300">{pat.occurrences}x</strong></span>
                <span>MITRE: {pat.mitre_techniques?.join(', ') || 'T1078'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
