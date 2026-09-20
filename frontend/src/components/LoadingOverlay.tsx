import React from 'react';
import { Loader2, Sparkles, Database, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const LoadingOverlay: React.FC = () => {
  const { isLoading, loadingStep } = useStudy();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
      <div className="bg-surface border-2 border-primary p-6 md:p-8 max-w-md w-full shadow-archival space-y-5 rounded-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-variant pb-3">
          <div className="flex items-center gap-2 text-primary font-label-stamp text-xs uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4 animate-pulse" />
            <span>Autonomous Exam Intake</span>
          </div>
          <span className="font-code-sm text-[10px] text-tertiary">ASYNC PIPELINE</span>
        </div>

        {/* Content */}
        <div className="flex items-start gap-4">
          <Loader2 className="w-6 h-6 text-primary animate-spin shrink-0 mt-1" />
          <div className="space-y-1">
            <div className="font-title-sm text-on-surface font-semibold">
              Processing Examination Docket
            </div>
            <div className="font-body-sm text-tertiary">
              {loadingStep || 'Analyzing examination materials...'}
            </div>
          </div>
        </div>

        {/* Progress Pipeline Indicators */}
        <div className="pt-2 border-t border-surface-variant/60 grid grid-cols-3 gap-2 text-center font-code-sm text-[10px] text-tertiary">
          <div className="p-1.5 bg-surface-container rounded-sm flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-secondary" />
            <span>Upload</span>
          </div>
          <div className="p-1.5 bg-surface-container rounded-sm flex items-center justify-center gap-1">
            <BrainCircuit className="w-3 h-3 text-primary animate-pulse" />
            <span>OCR & Parse</span>
          </div>
          <div className="p-1.5 bg-surface-container rounded-sm flex items-center justify-center gap-1 opacity-60">
            <span>Synthesis</span>
          </div>
        </div>
      </div>
    </div>
  );
};
