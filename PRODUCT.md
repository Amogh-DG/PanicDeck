<!-- impeccable:product-schema 1 -->
# Product Truth & Architecture: Exam Prep Agent

## 1. Product Identity & Purpose
* **Project Name**: Exam Prep Agent
* **Core Purpose**: An AI-powered study companion that turns scattered, messy exam materials — lecture slides, forwarded PDFs, handwritten notes, past papers, syllabus documents — into a single organized study plan with self-testing built in.
* **Problem Solved**: Replaces the pre-exam scramble of disconnected notes and no clear sense of what to study, with one pipeline that summarizes your material, tests you on it, tells you what the syllabus expects that your notes are missing, and ranks topics by how often they've shown up in past papers.

---

## 2. Surface & Audience
* **Surface Category**: `Product / App UI` (Web Application & Dashboard)
* **Primary Audience**: University and college students preparing for exams, working alone or comparing notes with a study group.
* **User Mindset**: Time-pressured, anxious about coverage gaps, wants a fast answer to "what do I actually need to study" rather than another tool to organize by hand.

---

## 3. Core Feature Hierarchy & Workflows
1. **Ingest**: Upload any mix of lecture slides, PDFs, handwritten note photos, past papers, and the official syllabus. Files land in S3 and get parsed/OCR'd into structured, topic-tagged text.
2. **Summary**: Bedrock organizes parsed notes into a clean, topic-by-topic summary.
3. **Quiz**: Bedrock generates a quiz from the summarized material; questions are weighted toward topics that appear most often in uploaded past papers.
4. **Coverage Gaps**: Cross-references the syllabus against the notes and flags syllabus topics that are missing or thin in the uploaded material.
5. **Weak Topics**: Combines quiz performance, syllabus gaps, and past-paper frequency into a single ranked list of what to study next, with the reasoning shown ("30% of past papers, barely covered in your notes, missed on quiz").

---

## 4. Voice, Tone & Interaction Guidelines
* **Voice**: Encouraging but direct — states what's weak plainly, without academic-advisor softness.
* **Density**: Moderate; a dashboard a stressed student can scan in seconds, not a data-grid tool.
* **Responsiveness**: Upload triggers a visible processing state (parsing → summarizing → quizzing) since these are real async AI calls with real latency; no fake instant results.
* **Feedback**: Clear per-module status (Summary ready / Quiz ready / Gaps found / Weak topics updated), simple color coding — Green = strong, Amber = needs review, Red = weak/uncovered.

---

## 5. Visual System & Aesthetic Foundations
*(inherits the token system in design.md — dark glassmorphic theme, Inter/Plus Jakarta Sans for UI, JetBrains Mono for extracted/structured content such as quiz IDs or source citations)*
* **Theme**: Dark mode, calmer and less "ops console" than the cloud-dashboard original — same tokens, applied to study cards instead of telemetry panels.
* **Atmosphere**: Glassmorphic cards per topic/module rather than dense metric grids; more breathing room since this is read by one stressed person, not scanned by an SRE.

---

## 6. Anti-Patterns & Blacklist
* 🚫 No generic AI gradients or cheesy rainbow borders.
* 🚫 No low-contrast text — every summary/quiz block must meet WCAG AA on the dark surface.
* 🚫 No pretending results are instant — show real progress states for parsing/summarizing/quizzing.
* 🚫 No burying the "what to study next" answer — Weak Topics should be reachable in one click from anywhere in the app, not nested three tabs deep.
* 🚫 No unstyled default controls — inputs, upload dropzone, and quiz UI must match the dark glass design system.