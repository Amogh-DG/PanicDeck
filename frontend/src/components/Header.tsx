import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Sun, Moon, Sparkles, BookOpen, Clock, AlertCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme, currentView, setCurrentView } = useStudy();
  const [countdown, setCountdown] = useState({ days: 6, hours: 14, mins: 22, secs: 40 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 border-b border-surface-variant px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left Mobile Brand / Desktop Marginalia */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 cursor-pointer md:hidden hover:opacity-80"
        >
          <span className="font-headline-md text-headline-md text-on-surface font-normal">PanicDesk</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-tertiary">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-medium">
            [EXAM ARCHIVE]
          </span>
          <span className="text-outline-variant font-label-sm">/</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            NIGHT-SHIFT STUDY VAULT
          </span>
        </div>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Countdown Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container border border-surface-variant rounded-sm">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline font-label-sm text-label-sm text-tertiary tracking-wider uppercase">
            EXAM COUNTDOWN:
          </span>
          <span className="font-code-sm text-code-sm text-on-surface font-semibold">
            {format2(countdown.days)}D : {format2(countdown.hours)}H : {format2(countdown.mins)}M : {format2(countdown.secs)}S
          </span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Parchment'}
          className="p-2 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-variant text-on-surface transition-all"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-tertiary" />
          ) : (
            <Sun className="w-4 h-4 text-primary" />
          )}
        </button>

        {/* User Session Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-xs font-semibold shadow-sm">
          PD
        </div>
      </div>
    </header>
  );
};
