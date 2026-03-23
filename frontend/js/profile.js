(function () {
  const app = window.MuscleMap || {};
  const form = document.getElementById('profile-form');

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
    goals: document.getElementById('profile-goals')
  };
  let selectedProfilePhoto = '';

  document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    form.addEventListener('submit', handleSubmit);
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
          window.location.href = app.links && app.links.login ? app.links.login : './login.php';
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

    window.location.href = app.links && app.links.logout ? app.links.logout : './logout.php';
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
