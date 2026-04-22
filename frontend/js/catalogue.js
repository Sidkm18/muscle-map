(function () {
  const grid = document.getElementById('catalogue-grid');
  const searchInput = document.getElementById('catalogue-search');
  const app = window.MuscleMap || {};

  if (!grid || !searchInput) {
    return;
  }

  const fallbackPrograms = [
    {
      id: 'starting-strength',
      title: 'Starting Strength',
      level: 'Beginner',
      description: 'A foundational barbell program focused on linear progression.',
      access_tier: 'Free',
      weekly_split: ['Day 1: Squat + Press + Deadlift', 'Day 2: Squat + Bench + Row', 'Day 3: Squat + Press + Pull'],
      exercise_days: [
        { day: 'Day 1', items: ['Back Squat (3x5)', 'Overhead Press (3x5)', 'Deadlift (1x5)'] }
      ],
      duration_weeks: 8,
      frequency_per_week: 3,
      session_minutes: '60-75'
    },
    {
      id: 'push-pull-legs',
      title: 'Push Pull Legs',
      level: 'Intermediate',
      description: 'A balanced 6-day split maximizing hypertrophy and recovery.',
      access_tier: 'Premium',
      weekly_split: ['Day 1: Push', 'Day 2: Pull', 'Day 3: Legs', 'Day 4: Push', 'Day 5: Pull', 'Day 6: Legs'],
      exercise_days: [
        { day: 'Push Day', items: ['Bench Press (4x8)', 'Incline Dumbbell Press (3x10)', 'Cable Fly (3x12)'] }
      ],
      duration_weeks: 6,
      frequency_per_week: 6,
      session_minutes: '60-75'
    }
  ];

  const colorByLevel = {
    Beginner: 'pill-beginner',
    Intermediate: 'pill-intermediate',
    Advanced: 'pill-advanced'
  };

  let programs = fallbackPrograms.slice();
  let activeProgram = null;
  let modalShell = null;
  let modalContent = null;

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureModal() {
    if (modalShell) {
      return;
    }

    modalShell = document.createElement('div');
    modalShell.className = 'catalogue-modal-shell';
    modalShell.hidden = true;
    modalShell.innerHTML =
      '<div class="catalogue-modal-backdrop" data-catalogue-close="true"></div>' +
      '<section class="glass-card card catalogue-modal" role="dialog" aria-modal="true" aria-label="Workout plan details">' +
        '<button class="catalogue-modal-close" type="button" data-catalogue-close="true" aria-label="Close plan">Close</button>' +
        '<div id="catalogue-modal-content"></div>' +
      '</section>';

    document.body.appendChild(modalShell);
    modalContent = modalShell.querySelector('#catalogue-modal-content');

    modalShell.addEventListener('click', function (event) {
      if (event.target.closest('[data-catalogue-close]')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modalShell && !modalShell.hidden) {
        closeModal();
      }
    });
  }

  function openModal(program) {
    ensureModal();
    activeProgram = program;

    const weeklySplit = Array.isArray(program.weekly_split) ? program.weekly_split : [];
    const exerciseDays = Array.isArray(program.exercise_days) ? program.exercise_days : [];

    modalContent.innerHTML =
      '<div class="catalogue-modal-copy">' +
        '<span class="pill-badge ' + escapeHtml(colorByLevel[program.level] || 'pill-beginner') + '">' + escapeHtml(program.level) + '</span>' +
        '<h2 class="page-title catalogue-modal-title">' + escapeHtml(program.title) + '</h2>' +
        '<p class="muted catalogue-modal-description">' + escapeHtml(program.description) + '</p>' +
        '<div class="catalogue-modal-meta">' +
          '<span class="chip">' + escapeHtml(String(program.duration_weeks || 0)) + ' weeks</span>' +
          '<span class="chip">' + escapeHtml(String(program.frequency_per_week || 0)) + ' days/week</span>' +
          '<span class="chip">' + escapeHtml(program.session_minutes || '45-60') + ' min/session</span>' +
          '<span class="chip">' + escapeHtml(program.access_tier || 'Free') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="catalogue-modal-grid">' +
        '<section class="catalogue-modal-section">' +
          '<h3 class="mini-label">Weekly Split</h3>' +
          '<div class="catalogue-modal-list">' + weeklySplit.map(function (item) {
            return '<div class="catalogue-modal-list-item">' + escapeHtml(item) + '</div>';
          }).join('') + '</div>' +
        '</section>' +
        '<section class="catalogue-modal-section">' +
          '<h3 class="mini-label">Exercise List</h3>' +
          '<div class="catalogue-modal-list">' + exerciseDays.map(function (day) {
            const items = Array.isArray(day.items) ? day.items : [];
            return (
              '<div class="catalogue-modal-day">' +
                '<strong>' + escapeHtml(day.day || 'Day') + '</strong>' +
                '<div class="catalogue-modal-day-items">' + items.map(function (item) {
                  return '<span class="catalogue-modal-day-item">' + escapeHtml(item) + '</span>';
                }).join('') + '</div>' +
              '</div>'
            );
          }).join('') + '</div>' +
        '</section>' +
      '</div>' +
      '<div class="catalogue-modal-actions">' +
        '<button class="button button-primary" type="button">Start Plan</button>' +
        '<button class="button button-outline" type="button">Save Plan</button>' +
      '</div>';

    document.body.classList.add('catalogue-modal-open');
    modalShell.hidden = false;
  }

  function closeModal() {
    if (!modalShell) {
      return;
    }

    modalShell.hidden = true;
    document.body.classList.remove('catalogue-modal-open');
    activeProgram = null;
  }

  function render(query) {
    const normalized = String(query || '').trim().toLowerCase();
    const filtered = programs.filter(function (item) {
      return String(item.title || '').toLowerCase().includes(normalized);
    });

    if (!filtered.length) {
      grid.innerHTML = '<p class="muted">No programs found for this search.</p>';
      return;
    }

    grid.innerHTML = filtered.map(function (item, index) {
      return (
        '<article class="glass-card card catalogue-program-card" data-program-index="' + index + '" style="display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">' +
          '<div>' +
            '<span class="pill-badge ' + escapeHtml(colorByLevel[item.level] || 'pill-beginner') + '">' + escapeHtml(item.level) + '</span>' +
            '<h3 class="page-title" style="font-size:1.35rem; margin:.8rem 0 .45rem;">' + escapeHtml(item.title) + '</h3>' +
            '<p class="muted">' + escapeHtml(item.description) + '</p>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line); padding-top:.8rem; gap:1rem;">' +
            '<strong class="' + (String(item.access_tier).toLowerCase() === 'premium' ? 'primary-text' : '') + '">' + escapeHtml(item.access_tier || 'Free') + '</strong>' +
            '<button class="button button-outline" type="button" data-program-view="' + escapeHtml(item.id || String(index)) + '">View Plan</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function loadPrograms() {
    if (typeof app.requestJson !== 'function') {
      render(searchInput.value);
      return;
    }

    app.requestJson('programs')
      .then(function (payload) {
        if (payload && Array.isArray(payload.programs) && payload.programs.length) {
          programs = payload.programs.slice();
        }
      })
      .catch(function () {
        // Keep fallback data available for offline/demo resilience.
      })
      .finally(function () {
        render(searchInput.value);
      });
  }

  searchInput.addEventListener('input', function () {
    render(searchInput.value);
  });

  grid.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-program-view]');
    if (!trigger) {
      return;
    }

    const programId = String(trigger.getAttribute('data-program-view') || '');
    const program = programs.find(function (item) {
      return String(item.id || item.slug || '') === programId;
    });

    if (program) {
      openModal(program);
    }
  });

  loadPrograms();
})();
