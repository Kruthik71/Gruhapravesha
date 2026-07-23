// Each list is a separate shared guest list with its own remote storage id.
// The blobId is what makes the list "the same everywhere" — bake it in via a
// Vercel env var (see README) once you've created the list, and every device
// that opens the deployed site will read/write the same data.
//
// To add a new person's list: add an entry here + a matching env var
// (VITE_<SLUG_UPPER>_BLOB_ID) + a seed in src/seedData.js.

export const LISTS = [
  {
    slug: 'kruthik',
    title: "Kruthik's List",
    blobId: import.meta.env.VITE_KRUTHIK_BLOB_ID || '',
  },
  {
    slug: 'brother',
    title: "Brother's List",
    blobId: import.meta.env.VITE_BROTHER_BLOB_ID || '',
  },
];

export function getList(slug) {
  return LISTS.find((l) => l.slug === slug) || null;
}
