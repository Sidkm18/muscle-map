(function () {
  const form = document.getElementById('register-form');
  const passwordInput = document.getElementById('reg-password');
  const toggleBtn = document.getElementById('toggle-register-password');
  const meter = document.querySelectorAll('#strength-meter .strength-bar');

  if (!form) {
    return;
  }

  function evaluatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    meter.forEach(function (bar, index) {
      if (index < score) {
        bar.style.background = '#c5ff2f';
      } else {
        bar.style.background = 'rgba(255,255,255,0.1)';
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      evaluatePasswordStrength(passwordInput.value);
    });
  }

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', function () {
      const hidden = passwordInput.type === 'password';
      passwordInput.type = hidden ? 'text' : 'password';
      toggleBtn.textContent = hidden ? 'Hide' : 'Show';
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('reg-name');
    const email = document.getElementById('reg-email');

    localStorage.setItem('isLoggedIn', 'true');
    if (name && name.value) {
      localStorage.setItem('userName', name.value);
    }
    if (email && email.value) {
      localStorage.setItem('userEmail', email.value);
    }

    if (typeof window.showToast === 'function') {
      window.showToast('Account created successfully.', 'success');
    }

    window.setTimeout(function () {
      window.location.href = './onboarding.html';
    }, 500);
  });
})();
