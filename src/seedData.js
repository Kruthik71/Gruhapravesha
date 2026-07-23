import guestLists from './data/guestLists.json';

function toPeople(sections = []) {
  let id = 1;
  const people = sections.flatMap((section) => section.people.map((name) => ({
    id: id++, section: section.title, name, phone: '', extra: 0,
    called: false, coming: false, arrivedCount: null, giftType: null,
  })));
  return { people, sections: sections.map((section) => section.title), nextId: id };
}

export const DEFAULT_LISTS = guestLists.lists.map(({ slug, title }) => ({ slug, title }));

export function getSeed(slug) {
  const list = guestLists.lists.find((entry) => entry.slug === slug);
  return list ? toPeople(list.sections) : { people: [], sections: [], nextId: 1 };
}
