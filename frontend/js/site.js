(function () {
  const app = window.MuscleMap || {};
  const links = app.links || {
    home: './index.html',
    exercises: './pages/exercises.html',
    catalogue: './pages/catalogue.html',
    calculator: './pages/calculator.html',
    pricing: './pages/pricing.html',
    login: './pages/login.html',
    register: './pages/register.html',
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
    if (path.includes('calculator')) return 'calculator';
    if (path.includes('pricing')) return 'pricing';
    if (path.includes('login')) return 'login';
    if (path.includes('register')) return 'register';
    if (path.includes('onboarding')) return 'onboarding';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('terms')) return 'terms';
    return null;
  }

  function buildNavMarkup() {
    return `
      <div class="site-nav-wrap">
        <nav class="site-nav" aria-label="Primary">
          <div class="site-nav-row">
            <a class="brand" href="${links.home}">MuscleMap</a>
            <div class="nav-links desktop-only">
              <a class="nav-link" data-nav="home" href="${links.home}">Home</a>
              <a class="nav-link" data-nav="exercises" href="${links.exercises}">Exercises</a>
              <a class="nav-link" data-nav="calculator" href="${links.calculator}">Calculator</a>
              <a class="nav-link" data-nav="pricing" href="${links.pricing}">Pricing</a>
              <div class="nav-menu-dropdown" id="nav-more-menu">
                <button class="nav-link nav-menu-trigger" data-nav="more" type="button" aria-expanded="false">More</button>
                <div class="nav-menu-panel" id="nav-more-panel">
                  <a class="nav-link nav-menu-item" data-nav="catalogue" href="${links.catalogue}">Catalogue</a>
                  <a class="nav-link nav-menu-item" data-nav="about" href="${links.about}">About</a>
                  <a class="nav-link nav-menu-item" data-nav="contact" href="${links.contact}">Contact</a>
                  <a class="nav-link nav-menu-item" data-nav="register" href="${links.register}">Register</a>
                  <a class="nav-link nav-menu-item" data-nav="onboarding" href="${links.onboarding}">Onboarding</a>
                  <a class="nav-link nav-menu-item" data-nav="privacy" href="${links.privacy}">Privacy</a>
                  <a class="nav-link nav-menu-item" data-nav="terms" href="${links.terms}">Terms</a>
                </div>
              </div>
              <a class="button button-primary" href="${links.login}">Login</a>
            </div>
            <button class="mobile-toggle" id="mobile-toggle" type="button" aria-label="Toggle menu">☰</button>
          </div>
          <div class="mobile-menu" id="mobile-menu">
            <a class="nav-link" data-nav="home" href="${links.home}">Home</a>
            <a class="nav-link" data-nav="exercises" href="${links.exercises}">Exercises</a>
            <a class="nav-link" data-nav="calculator" href="${links.calculator}">Calculator</a>
            <a class="nav-link" data-nav="pricing" href="${links.pricing}">Pricing</a>
            <a class="nav-link" data-nav="catalogue" href="${links.catalogue}">Catalogue</a>
            <a class="nav-link" data-nav="about" href="${links.about}">About</a>
            <a class="nav-link" data-nav="contact" href="${links.contact}">Contact</a>
            <a class="nav-link" data-nav="register" href="${links.register}">Register</a>
            <a class="nav-link" data-nav="onboarding" href="${links.onboarding}">Onboarding</a>
            <a class="nav-link" data-nav="privacy" href="${links.privacy}">Privacy</a>
            <a class="nav-link" data-nav="terms" href="${links.terms}">Terms</a>
            <a class="button button-primary" href="${links.login}">Login</a>
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

    if (['catalogue', 'about', 'contact', 'register', 'onboarding', 'privacy', 'terms'].includes(activeKey)) {
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

  function createToastStack() {
    const stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
    return stack;
  }

  if (navHost) {
    navHost.innerHTML = buildNavMarkup();
  }

  if (footerHost) {
    footerHost.innerHTML = buildFooterMarkup();
  }

  markActiveNav(getActiveKey());
  initMoreMenu();
  initMobileMenu();

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
