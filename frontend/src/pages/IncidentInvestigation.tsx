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
  const [incident, setIncident] = useState<Incident | null>(null);
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>([]);
  const [responseHistory, setResponseHistory] = useState<SimulatedAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
