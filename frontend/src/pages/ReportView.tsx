import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText, Download, Printer, ArrowLeft, ShieldAlert,
  CheckCircle2, Clock, Database, Terminal, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { IncidentReport } from '../types';

export const ReportView: React.FC = () => {
  const { incidentId = 'INC-1024' } = useParams<{ incidentId: string }>();
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await api.getReport(incidentId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load incident report', err);
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

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Assembling Structured Incident Report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-3 max-w-md mx-auto">
        <ShieldAlert className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Report for {incidentId} Not Generated</h3>
        <p className="text-xs text-slate-400">Please run the demo to generate incident evidence first.</p>
        <Link to="/" className="inline-block text-xs text-cyan-400">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          to={`/incidents/${incidentId}`}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-semibold hover:bg-cyan-400"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="glass-panel p-8 rounded-2xl border border-cyber-800 space-y-8 bg-cyber-950/90 text-slate-100">
        {/* Document Header */}
        <div className="border-b border-cyber-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {report.report_id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Simulation Mode
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">{report.title}</h1>
            <p className="text-xs text-slate-400 mt-1">Generated: {report.generated_at}</p>
          </div>

          <div className="text-right sm:self-center">
            <div className="text-2xl font-black font-mono text-rose-400">
              {report.risk_assessment.risk_score}/100
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {report.risk_assessment.severity} Severity
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            1. Executive Summary
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed bg-cyber-900/60 p-4 rounded-xl border border-cyber-800">
            {report.executive_summary}
          </p>
        </section>

        {/* Section 2: Incident Metadata & Risk Assessment */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            2. Incident Metadata & Risk Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-cyber-900/40 border border-cyber-800 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Incident ID:</span>
                <span className="text-white font-bold">{report.incident_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{report.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Telemetry Events:</span>
                <span className="text-cyan-300 font-bold">{report.incident_metadata?.event_count || 7}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Rating:</span>
                <span className="text-white">{report.risk_assessment.confidence_level}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-cyber-900/40 border border-cyber-800 space-y-1 text-xs">
              <div className="font-semibold text-white mb-1">Primary Risk Drivers:</div>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {report.risk_assessment.primary_factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Affected Assets */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            3. Identified Affected Assets
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800 font-mono">
              <div className="text-slate-400 text-[10px]">Compromised Users</div>
              <div className="font-bold text-white">{report.affected_assets.users?.join(', ') || 'alex'}</div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800 font-mono">
              <div className="text-slate-400 text-[10px]">Workstations</div>
              <div className="font-bold text-white">{report.affected_assets.devices?.join(', ') || 'PC-017'}</div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800 font-mono">
              <div className="text-slate-400 text-[10px]">Target Servers</div>
              <div className="font-bold text-white">{report.affected_assets.servers?.join(', ') || 'FILESERVER-02'}</div>
            </div>
            <div className="p-3 rounded-lg bg-cyber-900 border border-cyber-800 font-mono">
              <div className="text-slate-400 text-[10px]">Databases</div>
              <div className="font-bold text-white">{report.affected_assets.databases?.join(', ') || 'DB-01'}</div>
            </div>
          </div>
        </section>

        {/* Section 4: Reconstructed Attack Progression */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            4. Reconstructed Attack Sequence (Story)
          </h2>
          <div className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 text-xs text-slate-300 leading-relaxed font-mono">
            {report.attack_story?.summary_text ||
              "alex -> PC-017 -> PowerShell -> Credential Access -> Lateral Movement -> FILESERVER-02 -> DB-01"}
          </div>
        </section>

        {/* Section 5: Chronological Timeline */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            5. Incident Timeline & Telemetry Evidence
          </h2>
          <div className="space-y-2">
            {report.attack_timeline.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-cyber-900/40 border border-cyber-800 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 text-[11px]">{item.timestamp.slice(11, 19)}</span>
                  <span className="font-mono text-slate-400 text-[10px] uppercase bg-cyber-800 px-1.5 py-0.5 rounded">{item.event_type}</span>
                  <span className="text-slate-200">{item.description}</span>
                </div>
                <span className="font-mono text-rose-400 text-[10px] shrink-0">+{item.risk_contribution}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Defensive Response Actions */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-cyber-800/80 pb-1">
            6. Defensive Containment Actions (Simulated)
          </h2>
          <div className="space-y-2">
            {report.response_actions.map((act) => (
              <div key={act.action_id} className="p-2.5 rounded-lg bg-cyber-900/50 border border-cyber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono font-bold text-white">{act.action_type}</span>
                  <span className="text-slate-400">on target: <strong>{act.target}</strong></span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Simulated
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Disclaimer */}
        <div className="pt-4 border-t border-cyber-800 text-[11px] text-amber-400 font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{report.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
