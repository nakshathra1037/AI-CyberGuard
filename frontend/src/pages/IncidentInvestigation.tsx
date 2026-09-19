import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldAlert, Cpu, Bot, Clock, Database, Terminal,
  CheckCircle2, AlertTriangle, FileText, ArrowLeft, RefreshCw,
  Sparkles, ExternalLink, ShieldCheck, UserX, Network
} from 'lucide-react';
import { api } from '../services/api';
import { Incident, ResponseRecommendation, SimulatedAction } from '../types';
import { AttackStoryGraph } from '../components/AttackStoryGraph';
import { Timeline } from '../components/Timeline';
import { EvidenceTable } from '../components/EvidenceTable';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { ResponseConsole } from '../components/ResponseConsole';
import { FeedbackModal } from '../components/FeedbackModal';

export const IncidentInvestigation: React.FC = () => {
  const { incidentId = 'INC-1024' } = useParams<{ incidentId: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>([]);
  const [responseHistory, setResponseHistory] = useState<SimulatedAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'timeline' | 'evidence' | 'response' | 'chat'>('overview');

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
      }
      setRecommendations(recsData);
      setResponseHistory(historyData);
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
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Reconstructing Attack Story & Loading Evidence...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Incident {incidentId} Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested incident does not exist in local telemetry. Please run the full security demo to populate the environment.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/incidents" className="hover:text-cyan-300 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Incidents
          </Link>
          <span>/</span>
          <span className="font-mono text-slate-200 font-bold">{incident.incident_id}</span>
          <span>/</span>
          <span className="text-cyan-400 font-medium">Investigation Workspace</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports/${incident.incident_id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyber-900 hover:bg-cyber-800 text-slate-300 border border-cyber-700 text-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Generate Executive Report</span>
          </Link>

          <button
            onClick={fetchIncidentData}
            className="p-1.5 rounded-lg bg-cyber-900 text-slate-400 hover:text-white border border-cyber-700"
            title="Refresh incident"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Incident Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyber-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-sm font-black text-cyan-400 bg-cyber-900 px-2.5 py-1 rounded-lg border border-cyber-700">
              {incident.incident_id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {incident.severity}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {incident.status.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Simulation Mode
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
            {incident.title}
          </h1>

          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {incident.attack_story?.summary_text ||
              "Multi-stage credential theft and lateral intrusion targeting confidential customer databases."}
          </p>
        </div>

        {/* Risk Gauge Card */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-cyber-900/90 border border-cyber-700/80 shrink-0">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-rose-950/40 border-2 border-rose-500/50 cyber-glow-danger">
            <div className="text-center">
              <div className="text-xl font-black text-rose-400 font-mono leading-none">
                {incident.risk_score}
              </div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Risk</div>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <div className="text-white font-bold">Compound Risk Assessment</div>
            <div className="text-slate-400 text-[11px]">Synergistic Multi-Stage Attack</div>
            <div className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 5 Containment Actions Active
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Feature: Interactive Attack Story (Graph + Narrative) */}
      <AttackStoryGraph
        attackStory={incident.attack_story}
        incidentTitle={incident.title}
        riskScore={incident.risk_score}
      />

      {/* Investigation Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Evidence, Timeline, Response Console */}
        <div className="lg:col-span-7 space-y-6">
          {/* Affected Assets & Evidence Table */}
          <EvidenceTable
            evidence={incident.evidence || []}
            affectedAssets={incident.affected_assets}
          />

          {/* Chronological Timeline */}
          <Timeline items={incident.timeline || []} />

          {/* Defensive Response Console */}
          <ResponseConsole
            incidentId={incident.incident_id}
            recommendations={recommendations}
            simulatedHistory={responseHistory}
            onActionSimulated={fetchIncidentData}
          />

          {/* Feedback & Continuous Learning */}
          <FeedbackModal
            incidentId={incident.incident_id}
            onFeedbackSubmitted={fetchIncidentData}
          />
        </div>

        {/* Right Column (5 cols): AI Security Investigator Assistant */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
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
