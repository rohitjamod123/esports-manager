/* about.js - live stats and contact form (validated, saved in Browser Local Storage as a demo) */
(async function loadStats() {
  try {
    const stats = await api('/stats');
    document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = stats[el.dataset.count]; });
    document.getElementById('prizeStat').textContent = inr(stats.prizePool);
  } catch { /* stats are optional on this page */ }
})();

const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  contactForm.classList.add('was-validated');
  if (!contactForm.checkValidity()) { toast('Please complete the form first', 'danger'); return; }
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  messages.push({
    name: cName.value.trim(), email: cEmail.value.trim(), topic: cTopic.value,
    text: cMsg.value.trim(), at: new Date().toISOString()
  });
  localStorage.setItem('messages', JSON.stringify(messages));
  contactForm.reset(); contactForm.classList.remove('was-validated');
  toast('Message sent. We reply within 2 working days.');
});
