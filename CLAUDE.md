# CLAUDE.md — Standing Instructions

These instructions apply to every update, without exception.

## 1. Always commit to `main`

After any change to this repo, Claude **must**:

1. Commit the change (clear, descriptive message).
2. Push the commit to `origin/main`.
3. Confirm the push succeeded (`git log -1 origin/main`).

Never leave work on a feature branch unmerged. Never push to a different branch
unless the user explicitly asks for it in that same request.

## 2. Always return these two artifacts at the end of every update

Every update ends with the user seeing both of these, formatted as shown:

### GitHub download (latest `main` as zip)

Present this as a **clickable markdown link** (NOT inside a code block, so the
user can click it directly to trigger the browser download):

[Download latest `main` as zip](https://github.com/johnagius/appt/archive/refs/heads/main.zip)

### One-shot Windows deploy command

Chained with `&&`, uses the latest wrangler, and **every wrangler command
includes `--yes` / `-y` so no interactive prompts can stall the chain**.
Replace paths only if the project moves:

```cmd
cd /d "C:\Users\Potte\Downloads\appt-main\appt-main\kevappts-cf" && npm install && npm install -D wrangler@latest && npx wrangler d1 execute kevappts-db --remote --file=schema.sql --yes && npx wrangler deploy --yes
```

Notes for the user:
- If wrangler isn't logged in yet, run `npx wrangler login` once first (opens a
  browser, can't be chained).
- The `LINDA_CALENDAR_ID` secret only needs to be set once (the first deploy).
  Pipe the value to avoid the interactive prompt:
  ```cmd
  echo a18cc8ed238199dd6f03ca81085c202a5f032850f65782631aed5a3fb5fa431a@group.calendar.google.com| npx wrangler secret put LINDA_CALENDAR_ID
  ```
- The `d1 execute` step is safe to re-run (idempotent `INSERT OR IGNORE` seeds);
  skip it if no schema/config changes are included in the update.

## 3. Include a short "What changed" summary

Under the command block, list in 3–5 bullets what the update did, and anything
the user should verify after deploy (URL to check, admin tab to open, etc.).

---

Keep this file as the single source of truth for these standing instructions.
If the user changes any of them, update this file in the same commit.
