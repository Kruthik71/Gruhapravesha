# Guest List

A guest-list tracker with multiple lists (one per person), each shared across
every device via a small remote JSON store. Built with Vite + React, deploys
to Vercel as a static site — no server or database to run yourself.

Lists live at `#/kruthik` and `#/brother` (see `src/lists.config.js` to add more).
Each list: search, filters, add/edit/remove people, phone numbers, "extra
people with them" counts, Called / Coming toggles, and a "mark arrived" count
for the day of.

## How the data is stored

Each list is one JSON blob on [jsonblob.com](https://jsonblob.com) — free,
no account, plain REST. The blob's id is what makes a list "the same
everywhere": bake it into a Vercel environment variable once, and every
device that opens the deployed site reads/writes that same blob.

This is why a plain local file doesn't work here: on Vercel, serverless
functions and static builds don't have a writable, shared filesystem — a
file you write from one visitor's request isn't visible to the next one.
A tiny external JSON store (or a real database like Vercel KV/Postgres) is
the standard way around that. This project uses the simplest version of
that — swap `src/remote.js` for a database later if you outgrow it.

## First-time setup (one time, per list)

1. `npm install`
2. `npm run dev`, open the list you want (e.g. `http://localhost:5173/#/kruthik`)
3. The app auto-creates a new blob and shows the id in the sync bar at the
   top, e.g. `Add VITE_KRUTHIK_BLOB_ID=68abc123... to your env vars`
4. Copy that id into `.env.local` (copy `.env.example` first) **and** into
   your Vercel project's Environment Variables (Project Settings → Environment
   Variables). Repeat for each list.
5. Redeploy. From now on, the id is fixed and baked into the build, so the
   same URL on any device/browser shows the same list.

Until step 4 is done for a list, that list still works — it just falls back
to a per-browser copy (via `localStorage`) instead of a shared one.

## Deploy to Vercel

```bash
git init
git add .
git commit -m "guest list"
git remote add origin <your-repo-url>
git push -u origin main
```

Then in Vercel: **New Project → Import this repo**. Vercel auto-detects Vite.
Add the `VITE_*_BLOB_ID` env vars from step 4 above before (or after) the
first deploy — just redeploy once they're set.

## Adding another person's list

1. In `src/lists.config.js`, add:
   ```js
   { slug: 'someone', title: "Someone's List", blobId: import.meta.env.VITE_SOMEONE_BLOB_ID || '' }
   ```
2. In `src/seedData.js`, add a `someone: toPeople([...])` entry — sections and
   starting names (or an empty array to start from scratch).
3. Add `VITE_SOMEONE_BLOB_ID` to `.env.example` and Vercel, following
   "First-time setup" above.

## Local dev

```bash
npm install
npm run dev
```
