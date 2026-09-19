import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Sun, Moon, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme, setCurrentView, user, logout } = useStudy();
  const [imgError, setImgError] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'PD';

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 border-b border-surface-variant px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 cursor-pointer md:hidden hover:opacity-80"
        >
          <span className="font-headline-md text-headline-md text-on-surface font-normal">PanicDeck</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-tertiary">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-medium">
            [EXAM ARCHIVE]
          </span>
          <span className="text-outline-variant font-label-sm">/</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">
            {user?.email || 'NIGHT-SHIFT STUDY VAULT'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">

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

        <div className="flex items-center gap-2">
          {user?.picture && !imgError ? (
            <img
              src={user.picture}
              alt={user.name || 'User profile'}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className="w-8 h-8 rounded-full border border-primary/40 object-cover shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-xs font-semibold shrink-0 shadow-sm">
              {userInitials}
            </div>
          )}

          <button
            onClick={logout}
            title="Sign out of current desk"
            className="p-1.5 text-tertiary hover:text-error transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
