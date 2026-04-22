(function () {
  const app = window.MuscleMap || {};
  const form = document.getElementById('profile-form');
  const TRACKING_STORAGE_KEY = 'mm-daily-fitness-tracking';
  const STRENGTH_PR_STORAGE_KEY = 'mm-strength-prs';
  const WATER_GUIDE_STORAGE_KEY = 'mm-water-guide';

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
    profileEditToggle: document.getElementById('profile-edit-toggle'),
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
    trackingStopwatchDisplay: document.getElementById('tracking-stopwatch-display'),
    trackingStopwatchStart: document.getElementById('tracking-stopwatch-start'),
    trackingStopwatchStop: document.getElementById('tracking-stopwatch-stop'),
    trackingStopwatchReset: document.getElementById('tracking-stopwatch-reset'),
    trackingPrWorkout: document.getElementById('tracking-pr-workout'),
    trackingPrSteps: document.getElementById('tracking-pr-steps'),
    trackingPrDeadlift: document.getElementById('tracking-pr-deadlift'),
    trackingPrBench: document.getElementById('tracking-pr-bench'),
    trackingPrSquat: document.getElementById('tracking-pr-squat'),
    trackingPrDeadliftEdit: document.getElementById('tracking-pr-deadlift-edit'),
    trackingPrBenchEdit: document.getElementById('tracking-pr-bench-edit'),
    trackingPrSquatEdit: document.getElementById('tracking-pr-squat-edit'),
    trackingPrDeadliftEditor: document.getElementById('tracking-pr-deadlift-editor'),
    trackingPrBenchEditor: document.getElementById('tracking-pr-bench-editor'),
    trackingPrSquatEditor: document.getElementById('tracking-pr-squat-editor'),
    trackingPrDeadliftInput: document.getElementById('tracking-pr-deadlift-input'),
    trackingPrBenchInput: document.getElementById('tracking-pr-bench-input'),
    trackingPrSquatInput: document.getElementById('tracking-pr-squat-input'),
    trackingPrDeadliftSave: document.getElementById('tracking-pr-deadlift-save'),
    trackingPrBenchSave: document.getElementById('tracking-pr-bench-save'),
    trackingPrSquatSave: document.getElementById('tracking-pr-squat-save'),
    trackingStepsInput: document.getElementById('tracking-steps-input'),
    trackingActiveInput: document.getElementById('tracking-active-input'),
    trackingHeartButton: document.getElementById('tracking-heart-button'),
    trackingHeartSteps: document.getElementById('tracking-heart-steps'),
    trackingHeartActive: document.getElementById('tracking-heart-active'),
    trackingHeartCalories: document.getElementById('tracking-heart-calories'),
    trackingHeartCenterValue: document.getElementById('tracking-heart-center-value'),
    trackingCurrentStreak: document.getElementById('tracking-current-streak'),
    trackingLongestStreak: document.getElementById('tracking-longest-streak'),
    trackingStreakMonth: document.getElementById('tracking-streak-month'),
    trackingStreakCalendar: document.getElementById('tracking-streak-calendar'),
    stepsChart: document.getElementById('stepsChart'),
    stepsChartFallback: document.getElementById('stepsChartFallback'),
    waterTargetLiters: document.getElementById('water-target-liters'),
    waterTargetGlasses: document.getElementById('water-target-glasses'),
    waterGuideContext: document.getElementById('water-guide-context'),
    waterCreatineToggle: document.getElementById('water-creatine-toggle'),
    waterGlassGrid: document.getElementById('water-glass-grid'),
    waterCurrentProgress: document.getElementById('water-current-progress'),
    waterProgressCopy: document.getElementById('water-progress-copy'),
    waterProgressFill: document.getElementById('water-progress-fill'),
    waterReminderToggle: document.getElementById('water-reminder-toggle'),
    waterNextReminder: document.getElementById('water-next-reminder'),
    waterReminderNote: document.getElementById('water-reminder-note'),
    waterAddGlass: document.getElementById('water-add-glass'),
    waterResetDay: document.getElementById('water-reset-day')
  };
  const weeklyStepsLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyStepsFallback = [1800, 2600, 2200, 3400, 3900, 3100, 5200];
  let selectedProfilePhoto = '';
  let originalProfilePhoto = '';
  let fitnessTrackerState = readTrackingState();
  ensureDemoTrackingStreak();
  let strengthPrState = readStrengthPrState();
  let waterGuideState = readWaterGuideState();
  let workoutTimerInterval = null;
  let waterReminderTimeout = null;
  let waterReminderInterval = null;
  let workoutTimerStartedAt = 0;
  let workoutElapsedSeconds = 0;
  let workoutTimerDayKey = '';
  let profileWeightKg = 70;
  let trackingHeartProgress = {
    steps: 0,
    calories: 0,
    active: 0
  };
  let lastCompletedTrackingKey = '';
  let lastHeartCenterDisplayValue = 0;
  let stepsChartInstance = null;

  document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    renderTracking();
    renderWaterGuide();
    form.addEventListener('submit', handleSubmit);
    if (fields.profileEditToggle) {
      fields.profileEditToggle.addEventListener('click', function () {
        toggleProfileEditor(true);
      });
    }
    if (fields.trackingForm) {
      fields.trackingForm.addEventListener('submit', handleTrackingSubmit);
    }
    if (fields.trackingSimulate) {
      fields.trackingSimulate.addEventListener('click', handleTrackingSimulation);
    }
    if (fields.trackingStopwatchStart) {
      fields.trackingStopwatchStart.addEventListener('click', handleStopwatchStart);
    }
    if (fields.trackingStopwatchStop) {
      fields.trackingStopwatchStop.addEventListener('click', handleStopwatchStop);
    }
    if (fields.trackingStopwatchReset) {
      fields.trackingStopwatchReset.addEventListener('click', handleStopwatchReset);
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
    if (fields.waterCreatineToggle) {
      fields.waterCreatineToggle.addEventListener('change', handleWaterCreatineToggle);
    }
    if (fields.waterAddGlass) {
      fields.waterAddGlass.addEventListener('click', handleWaterAddGlass);
    }
    if (fields.waterResetDay) {
      fields.waterResetDay.addEventListener('click', handleWaterResetDay);
    }
    if (fields.waterReminderToggle) {
      fields.waterReminderToggle.addEventListener('click', handleWaterReminderToggle);
    }
    bindStrengthPrActions();
    document.addEventListener('mm:themechange', handleThemeChange);
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
          if (typeof app.clearSession === 'function') {
            app.clearSession();
          }
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
    originalProfilePhoto = user.profile_photo || '';
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
    profileWeightKg = Number(stats.weight || 70) > 0 ? Number(stats.weight) : 70;
    fields.bmi.textContent = stats.bmi ? String(stats.bmi) : '--';
    fields.calories.textContent = stats.daily_calories ? String(stats.daily_calories) : '--';
    fields.frequency.textContent = formatText(fitness.gym_frequency);
    fields.expertise.textContent = formatText(fitness.expertise_level);
    fields.workoutPlan.textContent = formatText(fitness.workout_plan);
    fields.workoutTime.textContent = formatText(fitness.workout_time);
    fields.diet.textContent = formatText(fitness.diet_preference);
    fields.goals.innerHTML = buildGoals(fitness.goals);

    fields.banner.hidden = setupComplete;
    renderWaterGuide();

    if (typeof app.setSession === 'function') {
      app.setSession({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          bio: user.bio,
          profile_photo: user.profile_photo,
          created_at: user.created_at
        }
      });
    } else {
      localStorage.setItem('userName', user.full_name || user.username || '');
      localStorage.setItem('userEmail', user.email || '');
    }

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
      bio: fields.bio.value.trim()
    };

    if (selectedProfilePhoto !== originalProfilePhoto) {
      payload.profile_photo = selectedProfilePhoto;
    }

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
      .then(function (response) {
        const storedProfilePhoto = response && Object.prototype.hasOwnProperty.call(response, 'profile_photo')
          ? (response.profile_photo || '')
          : selectedProfilePhoto;

        selectedProfilePhoto = storedProfilePhoto;
        originalProfilePhoto = storedProfilePhoto;

        if (typeof app.setSession === 'function') {
          const cachedSession = typeof app.getCachedSession === 'function' ? app.getCachedSession() : null;
          app.setSession({
            authenticated: true,
            user: Object.assign({}, cachedSession && cachedSession.user ? cachedSession.user : {}, {
              full_name: payload.full_name,
              username: payload.username,
              email: fields.email.value.trim(),
              profile_photo: storedProfilePhoto
            })
          });
        } else {
          localStorage.setItem('userName', payload.full_name);
        }
        if (typeof app.cacheAvatarPreview === 'function' && storedProfilePhoto && storedProfilePhoto.indexOf('data:image/') === 0) {
          app.cacheAvatarPreview(storedProfilePhoto);
        } else if (typeof app.clearAvatarPreview === 'function') {
          app.clearAvatarPreview();
        }
        toggleProfileEditor(false);
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

  function toggleProfileEditor(isOpen) {
    if (!fields.profileEditToggle || !form) {
      return;
    }

    fields.profileEditToggle.hidden = isOpen;
    form.hidden = !isOpen;
  }

  function handlePhotoSelection(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const isSupportedPhoto = typeof app.isSupportedProfilePhotoType === 'function'
      ? app.isSupportedProfilePhotoType(file.type)
      : file.type.startsWith('image/');

    if (!isSupportedPhoto) {
      if (window.showToast) {
        window.showToast('Please choose a PNG, JPG, WEBP, GIF, or SVG image.', 'error');
      }
      fields.photoInput.value = '';
      return;
    }

    if (file.type === 'image/svg+xml') {
      if (window.showToast) {
        window.showToast('Please use a PNG, JPG, GIF, or WEBP image.', 'error');
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
        if (typeof app.clearSession === 'function') {
          app.clearSession();
        } else {
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
        }
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

  function handleStopwatchStart() {
    const today = getTodayKey();
    const currentDay = ensureTrackingDay(today);

    if (workoutTimerInterval) {
      return;
    }

    workoutTimerDayKey = today;
    workoutElapsedSeconds = Number(currentDay.workoutDurationSeconds || 0);
    workoutTimerStartedAt = Date.now() - (workoutElapsedSeconds * 1000);
    workoutTimerInterval = window.setInterval(function () {
      workoutElapsedSeconds = Math.max(0, Math.floor((Date.now() - workoutTimerStartedAt) / 1000));
      updateStopwatchDisplay(workoutElapsedSeconds);
    }, 1000);
    updateStopwatchDisplay(workoutElapsedSeconds);
  }

  function handleStopwatchStop() {
    const today = workoutTimerDayKey || getTodayKey();
    const currentDay = ensureTrackingDay(today);
    const totalSeconds = workoutTimerInterval
      ? Math.max(0, Math.floor((Date.now() - workoutTimerStartedAt) / 1000))
      : Number(currentDay.workoutDurationSeconds || 0);

    clearWorkoutTimer();
    workoutElapsedSeconds = totalSeconds;
    updateStopwatchDisplay(totalSeconds);
    updateTrackingDay(today, {
      workoutDurationSeconds: totalSeconds
    });
  }

  function handleStopwatchReset() {
    const today = workoutTimerDayKey || getTodayKey();
    clearWorkoutTimer();
    workoutElapsedSeconds = 0;
    workoutTimerDayKey = today;
    updateStopwatchDisplay(0);
    updateTrackingDay(today, {
      workoutDurationSeconds: 0
    });
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
    if (!workoutTimerInterval || workoutTimerDayKey !== today) {
      workoutElapsedSeconds = Number(currentDay.workoutDurationSeconds || 0);
      workoutTimerDayKey = today;
      updateStopwatchDisplay(workoutElapsedSeconds);
    }
    renderPrTracking();
    trackingHeartProgress = progress;
    updateTrackingHeart(progress);
    updateTrackingHeartCenter(averageProgress);
    syncTrackingHeartCompletion(today, isComplete);
    renderStreakCalendar(today);
    renderStepsChart();
  }

  function readWaterGuideState() {
    try {
      const raw = localStorage.getItem(WATER_GUIDE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        useCreatine: Boolean(parsed.useCreatine),
        reminderEnabled: parsed.reminderEnabled !== false,
        entries: parsed.entries && typeof parsed.entries === 'object' ? parsed.entries : {}
      };
    } catch (error) {
      return {
        useCreatine: false,
        reminderEnabled: true,
        entries: {}
      };
    }
  }

  function persistWaterGuideState() {
    localStorage.setItem(WATER_GUIDE_STORAGE_KEY, JSON.stringify(waterGuideState));
  }

  function getWaterGuideDayKey() {
    return getTodayKey();
  }

  function ensureWaterGuideEntry(dayKey) {
    if (!waterGuideState.entries[dayKey]) {
      waterGuideState.entries[dayKey] = {
        glasses: 0,
        updatedAt: new Date().toISOString()
      };
      persistWaterGuideState();
    }

    return waterGuideState.entries[dayKey];
  }

  function calculateWaterTargetLiters(weightKg, useCreatine) {
    const safeWeight = Number(weightKg || 70);
    const baseLiters = Math.max(2.4, safeWeight * 0.035);
    return useCreatine ? baseLiters + 0.7 : baseLiters;
  }

  function calculateWaterTargetGlasses(liters) {
    return Math.max(8, Math.ceil((Number(liters || 0) * 1000) / 250));
  }

  function renderWaterGuide() {
    if (!fields.waterTargetLiters || !fields.waterGlassGrid) {
      return;
    }

    const dayKey = getWaterGuideDayKey();
    const entry = ensureWaterGuideEntry(dayKey);
    const targetLiters = calculateWaterTargetLiters(profileWeightKg, waterGuideState.useCreatine);
    const targetGlasses = calculateWaterTargetGlasses(targetLiters);
    const currentGlasses = Math.min(targetGlasses, normalizeNumber(entry.glasses, 0));
    const progress = Math.min(100, Math.round((currentGlasses / targetGlasses) * 100));
    const nextReminderLabel = waterGuideState.reminderEnabled
      ? formatUpcomingReminderLabel()
      : 'Reminders paused';
    const recommendationNote = waterGuideState.useCreatine
      ? 'Creatine increases your hydration target, so aim a little higher than your normal baseline.'
      : 'This baseline is based on your body weight and a general training-day hydration target.';

    if (fields.waterCreatineToggle) {
      fields.waterCreatineToggle.checked = waterGuideState.useCreatine;
    }
    fields.waterTargetLiters.textContent = targetLiters.toFixed(1) + ' L';
    fields.waterTargetGlasses.textContent = targetGlasses + (targetGlasses === 1 ? ' glass / day' : ' glasses / day');
    fields.waterGuideContext.textContent = 'Using ' + Math.round(profileWeightKg) + ' kg as your body weight. ' + recommendationNote;
    fields.waterCurrentProgress.textContent = currentGlasses + ' / ' + targetGlasses + ' glasses';
    fields.waterProgressCopy.textContent = currentGlasses >= targetGlasses
      ? 'You hit today\'s hydration target. Nice work.'
      : 'Keep sipping steadily through the day to reach your target.';
    fields.waterProgressFill.style.width = progress + '%';
    fields.waterNextReminder.textContent = nextReminderLabel;
    fields.waterReminderNote.textContent = waterGuideState.reminderEnabled
      ? 'Hourly reminders are active while this page stays open.'
      : 'Hourly reminders are paused. Turn them back on when you want a nudge every hour.';
    if (fields.waterReminderToggle) {
      fields.waterReminderToggle.textContent = waterGuideState.reminderEnabled ? 'Pause Reminders' : 'Resume Reminders';
    }

    fields.waterGlassGrid.innerHTML = '';
    for (let index = 0; index < targetGlasses; index += 1) {
      const glass = document.createElement('span');
      glass.className = 'water-glass' + (index < currentGlasses ? ' is-filled' : '') + (index === currentGlasses && currentGlasses < targetGlasses ? ' is-current' : '');
      glass.innerHTML = '<span class="water-glass-fill"></span>';
      glass.setAttribute('title', 'Glass ' + (index + 1) + ' of ' + targetGlasses);
      fields.waterGlassGrid.appendChild(glass);
    }

    syncWaterReminderSchedule();
  }

  function handleWaterCreatineToggle() {
    waterGuideState.useCreatine = Boolean(fields.waterCreatineToggle && fields.waterCreatineToggle.checked);
    persistWaterGuideState();
    renderWaterGuide();
  }

  function handleWaterAddGlass() {
    const dayKey = getWaterGuideDayKey();
    const entry = ensureWaterGuideEntry(dayKey);
    const targetGlasses = calculateWaterTargetGlasses(calculateWaterTargetLiters(profileWeightKg, waterGuideState.useCreatine));
    entry.glasses = Math.min(targetGlasses, normalizeNumber(entry.glasses, 0) + 1);
    entry.updatedAt = new Date().toISOString();
    persistWaterGuideState();
    renderWaterGuide();
    if (window.showToast) {
      window.showToast('Logged one glass of water.', 'success');
    }
  }

  function handleWaterResetDay() {
    const dayKey = getWaterGuideDayKey();
    waterGuideState.entries[dayKey] = {
      glasses: 0,
      updatedAt: new Date().toISOString()
    };
    persistWaterGuideState();
    renderWaterGuide();
    if (window.showToast) {
      window.showToast('Today\'s water intake has been reset.', 'success');
    }
  }

  function handleWaterReminderToggle() {
    waterGuideState.reminderEnabled = !waterGuideState.reminderEnabled;
    persistWaterGuideState();

    if (waterGuideState.reminderEnabled && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission().finally(function () {
        renderWaterGuide();
      });
      return;
    }

    renderWaterGuide();
    if (window.showToast) {
      window.showToast(waterGuideState.reminderEnabled ? 'Hourly water reminders enabled.' : 'Hourly water reminders paused.', 'success');
    }
  }

  function clearWaterReminderSchedule() {
    if (waterReminderTimeout) {
      window.clearTimeout(waterReminderTimeout);
      waterReminderTimeout = null;
    }
    if (waterReminderInterval) {
      window.clearInterval(waterReminderInterval);
      waterReminderInterval = null;
    }
  }

  function syncWaterReminderSchedule() {
    clearWaterReminderSchedule();

    if (!waterGuideState.reminderEnabled) {
      return;
    }

    const nextReminderAt = getNextHourlyReminderTime();
    const delay = Math.max(1000, nextReminderAt.getTime() - Date.now());

    waterReminderTimeout = window.setTimeout(function () {
      sendWaterReminder();
      waterReminderInterval = window.setInterval(sendWaterReminder, 60 * 60 * 1000);
      renderWaterGuide();
    }, delay);
  }

  function getNextHourlyReminderTime() {
    const next = new Date();
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    return next;
  }

  function formatUpcomingReminderLabel() {
    return 'Next at ' + getNextHourlyReminderTime().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function sendWaterReminder() {
    const targetLiters = calculateWaterTargetLiters(profileWeightKg, waterGuideState.useCreatine);
    const message = 'Time to drink water. Aim for about ' + targetLiters.toFixed(1) + ' L today.';

    if ('Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification('MuscleMap Hydration Reminder', {
          body: message
        });
      } catch (error) {
        if (window.showToast) {
          window.showToast(message, 'success');
        }
      }
      return;
    }

    if (window.showToast) {
      window.showToast(message, 'success');
    }
  }

  function readTrackingState() {
    try {
      const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function readStrengthPrState() {
    try {
      const raw = localStorage.getItem(STRENGTH_PR_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        deadlift: normalizeNumber(parsed.deadlift, 0),
        bench: normalizeNumber(parsed.bench, 0),
        squat: normalizeNumber(parsed.squat, 0)
      };
    } catch (error) {
      return {
        deadlift: 0,
        bench: 0,
        squat: 0
      };
    }
  }

  function ensureDemoTrackingStreak() {
    const today = parseDayKey(getTodayKey());
    if (!today) {
      return;
    }

    const recentActiveDays = [0, 1, 2].filter(function (offset) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dayKey = buildDayKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const entry = fitnessTrackerState[dayKey];
      return entry && Number(entry.steps || 0) > 0;
    });

    if (recentActiveDays.length >= 3) {
      return;
    }

    const demoOffsets = [0, 1, 2];
    demoOffsets.forEach(function (offset, index) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const dayKey = buildDayKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
      const existingDay = fitnessTrackerState[dayKey] || createDefaultTrackingDay();
      fitnessTrackerState[dayKey] = Object.assign({}, existingDay, {
        steps: Math.max(Number(existingDay.steps || 0), 4200 - (index * 650)),
        activeMinutes: Math.max(Number(existingDay.activeMinutes || 0), 32 - (index * 4)),
        workoutDurationSeconds: Math.max(Number(existingDay.workoutDurationSeconds || 0), 1500 - (index * 180)),
        updatedAt: new Date().toISOString()
      });
      fitnessTrackerState[dayKey].calories = calculateCalories(
        fitnessTrackerState[dayKey].steps,
        fitnessTrackerState[dayKey].activeMinutes
      );
    });

    persistTrackingState();
  }

  function ensureTrackingDay(dayKey) {
    if (!fitnessTrackerState[dayKey]) {
      fitnessTrackerState[dayKey] = createDefaultTrackingDay();
      persistTrackingState();
    }

    const day = fitnessTrackerState[dayKey];
    day.goals = Object.assign(createDefaultTrackingDay().goals, day.goals || {});
    day.calories = calculateCalories(day.steps || 0, day.activeMinutes || 0);
    day.workoutDurationSeconds = normalizeNumber(day.workoutDurationSeconds, 0);
    return day;
  }

  function updateTrackingDay(dayKey, updates) {
    const current = ensureTrackingDay(dayKey);
    const next = Object.assign({}, current, updates || {});
    next.steps = normalizeNumber(next.steps, 0);
    next.activeMinutes = normalizeNumber(next.activeMinutes, 0);
    next.workoutDurationSeconds = normalizeNumber(next.workoutDurationSeconds, current.workoutDurationSeconds || 0);
    next.calories = calculateCalories(next.steps, next.activeMinutes);
    next.updatedAt = new Date().toISOString();
    fitnessTrackerState[dayKey] = next;
    persistTrackingState();
    renderTracking();
  }

  function persistTrackingState() {
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(fitnessTrackerState));
  }

  function persistStrengthPrState() {
    localStorage.setItem(STRENGTH_PR_STORAGE_KEY, JSON.stringify(strengthPrState));
  }

  function createDefaultTrackingDay() {
    return {
      steps: 0,
      activeMinutes: 0,
      calories: 0,
      workoutDurationSeconds: 0,
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

  function renderStepsChart() {
    const chartValues = getWeeklyStepsChartData();
    const chartPalette = getStepsChartPalette();
    const baseBarColor = chartPalette.baseBarColor;
    const activeBarColor = chartPalette.activeBarColor;
    const hoverBarColor = chartPalette.hoverBarColor;
    const hoverActiveBarColor = chartPalette.hoverActiveBarColor;
    const axisLabelColor = chartPalette.axisLabelColor;
    const highlightedIndex = 4;
    const highlightedSteps = Number(chartValues[highlightedIndex] || 0);
    const approxDistance = (highlightedSteps / 1312).toFixed(1);

    if (document.getElementById('steps-chart-total')) {
      document.getElementById('steps-chart-total').textContent = formatCount(highlightedSteps);
    }
    if (document.getElementById('steps-chart-distance')) {
      document.getElementById('steps-chart-distance').textContent = approxDistance;
    }

    if (!fields.stepsChart || typeof window.Chart !== 'function') {
      renderStepsChartFallback(chartValues, highlightedIndex);
      return;
    }

    if (fields.stepsChartFallback) {
      fields.stepsChartFallback.hidden = true;
    }
    fields.stepsChart.hidden = false;

    if (stepsChartInstance) {
      stepsChartInstance.data.labels = weeklyStepsLabels;
      stepsChartInstance.data.datasets[0].data = chartValues;
      stepsChartInstance.data.datasets[0].backgroundColor = weeklyStepsLabels.map(function (_, index) {
        return index === highlightedIndex ? activeBarColor : baseBarColor;
      });
      stepsChartInstance.data.datasets[0].hoverBackgroundColor = weeklyStepsLabels.map(function (_, index) {
        return index === highlightedIndex ? hoverActiveBarColor : hoverBarColor;
      });
      stepsChartInstance.options.animation.duration = 160;
      stepsChartInstance.options.scales.x.ticks.color = axisLabelColor;
      stepsChartInstance.update('none');
      return;
    }

    try {
      stepsChartInstance = new window.Chart(fields.stepsChart.getContext('2d'), {
        type: 'bar',
        data: {
          labels: weeklyStepsLabels,
          datasets: [
            {
              data: chartValues,
              borderRadius: 12,
              borderSkipped: false,
              backgroundColor: weeklyStepsLabels.map(function (_, index) {
                return index === highlightedIndex ? activeBarColor : baseBarColor;
              }),
              hoverBackgroundColor: weeklyStepsLabels.map(function (_, index) {
                return index === highlightedIndex ? hoverActiveBarColor : hoverBarColor;
              }),
              categoryPercentage: 0.7,
              barPercentage: 0.78,
              maxBarThickness: 18
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 180,
            easing: 'easeOutQuart'
          },
          interaction: {
            mode: 'nearest',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          },
          scales: {
            y: {
              display: false,
              beginAtZero: true,
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                display: false
              },
              border: {
                display: false
              }
            },
            x: {
              grid: {
                display: false,
                drawBorder: false
              },
              ticks: {
                color: axisLabelColor,
                font: {
                  size: 11,
                  weight: '600'
                }
              },
              border: {
                display: false
              }
            }
          }
        }
      });
    } catch (error) {
      console.warn('Unable to render Chart.js steps graph. Falling back to static bars.', error);
      renderStepsChartFallback(chartValues, highlightedIndex);
    }
  }

  function getWeeklyStepsChartData() {
    return weeklyStepsFallback.slice();
  }

  function getStepsChartPalette() {
    const rootStyles = window.getComputedStyle(document.documentElement);
    const primaryRgb = String(rootStyles.getPropertyValue('--primary-rgb') || '197, 255, 47').trim();
    const primary = String(rootStyles.getPropertyValue('--primary') || '#c5ff2f').trim();
    const text = String(rootStyles.getPropertyValue('--text') || '#edf1e4').trim();
    const themeId = document.documentElement.dataset.theme || 'dark';
    const baseOpacity = themeId === 'light' ? 0.46 : 0.58;
    const hoverOpacity = themeId === 'light' ? 0.68 : 0.82;
    const axisOpacity = themeId === 'light' ? 0.62 : 0.44;

    return {
      baseBarColor: 'rgba(' + primaryRgb + ', ' + baseOpacity + ')',
      activeBarColor: primary,
      hoverBarColor: 'rgba(' + primaryRgb + ', ' + hoverOpacity + ')',
      hoverActiveBarColor: primary,
      axisLabelColor: toRgbaColor(text, axisOpacity)
    };
  }

  function toRgbaColor(color, alpha) {
    const normalized = String(color || '').trim();

    if (normalized.indexOf('#') === 0) {
      const hex = normalized.slice(1);
      const value = hex.length === 3
        ? hex.split('').map(function (part) { return part + part; }).join('')
        : hex;

      if (value.length === 6) {
        const red = parseInt(value.slice(0, 2), 16);
        const green = parseInt(value.slice(2, 4), 16);
        const blue = parseInt(value.slice(4, 6), 16);
        return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
      }
    }

    if (normalized.indexOf('rgb(') === 0) {
      return normalized.replace('rgb(', 'rgba(').replace(')', ', ' + alpha + ')');
    }

    if (normalized.indexOf('rgba(') === 0) {
      return normalized.replace(/rgba\(([^)]+),[^,]+\)$/, 'rgba($1, ' + alpha + ')');
    }

    return normalized;
  }

  function renderStepsChartFallback(chartValues, highlightedIndex) {
    if (!fields.stepsChartFallback) {
      return;
    }

    const maxValue = Math.max.apply(null, chartValues.concat([1]));

    if (fields.stepsChart) {
      fields.stepsChart.hidden = true;
    }
    fields.stepsChartFallback.hidden = false;
    fields.stepsChartFallback.innerHTML = weeklyStepsLabels.map(function (label, index) {
      const value = Number(chartValues[index] || 0);
      const height = Math.max(12, Math.round((value / maxValue) * 100));
      const className = index === highlightedIndex
        ? 'fitness-steps-chart-fallback-bar is-active'
        : 'fitness-steps-chart-fallback-bar';

      return (
        '<div class="fitness-steps-chart-fallback-col">' +
          '<div class="' + className + '" style="height:' + height + '%" title="' + escapeHtml(label + ': ' + formatCount(value) + ' steps') + '"></div>' +
          '<span>' + label + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function handleThemeChange() {
    renderStepsChart();
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

  function updateStopwatchDisplay(totalSeconds) {
    if (!fields.trackingStopwatchDisplay) {
      return;
    }

    fields.trackingStopwatchDisplay.textContent = formatDuration(totalSeconds);
  }

  function clearWorkoutTimer() {
    if (workoutTimerInterval) {
      window.clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
  }

  function renderPrTracking() {
    if (!fields.trackingPrWorkout || !fields.trackingPrSteps) {
      return;
    }

    const metrics = Object.keys(fitnessTrackerState).reduce(function (accumulator, key) {
      const entry = fitnessTrackerState[key];

      if (!entry || typeof entry !== 'object') {
        return accumulator;
      }

      const nextSteps = Number(entry.steps || 0);
      const nextWorkout = Number(entry.workoutDurationSeconds || 0);

      if (nextSteps > accumulator.highestSteps) {
        accumulator.highestSteps = nextSteps;
      }

      if (nextWorkout > accumulator.longestWorkout) {
        accumulator.longestWorkout = nextWorkout;
      }

      return accumulator;
    }, {
      highestSteps: 0,
      longestWorkout: 0
    });

    fields.trackingPrWorkout.textContent = formatDuration(metrics.longestWorkout);
    fields.trackingPrSteps.textContent = formatCount(metrics.highestSteps);
    renderStrengthPrState();
  }

  function renderStrengthPrState() {
    if (fields.trackingPrDeadlift) {
      fields.trackingPrDeadlift.textContent = formatWeight(strengthPrState.deadlift);
    }
    if (fields.trackingPrBench) {
      fields.trackingPrBench.textContent = formatWeight(strengthPrState.bench);
    }
    if (fields.trackingPrSquat) {
      fields.trackingPrSquat.textContent = formatWeight(strengthPrState.squat);
    }
    if (fields.trackingPrDeadliftInput) {
      fields.trackingPrDeadliftInput.value = strengthPrState.deadlift ? String(strengthPrState.deadlift) : '';
    }
    if (fields.trackingPrBenchInput) {
      fields.trackingPrBenchInput.value = strengthPrState.bench ? String(strengthPrState.bench) : '';
    }
    if (fields.trackingPrSquatInput) {
      fields.trackingPrSquatInput.value = strengthPrState.squat ? String(strengthPrState.squat) : '';
    }
  }

  function bindStrengthPrActions() {
    if (fields.trackingPrDeadliftEdit) {
      fields.trackingPrDeadliftEdit.addEventListener('click', function () {
        toggleStrengthPrEditor('deadlift', true);
      });
    }
    if (fields.trackingPrBenchEdit) {
      fields.trackingPrBenchEdit.addEventListener('click', function () {
        toggleStrengthPrEditor('bench', true);
      });
    }
    if (fields.trackingPrSquatEdit) {
      fields.trackingPrSquatEdit.addEventListener('click', function () {
        toggleStrengthPrEditor('squat', true);
      });
    }
    if (fields.trackingPrDeadliftSave) {
      fields.trackingPrDeadliftSave.addEventListener('click', function () {
        saveStrengthPr('deadlift', fields.trackingPrDeadliftInput);
      });
    }
    if (fields.trackingPrBenchSave) {
      fields.trackingPrBenchSave.addEventListener('click', function () {
        saveStrengthPr('bench', fields.trackingPrBenchInput);
      });
    }
    if (fields.trackingPrSquatSave) {
      fields.trackingPrSquatSave.addEventListener('click', function () {
        saveStrengthPr('squat', fields.trackingPrSquatInput);
      });
    }
  }

  function saveStrengthPr(key, input) {
    if (!input) {
      return;
    }

    const rawValue = String(input.value || '').trim();
    const nextValue = rawValue ? Math.max(0, Math.round(Number(rawValue))) : 0;

    if (Number.isNaN(nextValue)) {
      if (window.showToast) {
        window.showToast('Enter a valid PR value.', 'error');
      }
      return;
    }

    strengthPrState[key] = nextValue;
    persistStrengthPrState();
    renderStrengthPrState();
    animateStrengthPrSave(input);
    toggleStrengthPrEditor(key, false);

    if (window.showToast) {
      window.showToast(formatText(key) + ' PR saved.', 'success');
    }
  }

  function toggleStrengthPrEditor(key, isOpen) {
    const config = getStrengthPrEditorConfig(key);
    if (!config.editButton || !config.editor) {
      return;
    }

    config.editButton.hidden = isOpen;
    config.editor.hidden = !isOpen;

    if (isOpen && config.input) {
      config.input.focus();
      config.input.select();
    }
  }

  function getStrengthPrEditorConfig(key) {
    if (key === 'deadlift') {
      return {
        editButton: fields.trackingPrDeadliftEdit,
        editor: fields.trackingPrDeadliftEditor,
        input: fields.trackingPrDeadliftInput
      };
    }
    if (key === 'bench') {
      return {
        editButton: fields.trackingPrBenchEdit,
        editor: fields.trackingPrBenchEditor,
        input: fields.trackingPrBenchInput
      };
    }
    return {
      editButton: fields.trackingPrSquatEdit,
      editor: fields.trackingPrSquatEditor,
      input: fields.trackingPrSquatInput
    };
  }

  function animateStrengthPrSave(input) {
    const prCard = input && typeof input.closest === 'function'
      ? input.closest('.fitness-pr-item')
      : null;

    if (!prCard) {
      return;
    }

    prCard.classList.remove('is-saved');
    window.requestAnimationFrame(function () {
      prCard.classList.add('is-saved');
    });

    window.setTimeout(function () {
      prCard.classList.remove('is-saved');
    }, 720);
  }

  function renderStreakCalendar(dayKey) {
    if (!fields.trackingStreakCalendar || !fields.trackingStreakMonth) {
      return;
    }

    const baseDate = new Date(dayKey + 'T00:00:00');
    if (Number.isNaN(baseDate.getTime())) {
      return;
    }

    const year = baseDate.getFullYear();
    const monthIndex = baseDate.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const startWeekday = firstDay.getDay();
    const cells = [];
    const streaks = calculateTrackingStreaks(dayKey);

    fields.trackingStreakMonth.textContent = firstDay.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric'
    });
    if (fields.trackingCurrentStreak) {
      fields.trackingCurrentStreak.textContent = '🔥 ' + streaks.current + ' Day Streak';
    }
    if (fields.trackingLongestStreak) {
      fields.trackingLongestStreak.textContent = streaks.longest + (streaks.longest === 1 ? ' day' : ' days');
    }

    for (let index = 0; index < startWeekday; index += 1) {
      cells.push('<span class="streak-calendar-day is-empty" aria-hidden="true"></span>');
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const currentKey = buildDayKey(year, monthIndex + 1, day);
      const currentEntry = fitnessTrackerState[currentKey] || null;
      const isActive = Boolean(currentEntry && Number(currentEntry.steps || 0) > 0);
      const isToday = currentKey === dayKey;
      const classNames = ['streak-calendar-day'];

      if (isActive) {
        classNames.push('is-active');
      }

      if (isToday) {
        classNames.push('is-today');
      }

      cells.push(
        '<span class="' + classNames.join(' ') + '" title="' + escapeHtml(formatTrackingDate(currentKey)) + (isActive ? ' active day' : ' no activity') + '">' + day + '</span>'
      );
    }

    fields.trackingStreakCalendar.innerHTML = cells.join('');
  }

  function calculateTrackingStreaks(todayKey) {
    const activeDayKeys = Object.keys(fitnessTrackerState)
      .filter(function (key) {
        const entry = fitnessTrackerState[key];
        return entry && Number(entry.steps || 0) > 0;
      })
      .sort();

    if (!activeDayKeys.length) {
      return {
        current: 0,
        longest: 0
      };
    }

    let longest = 0;
    let runningLongest = 0;

    for (let index = 0; index < activeDayKeys.length; index += 1) {
      if (index === 0) {
        runningLongest = 1;
      } else {
        const previousDate = parseDayKey(activeDayKeys[index - 1]);
        const currentDate = parseDayKey(activeDayKeys[index]);
        const dayGap = differenceInDays(previousDate, currentDate);
        runningLongest = dayGap === 1 ? runningLongest + 1 : 1;
      }

      if (runningLongest > longest) {
        longest = runningLongest;
      }
    }

    let current = 0;
    let pointer = parseDayKey(todayKey);

    while (pointer) {
      const pointerKey = buildDayKey(pointer.getFullYear(), pointer.getMonth() + 1, pointer.getDate());
      const pointerEntry = fitnessTrackerState[pointerKey];
      if (!pointerEntry || Number(pointerEntry.steps || 0) <= 0) {
        break;
      }

      current += 1;
      pointer.setDate(pointer.getDate() - 1);
    }

    return {
      current: current,
      longest: longest
    };
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

  function buildDayKey(year, month, day) {
    return String(year) + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  }

  function parseDayKey(dayKey) {
    const date = new Date(dayKey + 'T00:00:00');
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function differenceInDays(previousDate, currentDate) {
    if (!previousDate || !currentDate) {
      return Infinity;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const previousUtc = Date.UTC(previousDate.getFullYear(), previousDate.getMonth(), previousDate.getDate());
    const currentUtc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    return Math.round((currentUtc - previousUtc) / millisecondsPerDay);
  }

  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Number(totalSeconds || 0));
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(Math.floor(safeSeconds % 60)).padStart(2, '0');
    return hours + ':' + minutes + ':' + seconds;
  }

  function formatWeight(value) {
    return formatCount(value) + ' kg';
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
