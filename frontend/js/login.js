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
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const loginData = {
      email: email,
      password: password
    };
    
    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
    
    fetch('../api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(error) {
          throw new Error(error.error || 'Login failed');
        });
      }
      return response.json();
    })
    .then(function(data) {
      if (typeof window.showToast === 'function') {
        window.showToast('Signed in successfully!', 'success');
      }
      
      // Store user info in localStorage/sessionStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.full_name || '');
      
      // Redirect after short delay
      window.setTimeout(function () {
        window.location.href = './onboarding.html';
      }, 500);
    })
    .catch(function(error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error.message || 'Login failed', 'error');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    });
  });
})();
