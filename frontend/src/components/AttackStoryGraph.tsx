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
  Server, Database, Info, GitFork, ListFilter, ShieldAlert
} from 'lucide-react';
import { AttackStory } from '../types';

interface AttackStoryGraphProps {
  attackStory?: AttackStory;
  incidentTitle?: string;
  riskScore?: number;
}

// Custom Node Renderer Component
const CustomNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    switch (data.type) {
      case 'user': return <User className="w-5 h-5 text-cyan-400" />;
      case 'device': return <Laptop className="w-5 h-5 text-blue-400" />;
      case 'process': return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'credential': return <Key className="w-5 h-5 text-red-400" />;
      case 'lateral_movement': return <ArrowRightLeft className="w-5 h-5 text-purple-400" />;
      case 'server': return <Server className="w-5 h-5 text-emerald-400" />;
      case 'database': return <Database className="w-5 h-5 text-rose-400" />;
      default: return <ShieldAlert className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBorderColor = () => {
    switch (data.type) {
      case 'credential':
      case 'database':
        return 'border-rose-500/50 bg-rose-950/40 shadow-rose-900/20';
      case 'lateral_movement':
        return 'border-purple-500/50 bg-purple-950/40 shadow-purple-900/20';
      case 'process':
        return 'border-amber-500/50 bg-amber-950/40 shadow-amber-900/20';
      default:
        return 'border-cyan-500/40 bg-cyber-900/90 shadow-cyan-900/20';
    }
  };

  return (
    <div className={`px-4 py-3 rounded-xl border ${getBorderColor()} backdrop-blur-md shadow-lg min-w-[190px] transition-all hover:scale-105`}>
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="p-1.5 rounded-lg bg-cyber-800/80 border border-cyber-700">
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {data.type?.replace('_', ' ')}
          </span>
          <span className="text-xs font-semibold text-white tracking-tight">
            {data.label}
          </span>
        </div>
      </div>
      {data.details && (
        <div className="mt-1 pt-1 border-t border-slate-700/50 text-[10px] text-slate-300 font-mono flex flex-col gap-0.5">
          {Object.entries(data.details).slice(0, 2).map(([k, v]) => (
            <div key={k} className="truncate">
              <span className="text-slate-400">{k}:</span> {String(v)}
            </div>
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
  riskScore = 91,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'narrative'>('graph');

  // Build React Flow graph data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!attackStory || !attackStory.nodes || attackStory.nodes.length === 0) {
      // Default fallback layout
      const defaultSequence = [
        { id: 'node-user', label: 'User: alex', type: 'user', details: { role: 'Domain User' } },
        { id: 'node-device', label: 'Workstation: PC-017', type: 'device', details: { os: 'Windows 11' } },
        { id: 'node-process', label: 'PowerShell Execution', type: 'process', details: { pid: 4820 } },
        { id: 'node-cred', label: 'LSASS Memory Dump', type: 'credential', details: { tech: 'T1003.001' } },
        { id: 'node-lateral', label: 'Lateral Movement', type: 'lateral_movement', details: { proto: 'WinRM' } },
        { id: 'node-server', label: 'Server: FILESERVER-02', type: 'server', details: { ip: '10.0.2.14' } },
        { id: 'node-database', label: 'Database: DB-01', type: 'database', details: { table: 'customers' } },
      ];

      const nodes: Node[] = defaultSequence.map((item, idx) => ({
        id: item.id,
        type: 'customNode',
        position: { x: 40 + (idx % 4) * 240, y: 60 + Math.floor(idx / 4) * 160 },
        data: item,
      }));

      const edges: Edge[] = [];
      for (let i = 0; i < defaultSequence.length - 1; i++) {
        edges.push({
          id: `edge-${i}`,
          source: defaultSequence[i].id,
          target: defaultSequence[i + 1].id,
          label: ['logged_into', 'executed', 'accessed_credentials', 'moved_to', 'compromised', 'accessed'][i] || 'connected_to',
          animated: true,
          style: { stroke: '#06b6d4', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
        });
      }
      return { initialNodes: nodes, initialEdges: edges };
    }

    // Dynamic layout from provided attack story
    const nodes: Node[] = attackStory.nodes.map((node, index) => {
      // Create a nice zigzag or 2-row layout
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        id: node.id,
        type: 'customNode',
        position: { x: 30 + col * 250, y: 50 + row * 170 },
        data: {
          label: node.label,
          type: node.type,
          details: node.details,
        },
      };
    });

    const edges: Edge[] = attackStory.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label.replace('_', ' '),
      animated: true,
      style: { stroke: '#38bdf8', strokeWidth: 2 },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85, rx: 4, ry: 4 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [attackStory]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-cyber-800 flex flex-col">
      {/* Header with View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-cyber-800 bg-cyber-900/60">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Attack Story — Probable Sequence Graph
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Risk: {riskScore}/100 Critical
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlated graph reconstruction showing causal relationships from initial access to database impact
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-cyber-950 rounded-lg border border-cyber-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'graph'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Graph</span>
          </button>
          <button
            onClick={() => setViewMode('narrative')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'narrative'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Attack Narrative</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'graph' ? (
        <div className="h-[430px] w-full bg-cyber-950/80 relative">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            attributionPosition="bottom-left"
          >
            <Background color="#1e293b" gap={18} size={1} />
            <Controls className="bg-cyber-900 border border-cyber-700 text-white rounded-lg overflow-hidden" />
          </ReactFlow>

          {/* Floating Stage Legend */}
          <div className="absolute bottom-3 right-3 p-2 rounded-xl bg-cyber-900/90 border border-cyber-700/80 backdrop-blur-md text-[10px] text-slate-300 flex items-center gap-3 shadow-lg">
            <span className="font-semibold text-slate-400">Stages:</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Identity</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Execution</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Credential</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Lateral</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Database</span>
          </div>
        </div>
      ) : (
        /* Readable Text Narrative View */
        <div className="p-6 bg-cyber-950/50 space-y-4">
          <div className="p-4 rounded-xl bg-cyber-900/80 border border-cyber-700/80">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-2">
              <Info className="w-4 h-4" />
              <span>Evidence-Grounded Synthesis</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {attackStory?.summary_text ||
                "User account 'alex' was logged into on PC-017 from external untrusted IP 185.23.44.12. The attacker executed obfuscated PowerShell commands, dumped credentials from LSASS memory, pivoted laterally to FILESERVER-02 via WinRM, and queried confidential client records on DB-01."}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Reconstructed Attack Progression Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { stage: '1. Initial Access', title: 'External RDP Authentication', target: 'PC-017', tech: 'T1078 - Valid Accounts', desc: 'Logon from suspicious external IP 185.23.44.12 using user alex' },
                { stage: '2. Execution', title: 'Encoded PowerShell Spawn', target: 'PC-017', tech: 'T1059.001 - PowerShell', desc: 'Hidden encoded download cradle spawned by explorer.exe' },
                { stage: '3. Credential Access', title: 'LSASS Memory Extraction', target: 'PC-017', tech: 'T1003.001 - OS Credential Dump', desc: 'Direct memory handle opened to harvest administrative session tokens' },
                { stage: '4. Discovery', title: 'Subnet SMB Reconnaissance', target: 'FILESERVER-02', tech: 'T1018 - Remote System Discovery', desc: 'Probing ports 445/139 searching for internal central storage shares' },
                { stage: '5. Lateral Movement', title: 'WinRM Remote Execution Pivot', target: 'FILESERVER-02', tech: 'T1021.002 - SMB/Windows Admin Shares', desc: 'Remote service established using stolen tokens to compromise file server' },
                { stage: '6. Database Impact', title: 'Unauthorized DB Query', target: 'DB-01', tech: 'T1005 - Data from Local System', desc: 'Execution of SQL queries extracting 15,000 customer financial records' }
              ].map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-cyber-900 border border-cyber-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 border border-cyan-500/30">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white">{step.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{step.target}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-cyber-800 text-[10px] text-slate-300 font-mono">
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
