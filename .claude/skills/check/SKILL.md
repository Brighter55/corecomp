---
name: check
description: Run every CoreComp verification gate with one command and report the result. Use before committing, before opening a PR, after any code change, or when the user asks "does this work / is this ready to ship / run the checks".
---

# Run the verification gate

`scripts/check.py` is the single source of truth for whether the tree is sound.
Everything that can be checked is behind this one command — if a gate isn't in
here, it isn't checked.

## Run it

```bash
python scripts/check.py              # everything (~55s)
python scripts/check.py --fast       # skip the frontend build (~45s)
python scripts/check.py --backend    # backend gates only
python scripts/check.py --frontend   # frontend gates only
python scripts/check.py --verbose    # stream full gate output
```

Run it from the repo root. It is CWD-independent, so it also works from
`server/` or `client/`.

**Use `--verbose` when a gate fails and the 40-line tail isn't enough.** Without
it, only failing gates print output.

## What it runs

| Gate | Catches |
|---|---|
| `django check` | Broken settings, bad model definitions |
| `migrations up to date` | A model change with no migration — tests pass locally, deploy fails |
| `backend tests` | 179 pytest tests |
| `backend lint (ruff)` | Undefined names, unused imports/vars, import order |
| `frontend lint` | ESLint |
| `frontend tests` | 222 Vitest tests |
| `typescript (tsc)` | `tsc --noEmit` |
| `frontend build` | Vite production build |
| `bundle has no prod API URL` | A build that points at production |

Every gate runs even when an earlier one fails — one pass gives the whole
picture. Read the **summary table**, not the scrollback.

## Read the result correctly

Three verdicts, and the difference matters:

- **`PASS`** — exit 0. Every gate ran and passed.
- **`FAIL (n gates failed)`** — exit 1. Something is genuinely broken. The last
  40 lines of each failing gate's output are printed above the table.
- **`INCOMPLETE (n gates could not run)`** — exit 1. A gate was *skipped*
  because its environment was missing, so the run proves nothing. **Do not
  report an INCOMPLETE run as passing.** Fix the environment and re-run.

`SKIP` with a note like `ruff not installed` is soft and does not fail the run.
`SKIP` from `Postgres/Redis not reachable` is **not** soft — that's the
INCOMPLETE case.

## When Postgres or Redis is down

The script prints a diagnosis with the fix:

```
[check] backend services unavailable:
  - PostgreSQL at localhost:5432 is not accepting connections (ConnectionRefusedError)
      start it: Get-Service postgresql-x64-17  /  net start postgresql-x64-17
  - Redis at localhost:6379 is not accepting connections (ConnectionRefusedError)
      start it: docker compose up -d   (from server/)
```

Start the service and re-run. Do not "fix" this by narrowing the gate — an
un-runnable environment must stay visible.

## What it deliberately does not do

- **It never touches production.** It refuses to run if the database or Redis
  URL isn't loopback, and the build step forces the frontend to
  `http://127.0.0.1:8000` rather than letting `.env.production` inject
  `api.corecomp.cc`. A green run has never spent WiseSheets quota — the backend
  suite mocks every upstream request.
- **It does not set `MOCK`.** Verification runs on the same code path as local
  dev. See `.claude/feature-map.md` before changing that.
- **It does not replace asking for a test.** The suite does not cover your new
  feature until someone writes a test for it. Passing gates mean *nothing else
  broke* — not that the new thing works.

## Before opening a PR

1. `python scripts/check.py` → expect `RESULT: PASS` and exit 0.
2. Confirm the change has a test. If it doesn't, write one — see the
   `reproduce-bug` skill for the shape.
3. For anything touching the quota, auth, or caching, see the traps in
   `.claude/feature-map.md` before deciding a change is safe.
