(function () {
  const WORKOUT_SESSION_STORAGE_KEY = 'mm-current-workout-session';
  const WORKOUT_PANEL_POSITION_KEY = 'mm-workout-panel-position';
  const mount = document.getElementById('exercise-grid');
  const count = document.getElementById('exercise-count');
  const filterRow = document.getElementById('filter-row');
  const startWorkoutButton = document.getElementById('start-workout-button');
  const workoutSessionCount = document.getElementById('workout-session-count');
  const workoutFloatingPanel = document.getElementById('workout-floating-panel');
  const workoutFloatingTimerBlock = document.getElementById('workout-floating-timer-block');
  const workoutFloatingTimerDisplay = document.getElementById('workout-floating-timer-display');
  const workoutTimerStart = document.getElementById('workout-timer-start');
  const workoutTimerStop = document.getElementById('workout-timer-stop');
  const workoutTimerLap = document.getElementById('workout-timer-lap');
  const workoutTimerReset = document.getElementById('workout-timer-reset');
  const workoutFloatingProgressLabel = document.getElementById('workout-floating-progress-label');
  const workoutFloatingProgressValue = document.getElementById('workout-floating-progress-value');
  const workoutFloatingProgressBar = document.getElementById('workout-floating-progress-bar');
  const workoutFloatingLaps = document.getElementById('workout-floating-laps');
  const workoutFloatingList = document.getElementById('workout-floating-list');
  const app = window.MuscleMap || {};

  if (!mount || !count || !filterRow || !startWorkoutButton || !workoutSessionCount || !workoutFloatingPanel || !workoutFloatingTimerBlock || !workoutFloatingTimerDisplay || !workoutTimerStart || !workoutTimerStop || !workoutTimerLap || !workoutTimerReset || !workoutFloatingProgressLabel || !workoutFloatingProgressValue || !workoutFloatingProgressBar || !workoutFloatingLaps || !workoutFloatingList) {
    return;
  }

  const fallbackExercises = [
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

  let exercises = fallbackExercises.slice();
  let currentFilter = 'all';
  let workoutSession = readWorkoutSession();
  let stopwatchState = createStopwatchState(workoutSession);
  workoutSession.active = false;
  workoutSession.showTimer = false;
  stopwatchState.isRunning = false;
  stopwatchState.startTime = null;
  let workoutTimerInterval = null;
  let dragState = {
    active: false,
    offsetX: 0,
    offsetY: 0
  };
  persistWorkoutSession();
  applySavedPanelPosition();
  syncWorkoutTimerTicker();

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

  startWorkoutButton.addEventListener('click', function () {
    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.showTimer = true;
      workoutSession.startedAt = new Date().toISOString();
      resetWorkoutTimer();
      persistWorkoutSession();
      renderSessionStatus();
      render();
      if (window.showToast) {
        window.showToast('Workout started. Use the stopwatch controls when you are ready.', 'success');
      }
      return;
    }

    stopWorkoutTimerTicker();
    workoutSession = createEmptyWorkoutSession();
    stopwatchState = createStopwatchState(workoutSession);
    persistWorkoutSession();
    renderSessionStatus();
    render();
    if (window.showToast) {
      window.showToast('Workout session cleared.', 'success');
    }
  });

  workoutTimerStart.addEventListener('click', function () {
    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.showTimer = true;
      workoutSession.startedAt = new Date().toISOString();
    }

    startWorkoutTimer();
    renderSessionStatus();
  });

  workoutTimerStop.addEventListener('click', function () {
    stopWorkoutTimer();
    renderSessionStatus();
  });

  workoutTimerLap.addEventListener('click', function () {
    if (!stopwatchState.isRunning) {
      return;
    }

    workoutSession.laps.unshift({
      id: createSessionItemId(),
      elapsedTime: getWorkoutElapsedMilliseconds(),
      createdAt: Date.now()
    });
    persistWorkoutSession();
    renderWorkoutTimer();
  });

  workoutTimerReset.addEventListener('click', function () {
    resetWorkoutTimer();
    persistWorkoutSession();
    renderSessionStatus();
  });

  workoutFloatingTimerBlock.addEventListener('pointerdown', function (event) {
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('label')) {
      return;
    }

    const panelRect = workoutFloatingPanel.getBoundingClientRect();
    dragState.active = true;
    dragState.offsetX = event.clientX - panelRect.left;
    dragState.offsetY = event.clientY - panelRect.top;

    workoutFloatingPanel.classList.add('is-dragging');
    workoutFloatingTimerBlock.setPointerCapture(event.pointerId);
  });

  workoutFloatingTimerBlock.addEventListener('pointermove', function (event) {
    if (!dragState.active) {
      return;
    }

    event.preventDefault();
    movePanelTo(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
  });

  workoutFloatingTimerBlock.addEventListener('pointerup', function (event) {
    if (!dragState.active) {
      return;
    }

    dragState.active = false;
    workoutFloatingPanel.classList.remove('is-dragging');
    workoutFloatingTimerBlock.releasePointerCapture(event.pointerId);
    persistPanelPosition();
  });

  workoutFloatingTimerBlock.addEventListener('pointercancel', function (event) {
    if (!dragState.active) {
      return;
    }

    dragState.active = false;
    workoutFloatingPanel.classList.remove('is-dragging');
    workoutFloatingTimerBlock.releasePointerCapture(event.pointerId);
    persistPanelPosition();
  });

  window.addEventListener('resize', function () {
    const rect = workoutFloatingPanel.getBoundingClientRect();
    if (workoutFloatingPanel.style.left) {
      movePanelTo(rect.left, rect.top);
      persistPanelPosition();
    }
  });

  mount.addEventListener('click', function (event) {
    const actionButton = event.target.closest('button[data-add-workout]');
    if (!actionButton) {
      return;
    }

    const exerciseName = actionButton.getAttribute('data-add-workout');
    const selectedExercise = exercises.find(function (item) {
      return item.name === exerciseName;
    });

    if (!selectedExercise) {
      return;
    }

    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.startedAt = new Date().toISOString();
    }

    workoutSession.items.push({
      id: createSessionItemId(),
      name: selectedExercise.name,
      category: selectedExercise.category,
      sets: 3,
      reps: deriveRepValue(selectedExercise.reps),
      addedAt: new Date().toISOString()
    });

    persistWorkoutSession();
    renderSessionStatus();
    render();

    if (window.showToast) {
      window.showToast(selectedExercise.name + ' added to the current workout.', 'success');
    }
  });

  workoutFloatingList.addEventListener('click', function (event) {
    const removeButton = event.target.closest('button[data-remove-workout-item]');
    if (!removeButton) {
      return;
    }

    const itemId = removeButton.getAttribute('data-remove-workout-item');
    workoutSession.items = workoutSession.items.filter(function (item) {
      return item.id !== itemId;
    });
    persistWorkoutSession();
    renderSessionStatus();
    render();
  });

  workoutFloatingList.addEventListener('input', function (event) {
    const input = event.target.closest('input[data-workout-field]');
    if (!input) {
      return;
    }

    const itemId = input.getAttribute('data-workout-item');
    const field = input.getAttribute('data-workout-field');
    const sessionItem = workoutSession.items.find(function (item) {
      return item.id === itemId;
    });

    if (!sessionItem || (field !== 'sets' && field !== 'reps')) {
      return;
    }

    sessionItem[field] = normalizePositiveNumber(input.value, sessionItem[field]);
    persistWorkoutSession();
    renderSessionStatus();
    renderFloatingPanel();
  });

  function render() {
    const filtered = currentFilter === 'all'
      ? exercises
      : exercises.filter(function (item) {
        return item.category === currentFilter;
      });

    count.textContent = 'Showing ' + filtered.length + ' exercise' + (filtered.length === 1 ? '' : 's');
    mount.innerHTML = filtered.map(function (item) {
      const alreadyAdded = workoutSession.items.some(function (entry) {
        return entry.name === item.name;
      });

      return (
        '<article class="glass-card card">' +
          '<div style="display:flex; gap:.5rem; margin-bottom:.6rem; flex-wrap:wrap;">' +
            '<span class="pill-badge ' + (colorByLevel[item.difficulty] || 'pill-beginner') + '">' + escapeHtml(item.difficulty) + '</span>' +
            '<span class="pill-badge" style="background:rgba(var(--primary-rgb),.12); color:var(--primary); text-transform:capitalize;">' + escapeHtml(item.category) + '</span>' +
          '</div>' +
          '<h3 class="page-title" style="font-size:1.2rem; margin:0 0 .4rem;">' + escapeHtml(item.name) + '</h3>' +
          '<p class="muted" style="margin:0 0 .6rem;">' + escapeHtml(item.description) + '</p>' +
          '<div class="exercise-card-actions">' +
            '<p class="mini-label" style="margin:0;">Recommended: <span class="primary-text">' + escapeHtml(item.reps) + ' reps</span></p>' +
            '<button class="button button-outline exercise-add-button" type="button" data-add-workout="' + escapeHtml(item.name) + '">' + (alreadyAdded ? 'Add Again' : 'Add To Workout') + '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderSessionStatus() {
    const exerciseCount = workoutSession.items.length;

    startWorkoutButton.textContent = workoutSession.active ? 'Reset Workout' : 'Start Workout';
    startWorkoutButton.classList.toggle('button-outline', workoutSession.active);
    startWorkoutButton.classList.toggle('button-primary', !workoutSession.active);
    workoutSessionCount.classList.add('workout-session-count-text');
    workoutSessionCount.textContent = exerciseCount
      ? exerciseCount + ' exercise' + (exerciseCount === 1 ? '' : 's') + ' in current session.'
      : '';
    syncWorkoutTimerTicker();
    renderWorkoutTimer();
    renderFloatingPanel();
  }

  function normalizeExercise(item) {
    return {
      name: item && item.name ? item.name : 'Exercise',
      category: item && item.muscle_group ? item.muscle_group : 'general',
      difficulty: item && item.difficulty ? item.difficulty : 'Beginner',
      reps: item && item.recommended_reps ? item.recommended_reps : '8-12',
      description: item && item.description ? item.description : 'Exercise details will be available soon.'
    };
  }

  function loadExercises() {
    if (typeof app.requestJson !== 'function') {
      renderSessionStatus();
      render();
      return;
    }

    count.textContent = 'Loading exercises...';

    app.requestJson('exercises')
      .then(function (data) {
        if (data && Array.isArray(data.exercises) && data.exercises.length) {
          exercises = data.exercises.map(normalizeExercise);
        }
        renderSessionStatus();
        render();
      })
      .catch(function () {
        exercises = fallbackExercises.slice();
        renderSessionStatus();
        render();
      });
  }

  function createEmptyWorkoutSession() {
    return {
      active: false,
      showTimer: false,
      startedAt: '',
      elapsedTime: 0,
      isRunning: false,
      startTime: null,
      laps: [],
      items: []
    };
  }

  function readWorkoutSession() {
    try {
      const raw = window.localStorage.getItem(WORKOUT_SESSION_STORAGE_KEY);
      if (!raw) {
        return createEmptyWorkoutSession();
      }

      const parsed = JSON.parse(raw);
      const legacyStartTime = parsed && parsed.timerStartedAt
        ? new Date(parsed.timerStartedAt).getTime()
        : null;

      return {
        active: Boolean(parsed && parsed.active),
        showTimer: false,
        startedAt: parsed && parsed.startedAt ? parsed.startedAt : '',
        elapsedTime: normalizePositiveNumber(
          parsed && (parsed.elapsedTime !== undefined ? parsed.elapsedTime : parsed.elapsedSeconds),
          0,
          true
        ),
        isRunning: Boolean(parsed && (parsed.isRunning !== undefined ? parsed.isRunning : parsed.timerRunning)),
        startTime: Number.isFinite(parsed && parsed.startTime)
          ? Number(parsed.startTime)
          : (Number.isFinite(legacyStartTime) ? legacyStartTime : null),
        laps: parsed && Array.isArray(parsed.laps) ? parsed.laps.map(function (lap, index) {
          return {
            id: lap && lap.id ? lap.id : 'lap-' + index,
            elapsedTime: normalizePositiveNumber(lap && lap.elapsedTime, 0, true),
            createdAt: Number(lap && lap.createdAt) || Date.now()
          };
        }) : [],
        items: parsed && Array.isArray(parsed.items) ? parsed.items.map(function (item, index) {
          return {
            id: item && item.id ? item.id : 'session-item-' + index,
            name: item && item.name ? item.name : 'Exercise',
            category: item && item.category ? item.category : 'general',
            sets: normalizePositiveNumber(item && item.sets, 3),
            reps: normalizePositiveNumber(item && item.reps, 10),
            addedAt: item && item.addedAt ? item.addedAt : ''
          };
        }) : []
      };
    } catch (error) {
      return createEmptyWorkoutSession();
    }
  }

  function persistWorkoutSession() {
    syncSessionTimerState();
    window.localStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, JSON.stringify(workoutSession));
  }

  function applySavedPanelPosition() {
    if (!workoutSession.showTimer) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(WORKOUT_PANEL_POSITION_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || !Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) {
        return;
      }

      movePanelTo(parsed.left, parsed.top);
    } catch (error) {
      // Ignore malformed saved positions.
    }
  }

  function persistPanelPosition() {
    const rect = workoutFloatingPanel.getBoundingClientRect();
    window.localStorage.setItem(WORKOUT_PANEL_POSITION_KEY, JSON.stringify({
      left: rect.left,
      top: rect.top
    }));
  }

  function movePanelTo(left, top) {
    const maxLeft = Math.max(0, window.innerWidth - workoutFloatingPanel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - workoutFloatingPanel.offsetHeight);
    const safeLeft = Math.min(Math.max(0, left), maxLeft);
    const safeTop = Math.min(Math.max(0, top), maxTop);

    workoutFloatingPanel.style.left = safeLeft + 'px';
    workoutFloatingPanel.style.top = safeTop + 'px';
    workoutFloatingPanel.style.right = 'auto';
    workoutFloatingPanel.style.bottom = 'auto';
  }

  function renderFloatingPanel() {
    const totalItems = workoutSession.items.length;
    const configuredItems = workoutSession.items.filter(function (item) {
      return Number(item.sets || 0) > 0 && Number(item.reps || 0) > 0;
    }).length;
    const progress = totalItems ? Math.round((configuredItems / totalItems) * 100) : 0;

    workoutFloatingPanel.hidden = !workoutSession.showTimer;
    workoutFloatingPanel.classList.toggle('is-inactive', !workoutSession.active);
    workoutFloatingTimerBlock.hidden = !workoutSession.showTimer;
    workoutFloatingProgressLabel.textContent = workoutSession.active
      ? (totalItems ? configuredItems + ' of ' + totalItems + ' ready for the session' : 'No exercises configured yet.')
      : 'Workout mode is inactive right now.';
    workoutFloatingProgressValue.textContent = workoutSession.active ? progress + '%' : '0%';
    workoutFloatingProgressBar.style.width = workoutSession.active ? progress + '%' : '0%';
    renderWorkoutLaps();

    if (!workoutSession.active) {
      workoutFloatingList.innerHTML = '<div class="workout-floating-empty">Start workout mode to open your live session, then add exercises from the library here.</div>';
      return;
    }

    if (!totalItems) {
      workoutFloatingList.innerHTML = '<div class="workout-floating-empty">Add exercises from the library to build your workout here.</div>';
      return;
    }

    workoutFloatingList.innerHTML = workoutSession.items.map(function (item) {
      return (
        '<article class="workout-floating-item">' +
          '<div class="workout-floating-item-head">' +
            '<div>' +
              '<h3 class="workout-floating-item-title">' + escapeHtml(item.name) + '</h3>' +
              '<p class="muted" style="margin:.2rem 0 0; text-transform:capitalize;">' + escapeHtml(item.category) + '</p>' +
            '</div>' +
            '<button class="button button-outline workout-floating-item-remove" type="button" data-remove-workout-item="' + escapeHtml(item.id) + '">Remove</button>' +
          '</div>' +
          '<div class="workout-floating-inputs">' +
            '<label>' +
              '<span class="mini-label">Sets</span>' +
              '<input type="number" min="1" step="1" value="' + escapeHtml(item.sets) + '" data-workout-item="' + escapeHtml(item.id) + '" data-workout-field="sets" />' +
            '</label>' +
            '<label>' +
              '<span class="mini-label">Reps</span>' +
              '<input type="number" min="1" step="1" value="' + escapeHtml(item.reps) + '" data-workout-item="' + escapeHtml(item.id) + '" data-workout-field="reps" />' +
            '</label>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWorkoutTimer() {
    workoutFloatingTimerBlock.hidden = !workoutSession.showTimer;
    workoutFloatingTimerDisplay.textContent = formatDuration(getWorkoutElapsedMilliseconds());
    workoutTimerStart.disabled = stopwatchState.isRunning;
    workoutTimerStop.disabled = !stopwatchState.isRunning;
    workoutTimerLap.disabled = !stopwatchState.isRunning;
    workoutTimerReset.disabled = !stopwatchState.isRunning && getWorkoutElapsedMilliseconds() === 0;
    renderWorkoutLaps();
  }

  function getWorkoutElapsedMilliseconds() {
    const storedElapsed = Math.max(0, Number(stopwatchState.elapsedTime || 0));
    if (!stopwatchState.isRunning || !Number.isFinite(stopwatchState.startTime)) {
      return storedElapsed;
    }
    return storedElapsed + Math.max(0, Date.now() - stopwatchState.startTime);
  }

  function startWorkoutTimer() {
    if (stopwatchState.isRunning) {
      return;
    }

    stopwatchState.elapsedTime = getWorkoutElapsedMilliseconds();
    stopwatchState.isRunning = true;
    stopwatchState.startTime = Date.now();
    syncSessionTimerState();
    persistWorkoutSession();
    syncWorkoutTimerTicker();
    renderWorkoutTimer();
  }

  function stopWorkoutTimer() {
    if (!stopwatchState.isRunning) {
      return;
    }

    stopwatchState.elapsedTime = getWorkoutElapsedMilliseconds();
    stopwatchState.isRunning = false;
    stopwatchState.startTime = null;
    stopWorkoutTimerTicker();
    syncSessionTimerState();
    renderWorkoutTimer();
    persistWorkoutSession();
  }

  function resetWorkoutTimer() {
    stopWorkoutTimerTicker();
    stopwatchState.elapsedTime = 0;
    stopwatchState.isRunning = false;
    stopwatchState.startTime = null;
    workoutSession.laps = [];
    syncSessionTimerState();
    renderWorkoutTimer();
  }

  function syncWorkoutTimerTicker() {
    stopWorkoutTimerTicker();

    if (workoutSession.active && stopwatchState.isRunning) {
      renderWorkoutTimer();
      workoutTimerInterval = window.setInterval(function () {
        renderWorkoutTimer();
      }, 50);
    }
  }

  function stopWorkoutTimerTicker() {
    if (workoutTimerInterval) {
      window.clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
  }

  function createStopwatchState(session) {
    return {
      startTime: Number.isFinite(session && session.startTime) ? Number(session.startTime) : null,
      elapsedTime: normalizePositiveNumber(session && session.elapsedTime, 0, true),
      isRunning: Boolean(session && session.isRunning)
    };
  }

  function syncSessionTimerState() {
    workoutSession.elapsedTime = stopwatchState.elapsedTime;
    workoutSession.isRunning = stopwatchState.isRunning;
    workoutSession.startTime = stopwatchState.startTime;
  }

  function renderWorkoutLaps() {
    if (!workoutSession.showTimer) {
      workoutFloatingLaps.hidden = true;
      workoutFloatingLaps.innerHTML = '';
      return;
    }

    if (!workoutSession.laps || !workoutSession.laps.length) {
      workoutFloatingLaps.hidden = true;
      workoutFloatingLaps.innerHTML = '';
      return;
    }

    workoutFloatingLaps.hidden = false;
    workoutFloatingLaps.innerHTML = workoutSession.laps.map(function (lap, index) {
      return (
        '<div class="workout-floating-lap">' +
          '<span class="workout-floating-lap-label">Lap ' + (workoutSession.laps.length - index) + '</span>' +
          '<strong class="workout-floating-lap-time">' + formatDuration(lap.elapsedTime) + '</strong>' +
        '</div>'
      );
    }).join('');
  }

  function deriveRepValue(repsText) {
    const match = String(repsText || '').match(/\d+/);
    return match ? Number(match[0]) : 10;
  }

  function createSessionItemId() {
    return 'session-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  function normalizePositiveNumber(value, fallback, allowZero) {
    const number = Number(value);
    if (Number.isNaN(number) || (!allowZero && number <= 0) || (allowZero && number < 0)) {
      return Number(fallback || 1);
    }
    return Math.round(number);
  }

  function formatDuration(totalMilliseconds) {
    const safeMilliseconds = Math.max(0, Number(totalMilliseconds || 0));
    const hours = String(Math.floor(safeMilliseconds / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((safeMilliseconds % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((safeMilliseconds % 60000) / 1000)).padStart(2, '0');
    const centiseconds = String(Math.floor((safeMilliseconds % 1000) / 10)).padStart(2, '0');
    return hours + ':' + minutes + ':' + seconds + '.' + centiseconds;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  loadExercises();
})();
