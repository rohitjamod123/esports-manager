/* register.js - create account, then send the user to the login page */
if (Auth.token) location.href = 'index.html';

const registerForm = document.getElementById('registerForm');
const regMsg = document.getElementById('regMsg');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerForm.classList.add('was-validated');
  regMsg.textContent = '';
  if (!registerForm.checkValidity()) { regMsg.textContent = 'Please fill all fields and accept the terms.'; return; }
  if (rPass.value !== rPass2.value) { regMsg.textContent = 'Passwords do not match.'; return; }
  try {
    await api('/auth/register', 'POST', { name: rName.value.trim(), email: rEmail.value.trim(), password: rPass.value });
    // Account is created. User must login now (register first, then login).
    location.href = 'login.html?registered=1';
  } catch (err) { regMsg.textContent = err.message; }
});
