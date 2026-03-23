(function () {
  function getPathname() {
    return (window.location && window.location.pathname ? window.location.pathname : '').toLowerCase();
  }

  function isInPagesDirectory() {
    return getPathname().includes('/pages/');
  }

  function getAssetBase() {
    return isInPagesDirectory() ? '../' : './';
  }

  function buildLinks() {
    const base = getAssetBase();

    return {
      home: base + 'index.html',
      exercises: base + 'pages/exercises.html',
      catalogue: base + 'pages/catalogue.html',
      calculator: base + 'pages/calculator.html',
      pricing: base + 'pages/pricing.html',
      login: base + 'pages/login.html',
      register: base + 'pages/register.html',
      onboarding: base + 'pages/onboarding.html',
      about: base + 'pages/about.html',
      contact: base + 'pages/contact.html',
      privacy: base + 'pages/privacy.html',
      terms: base + 'pages/terms.html',
      notFound: base + 'pages/404.html'
    };
  }

  function getApiBase() {
    const configuredBase = (document.body && document.body.dataset && document.body.dataset.apiBase) || window.MUSCLEMAP_API_BASE;
    const derivedBase = deriveApiBaseFromPath();
    const apiBase = configuredBase || derivedBase;
    return apiBase.endsWith('/') ? apiBase : apiBase + '/';
  }

  function deriveApiBaseFromPath() {
    const pathname = getPathname();
    const appRoots = ['/frontend/', '/pages/', '/api/'];

    for (let index = 0; index < appRoots.length; index += 1) {
      const marker = appRoots[index];
      const markerPosition = pathname.indexOf(marker);

      if (markerPosition !== -1) {
        const basePath = pathname.slice(0, markerPosition);
        return (basePath || '') + '/api';
      }
    }

    const normalizedPath = pathname.replace(/\/+$/, '');
    const slashIndex = normalizedPath.lastIndexOf('/');
    const basePath = slashIndex > 0 ? normalizedPath.slice(0, slashIndex) : '';

    return (basePath || '') + '/api';
  }

  function apiUrl(path) {
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    return getApiBase() + normalizedPath;
  }

  function requestJson(path, options) {
    const requestOptions = Object.assign(
      {
        credentials: 'include'
      },
      options || {}
    );

    const headers = new Headers(requestOptions.headers || {});
    const body = requestOptions.body;

    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      requestOptions.body = JSON.stringify(body);
    }

    requestOptions.headers = headers;

    return fetch(apiUrl(path), requestOptions).then(async function (response) {
      const text = await response.text();
      let payload = null;

      if (text) {
        try {
          payload = JSON.parse(text);
        } catch (error) {
          payload = text;
        }
      }

      if (!response.ok) {
        const message = payload && typeof payload === 'object' && payload.error ? payload.error : 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        throw error;
      }

      return payload;
    });
  }

  const passwordState = new WeakMap();

  function togglePasswordVisibility(button, input) {
    if (!button || !input) {
      return;
    }

    const hidden = input.type === 'password';
    input.type = hidden ? 'text' : 'password';
    button.textContent = hidden ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  }

  function setButtonBusy(button, busy, label) {
    if (!button) {
      return;
    }

    if (busy) {
      if (!passwordState.has(button)) {
        passwordState.set(button, {
          text: button.textContent,
          disabled: button.disabled
        });
      }

      button.disabled = true;
      if (label) {
        button.textContent = label;
      }
      return;
    }

    const previousState = passwordState.get(button);
    if (previousState) {
      button.textContent = previousState.text;
      button.disabled = previousState.disabled;
      passwordState.delete(button);
      return;
    }

    button.disabled = false;
    if (label) {
      button.textContent = label;
    }
  }

  function scorePassword(password) {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return score;
  }

  function formatCurrency(value) {
    return '₹' + Number(value || 0).toFixed(2);
  }

  window.MuscleMap = {
    links: buildLinks(),
    apiBase: getApiBase(),
    apiUrl: apiUrl,
    requestJson: requestJson,
    togglePasswordVisibility: togglePasswordVisibility,
    setButtonBusy: setButtonBusy,
    scorePassword: scorePassword,
    formatCurrency: formatCurrency
  };
})();
