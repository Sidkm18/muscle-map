(function () {
  const planRow = document.getElementById('plan-selector');
  const durationRow = document.getElementById('duration-selector');
  const membershipEl = document.getElementById('summary-membership');
  const durationEl = document.getElementById('summary-duration');
  const baseEl = document.getElementById('summary-base');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');
  const checkoutButton = document.getElementById('pricing-checkout-button');
  const app = window.MuscleMap || {};

  if (!planRow || !durationRow || !membershipEl || !durationEl || !baseEl || !discountEl || !totalEl || !checkoutButton) {
    return;
  }

  let pricingConfig = {
    currency: 'INR',
    defaults: {
      plan_name: 'basic',
      duration_months: 1
    },
    plans: {
      basic: { id: 'basic', label: 'Basic', monthly_price: 100 },
      pro: { id: 'pro', label: 'Pro', monthly_price: 250 },
      elite: { id: 'elite', label: 'Elite', monthly_price: 500 }
    },
    durations: {
      1: { months: 1, label: '1 Month', discount_percent: 0 },
      3: { months: 3, label: '3 Months', discount_percent: 5 },
      12: { months: 12, label: '1 Year', discount_percent: 15 }
    }
  };

  let state = {
    membership: 'basic',
    duration: 1
  };

  function getCurrencySymbol(currencyCode) {
    return currencyCode === 'INR' ? '₹' : `${currencyCode} `;
  }

  function formatMoney(value) {
    const symbol = getCurrencySymbol(pricingConfig.currency);
    const numericValue = Number(value || 0);

    if (typeof app.formatCurrency === 'function' && pricingConfig.currency === 'INR') {
      return app.formatCurrency(numericValue);
    }

    return symbol + numericValue.toFixed(2);
  }

  function getSelectedPlan() {
    return pricingConfig.plans[state.membership] || pricingConfig.plans.basic;
  }

  function getSelectedDuration() {
    return pricingConfig.durations[String(state.duration)] || pricingConfig.durations[1];
  }

  function formatDuration(value) {
    const durationConfig = pricingConfig.durations[String(value)];
    return durationConfig ? durationConfig.label : `${value} Month${value > 1 ? 's' : ''}`;
  }

  function getQuote() {
    const plan = getSelectedPlan();
    const durationConfig = getSelectedDuration();
    const monthlyPrice = Number(plan.monthly_price || 0);
    const base = monthlyPrice * state.duration;
    const discountPct = Number(durationConfig.discount_percent || 0);
    const discountAmount = Number(((base * discountPct) / 100).toFixed(2));
    const total = Number((base - discountAmount).toFixed(2));

    return {
      base: base,
      discountPct: discountPct,
      discountAmount: discountAmount,
      total: total
    };
  }

  function updateSelectionStyles() {
    planRow.querySelectorAll('[data-plan]').forEach(function (btn) {
      const active = btn.getAttribute('data-plan') === state.membership;
      btn.classList.toggle('active', active);
      btn.style.borderColor = active ? 'rgba(197,255,47,.5)' : 'var(--line)';
      btn.style.background = active ? 'rgba(197,255,47,.1)' : 'rgba(255,255,255,.02)';
    });

    durationRow.querySelectorAll('[data-duration]').forEach(function (btn) {
      const active = Number(btn.getAttribute('data-duration')) === state.duration;
      btn.classList.toggle('active', active);
      btn.style.borderColor = active ? 'rgba(197,255,47,.5)' : 'var(--line)';
      btn.style.background = active ? 'rgba(197,255,47,.1)' : 'rgba(255,255,255,.02)';
    });
  }

  function updateSummary() {
    const quote = getQuote();

    membershipEl.textContent = state.membership;
    durationEl.textContent = formatDuration(state.duration);
    baseEl.textContent = formatMoney(quote.base);
    discountEl.textContent = quote.discountPct
      ? `-${formatMoney(quote.discountAmount)} (${quote.discountPct}%)`
      : 'No Discount';
    totalEl.textContent = formatMoney(quote.total);
  }

  planRow.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-plan]');
    if (!btn) {
      return;
    }
    state.membership = btn.getAttribute('data-plan');
    updateSelectionStyles();
    updateSummary();
  });

  durationRow.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-duration]');
    if (!btn) {
      return;
    }
    state.duration = Number(btn.getAttribute('data-duration'));
    updateSelectionStyles();
    updateSummary();
  });

  checkoutButton.addEventListener('click', function () {
    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(checkoutButton, true, 'Processing...');
    } else {
      checkoutButton.disabled = true;
      checkoutButton.textContent = 'Processing...';
    }

    const sessionPromise = typeof app.getSession === 'function'
      ? app.getSession()
      : Promise.resolve({ authenticated: false });

    sessionPromise.then(function (session) {
      if (!session || !session.authenticated) {
        if (typeof window.showToast === 'function') {
          window.showToast('Please sign in before subscribing.', 'error');
        }
        window.setTimeout(function () {
          window.location.href = './login.html';
        }, 300);
        return null;
      }

      if (typeof app.requestJson !== 'function') {
        throw new Error('Subscription unavailable');
      }

      return app.requestJson('subscribe', {
        method: 'POST',
        body: {
          plan_name: state.membership,
          duration_months: state.duration
        }
      });
    }).then(function (payload) {
      if (!payload) {
        return;
      }

      if (typeof window.showToast === 'function') {
        window.showToast(payload.message || 'Subscription updated successfully!', 'success');
      }

      window.setTimeout(function () {
        window.location.href = './profile.html';
      }, 500);
    }).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error && error.message ? error.message : 'Unable to complete subscription.', 'error');
      }
    }).finally(function () {
      if (typeof app.setButtonBusy === 'function') {
        app.setButtonBusy(checkoutButton, false);
      } else {
        checkoutButton.disabled = false;
        checkoutButton.textContent = 'Proceed to Payment';
      }
    });
  });

  if (typeof app.requestJson === 'function') {
    app.requestJson('pricing')
      .then(function (payload) {
        if (!payload || typeof payload !== 'object') {
          return;
        }

        pricingConfig = Object.assign({}, pricingConfig, payload);
        state.membership = String(
          (payload.defaults && payload.defaults.plan_name)
          || state.membership
        );
        state.duration = Number(
          (payload.defaults && payload.defaults.duration_months)
          || state.duration
        );
        updateSelectionStyles();
        updateSummary();
      })
      .catch(function () {
        // Keep the inline fallback config when the backend is unavailable.
      });
  }

  updateSelectionStyles();
  updateSummary();
})();
