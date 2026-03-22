(function () {
  const inPages = window.location.pathname.includes('/pages/');
  const links = inPages
    ? {
        home: '../index.html',
        exercises: './exercises.html',
        catalogue: './catalogue.html',
        calculator: './calculator.html',
        pricing: './pricing.html',
        login: './login.html',
        register: './register.html',
        onboarding: './onboarding.html',
        about: './about.html',
        contact: './contact.html',
        privacy: './privacy.html',
        terms: './terms.html',
        notFound: './404.html'
      }
    : {
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

  if (navHost) {
    navHost.innerHTML = `
      <div class="site-nav-wrap">
        <nav class="site-nav">
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
            <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle menu">☰</button>
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

  if (footerHost) {
    footerHost.innerHTML = `
      <footer>
        <div class="container">
          <div class="brand">MuscleMap</div>
          <div class="footer-links">
            <a href="${links.about}">About Us</a>
            <a href="${links.contact}">Contact Us</a>
            <a href="${links.privacy}">Privacy</a>
            <a href="${links.terms}">Terms</a>
          </div>
          <div>© 2026 MuscleMap Inc. All rights reserved.</div>
        </div>
      </footer>
    `;
  }

  const path = window.location.pathname.toLowerCase();
  const activeKey = path.endsWith('/index.html') || path === '/' || path.endsWith('frontend-facelift')
    ? 'home'
    : path.includes('exercises')
    ? 'exercises'
    : path.includes('catalogue')
    ? 'catalogue'
    : path.includes('calculator')
    ? 'calculator'
    : path.includes('pricing')
    ? 'pricing'
    : path.includes('login')
    ? 'login'
    : path.includes('register')
    ? 'register'
    : path.includes('onboarding')
    ? 'onboarding'
    : path.includes('privacy')
    ? 'privacy'
    : path.includes('terms')
    ? 'terms'
    : path.includes('about')
    ? 'about'
    : path.includes('contact')
    ? 'contact'
    : null;

  if (activeKey) {
    document.querySelectorAll(`[data-nav="${activeKey}"]`).forEach((item) => {
      item.classList.add('active');
    });
  }

  const toggleBtn = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const moreMenu = document.getElementById('nav-more-menu');
  const morePanel = document.getElementById('nav-more-panel');
  const moreTrigger = moreMenu ? moreMenu.querySelector('.nav-menu-trigger') : null;
  let moreMenuCloseTimer = null;

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      toggleBtn.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
    });
  }

  if (moreMenu && morePanel && moreTrigger) {
    function openMoreMenu() {
      if (moreMenuCloseTimer) {
        window.clearTimeout(moreMenuCloseTimer);
      }
      moreMenu.classList.add('open');
      moreTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeMoreMenuWithDelay() {
      if (moreMenuCloseTimer) {
        window.clearTimeout(moreMenuCloseTimer);
      }
      moreMenuCloseTimer = window.setTimeout(function () {
        moreMenu.classList.remove('open');
        moreTrigger.setAttribute('aria-expanded', 'false');
      }, 180);
    }

    moreMenu.addEventListener('mouseenter', openMoreMenu);
    moreMenu.addEventListener('mouseleave', closeMoreMenuWithDelay);
    morePanel.addEventListener('mouseenter', openMoreMenu);
    morePanel.addEventListener('mouseleave', closeMoreMenuWithDelay);

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

    if (['catalogue', 'about', 'contact', 'register', 'onboarding', 'privacy', 'terms'].includes(activeKey || '')) {
      moreTrigger.classList.add('active');
    }
  }

  const toastStack = document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);

  window.showToast = function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'success'}`;
    toast.textContent = message;
    toastStack.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2600);
  };
})();
