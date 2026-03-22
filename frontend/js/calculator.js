(function () {
  const form = document.getElementById('calculator-form');
  const list = document.getElementById('exercise-list');
  const clearAllBtn = document.getElementById('clear-all');
  const emptyState = document.getElementById('empty-state');

  if (!form || !list || !clearAllBtn || !emptyState) {
    return;
  }

  const weightInput = document.getElementById('weight');
  const setsInput = document.getElementById('sets');
  const repsInput = document.getElementById('reps');

  const totalVolumeEl = document.getElementById('metric-volume');
  const est1RmEl = document.getElementById('metric-1rm');
  const totalCaloriesEl = document.getElementById('metric-calories');
  const totalSetsEl = document.getElementById('metric-sets');

  let items = [];

  function calculate1RM(weight, reps) {
    if (reps === 1) {
      return weight;
    }
    return Math.round(weight * (1 + reps / 30));
  }

  function calcCalories(weight, reps, sets) {
    return Math.round(0.07 * weight * reps * sets);
  }

  function updateMetrics() {
    const totalVolume = items.reduce(function (sum, item) {
      return sum + item.weight * item.reps * item.sets;
    }, 0);

    const totalSets = items.reduce(function (sum, item) {
      return sum + item.sets;
    }, 0);

    const totalCalories = items.reduce(function (sum, item) {
      return sum + calcCalories(item.weight, item.reps, item.sets);
    }, 0);

    const heaviest = items.reduce(function (max, item) {
      if (!max || item.weight > max.weight) {
        return item;
      }
      return max;
    }, null);

    const est1RM = heaviest ? calculate1RM(heaviest.weight, heaviest.reps) : 0;

    totalVolumeEl.textContent = totalVolume.toLocaleString();
    est1RmEl.textContent = est1RM.toLocaleString();
    totalCaloriesEl.textContent = totalCalories.toLocaleString();
    totalSetsEl.textContent = totalSets.toLocaleString();
  }

  function renderList() {
    list.innerHTML = items
      .map(function (item, index) {
        return `
          <div class="glass-card" style="display:flex; align-items:center; justify-content:space-between; padding:.8rem;">
            <div style="display:flex; gap:.9rem; flex-wrap:wrap;">
              <span class="muted">#${index + 1}</span>
              <span><strong>${item.weight}</strong> lbs</span>
              <span><strong>${item.sets}</strong> sets</span>
              <span><strong>${item.reps}</strong> reps</span>
            </div>
            <button class="pill" type="button" data-remove="${item.id}" style="color:var(--danger)">Delete</button>
          </div>
        `;
      })
      .join('');

    emptyState.style.display = items.length ? 'none' : 'block';
    clearAllBtn.style.visibility = items.length ? 'visible' : 'hidden';
    updateMetrics();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const payload = {
      id: Date.now(),
      weight: Number(weightInput.value),
      sets: Number(setsInput.value),
      reps: Number(repsInput.value)
    };

    if (payload.weight > 0 && payload.sets > 0 && payload.reps > 0) {
      items.push(payload);
      form.reset();
      renderList();
    }
  });

  list.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-remove]');
    if (!btn) {
      return;
    }
    const id = Number(btn.getAttribute('data-remove'));
    items = items.filter(function (item) {
      return item.id !== id;
    });
    renderList();
  });

  clearAllBtn.addEventListener('click', function () {
    items = [];
    renderList();
  });

  renderList();
})();
