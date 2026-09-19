import {
  NormalizedEvent, Incident, TimelineItem, EvidenceItem,
  AttackStory, ResponseRecommendation, SimulatedAction,
  AIResponse, IncidentReport, PatternItem, HourlyTrend,
  IntelligenceStatistics, DemoResult
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      // fallback to status text
    }
    throw new Error(`API Error [${response.status}]: ${errorDetail}`);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; storage: string; simulation_mode: boolean; llm_provider: string }>('/api/health'),

  // Events
  getEvents: (limit: number = 100) => request<NormalizedEvent[]>(`/api/events?limit=${limit}`),
  getEvent: (eventId: string) => request<NormalizedEvent>(`/api/events/${eventId}`),
  createEvent: (eventData: Partial<NormalizedEvent>) =>
    request<NormalizedEvent>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Detection
  analyzeEvent: (eventData: Record<string, any>) =>
    request<any>('/api/detection/analyze', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Incidents
  getIncidents: () => request<Incident[]>('/api/incidents'),
  getIncident: (incidentId: string) => request<Incident>(`/api/incidents/${incidentId}`),
  updateIncidentStatus: (incidentId: string, status: string, comment?: string) =>
    request<Incident>(`/api/incidents/${incidentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, comment }),
    }),
  getTimeline: (incidentId: string) => request<TimelineItem[]>(`/api/incidents/${incidentId}/timeline`),
  getEvidence: (incidentId: string) => request<EvidenceItem[]>(`/api/incidents/${incidentId}/evidence`),
  getAttackStory: (incidentId: string) => request<AttackStory>(`/api/incidents/${incidentId}/attack-story`),

  // AI Investigation
  investigateAI: (incidentId: string, question: string) =>
    request<AIResponse>('/api/ai/investigate', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, question }),
    }),
  explainAI: (incidentId: string, focus: string = 'full_incident') =>
    request<AIResponse>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, focus }),
    }),
  summarizeAI: (incidentId: string, format: string = 'executive') =>
    request<AIResponse>('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, format }),
    }),
  getInvestigationHistory: (incidentId: string) =>
    request<any[]>(`/api/ai/history/${incidentId}`),

  // Response Simulation
  getRecommendations: (incidentId: string) =>
    request<ResponseRecommendation[]>(`/api/incidents/${incidentId}/recommendations`),
  simulateAction: (incidentId: string, actionType: string, target: string, parameters: Record<string, any> = {}) =>
    request<SimulatedAction>('/api/response/simulate', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, action_type: actionType, target, parameters }),
    }),
  simulateAllActions: (incidentId: string, mode: string = 'automatic') =>
    request<SimulatedAction[]>('/api/response/simulate-all', {
      method: 'POST',
      body: JSON.stringify({ incident_id: incidentId, mode }),
    }),
  getResponseHistory: (incidentId: string) =>
    request<SimulatedAction[]>(`/api/incidents/${incidentId}/response-history`),

  // Reports
  getReport: (incidentId: string) => request<IncidentReport>(`/api/reports/${incidentId}`),

  // Feedback
  submitFeedback: (incidentId: string, feedbackType: string, analystComment?: string, analystName?: string) =>
    request<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        incident_id: incidentId,
        feedback_type: feedbackType,
        analyst_comment: analystComment,
        analyst_name: analystName || 'SOC-Analyst-1',
      }),
    }),
  getFeedback: () => request<any[]>('/api/feedback'),

  // Intelligence
  getTrends: () => request<HourlyTrend[]>('/api/intelligence/trends'),
  getPatterns: () => request<PatternItem[]>('/api/intelligence/patterns'),
  getStatistics: () => request<IntelligenceStatistics>('/api/intelligence/statistics'),

  // Demo Mode
  runDemo: () => request<DemoResult>('/api/demo/run', { method: 'POST' }),
  resetDemo: () => request<{ status: string; message: string }>('/api/demo/reset', { method: 'POST' }),
};
