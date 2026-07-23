import React, { useEffect, useRef, useState } from 'react';
import {
  fetchRemote, createRemote, putRemote,
  loadLocalCache, saveLocalCache, loadLocalBlobId, saveLocalBlobId,
} from './remote.js';
import { getSeed } from './seedData.js';
import AddPersonModal from './AddPersonModal.jsx';

export default function ListPage({ list }) {
  const [people, setPeople] = useState([]);
  const [sections, setSections] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [openSections, setOpenSections] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [arrivedEditingId, setArrivedEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sync, setSync] = useState({ text: 'Loading…', state: 'syncing' });

  const blobIdRef = useRef(list.blobId || loadLocalBlobId(list.slug) || null);

  // ---- initial load ----
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const id = blobIdRef.current;

      if (id) {
        setSync({ text: 'Loading…', state: 'syncing' });
        try {
          const data = await fetchRemote(id);
          if (cancelled) return;
          applyData(data);
          setSync({ text: 'Synced', state: 'ok' });
        } catch (e) {
          const cached = loadLocalCache(list.slug);
          applyData(cached || getSeed(list.slug));
          setSync({ text: "Couldn't reach the shared list — showing last saved copy", state: 'error' });
        }
      } else {
        const cached = loadLocalCache(list.slug);
        applyData(cached || getSeed(list.slug));
        setSync({ text: 'Creating your shared list…', state: 'syncing' });
        try {
          const newId = await createRemote(cached || getSeed(list.slug));
          blobIdRef.current = newId;
          saveLocalBlobId(list.slug, newId);
          setSync({
            text: `Synced — new list created. Add VITE_${list.slug.toUpperCase()}_BLOB_ID=${newId} to your env vars so every device shares it (see README).`,
            state: 'ok',
          });
        } catch (e) {
          setSync({ text: 'Offline mode — this device only', state: 'error' });
        }
      }
    }

    init();
    const interval = setInterval(() => pullRemote(false), 20000);
    return () => { cancelled = true; clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.slug]);

  function applyData(data) {
    const ppl = data.people || [];
    setPeople(ppl);
    setSections(data.sections || [...new Set(ppl.map((p) => p.section))]);
    setNextId(data.nextId || Math.max(0, ...ppl.map((p) => p.id)) + 1);
    setOpenSections(new Set(data.sections || [...new Set(ppl.map((p) => p.section))]));
  }

  function snapshot(ppl = people, secs = sections, nid = nextId) {
    return { people: ppl, sections: secs, nextId: nid };
  }

  async function persist(ppl, secs, nid) {
    const snap = snapshot(ppl, secs, nid);
    saveLocalCache(list.slug, snap);
    if (!blobIdRef.current) return;
    setSync({ text: 'Saving…', state: 'syncing' });
    try {
      const ok = await putRemote(blobIdRef.current, snap);
      setSync({ text: ok ? 'Synced' : 'Save failed — saved locally', state: ok ? 'ok' : 'error' });
    } catch (e) {
      setSync({ text: 'Save failed — saved locally', state: 'error' });
    }
  }

  async function pullRemote(showStatus) {
    if (!blobIdRef.current) return;
    if (showStatus) setSync({ text: 'Refreshing…', state: 'syncing' });
    try {
      const data = await fetchRemote(blobIdRef.current);
      if (editingId === null && arrivedEditingId === null) {
        applyData(data);
      }
      setSync({ text: 'Synced', state: 'ok' });
    } catch (e) {
      setSync({ text: "Couldn't reach the shared list — showing last saved copy", state: 'error' });
    }
  }

  // ---- mutations ----
  function toggleField(id, field) {
    const updated = people.map((p) => (p.id === id ? { ...p, [field]: !p[field] } : p));
    setPeople(updated);
    persist(updated, sections, nextId);
  }

  function setArrived(id, count) {
    const updated = people.map((p) => (p.id === id ? { ...p, arrivedCount: count } : p));
    setPeople(updated);
    persist(updated, sections, nextId);
  }

  function removePerson(id) {
    const updated = people.filter((p) => p.id !== id);
    setPeople(updated);
    persist(updated, sections, nextId);
  }

  function updatePerson(id, changes) {
    const updated = people.map((p) => (p.id === id ? { ...p, ...changes } : p));
    setPeople(updated);
    persist(updated, sections, nextId);
  }

  function addPerson({ section, name, phone, extra }) {
    const secs = sections.includes(section) ? sections : [...sections, section];
    const updated = [...people, {
      id: nextId, section, name, phone: phone || '', extra: Number(extra) || 0,
      called: false, coming: false, arrivedCount: null,
    }];
    setPeople(updated);
    setSections(secs);
    setNextId(nextId + 1);
    setOpenSections((prev) => new Set(prev).add(section));
    persist(updated, secs, nextId + 1);
  }

  // ---- derived ----
  const stats = people.reduce((acc, p) => {
    acc.invited += 1 + (Number(p.extra) || 0);
    if (p.called) acc.called += 1;
    if (p.coming) acc.coming += 1 + (Number(p.extra) || 0);
    if (p.arrivedCount != null) acc.arrived += p.arrivedCount;
    return acc;
  }, { invited: 0, called: 0, coming: 0, arrived: 0 });

  function matchesFilter(p) {
    if (activeFilter === 'not-called') return !p.called;
    if (activeFilter === 'coming') return p.coming;
    if (activeFilter === 'arrived') return p.arrivedCount != null;
    return true;
  }

  function toggleSection(title) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">Guest List</div>
        <h1>{list.title}</h1>
        <div className="sub">Add people, track calls, RSVPs, and who actually showed up</div>
        <div className="stats">
          <Stat num={stats.invited} label="Invited" />
          <Stat num={stats.called} label="Called" />
          <Stat num={stats.coming} label="Coming" />
          <Stat num={stats.arrived} label="Arrived" />
        </div>
      </header>

      <div className="sync-bar">
        <span className={`sync-status ${sync.state === 'error' ? 'error' : sync.state === 'syncing' ? 'syncing' : ''}`}>
          <span className="sync-dot" />{sync.text}
        </span>
        <button className="sync-btn" onClick={() => pullRemote(true)}>↻ Refresh</button>
        <button className="sync-btn" onClick={copyLink}>Copy link to this list</button>
        <a className="sync-btn" href="#/">All lists</a>
      </div>

      <div className="controls">
        <input type="text" placeholder="Search a name…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        {['all', 'not-called', 'coming', 'arrived'].map((f) => (
          <button key={f} className={`filter-btn ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
            {{ all: 'All', 'not-called': 'Not called', coming: 'Coming', arrived: 'Arrived' }[f]}
          </button>
        ))}
      </div>

      <button className="add-btn" onClick={() => setModalOpen(true)}>+ Add person</button>

      <Sections
        sections={sections}
        people={people}
        openSections={openSections}
        toggleSection={toggleSection}
        matchesFilter={matchesFilter}
        searchTerm={searchTerm}
        editingId={editingId}
        setEditingId={setEditingId}
        arrivedEditingId={arrivedEditingId}
        setArrivedEditingId={setArrivedEditingId}
        toggleField={toggleField}
        setArrived={setArrived}
        removePerson={removePerson}
        updatePerson={updatePerson}
      />

      <footer>Open the same link on any device to see the same list.</footer>

      {modalOpen && (
        <AddPersonModal
          sections={sections}
          onClose={() => setModalOpen(false)}
          onAdd={(payload) => { addPerson(payload); setModalOpen(false); }}
        />
      )}
    </div>
  );
}

function Stat({ num, label }) {
  return (
    <div className="stat">
      <div className="stat-num">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Sections({
  sections, people, openSections, toggleSection, matchesFilter, searchTerm,
  editingId, setEditingId, arrivedEditingId, setArrivedEditingId,
  toggleField, setArrived, removePerson, updatePerson,
}) {
  let anyVisible = false;

  const rendered = sections.map((sectionTitle) => {
    const secPeople = people.filter((p) => p.section === sectionTitle);
    const visible = secPeople
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(matchesFilter);

    if (visible.length === 0) return null;
    anyVisible = true;
    const comingCount = secPeople.filter((p) => p.coming).length;
    const isOpen = openSections.has(sectionTitle);

    return (
      <div className={`section ${isOpen ? 'open' : ''}`} key={sectionTitle}>
        <div
          className="section-head" tabIndex={0} role="button" aria-expanded={isOpen}
          onClick={() => toggleSection(sectionTitle)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(sectionTitle); } }}
        >
          <span className="section-title">{sectionTitle}</span>
          <span className="section-meta">
            <span className="section-count">{comingCount}/{secPeople.length} coming</span>
            <span className="chevron" />
          </span>
        </div>
        <div className="rows">
          {visible.map((p) => (
            <Row
              key={p.id} p={p}
              editing={editingId === p.id} arrivedEditing={arrivedEditingId === p.id}
              onEdit={() => setEditingId(editingId === p.id ? null : p.id)}
              onArrivedEdit={() => setArrivedEditingId(arrivedEditingId === p.id ? null : p.id)}
              onToggle={(field) => toggleField(p.id, field)}
              onArrivedConfirm={(count) => { setArrivedEditingId(null); setArrived(p.id, count); }}
              onSave={(changes) => { setEditingId(null); updatePerson(p.id, changes); }}
              onRemove={() => { setEditingId(null); removePerson(p.id); }}
            />
          ))}
        </div>
      </div>
    );
  });

  return (
    <>
      {rendered}
      {!anyVisible && <div className="empty-msg">No one matches that search.</div>}
    </>
  );
}

function Row({ p, editing, arrivedEditing, onEdit, onArrivedEdit, onToggle, onArrivedConfirm, onSave, onRemove }) {
  const [phone, setPhone] = useState(p.phone || '');
  const [extra, setExtra] = useState(p.extra || 0);
  const [arrivedVal, setArrivedVal] = useState(p.arrivedCount != null ? p.arrivedCount : 1 + (Number(p.extra) || 0));

  return (
    <div className="row">
      <div className="row-top">
        <div className="row-name-block">
          <div className={`row-name ${p.called && p.coming ? 'done' : ''}`}>{p.name}</div>
          <div className="row-sub">
            {p.phone && <span>{p.phone}</span>}
            {p.extra > 0 && <span>+{p.extra} with them</span>}
            <button onClick={onEdit}>edit</button>
          </div>
        </div>
        <div className="toggles">
          <button className={`toggle called ${p.called ? 'on' : ''}`} onClick={() => onToggle('called')}>
            <span className="dot" />Called
          </button>
          <button className={`toggle coming ${p.coming ? 'on' : ''}`} onClick={() => onToggle('coming')}>
            <span className="dot" />Coming
          </button>

          {arrivedEditing ? (
            <span className="arrived-input">
              <button onClick={() => setArrivedVal((v) => Math.max(0, v - 1))}>−</button>
              <input type="number" min="0" value={arrivedVal} onChange={(e) => setArrivedVal(Number(e.target.value) || 0)} />
              <button onClick={() => setArrivedVal((v) => v + 1)}>+</button>
              <button style={{ fontSize: 11 }} onClick={() => onArrivedConfirm(arrivedVal)}>✓</button>
            </span>
          ) : p.arrivedCount != null ? (
            <button className="toggle arrived on" onClick={onArrivedEdit}><span className="dot" />Arrived ({p.arrivedCount})</button>
          ) : (
            <button className="toggle" onClick={onArrivedEdit}><span className="dot" />Mark arrived</button>
          )}
        </div>
      </div>

      {editing && (
        <div className="edit-row">
          <input type="text" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input type="number" min="0" placeholder="Extra" value={extra} onChange={(e) => setExtra(Number(e.target.value) || 0)} />
          <div className="btn-row">
            <button className="danger" onClick={onRemove}>Remove</button>
            <button className="primary" onClick={() => onSave({ phone: phone.trim(), extra })}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
