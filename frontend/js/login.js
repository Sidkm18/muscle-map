(function () {
  const passInput = document.getElementById('login-password');
  const toggle = document.getElementById('toggle-password');
  const form = document.getElementById('login-form');

  if (!passInput || !toggle || !form) {
    return;
  }

  toggle.addEventListener('click', function () {
    const isHidden = passInput.getAttribute('type') === 'password';
    passInput.setAttribute('type', isHidden ? 'text' : 'password');
    toggle.textContent = isHidden ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    const email = document.getElementById('login-email');
    if (email && email.value) {
      localStorage.setItem('userEmail', email.value);
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Signed in (demo mode).', 'success');
    }
    window.setTimeout(function () {
      window.location.href = './onboarding.html';
    }, 500);
  });
})();
