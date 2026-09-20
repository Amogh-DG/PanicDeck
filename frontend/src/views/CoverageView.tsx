import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import {
  PieChart,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export const CoverageView: React.FC = () => {
  const { coverageGaps, handleUploadSyllabus, handleSynthesizeGap, setCurrentView, topics } = useStudy();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadSyllabus(e.target.files[0]);
    }
  };

  const handleSynthesize = (gapName: string, reason?: string) => {
    handleSynthesizeGap(gapName, reason);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Overline */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-variant pb-3 gap-2">
        <div className="flex items-baseline gap-3">
          <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
            [FOLIO // 088]
          </span>
          <span className="font-label-sm text-xs text-on-surface-variant uppercase">
            SYLLABUS COVERAGE GAP AUDIT
          </span>
        </div>
        <div className="font-code-sm text-xs text-tertiary">
          CROSS-REFERENCED WITH OFFICIAL EXAM SPEC
        </div>
      </div>

      {/* Header Banner & Syllabus Upload */}
      <div className="p-6 bg-surface-container border border-surface-variant rounded-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h1 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Syllabus Specification Cross-Reference
          </h1>
          <p className="font-body-sm text-xs text-tertiary leading-relaxed">
            Upload your university or course syllabus to flag missing requirements, thin lecture notes, and mandatory exam derivations.
          </p>
        </div>

        <label className="px-5 py-2.5 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container cursor-pointer flex items-center gap-2 shrink-0 transition-all">
          <Upload className="w-4 h-4" />
          <span>Upload Syllabus Document</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept=".pdf,.txt,.docx"
          />
        </label>
      </div>

      {/* Coverage Status Summary */}
      {(() => {
        const totalMandates = topics.length + coverageGaps.length;
        const coveragePct = totalMandates > 0 ? Math.round((topics.length / totalMandates) * 100) : 0;
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-container border border-surface-variant rounded-md space-y-1">
              <div className="font-label-sm text-[11px] text-tertiary uppercase">Total Syllabus Mandates</div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold">
                {totalMandates > 0 ? `${totalMandates} Requirements` : '0 Requirements'}
              </div>
            </div>
            <div className="p-4 bg-surface-container border border-secondary/40 rounded-md space-y-1">
              <div className="font-label-sm text-[11px] text-secondary uppercase">Covered in Uploaded Notes</div>
              <div className="font-headline-md text-headline-md text-secondary font-bold">
                {topics.length} Documented ({coveragePct}%)
              </div>
            </div>
            <div className="p-4 bg-surface-container border border-error/40 rounded-md space-y-1">
              <div className="font-label-sm text-[11px] text-error uppercase">Flagged Blindspots / Gaps</div>
              <div className="font-headline-md text-headline-md text-error font-bold">{coverageGaps.length} Missing</div>
            </div>
          </div>
        );
      })()}

      {/* Gaps List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-variant font-label-stamp text-xs text-tertiary">
          <span>FLAGGED SYLLABUS GAPS &amp; DERIVATIONS</span>
          <span>ACTION</span>
        </div>

        {coverageGaps.length > 0 ? (
          coverageGaps.map((gap, idx) => (
            <div
              key={idx}
              className="p-5 bg-surface-container border border-surface-variant rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-outline-variant transition-all"
            >
                <div className="flex items-start gap-3 min-w-0">
                  <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <div className="font-title-sm text-sm text-on-surface font-semibold truncate">
                      {gap.name}
                    </div>
                    <div className="font-body-sm text-xs text-tertiary leading-relaxed">
                      {gap.reason}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => handleSynthesize(gap.name, gap.reason)}
                    className="px-4 py-2 bg-secondary text-on-secondary font-title-sm text-xs rounded-md shadow-sm hover:bg-secondary-container hover:text-on-secondary-container flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Synthesize Missing Proof</span>
                  </button>
                </div>
              </div>
            )
          )
        ) : (
          <div className="p-10 bg-surface-container border border-surface-variant rounded-md text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <PieChart className="w-10 h-10 text-primary mx-auto opacity-70" />
            <div className="space-y-1">
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                Syllabus Audit Ready
              </h3>
              <p className="font-body-sm text-xs text-tertiary">
                Upload your course syllabus document to cross-reference lecture dossiers against required exam specifications.
              </p>
            </div>
            <label className="px-5 py-2.5 bg-primary text-on-primary font-title-sm text-xs rounded-md shadow-sm hover:bg-primary-container cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose Syllabus Document</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.txt,.docx"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
