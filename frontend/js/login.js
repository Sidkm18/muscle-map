(function () {
  const form = document.getElementById('login-form');
  const passInput = document.getElementById('login-password');
  const toggle = document.getElementById('toggle-password');
  const rememberMeInput = document.getElementById('login-remember-me');
  const app = window.MuscleMap || {};

  if (!form || !passInput || !toggle || !rememberMeInput) {
    return;
  }

  toggle.addEventListener('click', function () {
    if (typeof app.togglePasswordVisibility === 'function') {
      app.togglePasswordVisibility(toggle, passInput);
      return;
    }

    const hidden = passInput.type === 'password';
    passInput.type = hidden ? 'text' : 'password';
    toggle.textContent = hidden ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
    toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = passInput.value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const loginData = {
      email: email,
      password: password,
      remember_me: rememberMeInput.checked ? 1 : 0
    };

    if (!email || !password) {
      if (typeof window.showToast === 'function') {
        window.showToast('Enter your email and password.', 'error');
      }
      return;
    }

    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitBtn, true, 'Signing in...');
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
    }

    (typeof app.requestJson === 'function' ? app.requestJson('login', { method: 'POST', body: loginData }) : Promise.reject(new Error('Login unavailable'))).then(
      function (data) {
        if (typeof window.showToast === 'function') {
          window.showToast('Signed in successfully!', 'success');
        }

        if (typeof app.setSession === 'function') {
          app.setSession(data);
        }

        window.setTimeout(function () {
          window.location.href = './profile.html';
        }, 500);
      }
    ).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error.message || 'Login failed', 'error');
      }

      if (typeof app.setButtonBusy === 'function') {
        app.setButtonBusy(submitBtn, false);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    });
  });
})();
