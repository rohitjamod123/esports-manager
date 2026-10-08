/* home.js - stats counters, featured tournaments, leaderboard and countdown */
(async function () {
  try {
    const [stats, tournaments, teams] = await Promise.all([
      api('/stats'), api('/tournaments?sort=startDate'), api('/teams?sort=-points')
    ]);

    // Animated counters
    document.querySelectorAll('[data-count]').forEach((el) => animate(el, stats[el.dataset.count]));
    document.getElementById('prizeStat').textContent = inr(stats.prizePool);

    // Featured tournaments (not completed)
    const open = tournaments.filter((t) => t.status !== 'Completed').slice(0, 3);
    document.getElementById('featured').innerHTML = open.length
      ? open.map((t) => `
        <div class="col-md-4"><article class="card-ff h-100">
          <div class="d-flex justify-content-between align-items-start mb-2"><h3>${esc(t.title)}</h3>${statusBadge(t.status)}</div>
          <div class="prize">${inr(t.prize)}</div>
          <div class="meta">${esc(t.mode)} · ${fmtDate(t.startDate)} · ${t.teams.length}/${t.slots} squads</div>
          <div class="actions"><a class="btn-fire btn-sm-ff" href="tournaments.html">Register</a></div>
        </article></div>`).join('')
      : '<p class="text-muted-ff">No open tournaments right now. Check back soon.</p>';

    // Leaderboard
    document.getElementById('board').innerHTML = teams.slice(0, 5).map((t, i) => `
      <tr class="${i === 0 ? 'rank-1' : ''}"><td>#${i + 1}</td>
      <td><span class="tag-chip me-2">${esc(t.tag)}</span>${esc(t.name)}</td>
      <td>${esc(t.region)}</td><td>${t.wins}</td><td>${t.points}</td></tr>`).join('');

    startCountdown(tournaments.filter((t) => t.status === 'Upcoming' && new Date(t.startDate) > new Date())[0]);
  } catch (err) {
    document.getElementById('nextName').textContent = 'Server offline';
    toast(err.message, 'danger');
  }

  function animate(el, target) {
    const steps = 30; let n = 0;
    const timer = setInterval(() => {
      n++; el.textContent = Math.round((target * n) / steps);
      if (n >= steps) clearInterval(timer);
    }, 25);
  }

  function startCountdown(t) {
    const name = document.getElementById('nextName');
    if (!t) { name.textContent = 'No upcoming event'; return; }
    name.textContent = t.title;
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      const diff = Math.max(0, new Date(t.startDate) - new Date());
      document.getElementById('cdD').textContent = pad(Math.floor(diff / 864e5));
      document.getElementById('cdH').textContent = pad(Math.floor(diff / 36e5) % 24);
      document.getElementById('cdM').textContent = pad(Math.floor(diff / 6e4) % 60);
      document.getElementById('cdS').textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick(); setInterval(tick, 1000);
  }
})();
