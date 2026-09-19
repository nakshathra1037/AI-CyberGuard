import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Terminal, 
  Network, 
  FileText, 
  Cpu, 
  Settings, 
  Layers,
  Activity,
  Radio
} from 'lucide-react';

interface SidebarProps {
  activeIncidentId?: string;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeIncidentId, isCollapsed = false }) => {
  const location = useLocation();

  const navGroups = [
    {
      label: 'MONITOR',
      items: [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Events', path: '/events', icon: Terminal },
        { name: 'Incidents', path: '/incidents', icon: ShieldAlert },
      ]
    },
    {
      label: 'INVESTIGATE',
      items: [
        { 
          name: 'Incident Detail', 
          path: `/incidents/${activeIncidentId || 'INC-1024'}`, 
          icon: Layers,
          matchPrefix: '/incidents/'
        },
        { name: 'Threat Intelligence', path: '/intelligence', icon: Network },
      ]
    },
    {
      label: 'OPERATE',
      items: [
        { 
          name: 'Reports', 
          path: `/reports/${activeIncidentId || 'INC-1024'}`, 
          icon: FileText,
          matchPrefix: '/reports/'
        },
        { name: 'Attack Simulator', path: '/simulator', icon: Cpu },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Administration', path: '/admin', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-56 bg-soc-panel border-r border-soc-border flex flex-col shrink-0 select-none">
      <div className="flex-1 py-4 px-2.5 space-y-5 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-semibold text-soc-muted tracking-wider uppercase font-mono">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPrefix 
                  ? location.pathname.startsWith(item.matchPrefix) 
                  : location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-soc-blue/15 text-soc-blue font-semibold border-l-2 border-soc-blue'
                        : 'text-soc-secondary hover:text-soc-text hover:bg-soc-elevated'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-soc-blue' : 'text-soc-muted'}`} />
                    <span className="truncate">{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Subtle Bottom System Status */}
      <div className="p-3 border-t border-soc-border bg-soc-card">
        <div className="flex items-center justify-between text-[11px] text-soc-muted">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-soc-success animate-status-pulse" />
            ENGINE ACTIVE
          </span>
          <span className="font-mono text-[10px] text-soc-muted">v2.4</span>
        </div>
      </div>
    </aside>
  );
};
