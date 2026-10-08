/* players.js - player table with search, role filter and CRUD */
let players = [], teams = [], editingId = null;

const body = document.getElementById('body');
const pModal = new bootstrap.Modal(document.getElementById('pModal'));
const form = document.getElementById('pForm');

if (!Auth.token) document.getElementById('addBtn').classList.add('d-none');

async function load() {
  try {
    const role = document.getElementById('roleFilter').value;
    const q = document.getElementById('search').value.trim();
    const params = new URLSearchParams({ sort: '-kills' });
    if (role) params.set('role', role);
    if (q) params.set('q', q);
    [players, teams] = await Promise.all([api('/players?' + params), api('/teams?sort=name')]);
    document.getElementById('pTeam').innerHTML = teams.map((t) => `<option value="${t._id}">${esc(t.name)}</option>`).join('');
    render();
  } catch (err) { body.innerHTML = `<tr><td colspan="8">${esc(err.message)}</td></tr>`; }
}

function render() {
  if (!players.length) { body.innerHTML = '<tr><td colspan="8">No players found. Change the filter or add a player.</td></tr>'; return; }
  body.innerHTML = players.map((p) => `
    <tr><td><b>${esc(p.ign)}</b></td><td>${esc(p.realName)}</td><td>${esc(p.uid)}</td><td>${esc(p.role)}</td>
    <td>${p.team ? `<span class="tag-chip">${esc(p.team.tag)}</span>` : '-'}</td><td>${p.kills}</td><td>${p.headshotRate}%</td>
    <td class="text-nowrap">
      ${Auth.token ? `<button class="btn-ghost btn-sm-ff" data-act="edit" data-id="${p._id}">Edit</button>` : ''}
      ${Auth.isAdmin ? `<button class="btn-ghost btn-danger-ff btn-sm-ff" data-act="delete" data-id="${p._id}">Delete</button>` : ''}
    </td></tr>`).join('');
}

body.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-act]'); if (!btn) return;
  const id = btn.dataset.id, p = players.find((x) => x._id === id);
  if (btn.dataset.act === 'edit') {
    editingId = id;
    document.getElementById('pModalTitle').textContent = 'Edit player';
    pIgn.value = p.ign; pReal.value = p.realName || ''; pUid.value = p.uid || '';
    pRole.value = p.role; pTeam.value = p.team ? p.team._id : ''; pKills.value = p.kills; pHs.value = p.headshotRate;
    pModal.show();
  }
  if (btn.dataset.act === 'delete' && confirm(`Delete player "${p.ign}"?`)) {
    try { await api('/players/' + id, 'DELETE'); toast('Player deleted'); load(); }
    catch (err) { toast(err.message, 'danger'); }
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  editingId = null; form.reset();
  document.getElementById('pModalTitle').textContent = 'Add player';
  pModal.show();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;
  const data = {
    ign: pIgn.value.trim(), realName: pReal.value.trim(), uid: pUid.value.trim(), role: pRole.value,
    team: pTeam.value, kills: Number(pKills.value), headshotRate: Number(pHs.value)
  };
  try {
    if (editingId) await api('/players/' + editingId, 'PUT', data);
    else await api('/players', 'POST', data);
    toast(editingId ? 'Player updated' : 'Player added');
    pModal.hide(); load();
  } catch (err) { toast(err.message, 'danger'); }
});

document.getElementById('roleFilter').addEventListener('change', load);
let typing;                                   // debounce search so we don't call the API on every keystroke
document.getElementById('search').addEventListener('input', () => { clearTimeout(typing); typing = setTimeout(load, 300); });
load();
