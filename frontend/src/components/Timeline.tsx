import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, Terminal, User, Laptop } from 'lucide-react';
import { TimelineItem } from '../types';

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="soc-panel p-6 text-center text-soc-muted text-xs font-mono">
        No chronological timeline events recorded.
      </div>
    );
  }

  return (
    <div className="soc-panel p-5">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-soc-border">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-soc-blue" />
          <h3 className="text-xs font-semibold text-soc-text uppercase font-mono tracking-wide">
            Attack Chronology & Telemetry Progression
          </h3>
        </div>
        <span className="text-[10px] text-soc-muted font-mono">
          {items.length} Correlated Steps
        </span>
      </div>

      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-soc-border">
        {items.map((item, index) => {
          const time = item.timestamp.includes('T')
            ? item.timestamp.split('T')[1].slice(0, 8)
            : item.timestamp;

          const isHighRisk = item.risk_contribution >= 20;

          return (
            <div key={index} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full border border-soc-panel transition-transform group-hover:scale-125 ${
                  isHighRisk
                    ? 'bg-soc-critical'
                    : 'bg-soc-blue'
                }`}
              />

              <div className="p-3 rounded-md bg-soc-card border border-soc-border hover:border-soc-borderMuted transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-soc-blue bg-soc-panel px-1.5 py-0.2 rounded border border-soc-border">
                      {time}
                    </span>
                    <span className="text-xs font-bold text-soc-text font-mono">
                      {item.event_id}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-soc-secondary font-mono bg-soc-elevated px-1.5 py-0.2 rounded">
                      {item.event_type}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                      isHighRisk
                        ? 'bg-soc-critical/15 text-soc-critical border border-soc-critical/30'
                        : 'bg-soc-blue/15 text-soc-blue border border-soc-blue/30'
                    }`}
                  >
                    Risk +{item.risk_contribution}
                  </span>
                </div>

                <p className="text-xs text-soc-text mb-1.5">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-soc-muted pt-1.5 border-t border-soc-border font-mono">
                  <span className="text-soc-cyan">{item.relationship_to_incident}</span>
                  {item.source && (
                    <span>• Source: <strong className="text-soc-secondary">{item.source}</strong></span>
                  )}
                  {item.destination && (
                    <span>• Dest: <strong className="text-soc-secondary">{item.destination}</strong></span>
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
