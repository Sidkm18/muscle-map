/* Onboarding questionnaire with multi-step validation and local persistence */

(function () {
  const app = window.MuscleMap || {};
  const form = document.getElementById('onboardingForm');
  const wizard = document.getElementById('onboardingWizard');
  const ageGateScreen = document.getElementById('ageGateScreen');
  const eligibleDateDisplay = document.getElementById('eligibleDate');
  const ageGateBackBtn = document.getElementById('ageGateBackBtn');
  const steps = Array.from(document.querySelectorAll('.form-step'));
  const progressFill = document.getElementById('progressFill');
  const currentStepDisplay = document.getElementById('currentStep');
  const totalStepsDisplay = document.getElementById('totalSteps');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const skipBtn = document.getElementById('skipBtn');
  const submitBtn = document.getElementById('submitBtn');
  const bioInput = document.getElementById('bio');
  const photoPreview = document.getElementById('photoPreview');
  const MINIMUM_ONBOARDING_AGE = 13;
  const SUPPORTED_PROFILE_PHOTO_TYPES = typeof app.supportedProfilePhotoTypes !== 'undefined'
    ? app.supportedProfilePhotoTypes
    : ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
  const eligibleDateFormatter = typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function'
    ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const totalSteps = steps.length;
  const formData = {};
  let currentStep = 1;

  if (!form || !steps.length || !nextBtn || !prevBtn || !skipBtn || !submitBtn) {
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof app.getSession === 'function') {
      app.getSession().then(function (session) {
        if (!session || !session.authenticated) {
          window.location.replace('./login.html');
          return;
        }

        initializeForm();
        attachEventListeners();
        updateProgress();
        updateNavigationButtons();
        syncAvatarPreview();
      }).catch(function () {
        window.location.replace('./login.html');
      });
      return;
    }

    initializeForm();
    attachEventListeners();
    updateProgress();
    updateNavigationButtons();
    syncAvatarPreview();
  });

  function initializeForm() {
    const savedData = localStorage.getItem('onboardingProgress');
    if (savedData) {
      try {
        Object.assign(formData, JSON.parse(savedData));
      } catch (error) {
        localStorage.removeItem('onboardingProgress');
      }
    }

    delete formData.profilePhoto;

    if (!formData.fullName) {
      const cachedSession = typeof app.getCachedSession === 'function' ? app.getCachedSession() : null;
      formData.fullName = (cachedSession && cachedSession.user && (cachedSession.user.full_name || cachedSession.user.username))
        || localStorage.getItem('userName')
        || '';
    }

    populateFormFromData();
    updateBioCounter();
    if (totalStepsDisplay) {
      totalStepsDisplay.textContent = String(totalSteps);
    }

    if (getDateOfBirthAssessment(formData.dob).reason === 'underage') {
      showAgeGateState(formData.dob);
    }
  }

  function attachEventListeners() {
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrevious);
    skipBtn.addEventListener('click', handleSkip);
    form.addEventListener('submit', handleSubmit);

    form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="date"], textarea, select').forEach(function (input) {
      input.addEventListener('input', function (event) {
        validateField(event.target);
      });
      input.addEventListener('blur', function (event) {
        validateField(event.target);
      });
      input.addEventListener('change', function (event) {
        validateField(event.target);
      });
    });

    const photoInput = document.getElementById('profilePhoto');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }

    if (ageGateBackBtn) {
      ageGateBackBtn.addEventListener('click', handleAgeGateBack);
    }

    if (bioInput) {
      bioInput.addEventListener('input', updateBioCounter);
    }

    form.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function (field) {
      field.addEventListener('change', clearStepError);
    });
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return;
    }

    saveCurrentStepData();
    saveProgress();

    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  }

  function handleSkip() {
    saveCurrentStepData();
    saveProgress();

    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }

  function goToStep(stepNumber) {
    steps[currentStep - 1].classList.remove('active');
    steps[stepNumber - 1].classList.add('active');
    currentStep = stepNumber;
    updateProgress();
    updateNavigationButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    if (progressFill) {
      progressFill.style.width = progress + '%';
    }
    if (currentStepDisplay) {
      currentStepDisplay.textContent = String(currentStep);
    }
  }

  function updateNavigationButtons() {
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';

    if (currentStep === totalSteps) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'inline-flex';
    } else {
      nextBtn.style.display = 'inline-flex';
      submitBtn.style.display = 'none';
    }

    const requiredSteps = [1, 2, 3, 4, 10];
    skipBtn.style.display = requiredSteps.includes(currentStep) ? 'none' : 'inline-flex';
  }

  function validateCurrentStep() {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
    }

    switch (currentStep) {
      case 1:
        return validateDemographics();
      case 2:
        return validateRadioGroup('gymFrequency', 'Please select how often you visit the gym');
      case 3:
        return validateRadioGroup('expertiseLevel', 'Please select your fitness level');
      case 4:
        return validatePhysicalStats();
      case 5:
        return validateRadioGroup('dietPreference', 'Please select your eating preference');
      case 6:
        return validateRadioGroup('workoutPlan', 'Please select your workout plan');
      case 7:
        return validateRadioGroup('workoutTime', 'Please select your preferred workout time');
      case 8:
        return validateCheckboxGroup('goals', 'Please select at least one fitness goal');
      case 9:
        return validateReferral();
      case 10:
        return validateProfile();
      default:
        return true;
    }
  }

  function validateDemographics() {
    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const gender = document.getElementById('gender');
    const dob = document.getElementById('dob');
    const dobAssessment = getDateOfBirthAssessment(dob.value);
    let isValid = true;

    if (!fullName.value.trim() || fullName.value.trim().length < 2) {
      setError(fullName, 'Please enter your full name');
      isValid = false;
    } else {
      setSuccess(fullName);
    }

    if (phone.value.trim() && !/^[0-9+\-\s()]{7,20}$/.test(phone.value.trim())) {
      setError(phone, 'Please enter a valid phone number');
      isValid = false;
    } else if (phone.value.trim()) {
      setSuccess(phone);
    }

    if (!gender.value) {
      setError(gender, 'Please select your gender');
      isValid = false;
    } else {
      setSuccess(gender);
    }

    if (!dobAssessment.isValid) {
      setError(dob, getDateOfBirthError(dobAssessment));
      isValid = false;
      if (dobAssessment.reason === 'underage') {
        showAgeGateState(dob.value);
      }
    } else {
      setSuccess(dob);
    }

    return isValid;
  }

  function validateRadioGroup(name, errorMessage) {
    const selected = form.querySelector('input[name="' + name + '"]:checked');
    if (!selected) {
      showStepError(errorMessage);
      return false;
    }
    return true;
  }

  function validateCheckboxGroup(name, errorMessage) {
    const selected = form.querySelectorAll('input[name="' + name + '"]:checked');
    if (!selected.length) {
      showStepError(errorMessage);
      return false;
    }
    return true;
  }

  function validatePhysicalStats() {
    const height = document.getElementById('height');
    const weight = document.getElementById('weight');
    const calories = document.getElementById('dailyCalories');
    let isValid = true;

    if (!height.value || Number(height.value) < 100 || Number(height.value) > 250) {
      setError(height, 'Please enter a valid height (100-250 cm)');
      isValid = false;
    } else {
      setSuccess(height);
    }

    if (!weight.value || Number(weight.value) < 30 || Number(weight.value) > 200) {
      setError(weight, 'Please enter a valid weight (30-200 kg)');
      isValid = false;
    } else {
      setSuccess(weight);
    }

    if (calories.value && (Number(calories.value) < 1000 || Number(calories.value) > 5000)) {
      setError(calories, 'Please enter a valid calorie range (1000-5000)');
      isValid = false;
    } else if (calories.value) {
      setSuccess(calories);
    }

    return isValid;
  }

  function validateReferral() {
    const referralInput = document.getElementById('referralCode');
    const emailInput = document.getElementById('addFriends');

    if (referralInput.value.trim()) {
      if (!/^[A-Z0-9]{6,10}$/.test(referralInput.value.trim().toUpperCase())) {
        setError(referralInput, 'Invalid referral code format');
        return false;
      }
      setSuccess(referralInput);
    }

    if (emailInput.value.trim()) {
      if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, 'Please enter a valid email address');
        return false;
      }
      setSuccess(emailInput);
    }

    return true;
  }

  function validateProfile() {
    const username = document.getElementById('username');
    let isValid = true;

    if (!username.value.trim()) {
      setError(username, 'Username is required');
      isValid = false;
    } else if (username.value.trim().length < 3 || username.value.trim().length > 20) {
      setError(username, 'Username must be 3-20 characters');
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username.value.trim())) {
      setError(username, 'Username can only contain letters, numbers, and underscores');
      isValid = false;
    } else {
      setSuccess(username);
    }

    return isValid;
  }

  function validateField(field) {
    if (!field || !field.name) {
      return;
    }

    if (field.name === 'fullName' && field.value.trim()) {
      if (field.value.trim().length < 2) {
        setError(field, 'Please enter your full name');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'phone' && field.value.trim()) {
      if (!/^[0-9+\-\s()]{7,20}$/.test(field.value.trim())) {
        setError(field, 'Please enter a valid phone number');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'gender' && field.value) {
      setSuccess(field);
    }

    if (field.name === 'dob' && field.value) {
      const dobAssessment = getDateOfBirthAssessment(field.value);
      if (!dobAssessment.isValid) {
        setError(field, getDateOfBirthError(dobAssessment));
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'height' && field.value) {
      if (Number(field.value) < 100 || Number(field.value) > 250) {
        setError(field, 'Height must be between 100-250 cm');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'weight' && field.value) {
      if (Number(field.value) < 30 || Number(field.value) > 200) {
        setError(field, 'Weight must be between 30-200 kg');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'dailyCalories' && field.value) {
      if (Number(field.value) < 1000 || Number(field.value) > 5000) {
        setError(field, 'Calories must be between 1000-5000');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'addFriends' && field.value) {
      if (!validateEmail(field.value.trim())) {
        setError(field, 'Please enter a valid email address');
      } else {
        setSuccess(field);
      }
    }

    if (field.name === 'username' && field.value.trim()) {
      if (field.value.trim().length < 3) {
        setError(field, 'Username must be at least 3 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(field.value.trim())) {
        setError(field, 'Only letters, numbers, and underscores allowed');
      } else {
        setSuccess(field);
      }
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getDateOfBirthAssessment(value) {
    if (!value) {
      return {
        isValid: false,
        reason: 'missing',
        date: null,
        eligibleDate: null
      };
    }

    const parsedDate = new Date(value + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(parsedDate.getTime())) {
      return {
        isValid: false,
        reason: 'invalid',
        date: null,
        eligibleDate: null
      };
    }

    if (parsedDate > today) {
      return {
        isValid: false,
        reason: 'future',
        date: parsedDate,
        eligibleDate: null
      };
    }

    const eligibleDate = new Date(parsedDate.getTime());
    eligibleDate.setFullYear(eligibleDate.getFullYear() + MINIMUM_ONBOARDING_AGE);
    eligibleDate.setHours(0, 0, 0, 0);

    if (eligibleDate > today) {
      return {
        isValid: false,
        reason: 'underage',
        date: parsedDate,
        eligibleDate: eligibleDate
      };
    }

    return {
      isValid: true,
      reason: 'valid',
      date: parsedDate,
      eligibleDate: eligibleDate
    };
  }

  function getDateOfBirthError(assessment) {
    if (!assessment || assessment.reason === 'missing' || assessment.reason === 'invalid' || assessment.reason === 'future') {
      return 'Please select a valid date of birth';
    }

    if (assessment.reason === 'underage') {
      return 'You must be at least 13 years old to continue';
    }

    return '';
  }

  function formatEligibleDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return '';
    }

    return eligibleDateFormatter ? eligibleDateFormatter.format(date) : date.toISOString().slice(0, 10);
  }

  function showAgeGateState(dateOfBirth) {
    const assessment = getDateOfBirthAssessment(dateOfBirth);
    if (assessment.reason !== 'underage') {
      return;
    }

    formData.dob = String(dateOfBirth || '');
    saveProgress();

    if (eligibleDateDisplay) {
      eligibleDateDisplay.textContent = formatEligibleDate(assessment.eligibleDate);
    }

    if (wizard) {
      wizard.hidden = true;
    }

    if (ageGateScreen) {
      ageGateScreen.hidden = false;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function hideAgeGateState() {
    if (wizard) {
      wizard.hidden = false;
    }

    if (ageGateScreen) {
      ageGateScreen.hidden = true;
    }
  }

  function handleAgeGateBack() {
    hideAgeGateState();
    goToStep(1);

    const dob = document.getElementById('dob');
    if (dob && typeof dob.focus === 'function') {
      dob.focus();
    }
  }

  function setError(element, message) {
    element.classList.add('error');
    element.classList.remove('success');

    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function setSuccess(element) {
    element.classList.remove('error');
    element.classList.add('success');

    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function showStepError(message) {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearStepError() {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  function saveCurrentStepData() {
    const currentStepElement = steps[currentStep - 1];
    const inputs = Array.from(currentStepElement.querySelectorAll('input, textarea, select'));
    const resettableNames = new Set();

    inputs.forEach(function (input) {
      if (input.name && (input.type === 'radio' || input.type === 'checkbox')) {
        resettableNames.add(input.name);
      }
    });

    resettableNames.forEach(function (name) {
      delete formData[name];
    });

    inputs.forEach(function (input) {
      if (!input.name) {
        return;
      }

      if (input.type === 'radio') {
        if (input.checked) {
          formData[input.name] = input.value;
        }
        return;
      }

      if (input.type === 'checkbox') {
        if (input.checked) {
          if (!Array.isArray(formData[input.name])) {
            formData[input.name] = [];
          }
          formData[input.name].push(input.value);
        }
        return;
      }

      if (input.type === 'file') {
        return;
      }

      formData[input.name] = input.value;
    });
  }

  function saveProgress() {
    const storedSnapshot = Object.assign({}, formData);
    delete storedSnapshot.profilePhoto;
    try {
      localStorage.setItem('onboardingProgress', JSON.stringify(storedSnapshot));
    } catch (error) {
      // Ignore storage quota issues for draft progress.
    }
  }

  function populateFormFromData() {
    Object.keys(formData).forEach(function (key) {
      const value = formData[key];

      if (Array.isArray(value)) {
        value.forEach(function (entry) {
          const checkbox = form.querySelector('input[name="' + key + '"][value="' + entry + '"]');
          if (checkbox) {
            checkbox.checked = true;
          }
        });
        return;
      }

      const input = form.querySelector('[name="' + key + '"]');
      if (!input) {
        return;
      }

      if (input.type === 'radio') {
        const radio = form.querySelector('input[name="' + key + '"][value="' + value + '"]');
        if (radio) {
          radio.checked = true;
        }
        return;
      }

      input.value = value;
    });
  }

  function handlePhotoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      delete formData.profilePhoto;
      syncAvatarPreview();
      return;
    }

    const isSupportedPhoto = typeof app.isSupportedProfilePhotoType === 'function'
      ? app.isSupportedProfilePhotoType(file.type)
      : SUPPORTED_PROFILE_PHOTO_TYPES.indexOf(String(file.type || '').toLowerCase()) !== -1;
    if (!isSupportedPhoto) {
      window.showToast && window.showToast('Please use a PNG, JPG, WEBP, GIF, or SVG image.', 'error');
      event.target.value = '';
      delete formData.profilePhoto;
      syncAvatarPreview();
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      window.showToast && window.showToast('Image size should not exceed 2.5MB.', 'error');
      event.target.value = '';
      syncAvatarPreview();
      return;
    }

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
      const dataUrl = loadEvent.target && loadEvent.target.result ? String(loadEvent.target.result) : '';
      if (photoPreview && dataUrl) {
        photoPreview.src = dataUrl;
      }
      formData.profilePhoto = dataUrl;
      saveProgress();
    };
    reader.readAsDataURL(file);
  }

  function syncAvatarPreview() {
    if (!photoPreview) {
      return;
    }

    if (formData.profilePhoto) {
      photoPreview.src = String(formData.profilePhoto);
      return;
    }

    if (typeof app.createAvatarPlaceholder === 'function') {
      photoPreview.src = app.createAvatarPlaceholder(formData.fullName || formData.username || localStorage.getItem('userName') || 'MuscleMap User');
      return;
    }

    if (typeof app.resolveProfilePhoto === 'function') {
      photoPreview.src = app.resolveProfilePhoto('', formData.fullName || formData.username || localStorage.getItem('userName') || 'MuscleMap User');
    }
  }

  function updateBioCounter() {
    const counter = document.getElementById('bioCount');
    if (bioInput && counter) {
      counter.textContent = String(bioInput.value.length);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    saveCurrentStepData();

    if (typeof app.setButtonBusy === 'function') {
      app.setButtonBusy(submitBtn, true, 'Saving...');
    } else {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }

    const onboardingPayload = {
      fullName: formData.fullName || '',
      phone: formData.phone || '',
      gender: formData.gender || '',
      dob: formData.dob || '',
      gymFrequency: formData.gymFrequency || '',
      expertiseLevel: formData.expertiseLevel || '',
      height: formData.height || '',
      weight: formData.weight || '',
      dailyCalories: formData.dailyCalories || '',
      dietPreference: formData.dietPreference || '',
      workoutPlan: formData.workoutPlan || '',
      workoutTime: formData.workoutTime || '',
      goals: formData.goals || [],
      allergies: formData.allergies || '',
      supplements: formData.supplements || '',
      medicalConditions: formData.medicalConditions || '',
      referralCode: formData.referralCode || '',
      addFriends: formData.addFriends || '',
      username: formData.username || '',
      bio: formData.bio || '',
      profilePhoto: formData.profilePhoto || ''
    };

    (typeof app.requestJson === 'function'
      ? app.requestJson('onboarding', {
          method: 'POST',
          body: onboardingPayload
        })
      : Promise.reject(new Error('Onboarding unavailable'))
    )
      .then(function () {
        try {
          localStorage.removeItem('onboardingProgress');
          localStorage.setItem('onboardingComplete', 'true');
          localStorage.setItem('userName', onboardingPayload.fullName || formData.username || localStorage.getItem('userName') || '');
        } catch (error) {
          // Keep the successful server response authoritative even if local storage is full.
        }

        if (typeof app.setSession === 'function') {
          const cachedSession = typeof app.getCachedSession === 'function' ? app.getCachedSession() : null;
          app.setSession({
            authenticated: true,
            user: Object.assign({}, cachedSession && cachedSession.user ? cachedSession.user : {}, {
              full_name: onboardingPayload.fullName,
              username: onboardingPayload.username,
              profile_photo: onboardingPayload.profilePhoto || ''
            })
          });
        }

        if (window.showToast) {
          window.showToast('Profile setup complete!', 'success');
        }

        window.location.href = './profile.html';
      })
      .catch(function (error) {
        if (error && error.payload && error.payload.details && error.payload.details.dob === 'You must be at least 13 years old.') {
          if (typeof app.setButtonBusy === 'function') {
            app.setButtonBusy(submitBtn, false);
          } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Finish Setup';
          }
          showAgeGateState(onboardingPayload.dob);
          return;
        }

        if (window.showToast) {
          window.showToast(error.message || 'Failed to save onboarding data', 'error');
        }

        if (typeof app.setButtonBusy === 'function') {
          app.setButtonBusy(submitBtn, false);
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Finish Setup';
        }
      });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (currentStep < totalSteps) {
        event.preventDefault();
        handleNext();
        return;
      }

      if (typeof form.requestSubmit === 'function') {
        event.preventDefault();
        form.requestSubmit();
      }
    }
  });
})();
