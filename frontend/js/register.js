(function () {
  const form = document.getElementById('register-form');
  const passwordInput = document.getElementById('reg-password');
  const toggleBtn = document.getElementById('toggle-register-password');
  const meter = document.querySelectorAll('#strength-meter .strength-bar');
  const app = window.MuscleMap || {};

  if (!form || !passwordInput || !toggleBtn) {
    return;
  }

  function scorePassword(password) {
    if (typeof app.scorePassword === 'function') {
      return app.scorePassword(password);
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }

  function updateStrengthMeter(password) {
    const score = scorePassword(password);

    meter.forEach(function (bar, index) {
      bar.style.background = index < score ? '#c5ff2f' : 'rgba(255,255,255,0.1)';
    });
  }

  passwordInput.addEventListener('input', function () {
    updateStrengthMeter(passwordInput.value);
  });

  toggleBtn.addEventListener('click', function () {
    if (typeof app.togglePasswordVisibility === 'function') {
      app.togglePasswordVisibility(toggleBtn, passwordInput);
      return;
    }

    const hidden = passwordInput.type === 'password';
    passwordInput.type = hidden ? 'text' : 'password';
    toggleBtn.textContent = hidden ? 'Hide' : 'Show';
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = passwordInput.value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const passwordScore = scorePassword(password);

    if (passwordScore < 2) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please use a stronger password.', 'error');
      }
      return;
    }

    const registerData = {
      full_name: name,
      email: email,
      password: password
    };

    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitBtn, true, 'Creating account...');
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
    }

    (typeof app.requestJson === 'function' ? app.requestJson('register', { method: 'POST', body: registerData }) : Promise.reject(new Error('Registration unavailable'))).then(
      function () {
        if (typeof window.showToast === 'function') {
          window.showToast('Account created successfully!', 'success');
        }

        localStorage.setItem('isLoggedIn', 'true');
        if (name) {
          localStorage.setItem('userName', name);
        }
        if (email) {
          localStorage.setItem('userEmail', email);
        }

        window.setTimeout(function () {
          window.location.href = app.links && app.links.onboarding ? app.links.onboarding : './onboarding.php';
        }, 500);
      }
    ).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error.message || 'Registration failed', 'error');
      }

      if (typeof app.setButtonBusy === 'function') {
        app.setButtonBusy(submitBtn, false);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  });

  updateStrengthMeter(passwordInput.value);
})();
