/* layout.js - injects the shared navbar and footer into every page (DOM manipulation) */
(function () {
  const pages = [
    ['index.html', 'Home'],
    ['tournaments.html', 'Tournaments'],
    ['teams.html', 'Squads'],
    ['players.html', 'Players'],
    ['about.html', 'About']
  ];
  const current = location.pathname.split('/').pop() || 'index.html';
  const user = Auth.user;

  const links = pages.map(([href, label]) =>
    `<li class="nav-item"><a class="nav-link ${href === current ? 'active' : ''}" href="${href}">${label}</a></li>`
  ).join('');

  const account = user
    ? `<span class="me-3 text-muted-ff">Hi, <b>${esc(user.name)}</b> (${esc(user.role)})</span>
       <button class="btn-ghost btn-sm-ff" id="logoutBtn">Logout</button>`
    : `<a class="btn-ghost btn-sm-ff me-2" href="login.html">Login</a>
       <a class="btn-fire btn-sm-ff" href="register.html">Register</a>`;

  document.getElementById('navbar').innerHTML = `
    <nav class="navbar navbar-expand-lg site-nav">
      <div class="container">
        <a class="navbar-brand brand" href="index.html">BOOYAH<span>ARENA</span></a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav me-auto">${links}</ul>
          <div class="d-flex align-items-center">${account}</div>
        </div>
      </div>
    </nav>`;

  const svg = (inner) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const socials = [
    ['YouTube', 'https://www.youtube.com/', svg('<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>')],
    ['Instagram', 'https://www.instagram.com/', svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/>')],
    ['Discord', 'https://discord.com/', svg('<path d="M5 6.5c2-1.2 4-1.7 7-1.7s5 .5 7 1.7c1.3 3 1.9 6 1.7 9.5-1.6 1.2-3.2 1.8-4.7 2.2l-1-1.7M5 6.5C3.7 9.5 3.1 12.5 3.3 16c1.6 1.2 3.2 1.8 4.7 2.2l1-1.7"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/>')],
    ['X (Twitter)', 'https://x.com/', svg('<path d="M4 4l16 16M20 4L4 20"/>')]
  ].map(([name, url, icon]) => `<a class="social" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${icon}</a>`).join('');

  document.getElementById('footer').innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="newsletter">
          <div>
            <h3>Get tournament alerts</h3>
            <p class="mb-0">New events, prize pools and slot openings, straight to your inbox.</p>
          </div>
          <form id="newsForm" class="d-flex gap-2 flex-wrap" novalidate>
            <label class="visually-hidden" for="newsEmail">Email address</label>
            <input type="email" id="newsEmail" class="form-control" placeholder="you@example.com" required style="min-width:240px">
            <button class="btn-fire" type="submit">Subscribe</button>
          </form>
        </div>

        <div class="row g-4 footer-cols">
          <div class="col-lg-4">
            <div class="brand fs-5 text-white">BOOYAH<span style="color:var(--fire)">ARENA</span></div>
            <p class="mt-2">The home for amateur esports squads. Build your roster, enter tournaments and climb the leaderboard.</p>
            <div class="d-flex gap-2 mt-3">${socials}</div>
          </div>
          <div class="col-6 col-lg-2">
            <h4>Play</h4>
            <ul class="list-unstyled">
              <li><a href="tournaments.html">Tournaments</a></li>
              <li><a href="teams.html">Squads</a></li>
              <li><a href="players.html">Players</a></li>
              <li><a href="register.html">Create account</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-3">
            <h4>Support</h4>
            <ul class="list-unstyled">
              <li><a href="about.html#faq">FAQs</a></li>
              <li><a href="about.html#rules">Tournament rules</a></li>
              <li><a href="about.html#contact">Contact us</a></li>
              <li><a href="about.html">About us</a></li>
            </ul>
          </div>
          <div class="col-lg-3">
            <h4>Contact</h4>
            <ul class="list-unstyled">
              <li>support@booyaharena.in</li>
              <li>Gandhinagar, Gujarat, India</li>
              <li>Mon to Sat, 10 AM to 7 PM IST</li>
            </ul>
          </div>
        </div>

        <hr class="footer-line">
        <div class="d-flex flex-wrap justify-content-between gap-2">
          <small>&copy; 2026 Booyah Arena. All rights reserved.</small>
          <small><a href="legal.html#privacy">Privacy Policy</a> &nbsp;|&nbsp; <a href="legal.html#terms">Terms of Use</a></small>
        </div>
        <small class="d-block mt-2 disclaimer">Booyah Arena is an independent fan project. It is not affiliated with or endorsed by Garena, Krafton or Free Fire. Team and player names are fictional.</small>
      </div>
    </footer>`;

  const out = document.getElementById('logoutBtn');
  if (out) out.addEventListener('click', () => Auth.logout());

  // Newsletter form (saved in Local Storage as a demo)
  document.getElementById('newsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('newsEmail');
    if (!input.checkValidity() || !input.value.trim()) { toast('Enter a valid email address', 'danger'); return; }
    const list = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (!list.includes(input.value.trim())) list.push(input.value.trim());
    localStorage.setItem('subscribers', JSON.stringify(list));
    input.value = '';
    toast('You are subscribed. See you in the lobby!');
  });
})();
