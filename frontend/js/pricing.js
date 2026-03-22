(function () {
  const planRow = document.getElementById('plan-selector');
  const durationRow = document.getElementById('duration-selector');
  const membershipEl = document.getElementById('summary-membership');
  const durationEl = document.getElementById('summary-duration');
  const baseEl = document.getElementById('summary-base');
  const discountEl = document.getElementById('summary-discount');
  const totalEl = document.getElementById('summary-total');

  if (!planRow || !durationRow) {
    return;
  }

  const pricing = { basic: 100, pro: 250, elite: 500 };
  const discounts = { 1: 0, 3: 5, 12: 15 };

  let state = {
    membership: 'basic',
    duration: 1
  };

  function formatDuration(value) {
    if (value === 12) {
      return '1 Year';
    }
    return `${value} Month${value > 1 ? 's' : ''}`;
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
    const base = pricing[state.membership] * state.duration;
    const discountPct = discounts[state.duration] || 0;
    const discountAmount = Math.round((base * discountPct) / 100);
    const total = base - discountAmount;

    membershipEl.textContent = state.membership;
    durationEl.textContent = formatDuration(state.duration);
    baseEl.textContent = `₹${base.toFixed(2)}`;
    discountEl.textContent = discountPct
      ? `-₹${discountAmount.toFixed(2)} (${discountPct}%)`
      : 'No Discount';
    totalEl.textContent = `₹${total.toFixed(2)}`;
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

  updateSelectionStyles();
  updateSummary();
})();
