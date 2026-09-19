import React from 'react';
import { useStudy, ViewType } from '../context/StudyContext';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  PieChart,
  FileText
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, weakTopics } = useStudy();

  const items = [
    { id: 'overview' as ViewType, label: 'Overview', icon: LayoutDashboard },
    { id: 'notes' as ViewType, label: 'Notes', icon: BookOpen },
    { id: 'quizzes' as ViewType, label: 'Quiz', icon: HelpCircle },
    {
      id: 'weak_topics' as ViewType,
      label: 'Weak',
      icon: AlertTriangle,
      badge: weakTopics.length
    },
    { id: 'coverage' as ViewType, label: 'Gaps', icon: PieChart },
    { id: 'past_papers' as ViewType, label: 'Papers', icon: FileText }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-variant z-50 flex items-center justify-around px-2 shadow-lg">
      {items.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center w-12 py-1 relative transition-colors ${
              isActive ? 'text-primary font-semibold' : 'text-tertiary hover:text-on-surface'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge ? (
                <span className="absolute -top-1 -right-2 bg-error text-on-error font-code-sm text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="font-label-sm text-[10px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
