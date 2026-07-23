# Gruhapravesha Guest List

A Vite + React guest-list tracker for a housewarming ceremony. It supports
multiple family lists, sections, RSVP and arrival tracking, and normal/costly
gift markers.

## Data storage

The initial guest data is stored in `src/data/guestLists.json`. This includes
the current Kruthik and Brother lists. The app uses Firebase Cloud Firestore to
share live changes between devices. Local browser storage is retained only as
an offline fallback.

## Run locally

```bash
npm install
npm run dev
```

Use **Add another list** on the home screen to create a new local list. To add
a permanent pre-filled list for every new Firebase project, edit
`src/data/guestLists.json`.
