import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, Terminal, User, Laptop } from 'lucide-react';
import { TimelineItem } from '../types';

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 text-xs">
        No chronological timeline events recorded.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyber-800">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Incident Chronological Timeline
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {items.length} Correlated Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-blue-500 before:to-rose-500">
        {items.map((item, index) => {
          const time = item.timestamp.includes('T')
            ? item.timestamp.split('T')[1].slice(0, 8)
            : item.timestamp;

          const isHighRisk = item.risk_contribution >= 20;

          return (
            <div key={index} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                  isHighRisk
                    ? 'bg-rose-500 border-cyber-950 shadow-rose-500/50 shadow-md'
                    : 'bg-cyan-400 border-cyber-950 shadow-cyan-400/50 shadow-sm'
                }`}
              />

              <div className="p-3.5 rounded-xl bg-cyber-900/80 border border-cyber-800/80 hover:border-cyber-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyber-950 px-2 py-0.5 rounded border border-cyber-800">
                      {time}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {item.event_id}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono bg-cyber-800 px-1.5 py-0.5 rounded">
                      {item.event_type}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isHighRisk
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    Risk +{item.risk_contribution}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-2 border-t border-cyber-800/60 font-mono">
                  <span className="text-cyan-300">{item.relationship_to_incident}</span>
                  {item.source && (
                    <span>• Source: <strong className="text-slate-300">{item.source}</strong></span>
                  )}
                  {item.destination && (
                    <span>• Dest: <strong className="text-slate-300">{item.destination}</strong></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
