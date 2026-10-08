/* teams.js - squad cards with CRUD and roster viewer */
let teams = [], editingId = null;

const grid = document.getElementById('grid');
const teamModal = new bootstrap.Modal(document.getElementById('teamModal'));
const rosterModal = new bootstrap.Modal(document.getElementById('rosterModal'));
const form = document.getElementById('teamForm');

if (!Auth.token) document.getElementById('addBtn').classList.add('d-none');

async function load() {
  try { teams = await api('/teams?sort=-points'); render(); }
  catch (err) { grid.innerHTML = `<p style="color:#ff8d8d">${esc(err.message)}</p>`; }
}

function render() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const list = teams.filter((t) => t.name.toLowerCase().includes(q));
  if (!list.length) { grid.innerHTML = '<p class="text-muted-ff">No squads found. Add the first one.</p>'; return; }
  grid.innerHTML = list.map((t) => `
    <div class="col-md-6 col-lg-4"><article class="card-ff h-100">
      <div class="d-flex justify-content-between mb-2"><span class="tag-chip">${esc(t.tag)}</span><span class="meta">${esc(t.region)}</span></div>
      <h3>${esc(t.name)}</h3>
      <div class="meta">Captain: ${esc(t.captain)}</div>
      <div class="d-flex gap-4 mt-2"><div><div class="prize">${t.wins}</div><span class="meta">wins</span></div><div><div class="prize">${t.points}</div><span class="meta">points</span></div></div>
      <div class="actions">
        <button class="btn-fire btn-sm-ff" data-act="roster" data-id="${t._id}">View roster</button>
        ${Auth.token ? `<button class="btn-ghost btn-sm-ff" data-act="edit" data-id="${t._id}">Edit</button>` : ''}
        ${Auth.isAdmin ? `<button class="btn-ghost btn-danger-ff btn-sm-ff" data-act="delete" data-id="${t._id}">Delete</button>` : ''}
      </div>
    </article></div>`).join('');
}

grid.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]'); if (!btn) return;
  const id = btn.dataset.id, t = teams.find((x) => x._id === id);

  if (btn.dataset.act === 'roster') {
    document.getElementById('rosterTitle').textContent = t.name + ' roster';
    const body = document.getElementById('rosterBody');
    body.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
    rosterModal.show();
    try {
      const players = await api('/players?team=' + id);
      body.innerHTML = players.length
        ? players.map((p) => `<tr><td>${esc(p.ign)}</td><td>${esc(p.role)}</td><td>${p.kills}</td><td>${p.headshotRate}%</td></tr>`).join('')
        : '<tr><td colspan="4">No players yet. Add them on the Players page.</td></tr>';
    } catch (err) { body.innerHTML = `<tr><td colspan="4">${esc(err.message)}</td></tr>`; }
  }
  if (btn.dataset.act === 'edit') {
    editingId = id;
    document.getElementById('teamModalTitle').textContent = 'Edit squad';
    fName.value = t.name; fTag.value = t.tag; fCaptain.value = t.captain;
    fRegion.value = t.region; fWins.value = t.wins; fPoints.value = t.points;
    teamModal.show();
  }
  if (btn.dataset.act === 'delete' && confirm(`Delete squad "${t.name}"?`)) {
    try { await api('/teams/' + id, 'DELETE'); toast('Squad deleted'); load(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  editingId = null; form.reset();
  document.getElementById('teamModalTitle').textContent = 'Add squad';
  teamModal.show();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;
  const body = {
    name: fName.value.trim(), tag: fTag.value.trim(), captain: fCaptain.value.trim(),
    region: fRegion.value.trim() || 'India', wins: Number(fWins.value), points: Number(fPoints.value)
  };
  try {
    if (editingId) await api('/teams/' + editingId, 'PUT', body);
    else await api('/teams', 'POST', body);
    toast(editingId ? 'Squad updated' : 'Squad added');
    teamModal.hide(); load();
  } catch (err) { toast(err.message, 'danger'); }
});

document.getElementById('search').addEventListener('input', render);
load();
