const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const session = {
    email: formData.get('email'),
    remember: formData.get('remember') === 'on',
    loggedInAt: new Date().toISOString()
  };

  localStorage.setItem('tn_v2_session', JSON.stringify(session));
  loginMessage.classList.add('is-visible');
});
