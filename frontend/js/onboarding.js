/* Onboarding questionnaire with multi-step validation and local persistence */

if (localStorage.getItem('isLoggedIn') !== 'true') {
  window.location.href = './login.html';
}

const app = window.MuscleMap || {};
let currentStep = 1;
const totalSteps = 10;
const formData = {};

const form = document.getElementById('onboardingForm');
const steps = document.querySelectorAll('.form-step');
const progressFill = document.getElementById('progressFill');
const currentStepDisplay = document.getElementById('currentStep');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const skipBtn = document.getElementById('skipBtn');
const submitBtn = document.getElementById('submitBtn');

document.addEventListener('DOMContentLoaded', function () {
  initializeForm();
  attachEventListeners();
  updateProgress();
  updateNavigationButtons();
});

function initializeForm() {
  const savedData = localStorage.getItem('onboardingProgress');
  if (savedData) {
    const data = JSON.parse(savedData);
    Object.assign(formData, data);
    populateFormFromData();
  }
}

function attachEventListeners() {
  if (!form || !nextBtn || !prevBtn || !skipBtn || !submitBtn) {
    return;
  }

  nextBtn.addEventListener('click', handleNext);
  prevBtn.addEventListener('click', handlePrevious);
  skipBtn.addEventListener('click', handleSkip);
  form.addEventListener('submit', handleSubmit);

  const textInputs = form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], textarea');
  textInputs.forEach(function (input) {
    input.addEventListener('input', function (e) {
      validateField(e.target);
    });
    input.addEventListener('blur', function (e) {
      validateField(e.target);
    });
  });

  const photoInput = document.getElementById('profilePhoto');
  if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
  }

  const bioInput = document.getElementById('bio');
  if (bioInput) {
    bioInput.addEventListener('input', updateBioCounter);
  }

  const radioButtons = form.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(function (radio) {
    radio.addEventListener('change', clearStepError);
  });

  const goalCheckboxes = form.querySelectorAll('input[name="goals"]');
  goalCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', clearStepError);
  });
}

function handleNext() {
  if (validateCurrentStep()) {
    saveCurrentStepData();
    saveProgress();
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
    }
  }
}

function handlePrevious() {
  if (currentStep > 1) {
    goToStep(currentStep - 1);
  }
}

function handleSkip() {
  saveCurrentStepData();
  if (currentStep < totalSteps) {
    goToStep(currentStep + 1);
  }
}

function goToStep(stepNumber) {
  if (!steps.length) {
    return;
  }
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
  if (!prevBtn || !nextBtn || !submitBtn || !skipBtn) {
    return;
  }

  prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';

  if (currentStep === totalSteps) {
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'inline-flex';
  } else {
    nextBtn.style.display = 'inline-flex';
    submitBtn.style.display = 'none';
  }

  const requiredSteps = [1, 2, 3, 9];
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
      return validateRadioGroup('gymFrequency', 'Please select how often you visit the gym');
    case 2:
      return validateRadioGroup('expertiseLevel', 'Please select your fitness level');
    case 3:
      return validatePhysicalStats();
    case 4:
      return validateRadioGroup('dietPreference', 'Please select your eating preference');
    case 5:
      return validateRadioGroup('workoutPlan', 'Please select your workout plan');
    case 6:
      return validateRadioGroup('workoutTime', 'Please select your preferred workout time');
    case 7:
      return validateCheckboxGroup('goals', 'Please select at least one fitness goal');
    case 8:
      return validateReferral();
    case 9:
      return validateProfile();
    case 10:
      return true;
    default:
      return true;
  }
}

function validateRadioGroup(name, errorMsg) {
  const selected = form.querySelector('input[name="' + name + '"]:checked');
  if (!selected) {
    showStepError(errorMsg);
    return false;
  }
  return true;
}

