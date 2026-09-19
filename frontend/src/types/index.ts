export interface NormalizedEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  user?: string | null;
  device?: string | null;
  source_ip?: string | null;
  destination?: string | null;
  action: string;
  status: string;
  severity: string;
  description: string;
  metadata?: Record<string, any>;
  risk_score?: number;
  triggered_rules?: string[];
}

export interface AffectedAssets {
  users: string[];
  devices: string[];
  servers: string[];
  databases: string[];
  ips: string[];
  cloud_resources?: string[];
}

export interface TimelineItem {
  timestamp: string;
  event_id: string;
  event_type: string;
  description: string;
  risk_contribution: number;
  relationship_to_incident: string;
  source?: string;
  destination?: string;
}

export interface EvidenceItem {
  event_id: string;
  timestamp: string;
  event_type: string;
  description: string;
  risk_contribution: number;
  source?: string;
  destination?: string;
  relationship_to_incident: string;
  metadata?: Record<string, any>;
}

export interface AttackStoryNode {
  id: string;
  label: string;
  type: string;
  details?: Record<string, any>;
}

export interface AttackStoryEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  timestamp?: string;
  evidence_id?: string;
}

export interface AttackStory {
  incident_id: string;
  summary_text: string;
  stages: string[];
  nodes: AttackStoryNode[];
  edges: AttackStoryEdge[];
}

export interface Incident {
  incident_id: string;
  title: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: 'new' | 'investigating' | 'analyzing' | 'containment' | 'contained' | 'resolved' | 'false_positive';
  event_ids: string[];
  affected_users: string[];
  affected_devices: string[];
  affected_assets: AffectedAssets;
  timeline: TimelineItem[];
  evidence: EvidenceItem[];
  attack_story?: AttackStory;
  created_at: string;
  updated_at: string;
  status_history?: Array<{
    status: string;
    timestamp: string;
    comment: string;
  }>;
}

export interface ResponseRecommendation {
  action_type: string;
  target: string;
  priority: string;
  description: string;
  rationale: string;
  requires_approval: boolean;
}

export interface SimulatedAction {
  action_id: string;
  incident_id: string;
  action_type: string;
  target: string;
  status: string;
  simulation: boolean;
  timestamp: string;
  details?: Record<string, any>;
  executed_by: string;
  command_simulated?: string;
}

export interface AIResponse {
  incident_id: string;
  question?: string;
  answer: string;
  confidence: string;
  evidence_referenced: string[];
  suggested_follow_ups: string[];
  model_used: string;
  timestamp: string;
}

export interface IncidentReport {
  report_id: string;
  incident_id: string;
  title: string;
  generated_at: string;
  status: string;
  executive_summary: string;
  incident_metadata: Record<string, any>;
  risk_assessment: {
    risk_score: number;
    severity: string;
    primary_factors: string[];
    confidence_level: string;
    potential_impact: string;
  };
  attack_timeline: TimelineItem[];
  affected_assets: AffectedAssets;
  evidence: EvidenceItem[];
  attack_story?: AttackStory;
  ai_analysis: string;
  recommendations: ResponseRecommendation[];
  response_actions: SimulatedAction[];
  analyst_feedback?: Record<string, any>;
  disclaimer: string;
}

export interface PatternItem {
  pattern_id: string;
  pattern_signature: string;
  description: string;
  occurrences: number;
  severity: string;
  mitre_techniques: string[];
  last_observed: string;
  examples_incidents: string[];
}

export interface HourlyTrend {
  hour: string;
  event_count: number;
  incident_count: number;
}

export interface IntelligenceStatistics {
  total_events_processed: number;
  total_incidents_created: number;
  active_incidents: number;
  contained_incidents: number;
  critical_incidents: number;
  average_risk_score: number;
  average_containment_time_seconds: number;
  false_positive_rate: number;
  severity_distribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  top_affected_devices: Array<{ name: string; count: number }>;
  top_affected_users: Array<{ name: string; count: number }>;
  common_incident_types: Array<{ name: string; count: number }>;
}

export interface DemoResult {
  demo_id: string;
  incident: Incident;
  risk_score: number;
  severity: string;
  events: NormalizedEvent[];
  attack_story: AttackStory;
  affected_assets: AffectedAssets;
  ai_summary: string;
  recommended_actions: ResponseRecommendation[];
  simulated_actions: SimulatedAction[];
  report: IncidentReport;
}

export interface BulkIngestResponse {
  total_received: number;
  total_ingested: number;
  suspicious_count: number;
  incidents_created: number;
  incident_ids: string[];
  errors: string[];
  message: string;
}

