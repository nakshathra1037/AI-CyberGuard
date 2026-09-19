import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Incidents } from './pages/Incidents';
import { IncidentInvestigation } from './pages/IncidentInvestigation';
import { Events } from './pages/Events';
import { ReportView } from './pages/ReportView';
import { Intelligence } from './pages/Intelligence';
import { api } from './services/api';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('INC-1024');
  const navigate = useNavigate();

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    showToast('Executing 7-Stage Autonomous Demo Pipeline: Ingestion -> Detection -> Correlation -> Story -> AI -> Response -> Report...', 'info');
    try {
      const result = await api.runDemo();
      setActiveIncidentId(result.incident.incident_id);
      showToast(
        `Demo Succeeded! Correlated 7 events into ${result.incident.incident_id} (Risk: ${result.risk_score}/100 Critical). Redirecting to Investigation...`,
        'success'
      );
      navigate(`/incidents/${result.incident.incident_id}`);
    } catch (err: any) {
      showToast(`Demo execution error: ${err.message}`, 'error');
    } finally {
      setIsRunningDemo(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      showToast('Environment successfully reset to baseline clean state.', 'info');
      navigate('/');
    } catch (err: any) {
      showToast(`Reset error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onRunDemo={handleRunDemo}
        onResetDemo={handleResetDemo}
        isRunningDemo={isRunningDemo}
        activeIncidentId={activeIncidentId}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div
            className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 text-xs ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<Dashboard onRunDemo={handleRunDemo} isRunningDemo={isRunningDemo} />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:incidentId" element={<IncidentInvestigation />} />
          <Route path="/events" element={<Events />} />
          <Route path="/reports/:incidentId" element={<ReportView />} />
          <Route path="/intelligence" element={<Intelligence />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-800/80 bg-cyber-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI CyberGuard &copy; 2026 — Autonomous AI Cybersecurity Platform</span>
          <span className="text-amber-400/80 font-mono text-[11px]">
            SAFE SIMULATION MODE: All defensive containment actions executed are simulated.
          </span>
        </div>
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