function validateCheckboxGroup(name, errorMsg) {
  const checkboxes = form.querySelectorAll('input[name="' + name + '"]:checked');
  if (checkboxes.length === 0) {
    showStepError(errorMsg);
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

  if (referralInput.value) {
    const pattern = /^[A-Z0-9]{6,10}$/;
    if (!pattern.test(referralInput.value.toUpperCase())) {
      setError(referralInput, 'Invalid referral code format');
      return false;
    }
    setSuccess(referralInput);
  }

  if (emailInput.value) {
    if (!validateEmail(emailInput.value)) {
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

  if (!username.value) {
    setError(username, 'Username is required');
    isValid = false;
  } else if (username.value.length < 3 || username.value.length > 20) {
    setError(username, 'Username must be 3-20 characters');
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    setError(username, 'Username can only contain letters, numbers, and underscores');
    isValid = false;
  } else {
    setSuccess(username);
  }

  return isValid;
}

function validateField(field) {
  if (!field.value) return;

  if (field.name === 'height') {
    if (Number(field.value) < 100 || Number(field.value) > 250) {
      setError(field, 'Height must be between 100-250 cm');
    } else {
      setSuccess(field);
    }
  }

  if (field.name === 'weight') {
    if (Number(field.value) < 30 || Number(field.value) > 200) {
      setError(field, 'Weight must be between 30-200 kg');
    } else {
      setSuccess(field);
    }
  }

  if (field.name === 'dailyCalories') {
    if (field.value && (Number(field.value) < 1000 || Number(field.value) > 5000)) {
      setError(field, 'Calories must be between 1000-5000');
    } else {
      setSuccess(field);
    }
  }

  if (field.name === 'addFriends') {
    if (field.value && !validateEmail(field.value)) {
      setError(field, 'Please enter a valid email address');
    } else {
      setSuccess(field);
    }
  }

  if (field.name === 'username') {
    if (field.value.length < 3) {
      setError(field, 'Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(field.value)) {
      setError(field, 'Only letters, numbers, and underscores allowed');
    } else {
      setSuccess(field);
    }
  }
}

function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
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
  const inputs = currentStepElement.querySelectorAll('input, textarea, select');

  inputs.forEach(function (input) {
    if (input.type === 'radio' || input.type === 'checkbox') {
      if (input.checked) {
        if (input.type === 'checkbox') {
          if (!formData[input.name]) {
            formData[input.name] = [];
          }
          if (!formData[input.name].includes(input.value)) {
            formData[input.name].push(input.value);
          }
        } else {
          formData[input.name] = input.value;
        }
      }
    } else if (input.type === 'file') {
      if (input.files[0]) {
        formData[input.name] = input.files[0].name;
      }
    } else {
      formData[input.name] = input.value;
    }
  });
}

function saveProgress() {
  localStorage.setItem('onboardingProgress', JSON.stringify(formData));
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
    } else {
      const input = form.querySelector('[name="' + key + '"]');
      if (input) {
        if (input.type === 'radio') {
          const radio = form.querySelector('input[name="' + key + '"][value="' + value + '"]');
          if (radio) {
            radio.checked = true;
          }
        } else {
          input.value = value;
        }
      }
    }
  });
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    if (typeof window.showToast === 'function') {
      window.showToast('Please upload an image file.', 'error');
    }
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    if (typeof window.showToast === 'function') {
      window.showToast('Image size should not exceed 5MB.', 'error');
    }
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const preview = document.getElementById('photoPreview');
    if (preview) {
      preview.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

function updateBioCounter() {
  const bioInput = document.getElementById('bio');
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

  // Prepare data to send to backend
  const onboardingPayload = {
    gymFrequency: formData['gymFrequency'] || '',
    expertiseLevel: formData['expertiseLevel'] || '',
    height: formData['height'] || '',
    weight: formData['weight'] || '',
    dailyCalories: formData['dailyCalories'] || '',
    dietPreference: formData['dietPreference'] || '',
    workoutPlan: formData['workoutPlan'] || '',
    workoutTime: formData['workoutTime'] || '',
    goals: formData['goals'] || [],
    allergies: formData['allergies'] || '',
    supplements: formData['supplements'] || '',
    medicalConditions: formData['medicalConditions'] || '',
    referralCode: formData['referralCode'] || '',
    addFriends: formData['addFriends'] || '',
    username: formData['username'] || '',
    bio: formData['bio'] || '',
    profilePhoto: formData['profilePhoto'] || ''
  };

  (typeof app.requestJson === 'function'
    ? app.requestJson('onboarding', {
        method: 'POST',
        body: onboardingPayload
      })
    : Promise.reject(new Error('Onboarding unavailable'))
  )
  .then(function(data) {
    // Clear local storage and redirect
    localStorage.setItem('userOnboardingData', JSON.stringify(formData));
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.removeItem('onboardingProgress');
    
    if (typeof window.showToast === 'function') {
      window.showToast('Profile setup complete!', 'success');
    }
    
    window.location.href = './menu.html';
  })
  .catch(function(error) {
    if (typeof window.showToast === 'function') {
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

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'TEXTAREA') {
      return;
    }

    e.preventDefault();
    if (currentStep < totalSteps) {
      handleNext();
    }
  }
});
