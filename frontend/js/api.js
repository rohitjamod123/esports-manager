/* ============================================================
   api.js - shared helpers: Fetch API wrapper, auth (localStorage),
   toast messages and small utilities. Loaded on every page.
   ============================================================ */

const isLocalDev = ['localhost', '127.0.0.1'].includes(location.hostname) && location.port !== '5000';
const API_BASE = (location.protocol === 'file:' || isLocalDev) ? 'http://localhost:5000/api' : '/api';
/* ---------- Auth state stored in Browser Local Storage ---------- */
const Auth = {
  get token() { return localStorage.getItem('token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },
  get isAdmin() { return !!this.user && this.user.role === 'admin'; },
  save(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    location.href = 'login.html';
  }
};

/* ---------- Fetch wrapper (async/await + error handling) ---------- */
async function api(path, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token) headers.Authorization = 'Bearer ' + Auth.token;

  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Start the backend (npm start) and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && Auth.token) { Auth.logout(); }
    throw new Error(data.message || 'Request failed (' + res.status + ')');
  }
  return data;
}

/* ---------- Utilities ---------- */
function esc(value) {                      // prevents HTML injection (basic XSS protection)
  const div = document.createElement('div');
  div.textContent = value == null ? '' : String(value);
  return div.innerHTML;
}
const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const statusBadge = (s) => `<span class="badge-status badge-${esc(s)}">${esc(s.toUpperCase())}</span>`;

function toast(message, type = 'success') {
  let box = document.getElementById('toast-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast-box';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = 'toast-ff ' + (type === 'danger' ? 'danger' : '');
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
