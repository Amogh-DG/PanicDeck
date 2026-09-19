import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Upload,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setCurrentView, handleUploadNotes } = useStudy();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadNotes(e.dataTransfer.files[0]);
      setCurrentView('notes');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadNotes(e.target.files[0]);
      setCurrentView('notes');
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between">
      {/* Top Directive Header */}
      <section className="w-full bg-surface-container-low px-4 md:px-12 py-3 border-b border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-label-code text-label-code">
          <div className="flex items-center gap-3">
            <span className="font-bold text-primary tracking-widest uppercase">
              DOCKET REF: PD-ENG-2025
            </span>
            <span className="text-outline-variant">/</span>
            <span className="text-tertiary">FORM 14-B</span>
            <span className="text-outline-variant">/</span>
            <span className="text-secondary font-medium">EMERGENCY DIRECTIVE</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-error font-semibold">
              <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              TRIPOS FINALS COUNTDOWN: 34H : 11M : 49S
            </span>
            <button
              onClick={() => setCurrentView('login')}
              className="text-primary hover:underline font-semibold"
            >
              Sign In to Desk →
            </button>
          </div>
        </div>
      </section>

      {/* Main Hero & Manifesto */}
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Manifesto & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container border border-outline-variant rounded-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="font-label-stamp text-[11px] uppercase tracking-wider text-on-surface">
                Official Revision Mandate • Emergency Intake Active
              </span>
            </div>

            <h1 className="font-headline-xl text-headline-xl text-on-background tracking-tight leading-[1.08]">
              From Disordered Napkin Math to First-Class Examination Readiness.
            </h1>

            <p className="font-body-lg text-body-lg text-tertiary italic leading-relaxed">
              “Turn scattered lecture slides, forwarded PDFs, messy handwritten note photos, and past papers into a single organized study ledger with auto-tested recall and coverage gap detection.”
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setCurrentView('overview')}
                className="px-6 py-3.5 bg-inverse-surface text-inverse-on-surface font-title-sm text-sm rounded-md shadow-archival hover:translate-y-[-2px] transition-all flex items-center gap-2"
              >
                <span>Enter Study Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('notes')}
                className="px-6 py-3.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-title-sm text-sm rounded-md transition-all"
              >
                Upload Course Notes
              </button>
            </div>
          </div>

          {/* Right Column: Emergency Intake Chute */}
          <div className="lg:col-span-5">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="p-8 border-2 border-primary bg-surface-container-lowest rounded-md shadow-archival relative space-y-5 text-center"
            >
              <div className="absolute -top-3.5 -right-3 bg-secondary text-on-secondary px-3 py-1 font-label-stamp text-[10px] uppercase font-bold tracking-widest shadow-sm rounded-sm">
                CONFIDENTIAL INTAKE
              </div>

              <div className="w-14 h-14 mx-auto rounded-full bg-primary-container/15 flex items-center justify-center text-primary">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  Commit Notes to Chute
                </h3>
                <p className="font-body-sm text-body-sm text-tertiary">
                  Drop PDF lecture slides, handwritten camera rolls, or syllabus files (up to 4.5 MB).
                </p>
              </div>

              <label className="inline-block px-5 py-2.5 bg-primary text-on-primary font-title-sm text-xs uppercase tracking-wider rounded-md cursor-pointer hover:bg-primary-container transition-all">
                <span>Select Files from Machine</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                />
              </label>

              <div className="pt-2 border-t border-outline-variant font-code-sm text-[11px] text-tertiary flex items-center justify-between">
                <span>OCR Pipeline: Active</span>
                <span>Bedrock 3.7: Standby</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transmutation Audit: Core Transformation Mechanism */}
        <section className="bg-surface-container-high border-t-2 border-b-2 border-primary p-6 md:p-8 rounded-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-3 border-b border-outline-variant">
            <div>
              <span className="font-label-stamp text-xs text-primary uppercase tracking-widest">
                TRANSMUTATION AUDIT
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                The Core Transformation Mechanism
              </h2>
            </div>
            <div className="font-code-sm text-xs text-tertiary mt-2 md:mt-0">
              CANDIDATE RAW INPUT → SYNTHESIZED TRIPOS LEDGER
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Scraps */}
            <div className="p-5 bg-surface border border-outline-variant rounded-md space-y-3">
              <div className="flex items-center justify-between font-label-stamp text-xs text-error">
                <span>SOURCE ARTIFACT [UNCOMPILED]</span>
                <span>DISORDER: 89%</span>
              </div>
              <div className="font-code-sm text-xs bg-surface-container p-3 rounded text-on-surface-variant font-mono space-y-1">
                <div>[Scan 04] // thermo_notes_scrawl.jpg</div>
                <div className="opacity-70">"dS &gt;= dQ/T ... carnot loop max eff ... delta S universe?"</div>
                <div className="text-error font-semibold">[MISSING: Clausius derivation proof steps]</div>
              </div>
              <p className="font-body-sm text-xs text-tertiary">
                Scattered, illegible photos and incomplete slides leave dangerous knowledge blindspots before high-stakes exams.
              </p>
            </div>

            {/* Synthesized Ledger */}
            <div className="p-5 bg-surface border-2 border-secondary rounded-md space-y-3">
              <div className="flex items-center justify-between font-label-stamp text-xs text-secondary font-bold">
                <span>SYNTHESIZED TRIPOS FOLIO</span>
                <span>VERIFIED COVERAGE</span>
              </div>
              <div className="font-code-sm text-xs bg-secondary-container/20 p-3 rounded text-on-surface font-mono space-y-1 border border-secondary/30">
                <div className="font-bold text-secondary">Theorem: Clausius Inequality &amp; Second Law</div>
                <div>∮ (δQ/T) ≤ 0 with irreversible entropy growth proof.</div>
                <div className="text-secondary font-semibold">Matched: 35% of Tripos Past Papers (2019–2024)</div>
              </div>
              <p className="font-body-sm text-xs text-tertiary">
                Automatically structured into clear markdown theorems, LaTeX math, and verified against past-paper frequency ratings.
              </p>
            </div>
          </div>
        </section>

        {/* The 3 Pillars of Examination Dominance */}
        <section className="space-y-6">
          <div className="border-b-2 border-primary pb-3 flex items-end justify-between">
            <div>
              <span className="font-label-stamp text-xs text-secondary uppercase tracking-widest">
                CURATED ACADEMIC ARCHITECTURE
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Three Pillars of Examination Dominance
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-surface-container border border-outline-variant rounded-md space-y-3">
              <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold font-code-sm">
                01
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Past-Paper Frequency Weighting
              </h3>
              <p className="font-body-sm text-tertiary leading-relaxed">
                Ranks every concept by how often it has actually appeared across 10 years of exams (2018–2024) so you study high-yield topics first.
              </p>
            </div>

            <div className="p-6 bg-surface-container border border-outline-variant rounded-md space-y-3">
              <div className="w-10 h-10 rounded bg-secondary/10 text-secondary flex items-center justify-center font-bold font-code-sm">
                02
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Syllabus Gap Audit
              </h3>
              <p className="font-body-sm text-tertiary leading-relaxed">
                Cross-references the official syllabus against your uploaded notes and flags topics that are thin or missing before you walk in.
              </p>
            </div>

            <div className="p-6 bg-surface-container border border-outline-variant rounded-md space-y-3">
              <div className="w-10 h-10 rounded bg-primary/10 text-primary flex items-center justify-center font-bold font-code-sm">
                03
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Targeted Weak-Topic Drills
              </h3>
              <p className="font-body-sm text-tertiary leading-relaxed">
                Generates 15-question rapid recall drills weighted toward your missed concepts and high-frequency exam questions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Municipal Academic Archive Footer */}
      <footer className="w-full bg-surface-container-highest border-t border-outline-variant px-4 md:px-12 py-6 text-tertiary font-label-sm text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>PanicDesk autonomous revision ledger • Exam Prep Agent</div>
          <div className="flex items-center gap-4 font-code-sm">
            <span>REF: PD/REC-4029</span>
            <span>CLEARANCE: LEVEL-III</span>
            <span>EPOCH: 2026.FINALS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
