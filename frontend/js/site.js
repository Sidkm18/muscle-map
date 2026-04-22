(function () {
  const THEME_STORAGE_KEY = 'mm-theme';
  const themeConfig = {
    dark: {
      id: 'dark',
      label: 'Dark',
      description: 'Default studio dark with lime energy.',
      preview: ['#0a0b07', '#c5ff2f', '#3ddc97'],
      tokens: {
        '--bg': '#0a0b07',
        '--surface': 'rgba(20, 22, 15, 0.8)',
        '--surface-strong': '#11140d',
        '--surface-soft': 'rgba(255, 255, 255, 0.03)',
        '--text': '#edf1e4',
        '--muted': '#a3ad95',
        '--line': 'rgba(255, 255, 255, 0.12)',
        '--primary': '#c5ff2f',
        '--primary-strong': '#aae11b',
        '--primary-rgb': '197, 255, 47',
        '--accent': '#3ddc97',
        '--accent-rgb': '61, 220, 151',
        '--danger': '#ff6f6f',
        '--success': '#3ddc97',
        '--shadow': '0 16px 40px rgba(0, 0, 0, 0.35)',
        '--page-gradient': 'radial-gradient(circle at 12% 12%, rgba(197, 255, 47, 0.16), transparent 24%), radial-gradient(circle at 84% 14%, rgba(61, 220, 151, 0.1), transparent 22%), radial-gradient(circle at 80% 86%, rgba(197, 255, 47, 0.08), transparent 25%), linear-gradient(180deg, #080904 0%, #0a0b07 52%, #080904 100%)',
        '--orb-one': 'rgba(197, 255, 47, 0.55)',
        '--orb-two': 'rgba(61, 220, 151, 0.42)',
        '--nav-bg': 'rgba(10, 11, 7, 0.84)',
        '--panel-bg': 'rgba(10, 11, 7, 0.96)',
        '--nav-link-color': 'rgba(237, 241, 228, 0.82)',
        '--nav-link-hover-bg': 'rgba(197, 255, 47, 0.08)',
        '--nav-link-active-color': '#c5ff2f',
        '--button-text': '#131705'
      }
    },
    light: {
      id: 'light',
      label: 'Light',
      description: 'Clean white workspace with crisp blue accents.',
      preview: ['#ffffff', '#3b82f6', '#1d4ed8'],
      tokens: {
        '--bg': '#ffffff',
        '--surface': '#f8fafc',
        '--surface-strong': '#f5f5f5',
        '--surface-soft': '#f8fafc',
        '--text': '#111111',
        '--muted': '#5b6472',
        '--line': '#e5e7eb',
        '--primary': '#3b82f6',
        '--primary-strong': '#2563eb',
        '--primary-rgb': '59, 130, 246',
        '--accent': '#1d4ed8',
        '--accent-rgb': '29, 78, 216',
        '--danger': '#df5b5b',
        '--success': '#2563eb',
        '--shadow': '0 8px 24px rgba(15, 23, 42, 0.08)',
        '--page-gradient': 'radial-gradient(circle at 12% 12%, rgba(59, 130, 246, 0.14), transparent 24%), radial-gradient(circle at 84% 14%, rgba(29, 78, 216, 0.10), transparent 22%), radial-gradient(circle at 80% 86%, rgba(59, 130, 246, 0.06), transparent 25%), linear-gradient(180deg, #ffffff 0%, #f8fbff 52%, #f2f6ff 100%)',
        '--orb-one': 'rgba(59, 130, 246, 0.18)',
        '--orb-two': 'rgba(29, 78, 216, 0.14)',
        '--nav-bg': 'rgba(255, 255, 255, 0.88)',
        '--panel-bg': 'rgba(255, 255, 255, 0.95)',
        '--nav-link-color': '#374151',
        '--nav-link-hover-bg': 'rgba(59, 130, 246, 0.10)',
        '--nav-link-active-color': '#2563eb',
        '--button-text': '#ffffff'
      }
    },
    glass: {
      id: 'glass',
      label: 'Blue',
      description: 'Deep blue glow theme with frosted glass surfaces and blur.',
      preview: ['#0a0a0a', '#64d8ff', '#8b5cf6'],
      tokens: {
        '--bg': '#0a0a0a',
        '--surface': 'rgba(255, 255, 255, 0.06)',
        '--surface-strong': 'rgba(255, 255, 255, 0.08)',
        '--surface-soft': 'rgba(255, 255, 255, 0.04)',
        '--text': '#f5f5f5',
        '--muted': '#b8c2d8',
        '--line': 'rgba(255, 255, 255, 0.12)',
        '--primary': '#64d8ff',
        '--primary-strong': '#38bdf8',
        '--primary-rgb': '100, 216, 255',
        '--accent': '#8bffb0',
        '--accent-rgb': '139, 255, 176',
        '--danger': '#ff7a8a',
        '--success': '#8bffb0',
        '--shadow': '0 22px 54px rgba(0, 0, 0, 0.42)',
        '--page-gradient': 'radial-gradient(circle at 14% 16%, rgba(100, 216, 255, 0.14), transparent 22%), radial-gradient(circle at 82% 18%, rgba(139, 92, 246, 0.12), transparent 20%), radial-gradient(circle at 78% 84%, rgba(100, 216, 255, 0.08), transparent 24%), linear-gradient(180deg, #07080d 0%, #0a0a0a 48%, #090b12 100%)',
        '--orb-one': 'rgba(100, 216, 255, 0.20)',
        '--orb-two': 'rgba(139, 92, 246, 0.18)',
        '--nav-bg': 'rgba(18, 22, 30, 0.58)',
        '--panel-bg': 'rgba(14, 18, 26, 0.72)',
        '--nav-link-color': 'rgba(245, 245, 245, 0.86)',
        '--nav-link-hover-bg': 'rgba(100, 216, 255, 0.10)',
        '--nav-link-active-color': '#64d8ff',
        '--button-text': '#04131a'
      }
    },
    purple: {
      id: 'purple',
      label: 'Purple',
      description: 'Luxe violet surfaces with pink accents.',
      preview: ['#120f1d', '#a96cff', '#ff6bb7'],
      tokens: {
        '--bg': '#120f1d',
        '--surface': 'rgba(29, 21, 46, 0.82)',
        '--surface-strong': '#181126',
        '--surface-soft': 'rgba(255, 255, 255, 0.04)',
        '--text': '#f5f0ff',
        '--muted': '#b0a2cb',
        '--line': 'rgba(255, 255, 255, 0.11)',
        '--primary': '#a96cff',
        '--primary-strong': '#9550ff',
        '--primary-rgb': '169, 108, 255',
        '--accent': '#ff6bb7',
        '--accent-rgb': '255, 107, 183',
        '--danger': '#ff7f95',
        '--success': '#67d9c2',
        '--shadow': '0 18px 46px rgba(8, 5, 15, 0.38)',
        '--page-gradient': 'radial-gradient(circle at 12% 12%, rgba(169, 108, 255, 0.22), transparent 24%), radial-gradient(circle at 84% 14%, rgba(255, 107, 183, 0.14), transparent 22%), radial-gradient(circle at 80% 86%, rgba(169, 108, 255, 0.1), transparent 25%), linear-gradient(180deg, #100c19 0%, #120f1d 52%, #0d0a16 100%)',
        '--orb-one': 'rgba(169, 108, 255, 0.44)',
        '--orb-two': 'rgba(255, 107, 183, 0.32)',
        '--nav-bg': 'rgba(18, 15, 29, 0.84)',
        '--panel-bg': 'rgba(18, 15, 29, 0.96)',
        '--nav-link-color': 'rgba(245, 240, 255, 0.82)',
        '--nav-link-hover-bg': 'rgba(169, 108, 255, 0.08)',
        '--nav-link-active-color': '#a96cff',
        '--button-text': '#ffffff'
      }
    },
    neon: {
      id: 'neon',
      label: 'Neon',
      description: 'Cyberpunk pink, purple, and electric blue energy.',
      preview: ['#070707', '#ff2e88', '#22d3ee'],
      tokens: {
        '--bg': '#070707',
        '--surface': 'rgba(18, 12, 24, 0.82)',
        '--surface-strong': 'rgba(14, 10, 20, 0.94)',
        '--surface-soft': 'rgba(255, 255, 255, 0.035)',
        '--text': '#f5f5f5',
        '--muted': '#bdb2d4',
        '--line': 'rgba(255, 255, 255, 0.12)',
        '--primary': '#ff2e88',
        '--primary-strong': '#a855f7',
        '--primary-rgb': '255, 46, 136',
        '--accent': '#22d3ee',
        '--accent-rgb': '34, 211, 238',
        '--danger': '#ff6c9d',
        '--success': '#22d3ee',
        '--shadow': '0 22px 54px rgba(0, 0, 0, 0.46)',
        '--page-gradient': 'radial-gradient(circle at 14% 16%, rgba(255, 46, 136, 0.16), transparent 22%), radial-gradient(circle at 82% 18%, rgba(168, 85, 247, 0.13), transparent 20%), radial-gradient(circle at 78% 84%, rgba(34, 211, 238, 0.08), transparent 24%), linear-gradient(180deg, #050505 0%, #070707 50%, #090410 100%)',
        '--orb-one': 'rgba(255, 46, 136, 0.26)',
        '--orb-two': 'rgba(168, 85, 247, 0.20)',
        '--nav-bg': 'rgba(15, 10, 22, 0.84)',
        '--panel-bg': 'rgba(14, 10, 24, 0.96)',
        '--nav-link-color': 'rgba(245, 245, 245, 0.84)',
        '--nav-link-hover-bg': 'rgba(255, 46, 136, 0.10)',
        '--nav-link-active-color': '#ff2e88',
        '--button-text': '#fff6fb'
      }
    }
  };

  function getTheme(themeId) {
    return themeConfig[themeId] || themeConfig.dark;
  }

  function getStoredThemeId() {
    try {
      return window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch (error) {
      return 'dark';
    }
  }

  function applyTheme(themeId) {
    const theme = getTheme(themeId);
    const root = document.documentElement;
    root.dataset.theme = theme.id;

    Object.keys(theme.tokens).forEach(function (token) {
      root.style.setProperty(token, theme.tokens[token]);
    });

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    } catch (error) {
      // Ignore storage failures.
    }

    document.querySelectorAll('[data-theme-option]').forEach(function (button) {
      const isActive = button.getAttribute('data-theme-option') === theme.id;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('[data-theme-current]').forEach(function (label) {
      label.textContent = theme.label;
    });

    document.dispatchEvent(new CustomEvent('mm:themechange', {
      detail: {
        themeId: theme.id
      }
    }));
  }

  applyTheme(getStoredThemeId());

  const app = window.MuscleMap || {};
  const links = app.links || {
    home: './index.html',
    exercises: './pages/exercises.html',
    catalogue: './pages/catalogue.html',
    connect: './pages/connect.html',
    calculator: './pages/calculator.html',
    pricing: './pages/pricing.html',
    login: './pages/login.html',
    register: './pages/register.html',
    profile: './pages/profile.html',
    onboarding: './pages/onboarding.html',
    about: './pages/about.html',
    contact: './pages/contact.html',
    privacy: './pages/privacy.html',
    terms: './pages/terms.html',
    notFound: './pages/404.html'
  };

  const navHost = document.getElementById('site-nav');
  const footerHost = document.getElementById('site-footer');

  function getActiveKey() {
    const path = (window.location.pathname || '').toLowerCase();

    if (path === '/' || path.endsWith('/index.html') || path.endsWith('/frontend') || path.endsWith('/frontend/')) {
      return 'home';
    }

    if (path.includes('exercises')) return 'exercises';
    if (path.includes('catalogue')) return 'catalogue';
    if (path.includes('connect')) return 'connect';
    if (path.includes('calculator')) return 'calculator';
    if (path.includes('pricing')) return 'pricing';
    if (path.includes('login')) return 'login';
    if (path.includes('register')) return 'register';
    if (path.includes('profile')) return 'profile';
    if (path.includes('onboarding')) return 'onboarding';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms')) return 'terms';
    return null;
  }

  function buildNavMarkup(session) {
    const isLoggedIn = Boolean(session && session.authenticated);
    const accountLink = isLoggedIn ? links.profile : links.login;
    const accountLabel = isLoggedIn ? 'Profile' : 'Login';

    return `
      <div class="site-nav-wrap">
        <nav class="site-nav" aria-label="Primary">
          <div class="site-nav-row">
            <a class="brand" href="${links.home}">MuscleMap</a>
            <div class="nav-links desktop-only">
              <a class="nav-link" data-nav="home" href="${links.home}">Home</a>
              <a class="nav-link" data-nav="exercises" href="${links.exercises}">Exercises</a>
              <a class="nav-link" data-nav="connect" href="${links.connect}">Connect</a>
              <a class="nav-link" data-nav="calculator" href="${links.calculator}">Calculator</a>
              <div class="nav-menu-dropdown" id="nav-more-menu">
                <button class="nav-link nav-menu-trigger" data-nav="more" type="button" aria-expanded="false">More</button>
                <div class="nav-menu-panel" id="nav-more-panel">
                  <a class="nav-link nav-menu-item" data-nav="pricing" href="${links.pricing}">Pricing</a>
                  <a class="nav-link nav-menu-item" data-nav="catalogue" href="${links.catalogue}">Catalogue</a>
                  <a class="nav-link nav-menu-item" data-nav="about" href="${links.about}">About</a>
                  <a class="nav-link nav-menu-item" data-nav="contact" href="${links.contact}">Contact</a>
                  <a class="nav-link nav-menu-item" data-nav="register" href="${links.register}">Register</a>
                  <a class="nav-link nav-menu-item" data-nav="profile" href="${links.profile}">Profile</a>
                  <a class="nav-link nav-menu-item" data-nav="onboarding" href="${links.onboarding}">Onboarding</a>
                  <a class="nav-link nav-menu-item" data-nav="privacy" href="${links.privacy}">Privacy</a>
                  <a class="nav-link nav-menu-item" data-nav="terms" href="${links.terms}">Terms</a>
                </div>
              </div>
              <a class="button button-primary" href="${accountLink}">${accountLabel}</a>
            </div>
            <button class="mobile-toggle" id="mobile-toggle" type="button" aria-label="Toggle menu">☰</button>
          </div>
          <div class="mobile-menu" id="mobile-menu">
            <a class="nav-link" data-nav="home" href="${links.home}">Home</a>
            <a class="nav-link" data-nav="exercises" href="${links.exercises}">Exercises</a>
            <a class="nav-link" data-nav="connect" href="${links.connect}">Connect</a>
            <a class="nav-link" data-nav="calculator" href="${links.calculator}">Calculator</a>
            <a class="nav-link" data-nav="pricing" href="${links.pricing}">Pricing</a>
            <a class="nav-link" data-nav="catalogue" href="${links.catalogue}">Catalogue</a>
            <a class="nav-link" data-nav="about" href="${links.about}">About</a>
            <a class="nav-link" data-nav="contact" href="${links.contact}">Contact</a>
            <a class="nav-link" data-nav="register" href="${links.register}">Register</a>
            <a class="nav-link" data-nav="profile" href="${links.profile}">Profile</a>
            <a class="nav-link" data-nav="onboarding" href="${links.onboarding}">Onboarding</a>
            <a class="nav-link" data-nav="privacy" href="${links.privacy}">Privacy</a>
            <a class="nav-link" data-nav="terms" href="${links.terms}">Terms</a>
            <a class="button button-primary" href="${accountLink}">${accountLabel}</a>
          </div>
        </nav>
      </div>
    `;
  }

  function buildFooterMarkup() {
    const year = new Date().getFullYear();
    return `
      <footer>
        <div class="container">
          <div class="brand">MuscleMap</div>
          <div class="footer-links">
            <a href="${links.about}">About Us</a>
            <a href="${links.contact}">Contact Us</a>
            <a href="${links.privacy}">Privacy</a>
            <a href="${links.terms}">Terms</a>
          </div>
          <div>© ${year} MuscleMap Inc. All rights reserved.</div>
        </div>
      </footer>
    `;
  }

  function markActiveNav(activeKey) {
    if (!activeKey) {
      return;
    }

    document.querySelectorAll('[data-nav="' + activeKey + '"]').forEach(function (item) {
      item.classList.add('active');
    });

    if (['pricing', 'catalogue', 'about', 'contact', 'register', 'profile', 'onboarding', 'privacy', 'terms'].includes(activeKey)) {
      const moreTrigger = document.querySelector('[data-nav="more"]');
      if (moreTrigger) {
        moreTrigger.classList.add('active');
      }
    }
  }

  function initMoreMenu() {
    const moreMenu = document.getElementById('nav-more-menu');
    const morePanel = document.getElementById('nav-more-panel');
    const moreTrigger = moreMenu ? moreMenu.querySelector('.nav-menu-trigger') : null;
    let closeTimer = null;

    if (!moreMenu || !morePanel || !moreTrigger) {
      return;
    }

    function openMenu() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }

      moreMenu.classList.add('open');
      moreTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
      }

      closeTimer = window.setTimeout(function () {
        moreMenu.classList.remove('open');
        moreTrigger.setAttribute('aria-expanded', 'false');
      }, 150);
    }

    moreMenu.addEventListener('mouseenter', openMenu);
    moreMenu.addEventListener('mouseleave', closeMenu);
    morePanel.addEventListener('mouseenter', openMenu);
    morePanel.addEventListener('mouseleave', closeMenu);

    moreTrigger.addEventListener('click', function () {
      const willOpen = !moreMenu.classList.contains('open');
      moreMenu.classList.toggle('open', willOpen);
      moreTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (event) {
      if (!moreMenu.contains(event.target)) {
        moreMenu.classList.remove('open');
        moreTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (!toggleBtn || !mobileMenu) {
      return;
    }

    toggleBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      toggleBtn.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
      toggleBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('open') ? 'true' : 'false');
    });
  }

  function buildThemePanelMarkup() {
    const optionsMarkup = Object.keys(themeConfig).map(function (key) {
      const theme = themeConfig[key];
      const preview = theme.preview.map(function (color) {
        return '<span class="theme-swatch" style="background:' + color + ';"></span>';
      }).join('');

      return (
        '<button class="theme-option" type="button" data-theme-option="' + theme.id + '" aria-pressed="false">' +
          '<span class="theme-option-main">' +
            '<span class="theme-option-text">' +
              '<span class="theme-option-title">' + theme.label + '</span>' +
              '<span class="theme-option-copy">' + theme.description + '</span>' +
            '</span>' +
            '<span class="theme-option-swatches">' + preview + '</span>' +
          '</span>' +
        '</button>'
      );
    }).join('');

    return (
      '<div class="theme-floating-shell" id="theme-floating-shell">' +
        '<button class="theme-trigger" id="theme-trigger" type="button" aria-expanded="false" aria-controls="theme-panel">' +
          '<span class="theme-trigger-icon" aria-hidden="true">◐</span>' +
          '<span data-theme-current>Themes</span>' +
        '</button>' +
        '<div class="theme-panel" id="theme-panel">' +
          '<div class="theme-panel-header">' +
            '<div>' +
              '<div class="theme-panel-eyebrow">Appearance</div>' +
              '<div class="theme-panel-title">Theme selector</div>' +
            '</div>' +
          '</div>' +
          '<div class="theme-options">' + optionsMarkup + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function initThemePanel() {
    const shell = document.createElement('div');
    shell.innerHTML = buildThemePanelMarkup();
    document.body.appendChild(shell.firstChild);

    const panelShell = document.getElementById('theme-floating-shell');
    const trigger = document.getElementById('theme-trigger');

    document.querySelectorAll('[data-theme-option]').forEach(function (button) {
      button.addEventListener('click', function () {
        applyTheme(button.getAttribute('data-theme-option'));
        if (panelShell) {
          panelShell.classList.remove('open');
        }
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    if (panelShell && trigger) {
      trigger.addEventListener('click', function () {
        const willOpen = !panelShell.classList.contains('open');
        panelShell.classList.toggle('open', willOpen);
        trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      document.addEventListener('click', function (event) {
        if (!panelShell.contains(event.target)) {
          panelShell.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    applyTheme(getStoredThemeId());
  }

  function createToastStack() {
    const stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
    return stack;
  }

  function renderSiteChrome(session) {
    if (navHost) {
      navHost.innerHTML = buildNavMarkup(session);
    }

    if (footerHost) {
      footerHost.innerHTML = buildFooterMarkup();
    }

    markActiveNav(getActiveKey());
    initMoreMenu();
    initMobileMenu();
  }

  renderSiteChrome(typeof app.getCachedSession === 'function' ? app.getCachedSession() : null);
  initThemePanel();

  if (typeof app.getSession === 'function') {
    app.getSession().then(function (session) {
      renderSiteChrome(session);
    }).catch(function () {
      renderSiteChrome(null);
    });
  }

  const toastStack = createToastStack();

  window.showToast = function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'success');
    toast.textContent = message;
    toastStack.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 2600);
  };
})();
