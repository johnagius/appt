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
cd /d "C:\Users\locumpharmacist\Downloads\appt-main\kevappts-cf" && npm install && npm install -D wrangler@latest && npx wrangler d1 execute kevappts-db --remote --file=schema.sql --yes && npx wrangler deploy
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
- Note: `wrangler deploy` does NOT accept `--yes` (it deploys without asking
  by default). Only `d1 execute` needs the `--yes` flag.
- Self-serve deploy: deploys can also be run from the Claude Code environment
  (no local machine) when `CLOUDFLARE_API_TOKEN` (Workers Scripts + D1 + R2
  edit) and `CLOUDFLARE_ACCOUNT_ID` are set as environment secrets. With those,
  `npx wrangler deploy` / `d1 execute` run non-interactively — no `wrangler
  login`. The network policy must allow `api.cloudflare.com`.

### Reserve & Collect app (`reserve-collect-cf`)

The repo also contains a second Worker — the Reserve & Collect system — with its
own D1 database (`reserve-collect-db`) and R2 bucket (`reserve-collect-photos`).
When an update touches it, deploy it too (and redeploy `kevappts-cf` as well when
the change affects the shared/reciprocal home-page link):

```cmd
cd /d "C:\Users\locumpharmacist\Downloads\appt-main\reserve-collect-cf" && npm install && npm install -D wrangler@latest && npx wrangler d1 execute reserve-collect-db --remote --file=schema.sql --yes && npx wrangler deploy
```

First-time-only setup (can't be chained — prompts / browser):
- `npx wrangler login` (once), `npx wrangler d1 create reserve-collect-db` (paste
  the id into `reserve-collect-cf/wrangler.toml`), `npx wrangler r2 bucket create
  reserve-collect-photos`.
- Secrets: `SIGNING_SECRET`, `ADMIN_SECRET` + `ADMIN_PASSWORD` (reuse the kevappts
  values so the same staff password works), `RESEND_API_KEY`, `STAFF_EMAIL`,
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Google OAuth Web client; authorized
  redirect `https://reserve-collect.labrint.workers.dev/api/auth/google/callback`).

## 3. Include a short "What changed" summary

Under the command block, list in 3–5 bullets what the update did, and anything
the user should verify after deploy (URL to check, admin tab to open, etc.).

---

Keep this file as the single source of truth for these standing instructions.
If the user changes any of them, update this file in the same commit.
