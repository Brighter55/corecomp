---
name: reproduce-bug
description: Turn a reported bug into a failing test, fix it, and prove red-to-green. Use when the user reports something broken, says "X doesn't work", "this is wrong in prod", or asks to fix a bug. Also use before fixing anything described as a bug.
---

# Reproduce a reported bug

A bug report is not a task list. It's a claim that something is wrong, and the
first job is to turn it into a **falsifiable statement** — one a test can settle.
Fixing before reproducing means you're guessing, and you won't know if you fixed
it or just moved it.

## The loop

1. **Turn the report into a falsifiable claim.**
   "The overview page is broken" is not testable.
   "Given a symbol with no dividend history, /pages/overview returns
   `DividendYield: "None"` instead of 0" is.
   If you cannot write the claim as *given X, expect Y*, you do not understand
   the report yet — go back and ask.

2. **Write a test asserting the correct behaviour. It must fail.**
   - Backend: `server/corecomp/pages/tests/` or `accounts/tests/`, pytest style
     (`@pytest.mark.django_db`, fixtures from `conftest.py`).
   - Frontend: next to the code as `*.test.jsx`, Vitest + Testing Library.
   - **Run it and confirm it fails, and that it fails for the right reason.**
     A test that fails because of a typo in the test proves nothing.

3. **Read the evidence before changing code.**
   - What the test actually returned vs. what you expected.
   - Console / network output, failed requests, server logs.
   - `.claude/feature-map.md` — the symptom table points at the file to start in,
     and the traps section warns about fixes that look right and are wrong.
   - The `run-app` skill if you need to observe the real behaviour in a browser.

4. **Fix it.**

5. **Confirm red to green.** The same test, now passing. Not a different test.

6. **Keep the test.** It stays in the suite forever. The bug can never come back
   quietly.

## If you cannot reproduce it

That means you don't understand the report yet — not that there's no bug. Ask
for the things you cannot see:

- **What the user actually observed** (the symptom, not their diagnosis).
- **Console / network output**, if they can grab it.
- **Scale** — how many rows, which symbols, which account, how many requests.
  Scale is often the whole diagnosis: a bug that only appears past a page size,
  or after a cache TTL, or on the 6th symbol of the month, looks like nothing at
  all on a single test symbol.
- **Whether it reproduces locally.** Local dev runs on live WiseSheets data with
  `MOCK=False`, so some production-only symptoms come from cache state or quota,
  not code.

## Ask for symptoms, not diagnoses

"Symbol search returns 403" beats "I think the permission class is wrong" — the
symptom is what becomes a test, and a diagnosis can send you somewhere wrong.

## Before you call it fixed

```bash
python scripts/check.py       # nothing else broke
```

Then confirm the *specific* test you added fails on the un-fixed code. A test
written after the fix, that has never been red, is documentation — not a guard.
