import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Plus,
  HelpCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  BookOpen
} from 'lucide-react';

export const OverviewView: React.FC = () => {
  const {
    setCurrentView,
    topics,
    weakTopics,
    coverageGaps,
    uploadedFiles,
    handleLoadQuiz
  } = useStudy();

  const handleStartQuiz = async () => {
    await handleLoadQuiz();
    setCurrentView('quizzes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Archival Page Index Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
            [FOLIO // 084]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            SEMESTER FINALS DESK REGISTER
          </span>
        </div>
        <div className="flex items-center gap-3 text-tertiary font-label-sm text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
          <span>DESK STATUS: UNINTERRUPTED</span>
          <span className="text-surface-variant">/</span>
          <span className="font-code-sm text-on-surface">ROOM 412B</span>
        </div>
      </div>

      {/* Hero Greeting Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-none">
            Good morning.
          </h1>
          <p className="font-body-lg text-body-lg text-tertiary italic">
            “Let’s make the panic useful.”
          </p>
        </div>

        {/* Quiet Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentView('notes')}
            className="px-4 py-2.5 bg-inverse-surface text-inverse-on-surface font-title-sm text-xs rounded-md shadow-sm flex items-center gap-2 hover:translate-y-[-1px] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add study material</span>
          </button>
          <button
            onClick={handleStartQuiz}
            className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-title-sm text-xs rounded-md flex items-center gap-2 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Start a quiz drill</span>
          </button>
        </div>
      </div>

      {/* Section I: Status Ledger (Metric Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
          <span className="font-label-stamp text-xs text-secondary uppercase tracking-wider">
            [SECTION I // STATUS LEDGER]
          </span>
          <span className="font-code-sm text-xs text-tertiary">AGGREGATE COVERAGE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Syllabus Coverage */}
          <div
            onClick={() => setCurrentView('coverage')}
            className="p-5 bg-surface-container border border-surface-variant rounded-md cursor-pointer hover:border-primary transition-all space-y-3"
          >
            <div className="flex items-center justify-between font-label-sm text-xs text-tertiary">
              <span>Topics Covered</span>
              <span className="font-code-sm text-primary font-bold">73% Complete</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              38 <span className="text-body-lg text-tertiary font-normal">/ 52 Topics</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '73%' }}></div>
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>14 remaining to review</span>
              <span className="text-primary font-medium">Audit Gaps →</span>
            </div>
          </div>

          {/* Card 2: Quiz Accuracy */}
          <div
            onClick={() => setCurrentView('quizzes')}
            className="p-5 bg-surface-container border border-surface-variant rounded-md cursor-pointer hover:border-secondary transition-all space-y-3"
          >
            <div className="flex items-center justify-between font-label-sm text-xs text-tertiary">
              <span>Quiz Accuracy</span>
              <span className="font-code-sm text-secondary font-bold">+4.2% today</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              81.4%
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '81.4%' }}></div>
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>First-pass active recall</span>
              <span className="text-secondary font-medium">Launch Drill →</span>
            </div>
          </div>

          {/* Card 3: Weak Topics Flagged */}
          <div
            onClick={() => setCurrentView('weak_topics')}
            className="p-5 bg-surface-container border border-surface-variant rounded-md cursor-pointer hover:border-error transition-all space-y-3"
          >
            <div className="flex items-center justify-between font-label-sm text-xs text-tertiary">
              <span>Weak Topics Flagged</span>
              <span className="font-code-sm text-error font-bold">Priority Review</span>
            </div>
            <div className="font-headline-lg text-headline-lg text-error font-semibold flex items-center gap-2">
              <span>{weakTopics.length.toString().padStart(2, '0')}</span>
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div className="font-code-sm text-xs text-on-surface-variant truncate">
              {weakTopics.slice(0, 2).map((w) => w.name.split(' ')[0]).join(', ')}...
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>Ranked by exam frequency</span>
              <span className="text-error font-medium">Inspect List →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section II: Cognitive Insight Banner */}
      <section className="p-5 bg-surface-container-low border border-outline-variant/60 rounded-md space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-label-stamp text-xs uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span>[OBSERVED STUDY PATTERN]</span>
          </div>
          <span className="font-code-sm text-xs text-tertiary">#DIAG-04</span>
        </div>
        <p className="font-body-md text-on-surface leading-relaxed">
          “Your retention drops sharply on quiz questions attempted after <strong className="text-primary">1:15 AM</strong>, while your error rate in <strong className="text-secondary">Virtual Memory Paging</strong> stems mostly from multi-level page table lookups rather than TLB calculations.”
        </p>
      </section>

      {/* Section III & IV: Continue Studying + Desk Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Continue Studying Recent Files (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
            <div className="flex items-baseline gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Continue studying
              </h2>
              <span className="font-code-sm text-xs text-tertiary">
                [03 RECENT FILES]
              </span>
            </div>
            <button
              onClick={() => setCurrentView('notes')}
              className="text-primary hover:underline font-title-sm text-xs"
            >
              View All Archive →
            </button>
          </div>

          <div className="space-y-3">
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, idx) => (
                <div
                  key={file.id}
                  onClick={() => setCurrentView('notes')}
                  className="p-4 bg-surface-container border border-surface-variant rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-code-sm text-xs text-tertiary mt-1">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-title-sm text-sm text-on-surface truncate font-semibold">
                        {file.name.replace('.pdf', '').replace(/_/g, ' ')}
                      </div>
                      <div className="font-body-sm text-xs text-tertiary mt-0.5">
                        Uploaded {file.uploadedAt} • {file.size}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-primary font-title-sm text-xs">
                    <span>Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 bg-surface-container border border-surface-variant rounded-md text-center space-y-3">
                <FileText className="w-8 h-8 text-tertiary mx-auto opacity-50" />
                <div className="font-title-sm text-sm text-on-surface font-medium">
                  No lecture dossiers uploaded yet
                </div>
                <p className="font-body-sm text-xs text-tertiary max-w-sm mx-auto">
                  Commit your course slides, handwritten notes, or syllabus into the vault to generate topic summaries.
                </p>
                <button
                  onClick={() => setCurrentView('notes')}
                  className="px-4 py-2 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container"
                >
                  Upload First Dossier
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Tonight's Desk Queue Sprint (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-variant">
            <div className="flex items-baseline gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Desk Queue
              </h2>
              <span className="font-code-sm text-xs text-tertiary">[TONIGHT]</span>
            </div>
            <span className="font-code-sm text-xs text-primary font-bold">
              90 MIN RESERVED
            </span>
          </div>

          <div className="p-4 bg-surface-container border border-surface-variant rounded-md space-y-3">
            <div className="space-y-2.5 font-body-sm text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="line-through text-tertiary">
                  1. Re-derive Mundell-Fleming small open economy (20m)
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>2. Flashcard drill: Carbonyl nucleophilic additions (25m)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                <input
                  type="checkbox"
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span>3. Rapid 15-question past paper mock sprint (45m)</span>
              </label>
            </div>

            <div className="pt-3 border-t border-surface-variant flex items-center justify-between text-[11px] text-tertiary font-code-sm">
              <span>Goal: 100% High-Yield Mastery</span>
              <button
                onClick={handleStartQuiz}
                className="text-secondary font-bold hover:underline"
              >
                Launch Drill →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
