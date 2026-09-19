import React from 'react';
import { useStudy, ViewType } from '../context/StudyContext';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  PieChart,
  FileText,
  LogOut,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: ViewType;
  label: string;
  code: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, weakTopics, coverageGaps, logout } = useStudy();

  const navItems: NavItem[] = [
    {
      id: 'overview',
      code: '01',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'notes',
      code: '02',
      label: 'Notes & Ingest',
      icon: BookOpen,
    },
    {
      id: 'quizzes',
      code: '03',
      label: 'Quizzes Drill',
      icon: HelpCircle,
    },
    {
      id: 'weak_topics',
      code: '04',
      label: 'Weak Topics',
      icon: AlertTriangle,
      badge: weakTopics.length > 0 ? `${weakTopics.length}` : undefined,
    },
    {
      id: 'coverage',
      code: '05',
      label: 'Coverage Gaps',
      icon: PieChart,
      badge: coverageGaps.length > 0 ? `${coverageGaps.length}` : undefined,
    },
    {
      id: 'past_papers',
      code: '06',
      label: 'Past Papers',
      icon: FileText,
    },
  ];

  return (
    <aside className="hidden md:flex fixed top-0 left-0 w-64 h-full bg-surface-container-low border-r border-surface-variant flex-col justify-between z-50 transition-colors duration-200">
      {/* Top Header / Branding */}
      <div>
        <div 
          onClick={() => setCurrentView('landing')}
          className="h-16 px-6 border-b border-surface-variant flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-headline-md text-on-surface font-normal">
                PanicDesk<span className="text-primary italic">.</span>
              </span>
            </div>
            <div className="font-label-sm text-[10px] text-tertiary tracking-widest uppercase -mt-1">
              Vol. IV Reading Desk
            </div>
          </div>
          <span className="font-code-sm text-[11px] px-1.5 py-0.5 bg-surface-container text-tertiary border border-surface-variant rounded-sm">
            v1.4
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 font-label-sm text-[10px] text-tertiary uppercase tracking-widest">
            Study Modules
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-all ${
                  isActive
                    ? 'bg-surface-container-highest text-on-surface font-semibold shadow-sm border border-surface-variant'
                    : 'text-tertiary hover:text-on-surface hover:bg-surface-container/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-code-sm text-xs opacity-60">{item.code}</span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-tertiary'}`} />
                  <span className="font-title-sm text-title-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`font-code-sm text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      item.id === 'weak_topics'
                        ? 'bg-error-container text-on-error-container'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Desk Status & Links */}
      <div className="p-4 border-t border-surface-variant space-y-3">
        {/* Reading Room Desk Status */}
        <div className="p-3 bg-surface-container rounded-md border border-surface-variant space-y-1.5">
          <div className="flex items-center justify-between font-label-sm text-[10px] text-tertiary uppercase">
            <span>Reading Room</span>
            <span className="inline-flex items-center gap-1 text-secondary font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              ACTIVE
            </span>
          </div>
          <div className="font-code-sm text-xs text-on-surface font-semibold">
            DESK #412B // OXFORD STACK
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center justify-between pt-1 text-tertiary font-label-sm text-xs">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Tripos Ledger</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 hover:text-error transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch Desk</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
