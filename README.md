# Gruhapravesha Guest List

A Vite + React guest-list tracker for a housewarming ceremony. It supports
multiple family lists, sections, RSVP and arrival tracking, and normal/costly
gift markers.

## Data storage

The initial guest data is stored locally in `src/data/guestLists.json`. This
includes the current Kruthik and Brother lists. When you use the app, edits and
new lists are saved in your browser's local storage. No blob service, API,
environment variable, or remote database is used.

Because storage is browser-local, another device or browser will start from the
JSON file and will not see changes made elsewhere.

## Run locally

```bash
npm install
npm run dev
```

Use **Add another list** on the home screen to create a new local list. To add
a permanent pre-filled list for every new browser, edit
`src/data/guestLists.json`.
