import { useState } from 'react';
import api, { errorText } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@booyah.com');
  const [password, setPassword] = useState('admin123');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setMsg(errorText(err)); }
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button className="btn">Login</button>
      {msg && <span className="error">{msg}</span>}
    </form>
  );
}
