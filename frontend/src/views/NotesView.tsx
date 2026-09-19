import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Upload,
  BookOpen,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

export const NotesView: React.FC = () => {
  const {
    topics,
    uploadedFiles,
    handleUploadNotes,
    handleLoadQuiz,
    setCurrentView
  } = useStudy();

  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topics[0]?.topic_id || ''
  );
  const [dragOver, setDragOver] = useState<boolean>(false);

  const activeTopic =
    topics.find((t) => t.topic_id === selectedTopicId) || topics[0];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadNotes(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadNotes(e.target.files[0]);
    }
  };

  const handleLaunchQuiz = async () => {
    await handleLoadQuiz();
    setCurrentView('quizzes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Section Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
            [FOLIO // 085]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            COURSE NOTES SYNTHESIS &amp; OCR ARCHIVE
          </span>
        </div>
        <div className="font-code-sm text-xs text-tertiary">
          MODULES EXTRACTED: <strong className="text-on-surface">{topics.length}</strong>
        </div>
      </div>

      {/* Upload Dropzone Bar */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-md transition-all text-center flex flex-col md:flex-row items-center justify-between gap-4 ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-outline-variant bg-surface-container-low hover:border-primary'
        }`}
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-primary shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <div className="font-title-sm text-sm text-on-surface font-semibold">
              Drop lecture slides, PDF notes, or scrawls to parse
            </div>
            <div className="font-body-sm text-xs text-tertiary">
              Bedrock AI performs OCR, LaTeX structuring, and topic-by-topic synthesis.
            </div>
          </div>
        </div>

        <label className="px-4 py-2 bg-primary text-on-primary font-title-sm text-xs uppercase tracking-wider rounded-md cursor-pointer hover:bg-primary-container shrink-0 shadow-sm transition-all">
          <span>Choose Files</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.png,.jpg,.jpeg,.txt"
          />
        </label>
      </div>

      {/* Main Dual-Pane Notes Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Topics List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-surface-variant font-label-stamp text-xs text-tertiary">
            <span>SYNTHESIZED TOPICS</span>
            <span>ID</span>
          </div>

          <div className="space-y-2">
            {topics.length > 0 ? (
              topics.map((t, idx) => {
                const isSelected = (activeTopic?.topic_id || '') === t.topic_id;
                return (
                  <button
                    key={t.topic_id}
                    onClick={() => setSelectedTopicId(t.topic_id)}
                    className={`w-full p-3.5 rounded-md text-left transition-all border ${
                      isSelected
                        ? 'bg-surface-container-highest border-primary shadow-sm'
                        : 'bg-surface-container border-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-code-sm text-xs text-tertiary">
                        0{idx + 1}
                      </span>
                      <span className="font-code-sm text-[10px] text-primary">
                        {t.topic_id}
                      </span>
                    </div>
                    <div className="font-title-sm text-xs text-on-surface font-semibold mt-1 line-clamp-2">
                      {t.name}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 bg-surface-container border border-surface-variant rounded-md text-center space-y-2">
                <FileText className="w-6 h-6 text-tertiary mx-auto opacity-40" />
                <div className="font-body-sm text-xs text-tertiary">
                  No topics extracted yet. Upload a lecture PDF or notes above to begin synthesis.
                </div>
              </div>
            )}
          </div>

          {topics.length > 0 && (
            <button
              onClick={handleLaunchQuiz}
              className="w-full py-3 bg-inverse-surface text-inverse-on-surface font-title-sm text-xs rounded-md shadow-sm flex items-center justify-center gap-2 hover:translate-y-[-1px] transition-all mt-4"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Generate Quiz on All Topics</span>
            </button>
          )}
        </div>

        {/* Right Column: Full Summary & Proof Reader (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeTopic ? (
            <div className="p-6 md:p-8 bg-surface-container border border-surface-variant rounded-md shadow-sm space-y-6">
              <div className="border-b border-surface-variant pb-4 space-y-2">
                <div className="flex items-center justify-between font-label-stamp text-xs text-tertiary">
                  <span className="text-secondary font-bold">
                    BEDROCK SYNTHESIZED THEOREM
                  </span>
                  <span className="font-code-sm">{activeTopic.topic_id}</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  {activeTopic.name}
                </h2>
              </div>

              {/* Main Markdown / Text Content */}
              <div className="prose prose-sm max-w-none text-on-surface font-body-md text-sm leading-relaxed space-y-4">
                <div className="p-4 bg-surface-container-low border-l-4 border-primary rounded-r-md">
                  <div className="font-label-stamp text-[11px] text-primary uppercase mb-1">
                    Executive Summary &amp; Derivations
                  </div>
                  <p className="text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                    {activeTopic.summary}
                  </p>
                </div>
              </div>

              {/* Marginalia Source Citations */}
              <div className="pt-4 border-t border-surface-variant/80 flex flex-wrap items-center justify-between gap-4 font-code-sm text-xs text-tertiary">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-primary" />
                  <span>Citations: Tripos Syllabus 2024 • Section 4.2</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  <span>Confidence: 98.4%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-tertiary bg-surface-container rounded-md">
              No topic selected. Upload or pick a topic from the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
