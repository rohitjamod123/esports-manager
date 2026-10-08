import { useState } from 'react';
import api, { errorText } from '../api';

const empty = { name: '', tag: '', captain: '', region: 'India' };

export default function TeamForm({ onAdded }) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post('/teams', form);   // CREATE
      setForm(empty);
      setMsg('Squad added');
      onAdded();
    } catch (err) { setMsg(errorText(err)); }
  }

  return (
    <form className="panel inline-form" onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={change} placeholder="Squad name" required />
      <input name="tag" value={form.tag} onChange={change} placeholder="Tag" maxLength={5} required />
      <input name="captain" value={form.captain} onChange={change} placeholder="Captain" required />
      <input name="region" value={form.region} onChange={change} placeholder="Region" />
      <button className="btn">Add squad</button>
      {msg && <span>{msg}</span>}
    </form>
  );
}
