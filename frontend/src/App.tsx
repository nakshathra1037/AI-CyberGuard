import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { IncidentInvestigation } from './pages/IncidentInvestigation';
import { Events } from './pages/Events';
import { ReportView } from './pages/ReportView';
import { Intelligence } from './pages/Intelligence';
import { Simulator } from './pages/Simulator';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { api, authStorage } from './services/api';
import { UserProfile, WebSocketMessage } from './types';
import { ShieldAlert, CheckCircle2, Bell } from 'lucide-react';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authStorage.getUser() || {
    id: 'USR-001',
    username: 'admin',
    email: 'admin@cyberguard.ai',
    full_name: 'Marcus Vance',
    role: 'admin',
    permissions: ['all:read', 'all:write', 'containment:approve']
  });
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error' | 'alert'; text: string; title?: string } | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-1024');
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  const showToast = (text: string, type: 'success' | 'info' | 'error' | 'alert' = 'success', title?: string) => {
    setToastMessage({ text, type, title });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Real-Time WebSocket stream connection
  useEffect(() => {
    const unsubscribe = api.subscribeToThreatStream(
      (msg: WebSocketMessage) => {
        if (msg.type === 'NEW_EVENT') {
          showToast(`Telemetry Ingested: ${msg.data.event_type} on ${msg.data.resource}`, 'info', 'Telemetry Event');
        } else if (msg.type === 'THREAT_ALERT') {
          showToast(
            `Threat Alert (${msg.data.risk_score}/100): ${msg.data.reasons?.join(', ')}`,
            'alert',
            'Threat Detected'
          );
        } else if (msg.type === 'CONTAINMENT_ACTION') {
          showToast(
            `Containment Executed: ${msg.data.action_type} on ${msg.data.target} [SIMULATION]`,
            'success',
            'Containment Active'
          );
        }
      },
      (status) => setWsStatus(status)
    );

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    showToast(`Authenticated as ${user.username} (${user.role.toUpperCase()})`, 'success', 'Session Active');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    showToast('Session terminated.', 'info');
    navigate('/login');
  };

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    showToast('Executing 7-stage autonomous attack and correlation pipeline...', 'info', 'Pipeline Active');
    try {
      const result = await api.runDemo();
      setActiveIncidentId(result.incident.incident_id);
      showToast(
        `Correlated events into ${result.incident.incident_id} (Risk: ${result.risk_score}/100).`,
        'success',
        'Incident Generated'
      );
      navigate(`/incidents/${result.incident.incident_id}`);
    } catch (err: any) {
      showToast(`Execution error: ${err.message}`, 'error', 'Failed');
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-soc-bg text-soc-text flex flex-col selection:bg-soc-blue selection:text-white">
      {/* Top Header */}
      <Topbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onRunDemo={handleRunDemo}
        isRunningDemo={isRunningDemo}
        wsStatus={wsStatus}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Main App Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeIncidentId={activeIncidentId} />

        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard onRunDemo={handleRunDemo} isRunningDemo={isRunningDemo} />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/incidents/:incidentId" element={<IncidentInvestigation />} />
              <Route path="/events" element={<Events />} />
              <Route path="/reports/:incidentId" element={<ReportView />} />
              <Route path="/intelligence" element={<Intelligence />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`p-3.5 rounded-md shadow-elevated border flex items-start gap-2.5 text-xs font-mono ${
              toastMessage.type === 'success'
                ? 'bg-soc-panel border-soc-success text-soc-text'
                : toastMessage.type === 'error'
                ? 'bg-soc-panel border-soc-critical text-soc-text'
                : toastMessage.type === 'alert'
                ? 'bg-soc-panel border-soc-warning text-soc-text'
                : 'bg-soc-panel border-soc-blue text-soc-text'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-soc-success shrink-0 mt-0.5" />
            ) : toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-4 h-4 text-soc-warning shrink-0 mt-0.5" />
            ) : (
              <Bell className="w-4 h-4 text-soc-blue shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              {toastMessage.title && (
                <div className="font-bold text-[10px] uppercase text-soc-muted mb-0.5">
                  {toastMessage.title}
                </div>
              )}
              <span className="leading-tight text-soc-text text-xs">{toastMessage.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="h-7 border-t border-soc-border bg-soc-panel px-4 flex items-center justify-between text-[10px] font-mono text-soc-muted shrink-0 select-none">
        <span>AI-CyberGuard Enterprise SOC Platform &copy; 2026</span>
        <span className="text-soc-cyan">POLICY: SAFE SIMULATION MODE ACTIVE (ENABLE_LIVE_ACTIONS=false)</span>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
