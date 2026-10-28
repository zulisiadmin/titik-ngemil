const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const loginButton = loginForm.querySelector('[type="submit"]');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  loginButton.textContent = 'Masuk…';
  try {
    const payload = Object.fromEntries(new FormData(loginForm));
    const data = await tnApi('/api/login', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('tn_auth_token', data.token);
    localStorage.setItem('tn_auth_user', JSON.stringify(data.user));
    loginMessage.textContent = `Login berhasil. Selamat datang, ${data.user.brand}.`;
    loginMessage.classList.add('is-visible');
    setTimeout(() => location.href = data.user.role === 'admin' ? 'dashboard-admin.html' : 'dashboard-tenant.html', 700);
  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.classList.add('is-visible');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Masuk ke portal';
  }
});
