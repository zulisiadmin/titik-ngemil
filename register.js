const joinForm = document.querySelector('#join-form');
const formSuccess = document.querySelector('#form-success');
const submitButton = joinForm.querySelector('[type="submit"]');

joinForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = 'Mengirim…';
  formSuccess.classList.add('is-visible');
  formSuccess.textContent = 'Menghubungkan ke server…';
  try {
    const payload = Object.fromEntries(new FormData(joinForm));
    const data = await tnApi('/api/register', { method: 'POST', body: JSON.stringify(payload) });
    formSuccess.innerHTML = `Pendaftaran berhasil dikirim. Nomor pendaftaran: <strong>${data.id}</strong>. Akun tenant untuk <strong>${payload.email}</strong> sudah dibuat. Silakan <a href="login.html">login</a>.`;
    joinForm.reset();
  } catch (error) {
    formSuccess.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Kirim pendaftaran';
  }
});
