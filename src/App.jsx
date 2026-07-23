import React, { useEffect, useState } from 'react';
import { LISTS, getList } from './lists.config.js';
import ListPage from './ListPage.jsx';

function getSlugFromHash() {
  return window.location.hash.replace(/^#\/?/, '') || null;
}

export default function App() {
  const [slug, setSlug] = useState(getSlugFromHash());

  useEffect(() => {
    const onHashChange = () => setSlug(getSlugFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const list = slug ? getList(slug) : null;

  if (!list) {
    return <Home />;
  }

  return <ListPage key={list.slug} list={list} />;
}

function Home() {
  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Guest Lists</div>
        <h1>Whose list?</h1>
        <div className="sub">Pick a list to open it</div>
      </header>
      <div className="home-cards">
        {LISTS.map((l) => (
          <a key={l.slug} className="home-card" href={`#/${l.slug}`}>
            <span className="home-card-title">{l.title}</span>
            <span className="home-card-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
