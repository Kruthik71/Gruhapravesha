import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getSeed } from './seedData.js';
import { db } from './firebase.js';
import { loadListData, saveListData } from './localStorage.js';
import AddPersonModal from './AddPersonModal.jsx';

export default function ListPage({ list }) {
  const [people, setPeople] = useState([]);
  const [sections, setSections] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [openSections, setOpenSections] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [sync, setSync] = useState({ text: 'Connecting to shared list...', state: 'syncing' });

  useEffect(() => {
    let initialized = false;
    const fallback = loadListData(list.slug, getSeed(list.slug));
    function applyData(data) {
      const titles = data.sections || [...new Set((data.people || []).map((person) => person.section))];
      setPeople(data.people || []); setSections(titles); setNextId(data.nextId || 1); setOpenSections(new Set(titles));
    }
    applyData(fallback);
    const reference = doc(db, 'guestLists', list.slug);
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      if (snapshot.exists()) { applyData(snapshot.data()); saveListData(list.slug, snapshot.data()); setSync({ text: 'Synced across devices', state: 'ok' }); }
      else { setDoc(reference, fallback).catch(() => setSync({ text: 'Unable to create shared list', state: 'error' })); }
      initialized = true;
    }, () => { if (!initialized) setSync({ text: 'Offline - using this device copy', state: 'error' }); });
    return unsubscribe;
  }, [list.slug]);

  function save(updatedPeople, updatedSections = sections, updatedNextId = nextId) {
    setPeople(updatedPeople); setSections(updatedSections); setNextId(updatedNextId);
    const data = { people: updatedPeople, sections: updatedSections, nextId: updatedNextId };
    saveListData(list.slug, data);
    setSync({ text: 'Saving shared changes...', state: 'syncing' });
    setDoc(doc(db, 'guestLists', list.slug), data).catch(() => setSync({ text: 'Save failed - stored on this device', state: 'error' }));
  }
  function update(id, changes) { save(people.map((person) => person.id === id ? { ...person, ...changes } : person)); }
  function addPerson({ section, name, phone, extra }) {
    const updatedSections = sections.includes(section) ? sections : [...sections, section];
    const updatedPeople = [...people, { id: nextId, section, name, phone: phone || '', extra: Number(extra) || 0, called: false, coming: false, arrivedCount: null, giftType: null }];
    save(updatedPeople, updatedSections, nextId + 1); setOpenSections((current) => new Set(current).add(section));
  }
  const stats = people.reduce((total, person) => ({
    invited: total.invited + 1 + (Number(person.extra) || 0), called: total.called + Number(person.called),
    coming: total.coming + (person.coming ? 1 + (Number(person.extra) || 0) : 0), arrived: total.arrived + (person.arrivedCount || 0),
  }), { invited: 0, called: 0, coming: 0, arrived: 0 });
  const matches = (person) => person.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'not-called' && !person.called) || (filter === 'coming' && person.coming) || (filter === 'arrived' && person.arrivedCount != null));

  return <div className="wrap">
    <header><div className="eyebrow">Gruhapravesha Guest List</div><h1>{list.title}</h1><div className="sub">Track invitations, RSVPs, arrivals, and gifts for your housewarming</div><div className="stats">{Object.entries(stats).map(([label, num]) => <Stat key={label} num={num} label={label} />)}</div></header>
    <div className="sync-bar"><span className={`sync-status ${sync.state === 'error' ? 'error' : sync.state === 'syncing' ? 'syncing' : ''}`}><span className="sync-dot" />{sync.text}</span><button className="sync-btn" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link to this list</button><a className="sync-btn" href="#/">All lists</a></div>
    <div className="controls"><input type="text" placeholder="Search a name..." value={search} onChange={(event) => setSearch(event.target.value)} />{[['all', 'All'], ['not-called', 'Not called'], ['coming', 'Coming'], ['arrived', 'Arrived']].map(([value, label]) => <button key={value} className={`filter-btn ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <button className="add-btn" onClick={() => setModalOpen(true)}>+ Add person</button>
    {sections.map((section) => <Section key={section} title={section} people={people.filter((person) => person.section === section)} open={openSections.has(section)} onToggle={() => setOpenSections((current) => { const next = new Set(current); next.has(section) ? next.delete(section) : next.add(section); return next; })} matches={matches} onUpdate={update} onRemove={(id) => save(people.filter((person) => person.id !== id))} />)}
    {people.filter(matches).length === 0 && <div className="empty-msg">No one matches that search.</div>}
    <footer>Changes are shared automatically with anyone using this link.</footer>
    {modalOpen && <AddPersonModal sections={sections} onClose={() => setModalOpen(false)} onAdd={(payload) => { addPerson(payload); setModalOpen(false); }} />}
  </div>;
}

function Stat({ num, label }) { return <div className="stat"><div className="stat-num">{num}</div><div className="stat-label">{label}</div></div>; }

function Section({ title, people, open, onToggle, matches, onUpdate, onRemove }) {
  const visible = people.filter(matches); if (!visible.length) return null;
  return <div className={`section ${open ? 'open' : ''}`}><div className="section-head" role="button" tabIndex={0} onClick={onToggle} onKeyDown={(event) => event.key === 'Enter' && onToggle()}><span className="section-title">{title}</span><span className="section-meta"><span className="section-count">{people.filter((person) => person.coming).length}/{people.length} coming</span><span className="chevron" /></span></div><div className="rows">{visible.map((person) => <Row key={person.id} person={person} onUpdate={onUpdate} onRemove={onRemove} />)}</div></div>;
}

function Row({ person, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false); const [phone, setPhone] = useState(person.phone || ''); const [extra, setExtra] = useState(person.extra || 0); const [arriving, setArriving] = useState(false); const [count, setCount] = useState(person.arrivedCount ?? 1 + (Number(person.extra) || 0));
  return <div className="row"><div className="row-top"><div className="row-name-block"><div className={`row-name ${person.called && person.coming ? 'done' : ''}`}>{person.name}</div><div className="row-sub">{person.phone && <span>{person.phone}</span>}{person.extra > 0 && <span>+{person.extra} with them</span>}<button onClick={() => setEditing(!editing)}>edit</button></div></div><div className="toggles"><button className={`toggle called ${person.called ? 'on' : ''}`} onClick={() => onUpdate(person.id, { called: !person.called })}><span className="dot" />Called</button><button className={`toggle coming ${person.coming ? 'on' : ''}`} onClick={() => onUpdate(person.id, { coming: !person.coming })}><span className="dot" />Coming</button><button className={`toggle gift-normal ${person.giftType === 'normal' ? 'on' : ''}`} onClick={() => onUpdate(person.id, { giftType: person.giftType === 'normal' ? null : 'normal' })}>Normal gift</button><button className={`toggle gift-costly ${person.giftType === 'costly' ? 'on' : ''}`} onClick={() => onUpdate(person.id, { giftType: person.giftType === 'costly' ? null : 'costly' })}>Costly gift</button>{arriving ? <span className="arrived-input"><button onClick={() => setCount(Math.max(0, count - 1))}>−</button><input type="number" min="0" value={count} onChange={(event) => setCount(Number(event.target.value) || 0)} /><button onClick={() => setCount(count + 1)}>+</button><button onClick={() => { onUpdate(person.id, { arrivedCount: count }); setArriving(false); }}>✓</button></span> : <button className={`toggle arrived ${person.arrivedCount != null ? 'on' : ''}`} onClick={() => setArriving(true)}><span className="dot" />{person.arrivedCount != null ? `Arrived (${person.arrivedCount})` : 'Mark arrived'}</button>}</div></div>{editing && <div className="edit-row"><input value={phone} placeholder="Phone" onChange={(event) => setPhone(event.target.value)} /><input type="number" min="0" value={extra} onChange={(event) => setExtra(Number(event.target.value) || 0)} /><div className="btn-row"><button className="danger" onClick={() => onRemove(person.id)}>Remove</button><button className="primary" onClick={() => { onUpdate(person.id, { phone: phone.trim(), extra }); setEditing(false); }}>Save</button></div></div>}</div>;
}
