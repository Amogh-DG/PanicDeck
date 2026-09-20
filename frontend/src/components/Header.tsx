import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Plus,
  Check,
  BookOpen,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    setCurrentView,
    user,
    logout,
    subjects,
    currentSubject,
    currentSubjectId,
    setCurrentSubjectId,
    addSubject
  } = useStudy();

  const [imgError, setImgError] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newSubjectCode, setNewSubjectCode] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

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

  const handleOpenAddSubject = () => {
    setIsDropdownOpen(false);
    setIsAddModalOpen(true);
  };

  const handleCreateSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectCode.trim()) return;
    addSubject(newSubjectName.trim(), newSubjectCode.trim());
    setNewSubjectName('');
    setNewSubjectCode('');
    setIsAddModalOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-surface/90 backdrop-blur-md z-40 border-b border-surface-variant px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Mobile Brand */}
        <div
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2 cursor-pointer md:hidden hover:opacity-80"
        >
          <span className="font-headline-md text-headline-md text-on-surface font-normal">PanicDeck</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        </div>

        {/* Desktop Header Left: [EXAM ARCHIVE] + Subject Selector Dropdown */}
        <div className="hidden md:flex items-center gap-3 text-tertiary">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-medium">
            [EXAM ARCHIVE]
          </span>
          <span className="text-outline-variant font-label-sm">/</span>

          {/* Subject Selector Dropdown next to [EXAM ARCHIVE] */}
          {subjects.length === 0 ? (
            <button
              onClick={handleOpenAddSubject}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-all text-left shadow-sm group font-title-sm text-xs"
              title="Add your first study subject desk"
            >
              <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">No Subject Created • Add Subject</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container hover:bg-surface-container-high border border-surface-variant text-on-surface transition-all text-left group shadow-sm"
                title="Switch Active Subject Desk"
                aria-label="Select Subject"
              >
                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="flex items-baseline gap-1.5 max-w-[200px] lg:max-w-[320px] truncate">
                  <span className="font-code-sm text-xs text-primary font-bold shrink-0">
                    {currentSubject?.code || 'SUB'}:
                  </span>
                  <span className="font-title-sm text-xs text-on-surface truncate">
                    {currentSubject?.name || 'Select Subject'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-tertiary transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-primary' : 'group-hover:text-on-surface'
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-surface border border-surface-variant rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2 border-b border-surface-variant/80 flex items-center justify-between bg-surface-container-low">
                    <span className="font-label-stamp text-[10px] text-tertiary uppercase tracking-wider">
                      COURSE DESK REGISTRY
                    </span>
                    <span className="font-code-sm text-[10px] text-primary font-bold">
                      {subjects.length} ACTIVE
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                    {subjects.map((sub) => {
                      const isSelected = sub.id === currentSubjectId;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setCurrentSubjectId(sub.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-primary/15 text-primary font-semibold'
                              : 'hover:bg-surface-container text-on-surface'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-code-sm text-[10px] uppercase font-bold shrink-0">
                              {sub.code}
                            </span>
                            <span className="font-title-sm text-xs truncate">
                              {sub.name}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-1.5 border-t border-surface-variant/80 bg-surface-container-low">
                    <button
                      onClick={handleOpenAddSubject}
                      className="w-full px-3 py-2 rounded-md bg-surface-container hover:bg-surface-container-high border border-outline-variant text-primary hover:text-primary font-title-sm text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Subject</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Subject Selector */}
        <div className="flex md:hidden items-center gap-2">
          {subjects.length === 0 ? (
            <button
              onClick={handleOpenAddSubject}
              className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-[11px] font-title-sm text-primary flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="px-2.5 py-1 rounded bg-surface-container border border-surface-variant text-[11px] font-code-sm text-primary flex items-center gap-1.5 max-w-[140px] truncate"
            >
              <span className="font-bold truncate">{currentSubject?.code || 'SUB'}</span>
              <ChevronDown className="w-3 h-3 shrink-0 text-tertiary" />
            </button>
          )}
        </div>
      </div>

      {/* Header Right: Theme Switcher & User Profile */}
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

      {/* Add New Subject Modal Dialog - Fixed full-screen viewport overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-surface border border-surface-variant rounded-xl p-6 shadow-2xl space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-surface-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
                  [NEW DESK]
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                  Add New Subject
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewSubjectCode('');
                  setNewSubjectName('');
                }}
                className="text-tertiary hover:text-on-surface p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">
                  Subject / Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-402, MATH-310, PHY-201"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-md text-on-surface font-code-sm text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider block">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Operating Systems"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant rounded-md text-on-surface font-title-sm text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewSubjectCode('');
                    setNewSubjectName('');
                  }}
                  className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface rounded-md font-title-sm text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSubjectName.trim() || !newSubjectCode.trim()}
                  className="px-4 py-2 bg-primary text-on-primary rounded-md font-title-sm text-xs shadow-sm hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Subject Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
