/**
 * Onboarding Form - Multi-step wizard with validation
 * Collects user fitness preferences and profile information
 */

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// Form state
let currentStep = 1;
const totalSteps = 10;
const formData = {};

// DOM Elements
const form = document.getElementById('onboardingForm');
const steps = document.querySelectorAll('.form-step');
const progressFill = document.getElementById('progressFill');
const currentStepDisplay = document.getElementById('currentStep');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const skipBtn = document.getElementById('skipBtn');
const submitBtn = document.getElementById('submitBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    attachEventListeners();
    updateProgress();
});

/**
 * Initialize form state
 */
function initializeForm() {
    // Load saved progress from localStorage if available
    const savedData = localStorage.getItem('onboardingProgress');
    if (savedData) {
        const data = JSON.parse(savedData);
        Object.assign(formData, data);
        populateFormFromData();
    }
}

/**
 * Attach event listeners to form elements
 */
function attachEventListeners() {
    // Navigation buttons
    nextBtn.addEventListener('click', handleNext);
    prevBtn.addEventListener('click', handlePrevious);
    skipBtn.addEventListener('click', handleSkip);
    form.addEventListener('submit', handleSubmit);

    // Real-time validation for text inputs
    const textInputs = form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', (e) => validateField(e.target));
        input.addEventListener('blur', (e) => validateField(e.target));
    });

    // Profile photo upload
    const photoInput = document.getElementById('profilePhoto');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }

    // Bio character counter
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.addEventListener('input', updateBioCounter);
    }

    // Radio button selection
    const radioButtons = form.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', clearStepError);
    });

    // Checkbox selection for goals
    const goalCheckboxes = form.querySelectorAll('input[name="goals"]');
    goalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', clearStepError);
    });
}

/**
 * Handle next button click
 */
function handleNext() {
    if (validateCurrentStep()) {
        saveCurrentStepData();
        saveProgress();

        if (currentStep < totalSteps) {
            goToStep(currentStep + 1);
        }
    }
}

/**
 * Handle previous button click
 */
function handlePrevious() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

/**
 * Handle skip button click
 */
function handleSkip() {
    // Save empty data for optional fields
    saveCurrentStepData();

    if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
    }
}

/**
 * Navigate to specific step
 * @param {number} stepNumber - Step number to navigate to
 */
function goToStep(stepNumber) {
    const currentStepElement = steps[currentStep - 1];
    const nextStepElement = steps[stepNumber - 1];

    // Add exit animation
    currentStepElement.classList.add(stepNumber > currentStep ? 'exit-left' : 'exit-right');

    setTimeout(() => {
        currentStepElement.classList.remove('active', 'exit-left', 'exit-right');
        nextStepElement.classList.add('active');

        currentStep = stepNumber;
        updateProgress();
        updateNavigationButtons();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
}

/**
 * Update progress bar and step counter
 */
function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    currentStepDisplay.textContent = currentStep;
}

/**
 * Update navigation button visibility
 */
function updateNavigationButtons() {
    // Show/hide previous button
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';

    // Show/hide next vs submit button
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }

    // Hide skip button on required steps (1, 2, 3, 9)
    const requiredSteps = [1, 2, 3, 9];
    skipBtn.style.display = requiredSteps.includes(currentStep) ? 'none' : 'inline-flex';
}

/**
 * Validate current step
 * @returns {boolean} - Whether the step is valid
 */
function validateCurrentStep() {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');

    // Clear previous errors
    if (errorElement) {
        errorElement.textContent = '';
    }

    switch (currentStep) {
        case 1: // Gym frequency
            return validateRadioGroup('gymFrequency', 'Please select how often you visit the gym');

        case 2: // Expertise level
            return validateRadioGroup('expertiseLevel', 'Please select your fitness level');

        case 3: // Physical stats
            return validatePhysicalStats();

        case 4: // Diet preference
            return validateRadioGroup('dietPreference', 'Please select your eating preference');

        case 5: // Workout plan
            return validateRadioGroup('workoutPlan', 'Please select your workout plan');

        case 6: // Schedule
            return validateRadioGroup('workoutTime', 'Please select your preferred workout time');

        case 7: // Goals
            return validateCheckboxGroup('goals', 'Please select at least one fitness goal');

        case 8: // Referral (optional)
            return validateReferral();

        case 9: // Profile setup
            return validateProfile();

        case 10: // Supplements (optional)
            return true; // All fields are optional

        default:
            return true;
    }
}

/**
 * Validate radio button group
 * @param {string} name - Input name attribute
 * @param {string} errorMsg - Error message to display
 * @returns {boolean}
 */
function validateRadioGroup(name, errorMsg) {
    const selected = form.querySelector(`input[name="${name}"]:checked`);

    if (!selected) {
        showStepError(errorMsg);
        return false;
    }

    return true;
}

/**
 * Validate checkbox group (at least one selected)
 * @param {string} name - Input name attribute
 * @param {string} errorMsg - Error message to display
 * @returns {boolean}
 */
function validateCheckboxGroup(name, errorMsg) {
    const checkboxes = form.querySelectorAll(`input[name="${name}"]:checked`);

    if (checkboxes.length === 0) {
        showStepError(errorMsg);
        return false;
    }

    return true;
}

/**
 * Validate physical stats (height, weight)
 * @returns {boolean}
 */
