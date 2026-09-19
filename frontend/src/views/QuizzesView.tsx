import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';

export const QuizzesView: React.FC = () => {
  const {
    questions,
    quizAnswers,
    quizSubmitted,
    quizScore,
    handleAnswerQuestion,
    handleSubmitQuiz,
    handleResetQuiz,
    handleLoadQuiz,
    setCurrentView
  } = useStudy();

  const [currentIdx, setCurrentIdx] = useState<number>(0);

  const currentQ = questions[currentIdx] || questions[0];

  const answeredCount = Object.keys(quizAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
            [FOLIO // 086]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            EMERGENCY ACTIVE RECALL DRILL ENGINE
          </span>
        </div>
        <div className="font-code-sm text-xs text-tertiary">
          WEIGHTED BY PAST-PAPER OCCURRENCE
        </div>
      </div>

      {/* Quiz Result Banner if Submitted */}
      {quizSubmitted && quizScore && (
        <div className="p-6 bg-surface-container border-2 border-primary rounded-md shadow-archival space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-lg font-bold">
                {Math.round((quizScore.correct / quizScore.total) * 100)}%
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Drill Completed: {quizScore.correct} / {quizScore.total} Correct
                </h3>
                <p className="font-body-sm text-xs text-tertiary">
                  Results have been piped into the Actuarial Weak-Topics Matrix.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleResetQuiz}
                className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-title-sm text-xs rounded-md flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Drill</span>
              </button>
              <button
                onClick={() => setCurrentView('weak_topics')}
                className="px-4 py-2 bg-primary text-on-primary font-title-sm text-xs rounded-md flex items-center gap-2 shadow-sm hover:bg-primary-container"
              >
                <span>View Weak Topics Ranking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Question Navigation List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-surface-variant font-label-stamp text-xs text-tertiary">
            <span>QUESTION REGISTRY</span>
            <span>
              {answeredCount} / {questions.length} Answered
            </span>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => {
              const isSelected = idx === currentIdx;
              const hasAnswer = quizAnswers[q.id] !== undefined;
              const isCorrect =
                quizSubmitted && quizAnswers[q.id] === q.correct_answer_index;
              const isWrong =
                quizSubmitted &&
                hasAnswer &&
                quizAnswers[q.id] !== q.correct_answer_index;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-full p-3 rounded-md text-left transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-surface-container-highest border-primary shadow-sm'
                      : 'bg-surface-container border-surface-variant hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-code-sm text-xs text-tertiary">
                      Q{idx + 1}
                    </span>
                    <span className="font-title-sm text-xs text-on-surface font-medium truncate max-w-[180px]">
                      {q.question}
                    </span>
                  </div>

                  {/* Status icons */}
                  {quizSubmitted ? (
                    isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error shrink-0" />
                    )
                  ) : hasAnswer ? (
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {!quizSubmitted && (
            <button
              onClick={handleSubmitQuiz}
              disabled={!isAllAnswered}
              className={`w-full py-3 rounded-md font-title-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-4 shadow-sm transition-all ${
                isAllAnswered
                  ? 'bg-inverse-surface text-inverse-on-surface hover:translate-y-[-1px]'
                  : 'bg-surface-container-high text-tertiary opacity-60 cursor-not-allowed'
              }`}
            >
              <span>Submit for Actuarial Grading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Active Question Card (8 cols) */}
        <div className="lg:col-span-8">
          {currentQ ? (
            <div className="p-6 md:p-8 bg-surface-container border border-surface-variant rounded-md shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-surface-variant pb-3">
                <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
                  QUESTION {currentIdx + 1} OF {questions.length} • TOPIC {currentQ.topic_id}
                </span>
                <span className="font-code-sm text-xs text-tertiary">
                  ID: {currentQ.id}
                </span>
              </div>

              {/* Question text */}
              <h2 className="font-headline-md text-headline-md text-on-surface leading-snug">
                {currentQ.question}
              </h2>

              {/* Multi-choice options */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = quizAnswers[currentQ.id] === optIdx;
                  const isCorrect = optIdx === currentQ.correct_answer_index;
                  const isUserWrong =
                    quizSubmitted && isSelected && !isCorrect;

                  let borderClass = 'border-surface-variant bg-surface';
                  if (isSelected && !quizSubmitted) {
                    borderClass = 'border-primary bg-primary/10 shadow-sm';
                  } else if (quizSubmitted && isCorrect) {
                    borderClass = 'border-secondary bg-secondary/15 text-on-surface font-semibold';
                  } else if (isUserWrong) {
                    borderClass = 'border-error bg-error/15 text-error';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswerQuestion(currentQ.id, optIdx)}
                      disabled={quizSubmitted}
                      className={`w-full p-4 rounded-md border text-left transition-all flex items-start gap-3 ${borderClass}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center font-code-sm text-xs shrink-0 font-bold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-body-md text-sm leading-relaxed flex-1">
                        {opt}
                      </span>
                      {quizSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                      )}
                      {quizSubmitted && isUserWrong && (
                        <XCircle className="w-5 h-5 text-error shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Stepper */}
              <div className="pt-4 border-t border-surface-variant flex items-center justify-between">
                <button
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  disabled={currentIdx === 0}
                  className="px-3 py-1.5 bg-surface-container-high text-on-surface font-title-sm text-xs rounded disabled:opacity-30"
                >
                  ← Previous
                </button>
                <span className="font-code-sm text-xs text-tertiary">
                  {currentIdx + 1} / {questions.length}
                </span>
                <button
                  onClick={() =>
                    setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))
                  }
                  disabled={currentIdx === questions.length - 1}
                  className="px-3 py-1.5 bg-surface-container-high text-on-surface font-title-sm text-xs rounded disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
