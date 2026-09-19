import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, FileText, Sparkles, CheckCircle2, AlertTriangle,
  Play, RefreshCw, X, ArrowRight, ShieldAlert, Database,
  Terminal, ShieldCheck, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { BulkIngestResponse } from '../types';

interface LogUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventsIngested: () => void;
}

export const LogUploaderModal: React.FC<LogUploaderModalProps> = ({
  isOpen,
  onClose,
  onEventsIngested,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'simulate' | 'sandbox'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [autoCorrelate, setAutoCorrelate] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestResult, setIngestResult] = useState<BulkIngestResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scenario Injection State
  const [selectedScenario, setSelectedScenario] = useState<string>('ransomware_staging');
  const [targetUser, setTargetUser] = useState<string>('sarah');
  const [targetDevice, setTargetDevice] = useState<string>('PC-042');

  // Sandbox JSON State
  const [customEventJson, setCustomEventJson] = useState(
    JSON.stringify(
      {
        event_id: 'EVT-MANUAL-01',
        event_type: 'credential_access',
        user: 'admin_rob',
        device: 'SEC-ADMIN-PC',
        source_ip: '10.0.0.15',
        action: 'memory_read',
        description: 'LSASS memory access indicating attempted credential dump',
        metadata: { target_process: 'lsass.exe' }
      },
      null,
      2
    )
  );
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIngestResult(null);
      setErrorMessage(null);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setIngestResult(null);

    try {
      const res = await api.uploadLogFile(selectedFile, autoCorrelate);
      setIngestResult(res);
      onEventsIngested();
    } catch (err: any) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInjectScenario = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    setIngestResult(null);

    try {
      const res = await api.injectSimulatedScenario(
        selectedScenario,
        targetUser,
        targetDevice,
        autoCorrelate
      );
      setIngestResult(res);
      onEventsIngested();
    } catch (err: any) {
      setErrorMessage(err.message || 'Scenario injection failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEvaluateSandbox = async () => {
    setIsProcessing(true);
    try {
      const parsed = JSON.parse(customEventJson);
      const res = await api.analyzeEvent(parsed);
      setSandboxResult(res);
    } catch (err: any) {
      setErrorMessage(`JSON Parsing Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestSandboxEvent = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const parsed = JSON.parse(customEventJson);
      await api.createEvent(parsed);
      onEventsIngested();
      setIngestResult({
        total_received: 1,
        total_ingested: 1,
        suspicious_count: 1,
        incidents_created: 0,
        incident_ids: [],
        errors: [],
        message: 'Event successfully analyzed and stored in repository.',
      });
    } catch (err: any) {
      setErrorMessage(`Ingestion Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-cyan-500/40 bg-cyber-950/95 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-800 bg-cyber-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Log Ingestion & Attack Simulator Hub
              </h2>
              <p className="text-[11px] text-slate-400">
                Upload raw security logs or inject live synthetic attack scenarios
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-cyber-800 bg-cyber-900/40">
          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Log File (.json / .csv)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('simulate');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'simulate'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Scenario Injector</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sandbox');
              setErrorMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'sandbox'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Event Detection Sandbox</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {ingestResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ingestion Completed</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-300">
                  {ingestResult.total_ingested} Events Ingested
                </span>
              </div>
              <p className="text-xs text-slate-300">{ingestResult.message}</p>

              {ingestResult.incident_ids && ingestResult.incident_ids.length > 0 && (
                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    Created Incident:{' '}
                    <strong className="font-mono text-cyan-300">
                      {ingestResult.incident_ids.join(', ')}
                    </strong>
                  </span>
                  <Link
                    to={`/incidents/${ingestResult.incident_ids[0]}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 text-black text-xs font-semibold hover:bg-cyan-400"
                  >
                    <span>Investigate Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Tab 1: File Uploader */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyber-700 hover:border-cyan-500/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-cyber-900/40 hover:bg-cyber-900/70"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,text/csv,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto mb-3 flex items-center justify-center border border-cyan-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white mb-1">
                  {selectedFile ? selectedFile.name : 'Select or Drop Security Log File (.json or .csv)'}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Supports structured JSON arrays or CSV files containing timestamp, event_type, user, device, action, and description.
                </p>
                {selectedFile && (
                  <div className="mt-3 inline-block px-2.5 py-1 rounded bg-cyber-800 text-cyan-300 font-mono text-[11px]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'text/plain'}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyber-900/60 border border-cyber-800 text-xs">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCorrelate}
                    onChange={(e) => setAutoCorrelate(e.target.checked)}
                    className="rounded bg-cyber-950 border-cyber-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Automatically correlate ingested events into new incidents</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono">Multi-signal clustering</span>
              </div>

              <button
                onClick={handleUploadFile}
                disabled={!selectedFile || isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing & Ingesting Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload, Normalize & Correlate</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Live Scenario Injector */}
          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Choose a pre-packaged multi-stage attack sequence to inject into the live stream and watch AI CyberGuard detect and correlate it into an active investigation.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'ransomware_staging',
                    title: 'Ransomware Staging',
                    desc: 'Certutil download cradle + VSSAdmin shadow delete + high-frequency file modifications.',
                    severity: 'Critical'
                  },
                  {
                    id: 'password_spray',
                    title: 'Distributed Password Spray',
                    desc: '14 rapid failed authentications from external IP followed by compromised VPN session.',
                    severity: 'High'
                  },
                  {
                    id: 'data_exfiltration',
                    title: 'Cloud Data Exfiltration',
                    desc: '50,000 credit card records queried followed by 2GB encrypted outbound egress.',
                    severity: 'Critical'
                  }
                ].map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedScenario(scen.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedScenario === scen.id
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-900/20'
                        : 'bg-cyber-900 border-cyber-800 hover:border-cyber-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{scen.title}</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {scen.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{scen.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target User Identity
                  </label>
                  <input
                    type="text"
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value)}
                    className="w-full bg-cyber-950 border border-cyber-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Target Workstation / Device
                  </label>
                  <input
                    type="text"
                    value={targetDevice}
                    onChange={(e) => setTargetDevice(e.target.value)}
                    className="w-full bg-cyber-950 border border-cyber-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleInjectScenario}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Injecting Scenario Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    <span>Inject Live Attack Scenario & Correlate</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 3: Sandbox */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Custom Event JSON
                  </label>
                  <textarea
                    value={customEventJson}
                    onChange={(e) => setCustomEventJson(e.target.value)}
                    rows={8}
                    className="w-full bg-cyber-950 border border-cyber-700 rounded-xl p-3 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={handleEvaluateSandbox}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-750 text-cyan-300 text-xs font-semibold border border-cyber-700"
                    >
                      Test Detection Rules
                    </button>
                    <button
                      onClick={handleIngestSandboxEvent}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400"
                    >
                      Ingest to Stream
                    </button>
                  </div>
                </div>

                <div className="bg-cyber-950 p-4 rounded-xl border border-cyber-800 font-mono text-xs overflow-y-auto max-h-64">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                    Sandbox Rule Evaluation:
                  </div>
                  {sandboxResult ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Risk Score:</span>
                        <strong className="text-rose-400 font-bold text-sm">
                          {sandboxResult.risk_score}/100
                        </strong>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyber-800 text-slate-300">
                          {sandboxResult.severity}
                        </span>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Triggered Rules:</div>
                        <div className="text-cyan-300 font-semibold">
                          {sandboxResult.triggered_rules?.map((r: any) => r.name).join(', ') || 'None'}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px]">Reasons:</div>
                        <div className="text-slate-300 text-[11px]">
                          {sandboxResult.reasons?.join('; ') || 'No anomalies flagged.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">
                      Click "Test Detection Rules" to evaluate risk weights.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
