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
    fullName: document.getElementById('profile-full-name'),
    username: document.getElementById('profile-username'),
    email: document.getElementById('profile-email'),
    phone: document.getElementById('profile-phone'),
    gender: document.getElementById('profile-gender'),
    dob: document.getElementById('profile-dob'),
    bio: document.getElementById('profile-bio')
  };

  let selectedProfilePhoto = '';
  let originalProfilePhoto = '';

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
    const displayName = user.full_name || user.username || 'MuscleMap User';

    selectedProfilePhoto = user.profile_photo || '';
    originalProfilePhoto = user.profile_photo || '';
    if (fields.avatar) {
      fields.avatar.src = typeof app.resolveProfilePhoto === 'function'
        ? app.resolveProfilePhoto(user.profile_photo, displayName)
        : '';
    }

    fields.fullName.value = user.full_name || '';
    fields.username.value = user.username || '';
    fields.email.value = user.email || '';
    fields.phone.value = user.phone || '';
    fields.gender.value = user.gender || 'Prefer Not to Say';
    fields.dob.value = user.dob || '';
    fields.bio.value = user.bio || '';
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
        if (window.showToast) {
          window.showToast('Profile updated successfully!', 'success');
        }
        window.setTimeout(function () {
          window.location.href = './profile.html';
        }, 500);
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
      if (fields.avatar) {
        fields.avatar.src = dataUrl;
      }
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
    if (fields.photoInput) {
      fields.photoInput.value = '';
    }
    if (fields.avatar) {
      fields.avatar.src = typeof app.resolveProfilePhoto === 'function'
        ? app.resolveProfilePhoto('', fields.fullName.value.trim() || fields.username.value.trim() || 'MuscleMap User')
        : '';
    }
    if (typeof app.clearAvatarPreview === 'function') {
      app.clearAvatarPreview();
    }
    if (window.showToast) {
      window.showToast('Photo removed. Save profile to keep the change.', 'success');
    }
  }
})();
