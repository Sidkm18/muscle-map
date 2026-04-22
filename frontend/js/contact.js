(function () {
  const form = document.getElementById('contact-form');
  const app = window.MuscleMap || {};

  if (!form) {
    return;
  }

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const subjectInput = document.getElementById('subject');
  const messageInput = document.getElementById('message');
  const submitButton = form.querySelector('button[type="submit"]');

  if (typeof app.getSession === 'function') {
    app.getSession().then(function (session) {
      if (!session || !session.authenticated || !session.user) {
        return;
      }

      if (nameInput && !nameInput.value) {
        nameInput.value = String(session.user.full_name || session.user.username || '').trim();
      }

      if (emailInput && !emailInput.value) {
        emailInput.value = String(session.user.email || '').trim();
      }
    }).catch(function () {
      // Keep the form usable for guests if session lookup fails.
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (typeof app.requestJson !== 'function') {
      if (typeof window.showToast === 'function') {
        window.showToast('Support form is unavailable right now.', 'error');
      }
      return;
    }

    const payload = {
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      subject: subjectInput ? subjectInput.value : '',
      message: messageInput ? messageInput.value.trim() : ''
    };

    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitButton, true, 'Sending...');
    }

    app.requestJson('contact', {
      method: 'POST',
      body: payload
    }).then(function () {
      if (typeof window.showToast === 'function') {
        window.showToast('Support request submitted successfully!', 'success');
      }
      form.reset();
    }).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error && error.message ? error.message : 'Unable to submit request.', 'error');
      }
    }).finally(function () {
      if (typeof app.setButtonBusy === 'function') {
        app.setButtonBusy(submitButton, false);
      }
    });
  });
})();
