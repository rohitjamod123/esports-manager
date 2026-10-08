/* auth.js - login page */
if (Auth.token) location.href = 'index.html';

const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('authMsg');
const okMsg = document.getElementById('authOk');

// Messages coming from other pages (query string)
const params = new URLSearchParams(location.search);
if (params.get('registered')) okMsg.textContent = 'Account created. Please login to continue.';
if (params.get('need')) msg.textContent = 'Please login to register your squad. New here? Create an account first.';

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginForm.classList.add('was-validated');
  if (!loginForm.checkValidity()) { msg.textContent = 'Please fill all fields correctly.'; return; }
  try {
    Auth.save(await api('/auth/login', 'POST', { email: lEmail.value.trim(), password: lPass.value }));
    location.href = 'index.html';
  } catch (err) { msg.textContent = err.message; okMsg.textContent = ''; }
});
