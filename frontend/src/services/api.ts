import {
  NormalizedEvent, Incident, TimelineItem, EvidenceItem,
  AttackStory, ResponseRecommendation, SimulatedAction,
  AIResponse, IncidentReport, PatternItem, HourlyTrend,
  IntelligenceStatistics, DemoResult, BulkIngestResponse,
  UserProfile, LoginResponse, WebSocketMessage
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const TOKEN_KEY = 'ai_cyberguard_auth_token';
const USER_KEY = 'ai_cyberguard_user_profile';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): UserProfile | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },
  setUser: (user: UserProfile) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const token = authStorage.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

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
      // fallback
    }
    throw new Error(`API Error [${response.status}]: ${errorDetail}`);
  }

  return response.json();
}

export const api = {
  // Auth & RBAC
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    authStorage.setToken(res.access_token);
    authStorage.setUser(res.user);
    return res;
  },
  getMe: async (): Promise<UserProfile> => {
    const user = await request<UserProfile>('/api/auth/me');
    authStorage.setUser(user);
    return user;
  },
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clear();
    }
  },

  // Health
  getHealth: () => request<{ status: string; storage: string; simulation_mode: boolean; llm_provider: string }>('/api/health'),

  // Events
  getEvents: async (pageOrLimit: number = 1, pageSize: number = 100): Promise<{ events: NormalizedEvent[]; total: number }> => {
    try {
      const res = await request<any>(`/api/events?limit=${pageSize}&skip=${(pageOrLimit - 1) * pageSize}`);
      if (Array.isArray(res)) {
        return { events: res, total: res.length };
      }
      return { events: res.events || [], total: res.total || 0 };
    } catch {
      return { events: [], total: 0 };
    }
  },
  getEvent: (eventId: string) => request<NormalizedEvent>(`/api/events/${eventId}`),
  createEvent: (eventData: Partial<NormalizedEvent>) =>
    request<NormalizedEvent>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  uploadLogFile: (file: File, correlate: boolean = true): Promise<BulkIngestResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('correlate', String(correlate));
    const url = `${API_BASE}/api/events/upload`;
    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        let errDetail = res.statusText;
        try {
          const errJson = await res.json();
          errDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch {}
        throw new Error(`Upload Error [${res.status}]: ${errDetail}`);
      }
      return res.json();
    });
  },
  bulkIngestEvents: (events: Partial<NormalizedEvent>[], correlate_immediately: boolean = true) =>
    request<BulkIngestResponse>('/api/events/bulk', {
      method: 'POST',
      body: JSON.stringify({ events, correlate_immediately }),
    }),
  injectSimulatedScenario: (scenario: string, targetUser?: string, targetDevice?: string, correlate_immediately: boolean = true) =>
    request<BulkIngestResponse>('/api/events/simulate-injection', {
      method: 'POST',
      body: JSON.stringify({ scenario, target_user: targetUser, target_device: targetDevice, correlate_immediately }),
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

  // Threat Intel & CTI
  lookupThreatIntel: (ip: string) => request<any>(`/api/intelligence/ip/${ip}`),

  // Scenarios Lab
  getScenarios: () => request<any>('/api/scenarios'),
  runScenario: (scenarioId: string) =>
    request<any>(`/api/scenarios/${scenarioId}/execute`, {
      method: 'POST',
    }),

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

  // Real-Time WebSocket Streaming
  subscribeToThreatStream: (
    onMessage: (msg: WebSocketMessage) => void,
    onStatusChange?: (status: 'connected' | 'connecting' | 'disconnected') => void
  ): (() => void) => {
    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/api/ws/stream';
    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isClosedExplicitly = false;

    const connect = () => {
      if (isClosedExplicitly) return;
      onStatusChange?.('connecting');
      try {
        socket = new WebSocket(wsUrl);
        socket.onopen = () => {
          onStatusChange?.('connected');
        };
        socket.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            onMessage(data);
          } catch {
            // ignore non-json
          }
        };
        socket.onclose = () => {
          onStatusChange?.('disconnected');
          if (!isClosedExplicitly) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
        socket.onerror = () => {
          socket?.close();
        };
      } catch {
        onStatusChange?.('disconnected');
        if (!isClosedExplicitly) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isClosedExplicitly = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }
};
