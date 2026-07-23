// Storage: each list is one JSON blob on jsonblob.com (free, no account,
// plain REST, CORS-enabled for browser use). The blob id is what ties every
// device to the same data — see src/lists.config.js.

const REMOTE_BASE = 'https://jsonblob.com/api/jsonBlob';

export async function fetchRemote(id) {
  const res = await fetch(`${REMOTE_BASE}/${id}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  return res.json();
}

export async function createRemote(data) {
  const res = await fetch(REMOTE_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`create failed: ${res.status}`);
  const location = res.headers.get('Location') || res.headers.get('location') || '';
  const id = location.split('/').filter(Boolean).pop();
  if (!id) throw new Error('no id returned from jsonblob');
  return id;
}

export async function putRemote(id, data) {
  const res = await fetch(`${REMOTE_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  });
  return res.ok;
}

// Per-list local cache (keyed by slug), used as an offline fallback and to
// bridge the gap for a brand-new list before its blobId is baked in via env var.
export function loadLocalCache(slug) {
  try {
    const raw = localStorage.getItem(`guest-list-cache-${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveLocalCache(slug, data) {
  try {
    localStorage.setItem(`guest-list-cache-${slug}`, JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

export function loadLocalBlobId(slug) {
  try {
    return localStorage.getItem(`guest-list-blobid-${slug}`);
  } catch (e) {
    return null;
  }
}

export function saveLocalBlobId(slug, id) {
  try {
    localStorage.setItem(`guest-list-blobid-${slug}`, id);
  } catch (e) {
    /* ignore */
  }
}
