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

## Session pickup, 2026-10-12

1. Read the checkpoint — done, exit 0, hashes unchanged since publish.
2. Reconstruct operational state — branch `feat/earnings-calendar` at `84cbf58`, tree clean apart from the two pre-existing skill deletions.
3. Diff done vs pending — no code exists; resume point is the backend and frontend build.
4. Route to the playbook — Feature continues.
5. Verified inherited claims against real code rather than trusting the maps. `accounts/permissions.py:22-24` does raise on a missing `symbol`. `pages/urls.py:12` confirms `/pages/earnings` is taken. The no-trailing-slash rationale is at `urls.py:15-16`.

**Cache-shape item resolved.** Read `pages/trending.py`. It is a pure feature module of constants plus one pure function returning plain dicts, and `FinancialDataService.get_trending` returns a payload dict that the view caches directly. So the cached unit is the payload dict, not a dataclass, which removes the pickle hazard structurally instead of guarding it. `pages/services.py:8` already imports a feature module beside the provider client, so the module split is the house pattern.

Contract frozen at [earnings-calendar-contract.md](earnings-calendar-contract.md).

## Verification outcome, 2026-10-12

Both delegate branches merged into `feat/earnings-calendar`, no conflicts.

`python scripts/check.py` gives **RESULT: PASS** across all nine gates, including 243 backend tests and 314 frontend tests.

Drove the real page in headless Chromium against the live endpoint on `127.0.0.1:8000` with Vite on 5173.

- Weekly board rendered `Oct 12 – Oct 16, 2026` with exactly five Monday-to-Friday columns. Real Alpha Vantage data grouped correctly. Mon 12 showed MSS, NCPL, RMCF under Unannounced, matching the live feed where those rows carry a blank `timeOfTheDay`. Tue 13 put the banks under Before Open, which is really when they report. Next moved to `Oct 19 – Oct 23`.
- Monthly grid rendered `October 2026` as 25 Monday-to-Friday cells, 14 of them overflowing. Oct 29 held 6 shown plus 314 more, so the overflow indicator is load-bearing rather than decorative.
- Days before today are empty, which is correct, because `EARNINGS_CALENDAR` is forward-looking.
- The header and footer both render, since the page composes them itself.
- Over HTTP, `AllowAny` was confirmed with no `X-Anonymous-Session` header (200). Validation confirmed with `days=99` (400), a missing `start` (400), and a trailing slash (404, so `APPEND_SLASH` never redirects).

Two observations worth carrying, neither a confirmed defect.

1. **The cost incident.** A real upstream request was spent because `pipenv run` loads `server/.env` and overrides a shell variable of the same name. Verified by running `MOCK=True pipenv run python -c "import os; print(os.getenv('MOCK'))"`, which prints `False`; adding `PIPENV_DONT_LOAD_ENV=1` makes it print `True`. The `live:` cache key in Redis was the confirming evidence. **This belongs in `.claude/feature-map.md`**, because anyone trying to toggle MOCK from the shell will hit it.
2. Headless Chromium logged `net::ERR_BLOCKED_BY_ORB` for many logo.dev requests, yet logos render in the screenshots and only 2 tiles fell back to the ticker chip. That looks like opaque-response blocking in headless mode rather than a real failure, and the same shared helper serves Dip Finder. Worth confirming in a normal browser.

## Filter increment outcome, 2026-10-12

Both delegate branches merged. `python scripts/check.py` gives **RESULT: PASS** across all nine gates.

Drove the filter in a real browser against the live app.

- Placement confirmed. The right-hand cluster in DOM order is Previous week, Next week, Filter stocks, Calendar view, so the filter button sits left of the Weekly and Monthly toggle.
- Five options present. All stocks, Popular stocks, Market cap 100B+, Market cap 10B+, Market cap 1B+.
- On the weekly window, which holds 70 symbols, the filters leave 70, 6, 17, 35 and 48 tiles. A nested ladder, and Popular at 6 is genuinely narrower than 100B+ at 17, which is what the mid-flight correction to the list bought.
- Filtering is local. Five selections produced no additional calendar requests.
- The header Features menu lists Overview, Dip Finder and Earnings.
- The only console errors were the two pre-existing anonymous 401s on `/accounts/me`.

Cost measured rather than estimated. The first weekly view created 70 `market_cap` keys in Redis, which is 3 WiseSheets requests at 25 per request, and a re-run cost nothing because the cache holds.

**A pre-existing defect, found by the backend delegate, that deserves its own fix.** `clear_cache_between_tests` in `server/corecomp/conftest.py` clears after each test rather than before, so a suite sharing a live Redis can read a payload a running app wrote. The delegate saw `asOf 2026-10-12` against a fixture's `2026-10-11`, and worked around it inside its own tests instead of editing the shared fixture. The root cause is still there for every other test, so it belongs in `conftest.py` rather than in per-test workarounds.

Also worth knowing when editing the curated list. `POPULAR` is pinned by an exact-membership test as a frozen-contract promise, so changing the 41 names means changing that test too.

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
