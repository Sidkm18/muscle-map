(function () {
  const form = document.getElementById('calculator-form');
  const list = document.getElementById('exercise-list');
  const clearAllBtn = document.getElementById('clear-all');
  const emptyState = document.getElementById('empty-state');
  const app = window.MuscleMap || {};

  if (!form || !list || !clearAllBtn || !emptyState) {
    return;
  }

  const weightInput = document.getElementById('weight');
  const repsInput = document.getElementById('reps');
  const bodyweightInput = document.getElementById('bodyweight');

  const totalVolumeEl = document.getElementById('metric-volume');
  const est1RmEl = document.getElementById('metric-1rm');
  const avgRepsEl = document.getElementById('metric-avg-reps');
  const totalSetsEl = document.getElementById('metric-sets');
  const calculatorFeedbackEl = document.getElementById('calculator-feedback');
  const strengthLevelEl = document.getElementById('strength-level');
  const nextSetEmptyEl = document.getElementById('next-set-empty');
  const nextSetCardEl = document.getElementById('next-set-card');
  const nextSetValueEl = document.getElementById('next-set-value');
  const nextSetNoteEl = document.getElementById('next-set-note');
  const restTimerShellEl = document.querySelector('.rest-timer-shell');
  const restTimerDisplayEl = document.getElementById('rest-timer-display');
  const restTimerStatusEl = document.getElementById('rest-timer-status');
  const restTimerStartBtn = document.getElementById('rest-timer-start');
  const restTimerPauseBtn = document.getElementById('rest-timer-pause');
  const restTimerResetBtn = document.getElementById('rest-timer-reset');

  const TARGET_REP_RANGE = {
    min: 6,
    max: 10
  };
  const REST_TIMER_DEFAULT_SECONDS = 75;
  const WEIGHT_UNIT = {
    label: 'kg',
    increment: 2.5
  };
  const PROGRESSION_RATES = {
    smallIncrease: 0.025,
    largeIncrease: 0.05,
    smallDecrease: 0.025
  };
  const STRENGTH_LEVEL_THRESHOLDS = {
    beginnerMaxRatio: 1,
    intermediateMaxRatio: 1.5
  };

  let items = [];
  let restTimerRemainingSeconds = REST_TIMER_DEFAULT_SECONDS;
  let restTimerIntervalId = null;
  let restTimerState = 'idle';

  function calculate1RM(weight, reps) {
    if (reps === 1) {
      return weight;
    }
    return Math.round(weight * (1 + reps / 30));
  }

  function roundToNearestIncrement(value, increment) {
    return Math.max(increment, Math.round(value / increment) * increment);
  }

  function formatWeight(value) {
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: 1
    });
  }

  function formatSeconds(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return String(minutes).padStart(2, '0') + ':' + String(remainingSeconds).padStart(2, '0');
  }

  function getTargetRepDisplay() {
    return TARGET_REP_RANGE.min + '-' + Math.min(TARGET_REP_RANGE.max, TARGET_REP_RANGE.min + 2);
  }

  function getLatestSet() {
    return items.length ? items[items.length - 1] : null;
  }

  function getCurrentBodyweight() {
    return bodyweightInput ? Number(bodyweightInput.value) : 0;
  }

  function getStrengthLevel(ratio) {
    if (ratio <= 0) {
      return null;
    }

    if (ratio < STRENGTH_LEVEL_THRESHOLDS.beginnerMaxRatio) {
      return {
        label: 'Beginner',
        className: 'strength-level-beginner'
      };
    }

    if (ratio <= STRENGTH_LEVEL_THRESHOLDS.intermediateMaxRatio) {
      return {
        label: 'Intermediate',
        className: 'strength-level-intermediate'
      };
    }

    return {
      label: 'Advanced',
      className: 'strength-level-advanced'
    };
  }

  function renderStrengthLevel(est1RM) {
    if (!strengthLevelEl) {
      return;
    }

    const bodyweight = getCurrentBodyweight();
    strengthLevelEl.className = 'strength-level-indicator';

    if (!bodyweight || bodyweight <= 0) {
      strengthLevelEl.classList.add('strength-level-pending');
      strengthLevelEl.textContent = 'Strength Level: Add bodyweight';
      return;
    }

    if (!est1RM || est1RM <= 0) {
      strengthLevelEl.classList.add('strength-level-pending');
      strengthLevelEl.textContent = 'Strength Level: Log a set first';
      return;
    }

    const ratio = est1RM / bodyweight;
    const level = getStrengthLevel(ratio);

    if (!level) {
      strengthLevelEl.classList.add('strength-level-pending');
      strengthLevelEl.textContent = 'Strength Level: Not available';
      return;
    }

    strengthLevelEl.classList.add(level.className);
    strengthLevelEl.textContent = 'Strength Level: ' + level.label + ' (' + ratio.toFixed(2) + 'x bodyweight)';
  }

  function calculateNextSetSuggestion(item) {
    if (!item || item.weight <= 0 || item.reps <= 0) {
      return null;
    }

    const reps = item.reps;
    const lowerLimit = TARGET_REP_RANGE.min;
    const upperLimit = TARGET_REP_RANGE.max;
    const midpoint = (lowerLimit + upperLimit) / 2;
    let suggestedWeight = item.weight;
    let note = 'Keep the same load and aim to own the target range again.';

    if (reps >= upperLimit + 2) {
      suggestedWeight = item.weight * (1 + PROGRESSION_RATES.largeIncrease);
      note = 'You overshot the top of the range, so a stronger jump makes sense next set.';
    } else if (reps >= upperLimit) {
      suggestedWeight = item.weight * (1 + PROGRESSION_RATES.smallIncrease);
      note = 'You reached the top of the range, so a small bump is the next step.';
    } else if (reps >= lowerLimit) {
      if (reps > midpoint) {
        suggestedWeight = item.weight * (1 + PROGRESSION_RATES.smallIncrease);
        note = 'You are sitting comfortably in range, so a slight increase should still keep you productive.';
      } else {
        note = 'You are in the target range, so repeating the same weight is a solid next set.';
      }
    } else if (reps === lowerLimit - 1) {
      note = 'You were just under the range, so keep the same weight and try to beat the rep count.';
    } else {
      suggestedWeight = item.weight * (1 - PROGRESSION_RATES.smallDecrease);
      note = 'You fell below the target range, so a small drop should help bring reps back up cleanly.';
    }

    return {
      weight: roundToNearestIncrement(suggestedWeight, WEIGHT_UNIT.increment),
      repText: getTargetRepDisplay(),
      note: note
    };
  }

  function renderNextSetSuggestion() {
    if (!nextSetEmptyEl || !nextSetCardEl || !nextSetValueEl || !nextSetNoteEl) {
      return;
    }

    const latestSet = getLatestSet();
    const suggestion = calculateNextSetSuggestion(latestSet);

    if (!suggestion) {
      nextSetEmptyEl.hidden = false;
      nextSetCardEl.hidden = true;
      return;
    }

    nextSetEmptyEl.hidden = true;
    nextSetCardEl.hidden = false;
    nextSetValueEl.textContent = formatWeight(suggestion.weight) + ' ' + WEIGHT_UNIT.label + ' for ' + suggestion.repText + ' reps';
    nextSetNoteEl.textContent = suggestion.note;
  }

  function getWorkoutFeedback() {
    if (!items.length) {
      return 'Add a few sets and MuscleMap will summarize how the session is trending.';
    }

    const totalVolume = items.reduce(function (sum, item) {
      return sum + item.weight * item.reps;
    }, 0);
    const averageReps = items.reduce(function (sum, item) {
      return sum + item.reps;
    }, 0) / items.length;
    const startedHeavier = items.length > 1 && items[items.length - 1].weight > items[0].weight;
    const fatigueDetected = items.some(function (item, index) {
      if (index === 0) {
        return false;
      }

      const previousItem = items[index - 1];
      return item.weight === previousItem.weight && item.reps < previousItem.reps;
    });

    if (averageReps <= 5) {
      return 'Strength-focused training. Keep your rest long enough to hold bar speed.';
    }

    if (averageReps > 15) {
      return 'Light intensity session. Increase weight next session if the sets felt comfortable.';
    }

    if (fatigueDetected) {
      return 'Fatigue detected at the same load. Consider longer rest or a slightly smaller jump.';
    }

    if (averageReps >= 6 && averageReps <= 12) {
      if (startedHeavier || totalVolume >= 1000) {
        return 'Good hypertrophy session. The volume and rep range both look productive.';
      }

      return 'Good hypertrophy range. If the last set felt smooth, increase weight next session.';
    }

    return 'Mixed training session. Keep the next set aligned with your goal for cleaner progression.';
  }

  function renderWorkoutFeedback() {
    if (calculatorFeedbackEl) {
      calculatorFeedbackEl.textContent = getWorkoutFeedback();
    }
  }

  function updateRestTimerUI() {
    if (!restTimerShellEl || !restTimerDisplayEl || !restTimerStatusEl) {
      return;
    }

    restTimerShellEl.classList.remove('is-active', 'is-complete');
    restTimerDisplayEl.textContent = 'Rest: ' + formatSeconds(restTimerRemainingSeconds);

    if (restTimerState === 'running') {
      restTimerShellEl.classList.add('is-active');
      restTimerStatusEl.textContent = 'Recovery is running. Breathe and get ready for the next set.';
      if (restTimerPauseBtn) {
        restTimerPauseBtn.textContent = 'Pause';
      }
      return;
    }

    if (restTimerState === 'paused') {
      restTimerStatusEl.textContent = 'Timer paused. Resume when you want the rest clock back on.';
      if (restTimerPauseBtn) {
        restTimerPauseBtn.textContent = 'Resume';
      }
      return;
    }

    if (restTimerState === 'complete') {
      restTimerShellEl.classList.add('is-complete');
      restTimerStatusEl.textContent = 'Ready for next set';
      if (restTimerPauseBtn) {
        restTimerPauseBtn.textContent = 'Pause';
      }
      return;
    }

    restTimerStatusEl.textContent = 'Idle until you start a break.';
    if (restTimerPauseBtn) {
      restTimerPauseBtn.textContent = 'Pause';
    }
  }

  function clearRestTimerInterval() {
    if (restTimerIntervalId) {
      window.clearInterval(restTimerIntervalId);
      restTimerIntervalId = null;
    }
  }

  function notifyRestTimerComplete() {
    if (navigator.vibrate) {
      navigator.vibrate(180);
    }
  }

  function completeRestTimer() {
    clearRestTimerInterval();
    restTimerRemainingSeconds = 0;
    restTimerState = 'complete';
    notifyRestTimerComplete();
    updateRestTimerUI();
  }

  function tickRestTimer() {
    if (restTimerRemainingSeconds <= 1) {
      completeRestTimer();
      return;
    }

    restTimerRemainingSeconds -= 1;
    updateRestTimerUI();
  }

  function startRestTimer() {
    if (restTimerState === 'running') {
      return;
    }

    if (restTimerState === 'idle' || restTimerState === 'complete') {
      restTimerRemainingSeconds = REST_TIMER_DEFAULT_SECONDS;
    }

    restTimerState = 'running';
    clearRestTimerInterval();
    updateRestTimerUI();
    restTimerIntervalId = window.setInterval(tickRestTimer, 1000);
  }

  function pauseRestTimer() {
    if (restTimerState === 'running') {
      restTimerState = 'paused';
      clearRestTimerInterval();
      updateRestTimerUI();
      return;
    }

    if (restTimerState === 'paused') {
      startRestTimer();
    }
  }

  function resetRestTimer() {
    clearRestTimerInterval();
    restTimerRemainingSeconds = REST_TIMER_DEFAULT_SECONDS;
    restTimerState = 'idle';
    updateRestTimerUI();
  }

  function updateMetrics() {
    const totalVolume = items.reduce(function (sum, item) {
      return sum + item.weight * item.reps;
    }, 0);
    const totalSets = items.length;
    const totalReps = items.reduce(function (sum, item) {
      return sum + item.reps;
    }, 0);
    const avgReps = totalSets ? totalReps / totalSets : 0;
    const heaviest = items.reduce(function (max, item) {
      if (!max || item.weight > max.weight || (item.weight === max.weight && item.reps > max.reps)) {
        return item;
      }
      return max;
    }, null);
    const est1RM = heaviest ? calculate1RM(heaviest.weight, heaviest.reps) : 0;

    totalVolumeEl.textContent = totalVolume.toLocaleString();
    est1RmEl.textContent = est1RM.toLocaleString();
    avgRepsEl.textContent = avgReps.toFixed(totalSets ? 1 : 0);
    totalSetsEl.textContent = totalSets.toLocaleString();
    renderStrengthLevel(est1RM);
    renderNextSetSuggestion();
    renderWorkoutFeedback();
  }

  function getBestSetId() {
    const bestSet = items.reduce(function (best, item) {
      if (!best) {
        return item;
      }

      const bestVolume = best.weight * best.reps;
      const itemVolume = item.weight * item.reps;

      if (itemVolume > bestVolume) {
        return item;
      }

      if (itemVolume === bestVolume && item.weight > best.weight) {
        return item;
      }

      return best;
    }, null);

    return bestSet ? bestSet.id : null;
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function normalizeSet(item) {
    return {
      id: Number(item && item.id ? item.id : Date.now()),
      weight: Number(item && item.weight ? item.weight : 0),
      reps: Number(item && item.reps ? item.reps : 0),
      bodyweight: item && item.bodyweight !== null && item.bodyweight !== undefined ? Number(item.bodyweight) : null,
      timestamp: Number(item && item.timestamp ? item.timestamp : Date.now())
    };
  }

  function renderList() {
    const bestSetId = getBestSetId();

    list.innerHTML = items.map(function (item, index) {
      const isBestSet = item.id === bestSetId;

      return (
        '<div class="glass-card workout-set-row' + (isBestSet ? ' is-best' : '') + '">' +
          '<div class="workout-set-meta">' +
            '<div class="workout-set-head">' +
              '<span class="workout-set-badge">Set ' + (index + 1) + '</span>' +
              (isBestSet ? '<span class="workout-set-badge">Best Set</span>' : '') +
            '</div>' +
            '<div class="workout-set-line"><strong>' + formatWeight(item.weight) + '</strong> ' + WEIGHT_UNIT.label + ' x <strong>' + item.reps + '</strong> reps</div>' +
            '<div class="workout-set-time">Logged at ' + formatTimestamp(item.timestamp) + '</div>' +
          '</div>' +
          '<button class="pill" type="button" data-remove="' + item.id + '" style="color:var(--danger)">Delete</button>' +
        '</div>'
      );
    }).join('');

    emptyState.style.display = items.length ? 'none' : 'block';
    clearAllBtn.style.visibility = items.length ? 'visible' : 'hidden';
    updateMetrics();
  }

  function setItems(nextItems) {
    items = nextItems.map(normalizeSet);

    const latestBodyweight = items.reduce(function (current, item) {
      return item.bodyweight && item.bodyweight > 0 ? item.bodyweight : current;
    }, 0);

    if (bodyweightInput && latestBodyweight > 0 && !bodyweightInput.value) {
      bodyweightInput.value = String(latestBodyweight);
    }

    renderList();
  }

  function requireSession() {
    if (typeof app.getSession !== 'function') {
      return Promise.resolve(true);
    }

    return app.getSession().then(function (session) {
      if (!session || !session.authenticated) {
        window.location.href = './login.html';
        return false;
      }

      return true;
    }).catch(function () {
      window.location.href = './login.html';
      return false;
    });
  }

  function loadSets() {
    if (typeof app.requestJson !== 'function') {
      return;
    }

    app.requestJson('calculator')
      .then(function (payload) {
        const apiSets = payload && Array.isArray(payload.sets) ? payload.sets : [];
        setItems(apiSets);
      })
      .catch(function (error) {
        if (typeof window.showToast === 'function') {
          window.showToast(error && error.message ? error.message : 'Unable to load saved sets.', 'error');
        }
      });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const payload = {
      weight: Number(weightInput.value),
      reps: Number(repsInput.value),
      bodyweight: bodyweightInput && bodyweightInput.value ? Number(bodyweightInput.value) : null
    };

    if (!(payload.weight > 0 && payload.reps > 0)) {
      return;
    }

    if (typeof app.requestJson !== 'function') {
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitButton, true, 'Adding...');
    }

    app.requestJson('calculator', {
      method: 'POST',
      body: payload
    }).then(function (response) {
      if (response && response.set) {
        items.push(normalizeSet(response.set));
        renderList();
      } else {
        loadSets();
      }

      weightInput.value = '';
      repsInput.value = '';
      weightInput.focus();
    }).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error && error.message ? error.message : 'Unable to save set.', 'error');
      }
    }).finally(function () {
      if (typeof app.setButtonBusy === 'function') {
        app.setButtonBusy(submitButton, false);
      }
    });
  });

  if (bodyweightInput) {
    bodyweightInput.addEventListener('input', function () {
      updateMetrics();
    });
  }

  if (restTimerStartBtn) {
    restTimerStartBtn.addEventListener('click', startRestTimer);
  }

  if (restTimerPauseBtn) {
    restTimerPauseBtn.addEventListener('click', pauseRestTimer);
  }

  if (restTimerResetBtn) {
    restTimerResetBtn.addEventListener('click', resetRestTimer);
  }

  list.addEventListener('click', function (event) {
    const btn = event.target.closest('[data-remove]');
    if (!btn || typeof app.requestJson !== 'function') {
      return;
    }

    const id = Number(btn.getAttribute('data-remove'));
    app.requestJson('calculator', {
      method: 'DELETE',
      body: {
        id: id
      }
    }).then(function () {
      items = items.filter(function (item) {
        return item.id !== id;
      });
      renderList();
    }).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error && error.message ? error.message : 'Unable to delete set.', 'error');
      }
    });
  });

  clearAllBtn.addEventListener('click', function () {
    if (typeof app.requestJson !== 'function' || !items.length) {
      return;
    }

    app.requestJson('calculator', {
      method: 'DELETE',
      body: {
        clear_all: 1
      }
    }).then(function () {
      items = [];
      renderList();
    }).catch(function (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error && error.message ? error.message : 'Unable to clear sets.', 'error');
      }
    });
  });

  updateRestTimerUI();
  renderList();
  requireSession().then(function (allowed) {
    if (allowed) {
      loadSets();
    }
  });
})();
