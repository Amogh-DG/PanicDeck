import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  AlertTriangle,
  Flame,
  ArrowRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Severity } from '../api/types';

export const WeakTopicsView: React.FC = () => {
  const { weakTopics, handleLoadQuiz, setCurrentView } = useStudy();

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded bg-error-container text-on-error-container font-label-stamp text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-error fill-error" />
            CRITICAL BLINDSPOT
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded bg-warning-bg text-warning font-label-stamp text-[10px] uppercase font-bold tracking-wider border border-warning/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-warning" />
            NEEDS REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded bg-surface-container-highest text-tertiary font-label-stamp text-[10px] uppercase font-bold tracking-wider">
            STABLE RECALL
          </span>
        );
    }
  };

  const handleLaunchTargetedDrill = async () => {
    await handleLoadQuiz();
    setCurrentView('quizzes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-error uppercase tracking-widest">
            [FOLIO // 087]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            ACTUARIAL WEAK-TOPICS RANKING MATRIX
          </span>
        </div>
        <div className="font-code-sm text-xs text-error font-bold flex items-center gap-1">
          <span>{weakTopics.length} PRIORITY TOPICS FLAGGED</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-none">
            What to study next.
          </h1>
          <p className="font-body-lg text-body-lg text-tertiary italic">
            “Ranked by exam occurrence, syllabus requirement, and active recall performance.”
          </p>
        </div>

        <button
          onClick={handleLaunchTargetedDrill}
          className="px-5 py-2.5 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container flex items-center gap-2 self-start md:self-auto"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Launch Emergency 15-Question Drill</span>
        </button>
      </div>

      {/* Ranked List */}
      <div className="space-y-4">
        {weakTopics.map((topic, idx) => (
          <div
            key={topic.topic_id || idx}
            className={`p-6 bg-surface-container border rounded-md shadow-sm transition-all space-y-4 ${
              topic.severity === 'high'
                ? 'border-error/60 bg-error-container/5 hover:border-error'
                : 'border-surface-variant hover:border-outline-variant'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded bg-surface-container-highest flex items-center justify-center font-code-sm text-xs text-tertiary font-bold">
                  #{idx + 1}
                </span>
                <span className="font-code-sm text-xs text-primary font-semibold">
                  TOPIC ID: {topic.topic_id}
                </span>
              </div>
              <div>{getSeverityBadge(topic.severity)}</div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {topic.name}
              </h3>
              <p className="font-body-md text-sm text-on-surface-variant">
                <strong className="text-primary font-semibold">Causal Diagnostic:</strong> {topic.reason}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 font-body-sm text-xs text-tertiary">
              <div className="flex items-center gap-4">
                <span>Historical Exam Yield: <strong className="text-on-surface">35%</strong></span>
                <span>•</span>
                <span>Confidence: <strong className="text-error">Low (33%)</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('notes')}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface rounded font-title-sm flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-tertiary" />
                  <span>Review Notes</span>
                </button>
                <button
                  onClick={handleLaunchTargetedDrill}
                  className="px-3 py-1.5 bg-inverse-surface hover:bg-inverse-surface/90 text-inverse-on-surface rounded font-title-sm flex items-center gap-1.5"
                >
                  <span>Drill Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
