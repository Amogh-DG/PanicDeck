# PRD — Person B (Frontend / Infra) — your track

Reference `API_CONTRACT.md` for every request/response shape below — build your UI against those exact schemas so integration is a swap, not a rewrite.

## Owned paths
`/frontend/**`, `/amplify/**`, `product.md`, `design.md`. Do not edit `/backend/**` or `/lambdas/**` without checking with Person A first.

## Scope (in priority order — stop and ship if time runs out)

### P0 — must work by end of Sept 18
- [ ] Confirm S3 bucket name/region with Person A; write it into `.env.example`.
- [ ] Scaffold Amplify app, deploy a blank page to a live URL today — before it looks good, get it live.
- [ ] Upload UI: file picker → upload to S3 (presigned URL or direct), writes to the agreed bucket/key structure (`uploads/<session_id>/<filename>`).
- [ ] Results view: renders whatever `summarize` returns, per `API_CONTRACT.md §3.1`. Build against a **stub** matching that schema first — don't block on Person A's Lambda being ready.
- [ ] Swap the stub for the real `summarize` call the moment Person A signals it's live.

### P1 — Sept 19
- [ ] Quiz UI: renders questions from `generate_quiz` (`§3.2`), captures selected answers, shows correct/incorrect per question.
- [ ] On quiz submit, send answers to `weak_topics` (`§3.3`) and render the ranked list — this is your best demo moment, make severity/reason visually obvious (color-coded by `severity`).
- [ ] Apply `design.md` tokens (dark glass theme, colors, typography) across all views — after functionality works, not before.
- [ ] Redeploy to Amplify at least once today — don't save deployment for the last hour.

### P2 — stretch, only if P0/P1 are solid
- [ ] Syllabus upload + coverage gaps view (`§3.4`), if Person A ships that Lambda.
- [ ] Visual polish pass: loading states for each async step (parsing → summarizing → quizzing), empty states, error states matching the error shape in the contract.

### Sept 20
- [ ] Full run-through on the live deployed URL, exactly as you'll demo it.
- [ ] Fix only what's broken in that exact flow — no new features.
- [ ] Rehearse the pitch against the real live app.

## Definition of done for each view
- Consumes the exact schema in `API_CONTRACT.md` — no guessing field names.
- Handles the documented error response gracefully (shows a message, doesn't crash).
- Has a visible loading/progress state for any async call — these are real AI calls with real latency, never fake-instant.
- Deployed and reachable at the live Amplify URL, not just working locally.

## Working with your AI coding agent
- Give it one view at a time with the exact schema from the contract pasted in.
- Build against stubbed responses matching the contract shape so you're never blocked waiting on Person A.
- If a schema needs to change on your end, propose it in `API_CONTRACT.md`'s change log and confirm with Person A before you build against it — don't diverge silently.
