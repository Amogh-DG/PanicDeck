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
    user,
    setCurrentView,
    topics,
    weakTopics,
    coverageGaps,
    uploadedFiles,
    scoreHistory,
    handleLoadQuiz
  } = useStudy();

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  const hasScores = scoreHistory && scoreHistory.length > 0;
  const latestScore = hasScores ? scoreHistory[0] : null;
  const calculatedAccuracy = hasScores
    ? Math.round(
        (scoreHistory.reduce((acc, s) => acc + Number(s.overall_accuracy || 0), 0) /
          scoreHistory.length) *
          10
      ) / 10
    : 0;

  const hasTopics = topics.length > 0;
  const totalTopics = topics.length + (coverageGaps.length || 0);
  const coveragePct = hasTopics ? Math.round((topics.length / Math.max(1, totalTopics)) * 100) : 0;

  const hasWeak = weakTopics && weakTopics.length > 0;

  const handleStartQuiz = async () => {
    await handleLoadQuiz();
    setCurrentView('quizzes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Greeting Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight leading-none">
            Good morning{firstName ? `, ${firstName}` : ''}.
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
            onClick={() => setCurrentView(hasTopics ? 'coverage' : 'notes')}
            className="p-5 bg-surface-container border border-surface-variant rounded-md cursor-pointer hover:border-primary transition-all space-y-3"
          >
            <div className="flex items-center justify-between font-label-sm text-xs text-tertiary">
              <span>Topics Covered</span>
              <span className="font-code-sm text-primary font-bold">
                {hasTopics ? `${coveragePct}% Complete` : '0% Complete'}
              </span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              {topics.length}{' '}
              <span className="text-body-lg text-tertiary font-normal">
                {hasTopics ? `/ ${totalTopics} Topics` : 'Topics Extracted'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${coveragePct}%` }}
              ></div>
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>
                {hasTopics
                  ? coverageGaps.length > 0
                    ? `${coverageGaps.length} remaining to review`
                    : 'Full notes coverage'
                  : 'No lecture dossiers parsed'}
              </span>
              <span className="text-primary font-medium">
                {hasTopics ? 'Audit Gaps →' : 'Upload Notes →'}
              </span>
            </div>
          </div>

          {/* Card 2: Quiz Accuracy */}
          <div
            onClick={() => setCurrentView('quizzes')}
            className="p-5 bg-surface-container border border-surface-variant rounded-md cursor-pointer hover:border-secondary transition-all space-y-3"
          >
            <div className="flex items-center justify-between font-label-sm text-xs text-tertiary">
              <span>Quiz Accuracy</span>
              <span className="font-code-sm text-secondary font-bold">
                {hasScores
                  ? `${scoreHistory.length} drill${scoreHistory.length > 1 ? 's' : ''} logged`
                  : 'No drills taken'}
              </span>
            </div>
            <div className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              {hasScores ? `${calculatedAccuracy}%` : '--%'}
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${hasScores ? Math.min(100, calculatedAccuracy) : 0}%` }}
              ></div>
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>
                {latestScore
                  ? `Latest: ${latestScore.correct_count}/${latestScore.total_questions} correct`
                  : 'First-pass active recall'}
              </span>
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
              {hasWeak
                ? weakTopics.slice(0, 2).map((w) => w.name).join(', ')
                : 'No Blindspots Flagged'}
            </div>
            <div className="font-body-sm text-[11px] text-tertiary flex items-center justify-between">
              <span>{hasWeak ? 'Ranked by exam frequency' : 'All clear across drills'}</span>
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
          {hasWeak ? (
            <>
              “Actuarial diagnostic flagged high-priority blindspot in{' '}
              <strong className="text-primary">{weakTopics[0].name}</strong> ({weakTopics[0].reason}). High-frequency exam weighting recommends targeted recall drills before your next session.”
            </>
          ) : hasScores ? (
            <>
              “Current aggregate recall accuracy across {scoreHistory.length} drill session
              {scoreHistory.length > 1 ? 's' : ''} stands at{' '}
              <strong className="text-secondary">{calculatedAccuracy}%</strong>. Continue completing active recall drills to refine causal diagnostics.”
            </>
          ) : hasTopics ? (
            <>
              “{topics.length} topic module{topics.length > 1 ? 's' : ''} synthesized from your lecture vault. Launch your first recall drill to generate cognitive diagnostics and identify high-yield exam blindspots.”
            </>
          ) : (
            <>
              “Commit lecture slides, handwritten notes, or syllabus files into the vault to generate topic summaries, active recall drills, and causal diagnostics.”
            </>
          )}
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
                [{uploadedFiles.length.toString().padStart(2, '0')} RECENT FILES]
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
              {hasWeak ? '90 MIN RESERVED' : hasTopics ? '75 MIN RESERVED' : '45 MIN RESERVED'}
            </span>
          </div>

          <div className="p-4 bg-surface-container border border-surface-variant rounded-md space-y-3">
            <div className="space-y-2.5 font-body-sm text-xs">
              {hasWeak ? (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>1. Targeted drill: {weakTopics[0].name} (20m)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>
                      2. Review notes:{' '}
                      {weakTopics[1] ? weakTopics[1].name : (topics[0]?.name || 'Flagged blindspots')}{' '}
                      (25m)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>3. Rapid 15-question past paper mock sprint (45m)</span>
                  </label>
                </>
              ) : hasTopics ? (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>1. Review synthesized dossier: {topics[0].name} (20m)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>2. Complete 15-question active recall drill (25m)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>3. Audit syllabus coverage gaps (30m)</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>1. Commit course slides or handwritten notes into vault (15m)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>2. Cross-reference syllabus to audit coverage gaps (15m)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-on-surface">
                    <input
                      type="checkbox"
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span>3. Launch first baseline active recall drill (15m)</span>
                  </label>
                </>
              )}
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
