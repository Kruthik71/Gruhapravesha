import React, { useState } from 'react';

export default function AddPersonModal({ sections, onClose, onAdd }) {
  const [section, setSection] = useState(sections[0] || '__new__');
  const [newSection, setNewSection] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [extra, setExtra] = useState(0);

  function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    let finalSection = section;
    if (section === '__new__') {
      finalSection = newSection.trim();
      if (!finalSection) return;
    }
    onAdd({ section: finalSection, name: trimmedName, phone: phone.trim(), extra });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h2>Add person</h2>

        <label htmlFor="mSection">Section</label>
        <select id="mSection" value={section} onChange={(e) => setSection(e.target.value)}>
          {sections.map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="__new__">+ New section…</option>
        </select>
        {section === '__new__' && (
          <input type="text" placeholder="New section name" style={{ marginTop: 8 }}
            value={newSection} onChange={(e) => setNewSection(e.target.value)} />
        )}

        <label htmlFor="mName">Name</label>
        <input id="mName" type="text" placeholder="e.g. Rahul" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

        <label htmlFor="mPhone">Phone (optional)</label>
        <input id="mPhone" type="text" placeholder="e.g. 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label htmlFor="mExtra">Extra people with them</label>
        <input id="mExtra" type="number" min="0" value={extra} onChange={(e) => setExtra(Number(e.target.value) || 0)} />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={submit}>Add</button>
        </div>
      </div>
    </div>
  );
}
