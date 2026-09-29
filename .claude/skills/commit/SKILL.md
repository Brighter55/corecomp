---
name: commit
description: Stage and commit the current changes with a descriptive message. Use when the user asks to commit, or says "git add / git commit / commit this". Always shows the proposed commit message and asks for explicit approval before committing.
---

# Commit changes

Stage and commit the working tree with a message that accurately describes the change. The user wants to **see and approve the commit message before anything is committed** — never commit without that approval.

## Workflow

1. **Confirm the tree is sound first** — run `python scripts/check.py`. Never
   commit on a red gate. If it reports `INCOMPLETE`, the environment is missing
   Postgres or Redis; fix that and re-run rather than committing unverified work.
   (See the `check` skill.)

2. **Review the working tree** — run `git status --short` and `git diff --stat` first. Identify:
   - Changes from the current session that the commit is meant to capture.
   - Pre-existing or unrelated changes that `git add .` would also sweep in (this repo frequently has a large working tree — account/Stripe/Docker removal, new files, etc.). Surface these to the user; don't silently bundle unrelated work under a message that doesn't describe it. If the scope is ambiguous, ask.

3. **Write the commit message** — base it on the actual diff (what changed *and why*). Use conventional commits (`fix:`, `feat:`, `refactor:`, `chore:`, …). Keep the subject under ~72 chars; use a body for the why and key details.

4. **Show the message and get approval** — present the full message (subject + body) to the user and ask for explicit permission before running `git commit`. Offer the option to edit the message or narrow the scope (all changes vs. only specific files).

5. **Stage and commit** — after approval:
   - `git add .` (or the agreed subset of files)
   - `git commit -m "..."` with the approved message
   - End the message body with the trailer: `Co-Authored-By: Claude Code <noreply@anthropic.com>`

6. **Report** — show the result (`git log -1 --stat` or `git show --stat HEAD`) and note anything left uncommitted.

## Split infrastructure from fixes

If the working tree contains both a behavioural fix and supporting
infrastructure (new scripts, config, CI), commit them separately so the fix can
ship alone. Thirty files of tooling plus a one-line production fix in a single
commit cannot be reverted independently.
