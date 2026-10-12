# Earnings calendar at /earnings

Playbook: **Feature** (poteto-mode). Prototype was considered and rejected at its step 1, which reads "No decision means no prototype. Route to Feature." The ask is a routed page in production source, rendering the real header and footer, so it is not a throwaway instrument in a scratch dir.

Horizon decision (user, this session): `horizon=3month`. Costs the same one request as 12month and the extra rows carry no session data anyway.

## Playbook steps, verbatim

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model (default in poteto-mode's Models section) with a specific scope (file paths, named data shape and its organizing structure per **principle-model-the-domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the **arena** skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation. No "standing by" reply that waits on a nested agent. **Give every file-writing delegate its own worktree** (spawn it with `isolation: "worktree"`, or hand it an exclusive branch), and do not write files or run a suite in a worktree a delegate still holds. On Claude Code, `isolation: "worktree"` branches from the remote default branch unless the `worktree.baseRef` setting is `"head"`. When the delegate builds on commits the default branch lacks, commit them, create its worktree with `git worktree add <path> -b <delegate-branch> HEAD`, and name that base commit in the brief. Fencing a file in the brief's prose is not a lock (**principle-separate-before-serializing-shared-state**). Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.

## Throughput checkpoint

- **Blocking first steps.** Subsystem map of client and server, then the frozen response contract. Both must land before any code is written, because the contract is what the two workstreams share.
- **Independent workstreams.** Two. Backend (Alpha Vantage client module, service method, view, tests) and frontend (route, page, header and footer, tests). Disjoint files, no overlap.
- **Shared mutable state.** The response JSON contract, and nothing else. No shared files, no shared Redis keys between the two sides. Frozen as a written artifact before fan-out, so the two workers never negotiate it through code.
- **Smallest safe decomposition.** Two workers, one per layer. A single owner would also be defensible since the contract is the only coupling, but the layers touch disjoint files and the contract is written down, so the split costs nothing.

## Architect phases

1. Ground — done via two subsystem maps (client and server), recorded in the design brief.
2. Sketch — arena with the configured architect runners (opus, sonnet), brief at `.audit/earnings-calendar-design-brief.md`.
3. Agree — default is to proceed; no checkpoint unless asked.
4. Implement — against the frozen sketch.
5. Scrap — only if implementation keeps fighting the sketch.

## Arena phases

1. Frame — done. Artifact, rubric, runners (opus and sonnet, per the `arena runners` line), output paths.
2. Fan out — running. Two candidates under `%TEMP%\arena-earnings\`.
3. Cross-judge — pending, one readonly judge from the `arena cross-judge pool`.
4. Pick — pending.
5. Graft — pending.
6. Verify — pending.

**Rubric.** R1 contract completeness, all three session states including blank, no ambiguity on empty days. R2 the date-and-session grouping owned in exactly one place. R3 the 25-request/day upstream budget honored structurally, cost independent of request volume and window. R4 seam conformance with no new mechanism, and the correct permission class given no symbol exists. R5 a position on real density, 576 on the busiest day. R6 free of the red flags in design-red-flags.md.

## Task todos

- [ ] Freeze the response shape for `GET /pages/earnings/` (see contract below)
- [ ] Decide how a blank `timeOfTheDay` renders (date known, session unannounced)
- [ ] Backend: AV `EARNINGS_CALENDAR` client, service method, cached view, tests
- [ ] Frontend: `/earnings` route, page, header and footer, tests
- [ ] Verify end to end on the real page against real AV data
- [ ] `n/a: no PR requested`, stop at step 7 unless the user asks to ship

## Open decisions

1. **Blank session (78% of rows).** AV gives `pre-market`, `post-market`, or blank. The Stitch reference draws every tile under Before Open or After Close, so it has no slot for blank. Options: drop the session split entirely, add a third "time TBA" group, or default blank into Before Open.
2. **Monthly view viability.** Session coverage is 66% for the next 7 days, 30% for days 8 to 30, and 2% beyond. A four week grid would be mostly sessionless in weeks three and four. Restrict the page near term, or accept sessionless tiles.
3. **Density.** The mockup draws 6 tiles a day. Real Oct 15 holds 27 symbols and the busiest day this year holds 576. A relevance filter is needed, or honest overflow.
