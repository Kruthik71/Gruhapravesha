const LIST_DATA_PREFIX = 'housewarming-list-data-';
const CUSTOM_LISTS_KEY = 'housewarming-custom-lists';

export function loadListData(slug, fallback) {
  try {
    const saved = localStorage.getItem(`${LIST_DATA_PREFIX}${slug}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function saveListData(slug, data) {
  localStorage.setItem(`${LIST_DATA_PREFIX}${slug}`, JSON.stringify(data));
}

export function loadCustomLists() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_LISTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCustomLists(lists) {
  localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(lists));
}
