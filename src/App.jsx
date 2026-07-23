import React, { useEffect, useState } from 'react';
import { DEFAULT_LISTS } from './seedData.js';
import { loadCustomLists, saveCustomLists } from './localStorage.js';
import ListPage from './ListPage.jsx';

function getSlugFromHash() {
  return window.location.hash.replace(/^#\/?/, '') || null;
}

function makeSlug(title, existing) {
  const base = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-list';
  let slug = base;
  let suffix = 2;
  while (existing.some((list) => list.slug === slug)) slug = `${base}-${suffix++}`;
  return slug;
}

export default function App() {
  const [slug, setSlug] = useState(getSlugFromHash());
  const [customLists, setCustomLists] = useState(loadCustomLists);
  const lists = [...DEFAULT_LISTS, ...customLists];

  useEffect(() => {
    const onHashChange = () => setSlug(getSlugFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const list = slug ? lists.find((entry) => entry.slug === slug) : null;
  if (!list) return <Home lists={lists} onCreateList={(title) => {
    const newList = { title, slug: makeSlug(title, lists) };
    const next = [...customLists, newList];
    setCustomLists(next);
    saveCustomLists(next);
    window.location.hash = `#/${newList.slug}`;
  }} />;

  return <ListPage key={list.slug} list={list} />;
}

function Home({ lists, onCreateList }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateList(title.trim());
  }
  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Gruhapravesha</div>
        <h1>Guest Lists</h1>
        <div className="sub">Choose a family list, or begin a new one</div>
      </header>
      <div className="home-cards">
        {lists.map((list) => <a key={list.slug} className="home-card" href={`#/${list.slug}`}><span className="home-card-title">{list.title}</span><span className="home-card-arrow">→</span></a>)}
      </div>
      {adding ? <form className="new-list-form" onSubmit={submit}><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Parents' List" /><button className="primary" type="submit">Create list</button><button type="button" onClick={() => setAdding(false)}>Cancel</button></form> : <button className="add-btn" onClick={() => setAdding(true)}>+ Add another list</button>}
    </div>
  );
}
