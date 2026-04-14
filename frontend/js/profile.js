(function () {
  const app = window.MuscleMap || {};
  const form = document.getElementById('profile-form');
  const TRACKING_STORAGE_KEY = 'mm-daily-fitness-tracking';

  if (!form) {
    return;
  }

  const fields = {
    avatar: document.getElementById('profile-avatar'),
    avatarTrigger: document.getElementById('profile-avatar-trigger'),
    photoInput: document.getElementById('profile-photo-input'),
    photoDelete: document.getElementById('profile-photo-delete'),
    logout: document.getElementById('profile-logout'),
    name: document.getElementById('profile-name'),
    subtitle: document.getElementById('profile-subtitle'),
    badges: document.getElementById('profile-badges'),
    metaEmail: document.getElementById('profile-meta-email'),
    metaPhone: document.getElementById('profile-meta-phone'),
    metaDob: document.getElementById('profile-meta-dob'),
    metaStatus: document.getElementById('profile-meta-status'),
    banner: document.getElementById('profile-banner'),
    fullName: document.getElementById('profile-full-name'),
    username: document.getElementById('profile-username'),
    email: document.getElementById('profile-email'),
    phone: document.getElementById('profile-phone'),
    gender: document.getElementById('profile-gender'),
    dob: document.getElementById('profile-dob'),
    bio: document.getElementById('profile-bio'),
    height: document.getElementById('profile-height'),
    weight: document.getElementById('profile-weight'),
    bmi: document.getElementById('profile-bmi'),
    calories: document.getElementById('profile-calories'),
    frequency: document.getElementById('profile-frequency'),
    expertise: document.getElementById('profile-expertise'),
    workoutPlan: document.getElementById('profile-workout-plan'),
    workoutTime: document.getElementById('profile-workout-time'),
    diet: document.getElementById('profile-diet'),
    goals: document.getElementById('profile-goals'),
    trackingDate: document.getElementById('tracking-date-label'),
    trackingStepsValue: document.getElementById('tracking-steps-value'),
    trackingStepsCurrent: document.getElementById('tracking-steps-current'),
    trackingStepsGoal: document.getElementById('tracking-steps-goal'),
    trackingStepsProgress: document.getElementById('tracking-steps-progress'),
    trackingCaloriesValue: document.getElementById('tracking-calories-value'),
    trackingCaloriesCurrent: document.getElementById('tracking-calories-current'),
    trackingCaloriesGoal: document.getElementById('tracking-calories-goal'),
    trackingCaloriesProgress: document.getElementById('tracking-calories-progress'),
    trackingActiveValue: document.getElementById('tracking-active-value'),
    trackingActiveCurrent: document.getElementById('tracking-active-current'),
    trackingActiveGoal: document.getElementById('tracking-active-goal'),
    trackingActiveProgress: document.getElementById('tracking-active-progress'),
    trackingOverallProgress: document.getElementById('tracking-overall-progress'),
    trackingStatus: document.getElementById('tracking-status-text'),
    trackingForm: document.getElementById('fitness-tracker-form'),
    trackingSave: document.getElementById('fitness-tracker-save'),
    trackingSimulate: document.getElementById('fitness-tracker-simulate'),
    trackingStepsInput: document.getElementById('tracking-steps-input'),
    trackingActiveInput: document.getElementById('tracking-active-input'),
    trackingHeartButton: document.getElementById('tracking-heart-button'),
    trackingHeartSteps: document.getElementById('tracking-heart-steps'),
    trackingHeartActive: document.getElementById('tracking-heart-active'),
    trackingHeartCalories: document.getElementById('tracking-heart-calories'),
    trackingHeartCenterValue: document.getElementById('tracking-heart-center-value')
  };
  let selectedProfilePhoto = '';
  let fitnessTrackerState = readTrackingState();
  let trackingHeartProgress = {
    steps: 0,
    calories: 0,
    active: 0
  };
  let lastCompletedTrackingKey = '';
  let lastHeartCenterDisplayValue = 0;

  document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    renderTracking();
    form.addEventListener('submit', handleSubmit);
    if (fields.trackingForm) {
      fields.trackingForm.addEventListener('submit', handleTrackingSubmit);
    }
    if (fields.trackingSimulate) {
      fields.trackingSimulate.addEventListener('click', handleTrackingSimulation);
    }
    if (fields.trackingHeartButton) {
      fields.trackingHeartButton.addEventListener('click', function () {
        animateTrackingHeart(trackingHeartProgress);
      });
    }
    if (fields.avatarTrigger && fields.photoInput) {
      fields.avatarTrigger.addEventListener('click', function () {
        fields.photoInput.click();
      });
      fields.photoInput.addEventListener('change', handlePhotoSelection);
    }
    if (fields.photoDelete) {
      fields.photoDelete.addEventListener('click', handlePhotoDelete);
    }
    if (fields.logout) {
      fields.logout.addEventListener('click', handleLogout);
    }
  });

  function loadProfile() {
    if (typeof app.requestJson !== 'function') {
      return;
    }

    app.requestJson('profile')
      .then(function (data) {
        renderProfile(data || {});
      })
      .catch(function (error) {
        if (error.status === 401) {
          localStorage.removeItem('isLoggedIn');
          window.location.href = './login.html';
          return;
        }

        if (window.showToast) {
          window.showToast(error.message || 'Unable to load profile', 'error');
        }
      });
  }

  function renderProfile(payload) {
    const user = payload.user || {};
    const stats = payload.stats || {};
    const fitness = payload.fitness || {};
    const membership = payload.membership || null;
    const displayName = user.full_name || user.username || 'MuscleMap User';
    const displayHandle = user.username ? '@' + user.username : 'Profile incomplete';
    const joinedLabel = user.created_at ? formatDate(user.created_at) : 'recently';
    const setupComplete = !isOnboardingIncomplete(user, stats, fitness);

    fields.avatar.src = typeof app.resolveProfilePhoto === 'function'
      ? app.resolveProfilePhoto(user.profile_photo, displayName)
      : '';
    selectedProfilePhoto = user.profile_photo || '';
    fields.name.textContent = displayName;
    fields.subtitle.textContent = displayHandle + ' · Joined ' + joinedLabel;
    fields.metaEmail.textContent = user.email || '--';
    fields.metaPhone.textContent = user.phone || 'Not added';
    fields.metaDob.textContent = user.dob ? formatDate(user.dob) : 'Not added';
    fields.metaStatus.textContent = setupComplete ? 'Complete' : 'Needs onboarding';
    fields.badges.innerHTML = buildBadges(fitness, membership);

    fields.fullName.value = user.full_name || '';
    fields.username.value = user.username || '';
    fields.email.value = user.email || '';
    fields.phone.value = user.phone || '';
    fields.gender.value = user.gender || 'Prefer Not to Say';
    fields.dob.value = user.dob || '';
    fields.bio.value = user.bio || '';

    fields.height.textContent = formatMetric(stats.height, 'cm');
    fields.weight.textContent = formatMetric(stats.weight, 'kg');
    fields.bmi.textContent = stats.bmi ? String(stats.bmi) : '--';
    fields.calories.textContent = stats.daily_calories ? String(stats.daily_calories) : '--';
    fields.frequency.textContent = formatText(fitness.gym_frequency);
    fields.expertise.textContent = formatText(fitness.expertise_level);
    fields.workoutPlan.textContent = formatText(fitness.workout_plan);
    fields.workoutTime.textContent = formatText(fitness.workout_time);
    fields.diet.textContent = formatText(fitness.diet_preference);
    fields.goals.innerHTML = buildGoals(fitness.goals);

    fields.banner.hidden = setupComplete;

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', user.full_name || user.username || '');
    localStorage.setItem('userEmail', user.email || '');
    if (user.username || stats.height || fitness.gym_frequency) {
      localStorage.setItem('onboardingComplete', 'true');
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const submitButton = document.getElementById('profile-save');
    const payload = {
      full_name: fields.fullName.value.trim(),
      username: fields.username.value.trim(),
      phone: fields.phone.value.trim(),
      gender: fields.gender.value,
      dob: fields.dob.value,
      bio: fields.bio.value.trim(),
      profile_photo: selectedProfilePhoto
    };

    if (!payload.full_name) {
      window.showToast && window.showToast('Full name is required.', 'error');
      return;
    }

    if (!payload.username || !/^[A-Za-z0-9_]{3,20}$/.test(payload.username)) {
      window.showToast && window.showToast('Username must be 3-20 characters and use only letters, numbers, and underscores.', 'error');
      return;
    }

    if (payload.phone && !/^[0-9+\-\s()]{7,20}$/.test(payload.phone)) {
      window.showToast && window.showToast('Please enter a valid phone number.', 'error');
      return;
    }

    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitButton, true, 'Saving...');
    }

    app.requestJson('profile', {
      method: 'PUT',
      body: payload
    })
      .then(function () {
        localStorage.setItem('userName', payload.full_name);
        if (typeof app.cacheAvatarPreview === 'function' && selectedProfilePhoto && selectedProfilePhoto.indexOf('data:image/') === 0) {
          app.cacheAvatarPreview(selectedProfilePhoto);
        }
        if (window.showToast) {
          window.showToast('Profile updated successfully!', 'success');
        }
        loadProfile();
      })
      .catch(function (error) {
        if (window.showToast) {
          window.showToast(error.message || 'Unable to update profile', 'error');
        }
      })
      .finally(function () {
        if (typeof app.setButtonBusy === 'function') {
          app.setButtonBusy(submitButton, false);
        }
      });
  }

  function handlePhotoSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      if (window.showToast) {
        window.showToast('Please choose an image file.', 'error');
      }
      fields.photoInput.value = '';
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      if (window.showToast) {
        window.showToast('Please use an image under 2.5MB.', 'error');
      }
      fields.photoInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
      const dataUrl = loadEvent.target && loadEvent.target.result ? String(loadEvent.target.result) : '';
      if (!dataUrl) {
        return;
      }

      selectedProfilePhoto = dataUrl;
      fields.avatar.src = dataUrl;
      if (typeof app.cacheAvatarPreview === 'function') {
        app.cacheAvatarPreview(dataUrl);
      }
      if (window.showToast) {
        window.showToast('Photo selected. Save profile to keep it.', 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoDelete() {
    selectedProfilePhoto = '';
    fields.photoInput.value = '';
    fields.avatar.src = typeof app.resolveProfilePhoto === 'function'
      ? app.resolveProfilePhoto('', fields.fullName.value.trim() || fields.username.value.trim() || 'MuscleMap User')
      : '';
    if (typeof app.clearAvatarPreview === 'function') {
      app.clearAvatarPreview();
    }
    if (window.showToast) {
      window.showToast('Photo removed. Save profile to keep the change.', 'success');
    }
  }

  function handleLogout() {
    const logoutButton = fields.logout;
    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(logoutButton, true, 'Logging out...');
    }

    app.requestJson('logout', {
      method: 'POST'
    })
      .catch(function () {
        // Clear client session state even if the server session is already gone.
      })
      .finally(function () {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('onboardingComplete');
        localStorage.removeItem('userOnboardingData');
        localStorage.removeItem('onboardingProgress');
        if (typeof app.clearAvatarPreview === 'function') {
          app.clearAvatarPreview();
        }
        window.location.href = './login.html';
      });
  }

  function handleTrackingSubmit(event) {
    event.preventDefault();

    const today = getTodayKey();
    const currentDay = ensureTrackingDay(today);
    const nextSteps = normalizeNumber(fields.trackingStepsInput.value, currentDay.steps);
    const nextActiveMinutes = normalizeNumber(fields.trackingActiveInput.value, currentDay.activeMinutes);

    updateTrackingDay(today, {
      steps: nextSteps,
      activeMinutes: nextActiveMinutes
    });

    if (window.showToast) {
      window.showToast('Daily fitness progress updated.', 'success');
    }
  }

  function handleTrackingSimulation() {
    const today = getTodayKey();
    const currentDay = ensureTrackingDay(today);
    const nextSteps = currentDay.steps + randomInt(650, 1850);
    const nextActiveMinutes = currentDay.activeMinutes + randomInt(8, 24);

    updateTrackingDay(today, {
      steps: nextSteps,
      activeMinutes: nextActiveMinutes
    });

    if (window.showToast) {
      window.showToast('Simulated activity added for today.', 'success');
    }
  }

  function renderTracking() {
    const today = getTodayKey();
    const currentDay = ensureTrackingDay(today);
    const calories = calculateCalories(currentDay.steps, currentDay.activeMinutes);
    const progress = {
      steps: calculateProgress(currentDay.steps, currentDay.goals.steps),
      calories: calculateProgress(calories, currentDay.goals.calories),
      active: calculateProgress(currentDay.activeMinutes, currentDay.goals.activeMinutes)
    };
    const averageProgress = Math.round((progress.steps + progress.calories + progress.active) / 3);
    const isComplete = progress.steps >= 100 && progress.calories >= 100 && progress.active >= 100;

    fields.trackingDate.textContent = formatTrackingDate(today);
    fields.trackingStepsValue.textContent = formatCount(currentDay.steps);
    fields.trackingStepsCurrent.textContent = formatCount(currentDay.steps);
    fields.trackingStepsGoal.textContent = formatCount(currentDay.goals.steps);
    fields.trackingStepsProgress.style.width = progress.steps + '%';

    fields.trackingCaloriesValue.textContent = formatCount(calories);
    fields.trackingCaloriesCurrent.textContent = formatCount(calories);
    fields.trackingCaloriesGoal.textContent = formatCount(currentDay.goals.calories);
    fields.trackingCaloriesProgress.style.width = progress.calories + '%';

    fields.trackingActiveValue.textContent = formatCount(currentDay.activeMinutes);
    fields.trackingActiveCurrent.textContent = formatCount(currentDay.activeMinutes);
    fields.trackingActiveGoal.textContent = formatCount(currentDay.goals.activeMinutes);
    fields.trackingActiveProgress.style.width = progress.active + '%';

    fields.trackingOverallProgress.textContent = averageProgress + '%';
    fields.trackingStatus.textContent = describeTrackingStatus(averageProgress, progress);

    fields.trackingStepsInput.value = String(currentDay.steps);
    fields.trackingActiveInput.value = String(currentDay.activeMinutes);
    trackingHeartProgress = progress;
    updateTrackingHeart(progress);
    updateTrackingHeartCenter(averageProgress);
    syncTrackingHeartCompletion(today, isComplete);
  }

  function readTrackingState() {
    try {
      const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function ensureTrackingDay(dayKey) {
    if (!fitnessTrackerState[dayKey]) {
      fitnessTrackerState[dayKey] = createDefaultTrackingDay();
      persistTrackingState();
    }

    const day = fitnessTrackerState[dayKey];
    day.goals = Object.assign(createDefaultTrackingDay().goals, day.goals || {});
    day.calories = calculateCalories(day.steps || 0, day.activeMinutes || 0);
    return day;
  }

  function updateTrackingDay(dayKey, updates) {
    const current = ensureTrackingDay(dayKey);
    const next = Object.assign({}, current, updates || {});
    next.steps = normalizeNumber(next.steps, 0);
    next.activeMinutes = normalizeNumber(next.activeMinutes, 0);
    next.calories = calculateCalories(next.steps, next.activeMinutes);
    next.updatedAt = new Date().toISOString();
    fitnessTrackerState[dayKey] = next;
    persistTrackingState();
    renderTracking();
  }

  function persistTrackingState() {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(fitnessTrackerState));
  }

  function createDefaultTrackingDay() {
    return {
      steps: 0,
      activeMinutes: 0,
      calories: 0,
      goals: {
        steps: 10000,
        calories: 500,
        activeMinutes: 90
      },
      updatedAt: new Date().toISOString()
    };
  }

  function calculateCalories(steps, activeMinutes) {
    const safeSteps = Number(steps || 0);
    const safeActiveMinutes = Number(activeMinutes || 0);
    return Math.round((safeSteps * 0.04) + (safeActiveMinutes * 3.2));
  }

  function calculateProgress(current, goal) {
    if (!goal) {
      return 0;
    }

    return Math.min(100, Math.round((Number(current || 0) / Number(goal)) * 100));
  }

  function describeTrackingStatus(overallProgress, progress) {
    if (progress.steps >= 100 && progress.calories >= 100 && progress.active >= 100) {
      return 'Daily goals completed';
    }
    if (overallProgress >= 70) {
      return 'Strong momentum today';
    }
    if (overallProgress >= 35) {
      return 'Good progress building';
    }
    return 'Getting started';
  }

  function getTodayKey() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return now.getFullYear() + '-' + month + '-' + day;
  }

  function formatTrackingDate(dayKey) {
    const date = new Date(dayKey + 'T00:00:00');
    if (Number.isNaN(date.getTime())) {
      return 'Today';
    }

    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  function normalizeNumber(value, fallback) {
    const number = Number(value);
    if (Number.isNaN(number) || number < 0) {
      return Number(fallback || 0);
    }
    return Math.round(number);
  }

  function formatCount(value) {
    return Number(value || 0).toLocaleString();
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function updateTrackingHeart(progress) {
    setHeartPathProgress(fields.trackingHeartSteps, progress.steps);
    setHeartPathProgress(fields.trackingHeartActive, progress.active);
    setHeartPathProgress(fields.trackingHeartCalories, progress.calories);
  }

  function animateTrackingHeart(progress) {
    if (!fields.trackingHeartButton) {
      return;
    }

    fields.trackingHeartButton.classList.remove('is-animating');
    setHeartPathProgress(fields.trackingHeartSteps, 0);
    setHeartPathProgress(fields.trackingHeartActive, 0);
    setHeartPathProgress(fields.trackingHeartCalories, 0);

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        fields.trackingHeartButton.classList.add('is-animating');
        updateTrackingHeart(progress);
      });
    });

    window.setTimeout(function () {
      fields.trackingHeartButton.classList.remove('is-animating');
    }, 760);
  }

  function syncTrackingHeartCompletion(dayKey, isComplete) {
    if (!fields.trackingHeartButton) {
      return;
    }

    if (!isComplete) {
      fields.trackingHeartButton.classList.remove('is-complete');
      fields.trackingHeartButton.classList.remove('is-celebrating');
      if (lastCompletedTrackingKey === dayKey) {
        lastCompletedTrackingKey = '';
      }
      return;
    }

    fields.trackingHeartButton.classList.add('is-complete');

    if (lastCompletedTrackingKey === dayKey) {
      return;
    }

    lastCompletedTrackingKey = dayKey;
    fields.trackingHeartButton.classList.remove('is-celebrating');
    window.requestAnimationFrame(function () {
      fields.trackingHeartButton.classList.add('is-celebrating');
    });

    window.setTimeout(function () {
      if (fields.trackingHeartButton) {
        fields.trackingHeartButton.classList.remove('is-celebrating');
      }
    }, 900);
  }

  function updateTrackingHeartCenter(dailyProgress) {
    if (!fields.trackingHeartCenterValue || !fields.trackingHeartButton) {
      return;
    }

    const nextValue = Math.max(0, Math.min(100, Math.round(Number(dailyProgress || 0))));
    animateHeartCenterValue(lastHeartCenterDisplayValue, nextValue);
    lastHeartCenterDisplayValue = nextValue;
  }

  function animateHeartCenterValue(fromValue, toValue) {
    if (!fields.trackingHeartCenterValue || !fields.trackingHeartButton) {
      return;
    }

    const startValue = Math.round(Number(fromValue || 0));
    const endValue = Math.round(Number(toValue || 0));
    const shouldAnimate = startValue !== endValue;

    if (!shouldAnimate) {
      fields.trackingHeartCenterValue.textContent = endValue + '%';
      return;
    }

    const duration = 520;
    const startTime = window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now();

    function step(now) {
      const currentTime = typeof now === 'number' ? now : Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + ((endValue - startValue) * eased));
      fields.trackingHeartCenterValue.textContent = currentValue + '%';

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function setHeartPathProgress(element, progress) {
    if (!element) {
      return;
    }

    const safeProgress = Math.max(0, Math.min(100, Number(progress || 0)));
    const remaining = Math.max(0, 100 - safeProgress);
    element.style.strokeDasharray = safeProgress.toFixed(2) + ' ' + remaining.toFixed(2);
    element.style.strokeDashoffset = '0';
  }

  function formatMetric(value, unit) {
    if (!value) {
      return '--';
    }

    return String(value) + (unit ? ' ' + unit : '');
  }

  function formatText(value) {
    if (!value) {
      return '--';
    }

    return String(value)
      .split(/[-_]/)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function buildGoals(value) {
    const goals = parseGoals(value);
    if (!goals.length) {
      return '<span class="profile-empty">No goals saved yet.</span>';
    }

    return goals.map(function (goal) {
      return '<span class="chip">' + escapeHtml(formatText(goal)) + '</span>';
    }).join('');
  }

  function parseGoals(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function buildBadges(fitness, membership) {
    const badges = [];
    if (fitness.expertise_level) {
      badges.push('<span class="chip">' + escapeHtml(formatText(fitness.expertise_level)) + '</span>');
    }
    if (fitness.workout_plan) {
      badges.push('<span class="chip">' + escapeHtml(formatText(fitness.workout_plan)) + '</span>');
    }
    if (membership && membership.plan_name) {
      badges.push('<span class="chip">' + escapeHtml(membership.plan_name) + '</span>');
    }
    return badges.join('');
  }

  function isOnboardingIncomplete(user, stats, fitness) {
    return !user.username || !stats.height || !stats.weight || !fitness.gym_frequency || !fitness.expertise_level;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
