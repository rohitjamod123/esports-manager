/* tournaments.js - list, filter, search, create/edit/delete (CRUD) and register squads */
let all = [], filter = 'All', editingId = null, registerId = null;

const grid = document.getElementById('grid');
const tModal = new bootstrap.Modal(document.getElementById('tModal'));
const rModal = new bootstrap.Modal(document.getElementById('rModal'));
const tForm = document.getElementById('tForm');
const rForm = document.getElementById('rForm');

// Build the 4 player rows (in-game name + Free Fire UID) for the registration form
document.getElementById('playerRows').innerHTML = [1, 2, 3, 4].map((n) => `
  <div class="row g-2 mb-3">
    <div class="col-12"><b>Player ${n}${n === 1 ? ' (Captain)' : ''}</b></div>
    <div class="col-6"><input class="form-control" id="pIgn${n}" placeholder="In-game name" aria-label="Player ${n} in-game name" required></div>
    <div class="col-6"><input class="form-control" id="pUid${n}" placeholder="Free Fire UID" aria-label="Player ${n} UID" inputmode="numeric" pattern="[0-9]{6,12}" required></div>
  </div>`).join('');

if (!Auth.token) document.getElementById('addBtn').classList.add('d-none');

async function load() {
  try { all = await api('/tournaments?sort=startDate'); render(); }
  catch (err) { grid.innerHTML = `<p style="color:#ff8d8d">${esc(err.message)}</p>`; }
}

function render() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const list = all.filter((t) => (filter === 'All' || t.status === filter) && t.title.toLowerCase().includes(q));
  if (!list.length) { grid.innerHTML = '<p class="text-muted-ff">No tournaments match. Try another filter.</p>'; return; }

  grid.innerHTML = list.map((t) => {
    const pct = Math.round((t.teams.length / t.slots) * 100);
    const canRegister = t.status !== 'Completed' && t.teams.length < t.slots;
    return `
    <div class="col-md-6 col-lg-4"><article class="card-ff h-100">
      <div class="d-flex justify-content-between align-items-start mb-2"><h3>${esc(t.title)}</h3>${statusBadge(t.status)}</div>
      <div class="prize">${inr(t.prize)}</div>
      <div class="meta">${esc(t.mode)} · starts ${fmtDate(t.startDate)}</div>
      <div class="meta mt-2">${t.teams.length} of ${t.slots} slots filled</div>
      <div class="slot-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
      <div class="meta mt-2">${t.teams.map((x) => esc(x.tag)).join(', ') || 'No squads yet'}</div>
      <div class="actions">
        ${canRegister ? `<button class="btn-fire btn-sm-ff" data-act="register" data-id="${t._id}">Register</button>` : ''}
        ${Auth.token ? `<button class="btn-ghost btn-sm-ff" data-act="edit" data-id="${t._id}">Edit</button>` : ''}
        ${Auth.isAdmin ? `<button class="btn-ghost btn-danger-ff btn-sm-ff" data-act="delete" data-id="${t._id}">Delete</button>` : ''}
      </div>
    </article></div>`;
  }).join('');
}

// Event delegation for card buttons
grid.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.dataset.id, t = all.find((x) => x._id === id);

  if (btn.dataset.act === 'register') {
    if (!Auth.token) { toast('Login required. New here? Create an account first.', 'danger'); setTimeout(() => { location.href = 'login.html?need=1'; }, 1400); return; }
    registerId = id;
    document.getElementById('rTourName').textContent = t.title;
    rForm.classList.remove('was-validated');
    rModal.show();
  }
  if (btn.dataset.act === 'edit') {
    editingId = id;
    document.getElementById('tModalTitle').textContent = 'Edit tournament';
    document.getElementById('tTitle').value = t.title;
    document.getElementById('tPrize').value = t.prize;
    document.getElementById('tSlots').value = t.slots;
    document.getElementById('tMode').value = t.mode;
    document.getElementById('tStatus').value = t.status;
    document.getElementById('tDate').value = new Date(t.startDate).toISOString().slice(0, 10);
    tModal.show();
  }
  if (btn.dataset.act === 'delete' && confirm(`Delete "${t.title}"? This cannot be undone.`)) {
    try { await api('/tournaments/' + id, 'DELETE'); toast('Tournament deleted'); load(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  editingId = null; tForm.reset(); tForm.classList.remove('was-validated');
  document.getElementById('tModalTitle').textContent = 'Create tournament';
  tModal.show();
});

tForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  tForm.classList.add('was-validated');
  if (!tForm.checkValidity()) return;
  const body = {
    title: document.getElementById('tTitle').value.trim(),
    prize: Number(document.getElementById('tPrize').value),
    slots: Number(document.getElementById('tSlots').value),
    mode: document.getElementById('tMode').value,
    status: document.getElementById('tStatus').value,
    startDate: document.getElementById('tDate').value
  };
  try {
    if (editingId) await api('/tournaments/' + editingId, 'PUT', body);
    else await api('/tournaments', 'POST', body);
    toast(editingId ? 'Tournament updated' : 'Tournament created');
    tModal.hide(); load();
  } catch (err) { toast(err.message, 'danger'); }
});

rForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  rForm.classList.add('was-validated');
  if (!rForm.checkValidity()) { toast('Fill the squad name, tag and all 4 players correctly', 'danger'); return; }
  const players = [1, 2, 3, 4].map((n) => ({
    ign: document.getElementById('pIgn' + n).value.trim(),
    uid: document.getElementById('pUid' + n).value.trim()
  }));
  const body = {
    teamName: document.getElementById('rSquad').value.trim(),
    tag: document.getElementById('rTag').value.trim(),
    players
  };
  try {
    await api(`/tournaments/${registerId}/register`, 'POST', body);
    toast('Squad registered. Good luck!');
    rModal.hide(); rForm.reset(); rForm.classList.remove('was-validated');
    load();
  } catch (err) { toast(err.message, 'danger'); }
});

document.getElementById('filters').addEventListener('click', (e) => {
  const b = e.target.closest('.filter-btn'); if (!b) return;
  document.querySelectorAll('#filters .filter-btn').forEach((x) => x.classList.remove('active'));
  b.classList.add('active'); filter = b.dataset.status; render();
});
document.getElementById('search').addEventListener('input', render);

load();
