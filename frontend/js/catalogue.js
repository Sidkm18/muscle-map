(function () {
  const grid = document.getElementById('catalogue-grid');
  const searchInput = document.getElementById('catalogue-search');
  if (!grid || !searchInput) {
    return;
  }

  const programs = [
    { title: 'Starting Strength', level: 'Beginner', desc: 'A foundational barbell program focused on linear progression.', price: 'Free' },
    { title: 'Push Pull Legs', level: 'Intermediate', desc: 'A balanced 6-day split maximizing hypertrophy and recovery.', price: 'Premium' },
    { title: 'Powerbuilding 5/3/1', level: 'Advanced', desc: 'Combine powerlifting strength with bodybuilding volume.', price: 'Premium' },
    { title: 'Upper/Lower Split', level: 'Intermediate', desc: 'A flexible 4-day split perfect for building muscle and strength.', price: 'Free' },
    { title: 'Calisthenics Foundation', level: 'Beginner', desc: 'Master bodyweight movements without needing any special equipment.', price: 'Free' },
    { title: 'Olympic Weightlifting', level: 'Advanced', desc: 'A complex peaking block focusing on the Snatch and Clean & Jerk.', price: 'Premium' }
  ];

  const colorByLevel = {
    Beginner: 'pill-beginner',
    Intermediate: 'pill-intermediate',
    Advanced: 'pill-advanced'
  };

  function render(query) {
    const normalized = (query || '').trim().toLowerCase();
    const filtered = programs.filter(function (item) {
      return item.title.toLowerCase().includes(normalized);
    });

    grid.innerHTML = filtered
      .map(function (item) {
        return `
          <article class="glass-card card" style="display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
            <div>
              <span class="pill-badge ${colorByLevel[item.level]}">${item.level}</span>
              <h3 class="page-title" style="font-size:1.35rem; margin:.8rem 0 .45rem;">${item.title}</h3>
              <p class="muted">${item.desc}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line); padding-top:.8rem;">
              <strong class="${item.price === 'Premium' ? 'primary-text' : ''}">${item.price}</strong>
              <button class="button button-outline" type="button">View Plan</button>
            </div>
          </article>
        `;
      })
      .join('');

    if (!filtered.length) {
      grid.innerHTML = '<p class="muted">No programs found for this search.</p>';
    }
  }

  searchInput.addEventListener('input', function () {
    render(searchInput.value);
  });

  render('');
})();