function validatePhysicalStats() {
    const height = document.getElementById('height');
    const weight = document.getElementById('weight');
    const calories = document.getElementById('dailyCalories');

    let isValid = true;

    // Validate height
    if (!height.value || height.value < 100 || height.value > 250) {
        setError(height, 'Please enter a valid height (100-250 cm)');
        isValid = false;
    } else {
        setSuccess(height);
    }

    // Validate weight
    if (!weight.value || weight.value < 30 || weight.value > 200) {
        setError(weight, 'Please enter a valid weight (30-200 kg)');
        isValid = false;
    } else {
        setSuccess(weight);
    }

    // Calories is optional
    if (calories.value && (calories.value < 1000 || calories.value > 5000)) {
        setError(calories, 'Please enter a valid calorie range (1000-5000)');
        isValid = false;
    } else if (calories.value) {
        setSuccess(calories);
    }

    return isValid;
}

/**
 * Validate referral code format
 * @returns {boolean}
 */
function validateReferral() {
    const referralInput = document.getElementById('referralCode');
    const emailInput = document.getElementById('addFriends');

    // Referral code is optional
    if (referralInput.value) {
        const pattern = /^[A-Z0-9]{6,10}$/;
        if (!pattern.test(referralInput.value.toUpperCase())) {
            setError(referralInput, 'Invalid referral code format');
            return false;
        } else {
            setSuccess(referralInput);
        }
    }

    // Friend email is optional
    if (emailInput.value) {
        if (!validateEmail(emailInput.value)) {
            setError(emailInput, 'Please enter a valid email address');
            return false;
        } else {
            setSuccess(emailInput);
        }
    }

    return true;
}

/**
 * Validate profile setup
 * @returns {boolean}
 */
function validateProfile() {
    const username = document.getElementById('username');
    let isValid = true;

    // Validate username
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

/**
 * Validate individual field
 * @param {HTMLElement} field - Input field to validate
 */
function validateField(field) {
    if (!field.value) return;

    switch (field.name) {
        case 'height':
            if (field.value < 100 || field.value > 250) {
                setError(field, 'Height must be between 100-250 cm');
            } else {
                setSuccess(field);
            }
            break;

        case 'weight':
            if (field.value < 30 || field.value > 200) {
                setError(field, 'Weight must be between 30-200 kg');
            } else {
                setSuccess(field);
            }
            break;

        case 'dailyCalories':
            if (field.value && (field.value < 1000 || field.value > 5000)) {
                setError(field, 'Calories must be between 1000-5000');
            } else if (field.value) {
                setSuccess(field);
            }
            break;

        case 'addFriends':
            if (field.value && !validateEmail(field.value)) {
                setError(field, 'Please enter a valid email address');
            } else if (field.value) {
                setSuccess(field);
            }
            break;

        case 'username':
            if (field.value.length < 3) {
                setError(field, 'Username must be at least 3 characters');
            } else if (!/^[a-zA-Z0-9_]+$/.test(field.value)) {
                setError(field, 'Only letters, numbers, and underscores allowed');
            } else {
                setSuccess(field);
            }
            break;
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

/**
 * Set error state for input field
 * @param {HTMLElement} element - Input element
 * @param {string} message - Error message
 */
function setError(element, message) {
    element.classList.add('error');
    element.classList.remove('success');

    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

/**
 * Set success state for input field
 * @param {HTMLElement} element - Input element
 */
function setSuccess(element) {
    element.classList.remove('error');
    element.classList.add('success');

    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Show error message for current step
 * @param {string} message - Error message
 */
function showStepError(message) {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Clear error message for current step
 */
function clearStepError() {
    const currentStepElement = steps[currentStep - 1];
    const errorElement = currentStepElement.querySelector('.error-message');

    if (errorElement) {
        errorElement.textContent = '';
    }
}

/**
 * Save current step data to formData object
 */
function saveCurrentStepData() {
    const currentStepElement = steps[currentStep - 1];
    const inputs = currentStepElement.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
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
            // Handle file separately
            if (input.files[0]) {
                formData[input.name] = input.files[0].name;
            }
        } else {
            formData[input.name] = input.value;
        }
    });
}

/**
 * Save progress to localStorage
 */
function saveProgress() {
    localStorage.setItem('onboardingProgress', JSON.stringify(formData));
}

/**
 * Populate form fields from saved data
 */
function populateFormFromData() {
    Object.keys(formData).forEach(key => {
        const value = formData[key];

        if (Array.isArray(value)) {
            // Handle checkboxes
            value.forEach(val => {
                const checkbox = form.querySelector(`input[name="${key}"][value="${val}"]`);
                if (checkbox) checkbox.checked = true;
            });
        } else {
            // Handle text inputs and radio buttons
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value;
                }
            }
        }
    });
}

/**
 * Handle profile photo upload
 * @param {Event} event - Change event
 */
function handlePhotoUpload(event) {
    const file = event.target.files[0];

    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should not exceed 5MB');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photoPreview');
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Update bio character counter
 */
function updateBioCounter() {
    const bioInput = document.getElementById('bio');
    const counter = document.getElementById('bioCount');

    if (bioInput && counter) {
        counter.textContent = bioInput.value.length;
    }
}

/**
 * Handle form submission
 * @param {Event} event - Submit event
 */
function handleSubmit(event) {
    event.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    saveCurrentStepData();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Saving...';

    // Simulate API call
    setTimeout(() => {
        // Save to localStorage (in real app, send to backend)
        localStorage.setItem('userOnboardingData', JSON.stringify(formData));
        localStorage.removeItem('onboardingProgress'); // Clear progress

        // Redirect to dashboard or profile
        window.location.href = 'profile.html';
    }, 1500);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const activeElement = document.activeElement;

        // Prevent enter from submitting on textarea
        if (activeElement.tagName === 'TEXTAREA') {
            return;
        }

        e.preventDefault();

        if (currentStep < totalSteps) {
            handleNext();
        }
    }
});

// Initialize navigation on load
updateNavigationButtons();
