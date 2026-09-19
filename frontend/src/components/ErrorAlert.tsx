import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const ErrorAlert: React.FC = () => {
  const { error, clearError } = useStudy();

  if (!error) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 max-w-lg z-50 bg-error-container border border-error text-on-error-container p-4 rounded-md shadow-lg flex items-start justify-between gap-3 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-title-sm text-xs uppercase font-bold tracking-wide">
            Pipeline Exception
          </div>
          <div className="font-body-sm text-xs leading-relaxed">{error}</div>
        </div>
      </div>
      <button
        onClick={clearError}
        className="p-1 hover:bg-error/10 rounded text-on-error-container/70 hover:text-on-error-container"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
