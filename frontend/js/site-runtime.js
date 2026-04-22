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
      connect: base + 'pages/connect.html',
      calculator: base + 'pages/calculator.html',
      pricing: base + 'pages/pricing.html',
      login: base + 'pages/login.html',
      register: base + 'pages/register.html',
      profile: base + 'pages/profile.html',
      profileEdit: base + 'pages/profile-edit.html',
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

  const anonymousWritePaths = ['login', 'register'];
  const SUPPORTED_PROFILE_PHOTO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
  const MAX_STORED_AVATAR_PREVIEW_CHARS = 262144;
  const sessionState = {
    loaded: false,
    loadingPromise: null,
    data: {
      authenticated: false,
      user: null,
      csrfToken: null
    }
  };

  function isObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function isSessionPayload(payload) {
    return isObject(payload) && Object.prototype.hasOwnProperty.call(payload, 'authenticated');
  }

  function syncLegacySessionCache(session) {
    try {
      window.localStorage.removeItem('isLoggedIn');

      if (session.authenticated && session.user) {
        if (session.user.id !== undefined && session.user.id !== null) {
          window.localStorage.setItem('userId', String(session.user.id));
        } else {
          window.localStorage.removeItem('userId');
        }

        if (session.user.email) {
          window.localStorage.setItem('userEmail', String(session.user.email));
        } else {
          window.localStorage.removeItem('userEmail');
        }

        if (session.user.full_name || session.user.username) {
          window.localStorage.setItem('userName', String(session.user.full_name || session.user.username || ''));
        }
      } else {
        window.localStorage.removeItem('userId');
        window.localStorage.removeItem('userEmail');
        window.localStorage.removeItem('userName');
        window.localStorage.removeItem('onboardingComplete');
      }
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function normalizeSessionPayload(payload) {
    const current = sessionState.data || {
      authenticated: false,
      user: null,
      csrfToken: null
    };
    const authenticated = Boolean(payload && payload.authenticated && isObject(payload.user));

    return {
      authenticated: authenticated,
      user: authenticated ? payload.user : null,
      csrfToken: authenticated
        ? String((payload && (payload.csrf_token || payload.csrfToken)) || current.csrfToken || '').trim() || null
        : null
    };
  }

  function setSession(payload) {
    const session = normalizeSessionPayload(payload);
    sessionState.loaded = true;
    sessionState.data = session;
    syncLegacySessionCache(session);
    return session;
  }

  function clearSession() {
    return setSession({
      authenticated: false,
      user: null
    });
  }

  function getCachedSession() {
    return sessionState.data;
  }

  function fetchJson(url, options) {
    return fetch(url, options).then(async function (response) {
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

  function refreshSession() {
    if (sessionState.loadingPromise) {
      return sessionState.loadingPromise;
    }

    sessionState.loadingPromise = fetchJson(apiUrl('me'), {
      credentials: 'include'
    }).then(function (payload) {
      return setSession(payload);
    }).catch(function (error) {
      clearSession();
      throw error;
    }).finally(function () {
      sessionState.loadingPromise = null;
    });

    return sessionState.loadingPromise;
  }

  function getSession() {
    if (sessionState.loaded) {
      return Promise.resolve(sessionState.data);
    }

    return refreshSession().catch(function () {
      return sessionState.data;
    });
  }

  function shouldSkipCsrf(path, method, headers) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    if (headers.has('X-CSRF-Token')) {
      return true;
    }

    const normalizedPath = String(path || '').replace(/^\/+/, '').toLowerCase();
    return anonymousWritePaths.indexOf(normalizedPath) !== -1;
  }

  function attachCsrfHeader(path, requestOptions, headers) {
    const method = String(requestOptions.method || 'GET').toUpperCase();

    if (shouldSkipCsrf(path, method, headers)) {
      return Promise.resolve();
    }

    const cachedToken = sessionState.data && sessionState.data.csrfToken;
    if (cachedToken) {
      headers.set('X-CSRF-Token', cachedToken);
      return Promise.resolve();
    }

    return getSession().then(function (session) {
      if (session && session.authenticated && session.csrfToken) {
        headers.set('X-CSRF-Token', session.csrfToken);
      }
    }).catch(function () {
      // Leave the request unchanged; the server will reject it if needed.
    });
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

    return attachCsrfHeader(path, requestOptions, headers).then(function () {
      return fetchJson(apiUrl(path), requestOptions);
    }).then(function (payload) {
      if (isSessionPayload(payload)) {
        setSession(payload);
      }

      return payload;
    }).catch(function (error) {
      if (error && error.status === 401) {
        clearSession();
      }

      throw error;
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

  function getInitials(label) {
    const safeLabel = String(label || '').trim();
    if (!safeLabel) {
      return 'MM';
    }

    const parts = safeLabel.split(/\s+/).filter(Boolean);
    const initials = parts.slice(0, 2).map(function (part) {
      return part.charAt(0).toUpperCase();
    }).join('');

    return initials || safeLabel.slice(0, 2).toUpperCase();
  }

  function createAvatarPlaceholder(label) {
    const initials = getInitials(label);
    const primaryColor = (typeof window !== 'undefined' && window.getComputedStyle)
      ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#c5ff2f'
      : '#c5ff2f';
    const primaryRgb = (typeof window !== 'undefined' && window.getComputedStyle)
      ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() || '197, 255, 47'
      : '197, 255, 47';
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">',
      '<defs>',
      '<linearGradient id="mm-avatar" x1="0%" y1="0%" x2="100%" y2="100%">',
      '<stop offset="0%" stop-color="#1a1624" />',
      '<stop offset="100%" stop-color="#0b0d14" />',
      '</linearGradient>',
      '<radialGradient id="mm-avatar-glow" cx="50%" cy="44%" r="55%">',
      '<stop offset="0%" stop-color="rgba(' + primaryRgb + ',0.20)" />',
      '<stop offset="100%" stop-color="rgba(' + primaryRgb + ',0)" />',
      '</radialGradient>',
      '</defs>',
      '<rect width="240" height="240" rx="52" fill="url(#mm-avatar)" />',
      '<rect x="10" y="10" width="220" height="220" rx="44" fill="rgba(255,255,255,0.02)" stroke="rgba(' + primaryRgb + ',0.22)" stroke-width="2" />',
      '<circle cx="120" cy="120" r="82" fill="url(#mm-avatar-glow)" />',
      '<circle cx="120" cy="120" r="76" fill="rgba(' + primaryRgb + ',0.12)" />',
      '<text x="120" y="138" text-anchor="middle" font-family="Arial, sans-serif" font-size="76" font-weight="700" fill="' + primaryColor + '">' + initials + '</text>',
      '</svg>'
    ].join('');

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function getStoredAvatarPreview() {
    try {
      const storedValue = window.localStorage.getItem('userAvatarPreview');
      if (storedValue && storedValue.length > MAX_STORED_AVATAR_PREVIEW_CHARS) {
        clearAvatarPreview();
        return '';
      }
      return storedValue
        && storedValue.startsWith('data:image/')
        && storedValue.length <= MAX_STORED_AVATAR_PREVIEW_CHARS
        ? storedValue
        : '';
    } catch (error) {
      return '';
    }
  }

  function isSupportedProfilePhotoType(value) {
    return SUPPORTED_PROFILE_PHOTO_TYPES.indexOf(String(value || '').toLowerCase()) !== -1;
  }

  function cacheAvatarPreview(dataUrl) {
    if (!dataUrl || !String(dataUrl).startsWith('data:image/')) {
      return;
    }

    if (String(dataUrl).length > MAX_STORED_AVATAR_PREVIEW_CHARS) {
      clearAvatarPreview();
      return;
    }

    try {
      window.localStorage.setItem('userAvatarPreview', String(dataUrl));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function clearAvatarPreview() {
    try {
      window.localStorage.removeItem('userAvatarPreview');
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function resolveProfilePhoto(profilePhoto, displayName) {
    const normalized = String(profilePhoto || '').trim();
    if (normalized && (normalized.startsWith('data:image/') || normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('/'))) {
      return normalized;
    }

    const cachedPreview = getStoredAvatarPreview();
    if (cachedPreview) {
      return cachedPreview;
    }

    return createAvatarPlaceholder(displayName);
  }

  window.MuscleMap = {
    links: buildLinks(),
    apiBase: getApiBase(),
    apiUrl: apiUrl,
    requestJson: requestJson,
    getSession: getSession,
    getCachedSession: getCachedSession,
    refreshSession: refreshSession,
    setSession: setSession,
    clearSession: clearSession,
    togglePasswordVisibility: togglePasswordVisibility,
    setButtonBusy: setButtonBusy,
    scorePassword: scorePassword,
    formatCurrency: formatCurrency,
    createAvatarPlaceholder: createAvatarPlaceholder,
    resolveProfilePhoto: resolveProfilePhoto,
    cacheAvatarPreview: cacheAvatarPreview,
    clearAvatarPreview: clearAvatarPreview,
    isSupportedProfilePhotoType: isSupportedProfilePhotoType,
    supportedProfilePhotoTypes: SUPPORTED_PROFILE_PHOTO_TYPES.slice()
  };
})();
