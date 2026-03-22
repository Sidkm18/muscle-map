(function () {
  const mount = document.getElementById('exercise-grid');
  const count = document.getElementById('exercise-count');
  const filterRow = document.getElementById('filter-row');
  if (!mount || !count || !filterRow) {
    return;
  }

  const exercises = [
    { name: 'Bench Press', category: 'chest', difficulty: 'Intermediate', reps: '8-12', description: 'Classic compound movement for chest development.' },
    { name: 'Incline Dumbbell Press', category: 'chest', difficulty: 'Intermediate', reps: '8-12', description: 'Targets upper chest with adjustable angle.' },
    { name: 'Cable Fly', category: 'chest', difficulty: 'Beginner', reps: '12-15', description: 'Isolation movement for chest definition.' },
    { name: 'Deadlift', category: 'back', difficulty: 'Advanced', reps: '5-8', description: 'Full body posterior chain builder.' },
    { name: 'Pull-ups', category: 'back', difficulty: 'Intermediate', reps: '8-12', description: 'Bodyweight lat builder and grip strength.' },
    { name: 'Barbell Row', category: 'back', difficulty: 'Intermediate', reps: '8-12', description: 'Thick back developer with barbell.' },
    { name: 'Squat', category: 'legs', difficulty: 'Advanced', reps: '5-8', description: 'King of leg exercises, full lower body.' },
    { name: 'Leg Press', category: 'legs', difficulty: 'Beginner', reps: '10-15', description: 'Machine-based quad dominant movement.' },
    { name: 'Romanian Deadlift', category: 'legs', difficulty: 'Intermediate', reps: '8-12', description: 'Hamstring and glute focused hip hinge.' },
    { name: 'Overhead Press', category: 'shoulders', difficulty: 'Intermediate', reps: '6-10', description: 'Standing barbell press for shoulder mass.' },
    { name: 'Lateral Raise', category: 'shoulders', difficulty: 'Beginner', reps: '12-15', description: 'Isolation movement for side delts.' },
    { name: 'Barbell Curl', category: 'arms', difficulty: 'Beginner', reps: '10-12', description: 'Classic bicep builder with barbell.' },
    { name: 'Tricep Pushdown', category: 'arms', difficulty: 'Beginner', reps: '12-15', description: 'Cable isolation for tricep development.' },
    { name: 'Dips', category: 'chest', difficulty: 'Intermediate', reps: '8-12', description: 'Compound pushing movement for chest and triceps.' },
    { name: 'Face Pull', category: 'shoulders', difficulty: 'Beginner', reps: '15-20', description: 'Rear delt and rotator cuff health.' }
  ];

  const colorByLevel = {
    Beginner: 'pill-beginner',
    Intermediate: 'pill-intermediate',
    Advanced: 'pill-advanced'
  };

  let currentFilter = 'all';

  function render() {
    const filtered = currentFilter === 'all'
      ? exercises
      : exercises.filter((item) => item.category === currentFilter);

    count.textContent = `Showing ${filtered.length} exercise${filtered.length === 1 ? '' : 's'}`;
    mount.innerHTML = filtered
      .map(function (item) {
        return `
          <article class="glass-card card">
            <div style="display:flex; gap:.5rem; margin-bottom:.6rem; flex-wrap:wrap;">
              <span class="pill-badge ${colorByLevel[item.difficulty]}">${item.difficulty}</span>
              <span class="pill-badge" style="background:rgba(197,255,47,.12); color:var(--primary); text-transform:capitalize;">${item.category}</span>
            </div>
            <h3 class="page-title" style="font-size:1.2rem; margin:0 0 .4rem;">${item.name}</h3>
            <p class="muted" style="margin:0 0 .6rem;">${item.description}</p>
            <p class="mini-label">Recommended: <span class="primary-text">${item.reps} reps</span></p>
          </article>
        `;
      })
      .join('');
  }

  filterRow.addEventListener('click', function (event) {
    const btn = event.target.closest('button[data-filter]');
    if (!btn) {
      return;
    }
    currentFilter = btn.getAttribute('data-filter') || 'all';
    filterRow.querySelectorAll('.pill').forEach(function (node) {
      node.classList.remove('active');
    });
    btn.classList.add('active');
    render();
  });

  render();
})();
