document.querySelector('#header').innerHTML = tnHeader();
document.querySelector('#footer').innerHTML = tnFooter();
const statusForm = document.querySelector('#status-form');
const statusResult = document.querySelector('#status-result');
const user = JSON.parse(localStorage.getItem('tn_auth_user') || 'null');

if (!localStorage.getItem('tn_auth_token')) {
  statusResult.innerHTML = '<h3>Login diperlukan</h3><p>Silakan login dengan akun yang dibuat saat pendaftaran.</p><a class="button button-primary" href="login.html">Login</a>';
  statusResult.classList.add('is-visible');
} else if (user) {
  statusResult.innerHTML = `<p class="eyebrow">Akun aktif</p><h3>${user.brand}</h3><p>${user.email}</p>`;
  statusResult.classList.add('is-visible');
}

statusForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = document.querySelector('#application-id').value.trim().toUpperCase();
  statusResult.innerHTML = '<p>Memeriksa status…</p>';
  statusResult.classList.add('is-visible');
  try {
    const { application } = await tnApi(`/api/applications/${encodeURIComponent(id)}`);
    statusResult.innerHTML = `<p class="eyebrow">${application.stage.replaceAll('-',' ')}</p><h3>${application.brand_name}</h3><p>${application.note || 'Pendaftaran sudah diterima dan sedang menunggu peninjauan tim kurasi.'}</p>${application.booth ? `<strong>Booth ${application.booth}</strong>` : ''}`;
  } catch (error) {
    statusResult.innerHTML = `<h3>Status belum dapat ditampilkan</h3><p>${error.message}</p>`;
  }
});
