import React, { useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  User, Laptop, Terminal, Key, ArrowRightLeft,
  Server, Database, Info, GitFork, ListFilter, ShieldAlert,
  Network, X, Activity, ExternalLink
} from 'lucide-react';
import { AttackStory } from '../types';

interface AttackStoryGraphProps {
  attackStory?: AttackStory;
  incidentTitle?: string;
  riskScore?: number;
}

// Custom SOC Node Renderer
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const isSuspicious = data.isSuspicious ?? true;

  const getIcon = () => {
    switch (data.type) {
      case 'user': return <User className="w-4 h-4 text-soc-cyan" />;
      case 'device': return <Laptop className="w-4 h-4 text-soc-blue" />;
      case 'ip': return <Network className="w-4 h-4 text-soc-critical" />;
      case 'process': return <Terminal className="w-4 h-4 text-soc-warning" />;
      case 'credential': return <Key className="w-4 h-4 text-soc-critical" />;
      case 'lateral_movement': return <ArrowRightLeft className="w-4 h-4 text-soc-high" />;
      case 'server': return <Server className="w-4 h-4 text-soc-secondary" />;
      case 'database': return <Database className="w-4 h-4 text-soc-critical" />;
      default: return <ShieldAlert className="w-4 h-4 text-soc-blue" />;
    }
  };

  return (
    <div className={`px-3.5 py-2.5 rounded-md border text-left transition-all min-w-[170px] ${
      selected
        ? 'border-soc-blue bg-soc-elevated shadow-accent-subtle ring-1 ring-soc-blue'
        : isSuspicious
        ? 'border-soc-border bg-soc-panel hover:border-soc-borderMuted'
        : 'border-soc-border bg-soc-card opacity-70'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1 rounded bg-soc-card border border-soc-border">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <div className="text-[9px] uppercase font-mono tracking-wider text-soc-muted">
            {data.type?.replace('_', ' ')}
          </div>
          <div className="text-xs font-semibold text-soc-text truncate font-mono">
            {data.label}
          </div>
        </div>
      </div>
      {data.details && (
        <div className="mt-1 pt-1 border-t border-soc-border text-[10px] text-soc-secondary font-mono truncate">
          {Object.entries(data.details).slice(0, 1).map(([k, v]) => (
            <span key={k}>{k}: {String(v)}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

export const AttackStoryGraph: React.FC<AttackStoryGraphProps> = ({
  attackStory,
  incidentTitle,
  riskScore = 85,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'narrative'>('graph');
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  // Build React Flow graph data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!attackStory || !attackStory.nodes || attackStory.nodes.length === 0) {
      const defaultSequence = [
        { id: 'node-user', label: 'alice.smith', type: 'user', details: { role: 'Finance Analyst', dept: 'Treasury' }, isSuspicious: true },
        { id: 'node-ip', label: '198.51.100.44', type: 'ip', details: { country: 'Romania', reputation: 'Suspicious (78%)' }, isSuspicious: true },
        { id: 'node-device', label: 'DEV-UNKNOWN-98', type: 'device', details: { os: 'Linux x86_64', first_seen: 'Today' }, isSuspicious: true },
        { id: 'node-process', label: 'PowerShell Cradle', type: 'process', details: { pid: 4820, cmd: 'enc -bypass' }, isSuspicious: true },
        { id: 'node-cred', label: 'Auth Token Access', type: 'credential', details: { tech: 'T1078 (Valid Accounts)' }, isSuspicious: true },
        { id: 'node-server', label: 'API Gateway', type: 'server', details: { endpoint: '/api/v1/customers' }, isSuspicious: false },
        { id: 'node-database', label: 'Financial DB-01', type: 'database', details: { table: 'wire_transfers' }, isSuspicious: true },
      ];

      const nodes: Node[] = defaultSequence.map((item, idx) => ({
        id: item.id,
        type: 'customNode',
        position: { x: 30 + (idx % 4) * 230, y: 40 + Math.floor(idx / 4) * 140 },
        data: item,
      }));

      const edges: Edge[] = [];
      const labels = ['logged_from', 'used_device', 'spawned', 'harvested', 'targeted', 'exfiltrated_from'];
      for (let i = 0; i < defaultSequence.length - 1; i++) {
        edges.push({
          id: `edge-${i}`,
          source: defaultSequence[i].id,
          target: defaultSequence[i + 1].id,
          label: labels[i] || 'connected_to',
          animated: true,
          style: { stroke: '#4F8CFF', strokeWidth: 1.5 },
          labelStyle: { fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' },
          labelBgStyle: { fill: '#11161D', fillOpacity: 0.9, rx: 3, ry: 3 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#4F8CFF' },
        });
      }
      return { initialNodes: nodes, initialEdges: edges };
    }

    const nodes: Node[] = attackStory.nodes.map((node, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        id: node.id,
        type: 'customNode',
        position: { x: 30 + col * 230, y: 40 + row * 140 },
        data: {
          label: node.label,
          type: node.type,
          details: node.details,
          isSuspicious: true,
        },
      };
    });

    const edges: Edge[] = attackStory.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label.replace(/_/g, ' '),
      animated: true,
      style: { stroke: '#4F8CFF', strokeWidth: 1.5 },
      labelStyle: { fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' },
      labelBgStyle: { fill: '#11161D', fillOpacity: 0.9, rx: 3, ry: 3 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4F8CFF' },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [attackStory]);

  const onNodeClick = (_: any, node: Node) => {
    setSelectedEntity(node.data);
  };

  return (
    <div className="soc-panel overflow-hidden flex flex-col">
      {/* Header with View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-soc-border bg-soc-card">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-soc-blue" />
            <h3 className="text-sm font-semibold text-soc-text">
              Dynamic Attack Story Graph
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-soc-critical/20 text-soc-critical border border-soc-critical/30">
              Risk {riskScore}/100
            </span>
          </div>
          <p className="text-xs text-soc-secondary mt-0.5">
            Causal graph topology showing attacker progression from initial access to sensitive database impact.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-soc-panel rounded border border-soc-border self-start sm:self-auto">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'graph'
                ? 'bg-soc-blue/20 text-soc-blue font-semibold border border-soc-blue/40'
                : 'text-soc-secondary hover:text-soc-text'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Graph View</span>
          </button>
          <button
            onClick={() => setViewMode('narrative')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'narrative'
                ? 'bg-soc-blue/20 text-soc-blue font-semibold border border-soc-blue/40'
                : 'text-soc-secondary hover:text-soc-text'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Narrative</span>
          </button>
        </div>
      </div>

      {/* Main Graph Canvas */}
      {viewMode === 'graph' ? (
        <div className="h-[380px] w-full bg-soc-bg relative flex">
          <div className="flex-1 h-full">
            <ReactFlow
              nodes={initialNodes}
              edges={initialEdges}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              attributionPosition="bottom-left"
            >
              <Background color="#202832" gap={20} size={1} />
              <Controls />
            </ReactFlow>
          </div>

          {/* Contextual Entity Inspector Sidebar */}
          {selectedEntity && (
            <div className="w-64 bg-soc-panel border-l border-soc-border p-4 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-150">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-soc-border">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-soc-muted">
                    Entity Inspector
                  </span>
                  <button 
                    onClick={() => setSelectedEntity(null)}
                    className="text-soc-muted hover:text-soc-text p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="text-xs font-bold text-soc-text font-mono truncate">
                    {selectedEntity.label}
                  </div>
                  <div className="text-[10px] font-mono text-soc-blue uppercase mt-0.5">
                    Type: {selectedEntity.type}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono text-soc-secondary">
                    <span className="text-soc-muted block">First Observed:</span>
                    Today during incident window
                  </div>
                  <div className="text-[11px] font-mono text-soc-secondary">
                    <span className="text-soc-muted block">Reputation Assessment:</span>
                    <span className="text-soc-critical font-semibold">Flagged Suspicious</span>
                  </div>
                  {selectedEntity.details && (
                    <div className="p-2 rounded bg-soc-card border border-soc-border text-[10px] font-mono space-y-1">
                      {Object.entries(selectedEntity.details).map(([k, v]) => (
                        <div key={k} className="truncate">
                          <span className="text-soc-muted">{k}:</span> <span className="text-soc-text">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[10px] font-mono text-soc-muted pt-2 border-t border-soc-border">
                Click graph background to deselect
              </div>
            </div>
          )}

          {/* Subtle Stage Legend */}
          {!selectedEntity && (
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md bg-soc-panel/90 border border-soc-border text-[10px] text-soc-secondary flex items-center gap-3 font-mono shadow-panel">
              <span className="font-semibold text-soc-muted">Causality:</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-soc-cyan" /> Identity</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-soc-warning" /> Process</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-soc-critical" /> Impact</span>
            </div>
          )}
        </div>
      ) : (
        /* Text Narrative View */
        <div className="p-5 bg-soc-panel space-y-4">
          <div className="p-4 rounded-md bg-soc-card border border-soc-border">
            <div className="flex items-center gap-1.5 text-soc-blue text-xs font-semibold mb-1.5">
              <Info className="w-4 h-4" />
              <span>Synthesized Attack Progression Narrative</span>
            </div>
            <p className="text-xs text-soc-text leading-relaxed">
              {attackStory?.summary_text ||
                "Multiple authentication failures from external IP 198.51.100.44 were followed by a successful logon for user alice.smith. The session originated from an unrecorded device hardware profile, quickly accessed sensitive financial database endpoints, and triggered volumetric rate anomalies."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] uppercase font-mono font-bold tracking-wider text-soc-muted">
              Chronological Kill-Chain Stages
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {[
                { stage: '1. Initial Access', title: 'Brute-Force & Valid Login', target: 'auth-service', tech: 'T1110 / T1078', desc: 'Authentication attempts from untrusted IP 198.51.100.44' },
                { stage: '2. Device Drift', title: 'Unseen Hardware Signature', target: 'DEV-UNKNOWN-98', tech: 'T1078.004', desc: 'Session established on previously unseen Linux client' },
                { stage: '3. Execution', title: 'PowerShell / Shell Command', target: 'Internal API', tech: 'T1059.001', desc: 'Privileged command invocation for session token acquisition' },
                { stage: '4. Data Access', title: 'Sensitive Financial Query', target: 'Financial DB-01', tech: 'T1020 / T1005', desc: 'Unusual volumetric query on customer wire transfer records' }
              ].map((step, idx) => (
                <div key={idx} className="p-3 rounded-md bg-soc-card border border-soc-border flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded bg-soc-elevated text-soc-blue flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border border-soc-border">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-soc-text">{step.title}</span>
                      <span className="text-[10px] font-mono text-soc-muted">{step.target}</span>
                    </div>
                    <p className="text-[11px] text-soc-secondary mt-0.5">{step.desc}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-soc-elevated text-[10px] text-soc-cyan font-mono border border-soc-border">
                      {step.tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
