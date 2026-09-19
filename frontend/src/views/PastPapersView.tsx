import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  FileText,
  Upload,
  TrendingUp,
  Award,
  HelpCircle,
  Calendar,
  Filter,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const PastPapersView: React.FC = () => {
  const {
    weightedTopics,
    handleUploadPastPapers,
    handleLoadQuiz,
    setCurrentView
  } = useStudy();

  const [onlyHighYield, setOnlyHighYield] = useState<boolean>(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadPastPapers(Array.from(e.target.files));
    }
  };

  const filtered = onlyHighYield
    ? weightedTopics.filter((w) => w.weight === 'high')
    : weightedTopics;

  const handleLaunchPastPaperQuiz = async () => {
    await handleLoadQuiz();
    setCurrentView('quizzes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
            [FOLIO // 089]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            PAST-PAPER HISTORICAL OCCURRENCE INDEX (2018–2024)
          </span>
        </div>
        <div className="font-code-sm text-xs text-tertiary">
          ACTUARIAL YIELD ENGINE
        </div>
      </div>

      {/* Header Banner & Uploader */}
      <div className="p-6 bg-surface-container border border-surface-variant rounded-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Past-Paper Frequency Weighting
          </h1>
          <p className="font-body-sm text-xs text-tertiary leading-relaxed">
            Analyze 5–10 years of historical exam papers. Bedrock extracts questions and calculates the statistical probability of each topic appearing on your upcoming paper.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <label className="px-4 py-2 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 transition-all">
            <Upload className="w-4 h-4" />
            <span>Deposit Past Papers (PDF)</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInput}
              accept=".pdf"
            />
          </label>
          <button
            onClick={handleLaunchPastPaperQuiz}
            className="px-4 py-2 bg-inverse-surface text-inverse-on-surface font-title-sm text-xs rounded-md shadow-sm flex items-center gap-2 hover:translate-y-[-1px] transition-all"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Drill High-Yield Questions</span>
          </button>
        </div>
      </div>

      {/* Filter & Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-surface-variant">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOnlyHighYield(!onlyHighYield)}
            className={`px-3 py-1.5 rounded-md font-title-sm text-xs flex items-center gap-2 border transition-all ${
              onlyHighYield
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container text-tertiary border-outline-variant hover:text-on-surface'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>High-Yield Only (&gt;25% Recurrence)</span>
          </button>
        </div>
        <div className="font-code-sm text-xs text-tertiary">
          SHOWING {filtered.length} OF {weightedTopics.length} TOPICS
        </div>
      </div>

      {/* Frequency Distribution Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((topic, idx) => {
            const isHigh = topic.weight === 'high';
            const isMed = topic.weight === 'medium';
            const percentage = Math.min(100, topic.frequency * 16);

            return (
              <div
                key={topic.topic_id || idx}
                className={`p-6 bg-surface-container border rounded-md shadow-sm space-y-4 transition-all ${
                  isHigh
                    ? 'border-primary/60 bg-primary/5 hover:border-primary'
                    : 'border-surface-variant hover:border-outline-variant'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-variant/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-code-sm text-xs text-tertiary font-bold">
                      0{idx + 1}
                    </span>
                    <h3 className="font-title-md text-base text-on-surface font-semibold">
                      {topic.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded font-label-stamp text-[10px] uppercase font-bold tracking-wider ${
                        isHigh
                          ? 'bg-primary text-on-primary'
                          : isMed
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container-highest text-tertiary'
                      }`}
                    >
                      {topic.weight.toUpperCase()} YIELD
                    </span>
                    <span className="font-code-sm text-xs text-on-surface font-bold">
                      {topic.frequency}x Occurrences
                    </span>
                  </div>
                </div>

                {/* Recurrence progress visualizer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-code-sm text-xs text-tertiary">
                    <span>Exam Recurrence Yield</span>
                    <span className="font-bold text-on-surface">{percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh ? 'bg-primary' : isMed ? 'bg-secondary' : 'bg-tertiary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Years Seen Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-4 font-body-sm text-xs text-tertiary">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-label-sm text-[11px] text-tertiary uppercase">
                      Seen in Exam Years:
                    </span>
                    {topic.years_seen.map((yr) => (
                      <span
                        key={yr}
                        className="px-2 py-0.5 bg-surface-container-high border border-outline-variant rounded text-on-surface font-code-sm text-[11px]"
                      >
                        {yr}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={handleLaunchPastPaperQuiz}
                    className="text-primary hover:underline font-title-sm text-xs font-semibold"
                  >
                    Generate Drill on this Topic →
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 bg-surface-container border border-surface-variant rounded-md text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <BarChart3 className="w-10 h-10 text-primary mx-auto opacity-70" />
            <div className="space-y-1">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Historical Yield Matrix Ready
              </h3>
              <p className="font-body-sm text-xs text-tertiary">
                Deposit past exam papers (2018–2024) to calculate statistical question frequencies and topic weights.
              </p>
            </div>
            <label className="px-5 py-2.5 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Deposit Past Papers (PDF)</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
