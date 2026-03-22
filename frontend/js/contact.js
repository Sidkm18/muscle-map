(function () {
  const form = document.getElementById('contact-form');
  if (!form) {
    return;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (typeof window.showToast === 'function') {
      window.showToast('Message sent successfully!', 'success');
    }
    form.reset();
  });
})();
