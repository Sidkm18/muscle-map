/**
 * Forgot Password JavaScript
 * Handles multi-step password reset with CAPTCHA and OTP verification
 */

let currentStep = 1;
let captchaCode = '';
let generatedOTP = '';
let userEmail = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();

    // Add real-time password strength validation
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', checkPasswordStrength);
    }
});

/**
 * Navigate to a specific step
 * @param {number} step - Step number (1-4)
 */
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => {
        el.classList.remove('active');
    });

    // Show target step
    const steps = ['emailStep', 'captchaStep', 'otpStep', 'passwordStep'];
    document.getElementById(steps[step - 1]).classList.add('active');

    // Update step indicators
    updateStepIndicators(step);

    // Update description
    updateDescription(step);

    currentStep = step;
}

/**
 * Update step indicators
 * @param {number} activeStep - Current active step
 */
function updateStepIndicators(activeStep) {
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        const lineEl = document.getElementById(`line-${i}`);

        if (i < activeStep) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
            stepEl.innerHTML = '✓';
            if (lineEl) lineEl.classList.add('active');
        } else if (i === activeStep) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
            stepEl.textContent = i;
        } else {
            stepEl.classList.remove('active', 'completed');
            stepEl.textContent = i;
            if (lineEl) lineEl.classList.remove('active');
        }
    }
}

/**
 * Update step description
 * @param {number} step - Current step number
 */
function updateDescription(step) {
    const descriptions = [
        'Enter your email address to get started.',
        'Verify that you\'re not a robot.',
        'Check your email for the verification code.',
        'Create a new strong password for your account.'
    ];

    document.getElementById('stepDescription').textContent = descriptions[step - 1];
}

/**
 * Validate email and proceed
 */
function validateEmail() {
    const emailInput = document.getElementById('resetEmail');
    const email = emailInput.value.trim();
    const errorEl = emailInput.parentElement.nextElementSibling;

    // Email validation regex
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        showError(errorEl, 'Email is required');
        return;
    }

    if (!emailPattern.test(email)) {
        showError(errorEl, 'Please enter a valid email address');
        return;
    }

    // Clear error and save email
    clearError(errorEl);
    userEmail = email;

    // Move to captcha step
    goToStep(2);
}

/**
 * Generate random CAPTCHA
 */
function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    captchaCode = '';

    for (let i = 0; i < 6; i++) {
        captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById('captchaText').textContent = captchaCode;
    document.getElementById('captchaInput').value = '';
}

/**
 * Validate CAPTCHA and proceed
 */
function validateCaptcha() {
    const captchaInput = document.getElementById('captchaInput');
    const userInput = captchaInput.value.trim().toUpperCase();
    const errorEl = captchaInput.nextElementSibling;

    if (!userInput) {
        showError(errorEl, 'Please enter the CAPTCHA code');
        return;
    }

    if (userInput !== captchaCode) {
        showError(errorEl, 'Incorrect CAPTCHA. Please try again.');
        generateCaptcha();
        captchaInput.value = '';
        return;
    }

    // Clear error and proceed
    clearError(errorEl);

    // Generate and "send" OTP
    sendOTP();

    // Move to OTP step
    goToStep(3);
}

/**
 * Generate and "send" OTP
 */
function sendOTP() {
    // Generate 6-digit OTP
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    // In a real app, this would be sent to the backend
    console.log('OTP sent:', generatedOTP); // For demo purposes

    // Display email in OTP step
    document.getElementById('emailDisplay').textContent = userEmail;

    // Focus first OTP input
    setTimeout(() => {
        document.getElementById('otp1').focus();
    }, 100);
}

/**
 * Resend OTP
 */
function resendOTP() {
    sendOTP();

    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`otp${i}`).value = '';
    }

    // Show notification
    showNotification('New verification code sent!', 'success');
}

/**
 * Move to next OTP input
 * @param {HTMLElement} current - Current input element
 * @param {string} nextId - Next input element ID
 */
function moveToNext(current, nextId) {
    if (current.value.length === 1 && nextId) {
        document.getElementById(nextId).focus();
    }
}

/**
 * Handle backspace in OTP inputs
 * @param {Event} event - Keyboard event
 * @param {string} prevId - Previous input ID
 * @param {string} nextId - Next input ID
 */
function handleBackspace(event, prevId, nextId) {
    if (event.key === 'Backspace' && !event.target.value && prevId) {
        document.getElementById(prevId).focus();
    }
}

/**
 * Validate OTP and proceed
 */
function validateOTP() {
    let otp = '';
    for (let i = 1; i <= 6; i++) {
        otp += document.getElementById(`otp${i}`).value;
    }

    const errorEl = document.querySelector('#otpStep .error-message');

    if (otp.length !== 6) {
        showError(errorEl, 'Please enter the complete 6-digit code');
        return;
    }

    // In demo mode, accept any 6-digit code or the correct OTP
    if (otp !== generatedOTP && otp !== '123456') { // 123456 for easy testing
        showError(errorEl, 'Invalid verification code. Please try again.');

        // Clear OTP inputs
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`otp${i}`).value = '';
        }
        document.getElementById('otp1').focus();
        return;
    }

    // Clear error and proceed
    clearError(errorEl);

    // Move to password reset step
    goToStep(4);
}

/**
 * Check password strength
 */
function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strength = calculatePasswordStrength(password);

    // Update strength bars
    const bars = ['strength1', 'strength2', 'strength3', 'strength4'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#10b981'];

    bars.forEach((bar, index) => {
        const element = document.getElementById(bar);
        if (index < strength.level) {
            element.style.backgroundColor = colors[strength.level - 1];
        } else {
            element.style.backgroundColor = '#374151';
        }
    });

    // Update text
    const strengthText = document.getElementById('strengthText');
    const labels = ['Very Weak', 'Weak', 'Medium', 'Strong'];
    strengthText.textContent = `Password strength: ${labels[strength.level - 1] || 'Very Weak'}`;
    strengthText.style.color = strength.level >= 3 ? '#10b981' : '#6b7280';
}

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @returns {Object} - Strength level and details
 */
function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return {
        level: Math.min(Math.floor(strength / 1.5) + 1, 4),
        score: strength
    };
}

/**
 * Validate password requirements
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result
 */
function validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Reset password
 */
function resetPassword() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const newPasswordError = newPasswordInput.parentElement.nextElementSibling;
    const confirmPasswordError = confirmPasswordInput.parentElement.nextElementSibling;

    // Clear previous errors
    clearError(newPasswordError);
    clearError(confirmPasswordError);

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
        showError(newPasswordError, passwordValidation.errors[0]);
        return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showError(confirmPasswordError, 'Passwords do not match');
        return;
    }

    // Show loading state
    const submitBtn = event.target;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Resetting...';

    // Simulate API call
    setTimeout(() => {
        // In a real app, send to backend
        localStorage.setItem('passwordReset', 'true');

        // Show success message
        showSuccessModal();
    }, 1500);
}

/**
 * Show success modal
 */
function showSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.style.background = 'rgba(0, 0, 0, 0.8)';
    modal.style.backdropFilter = 'blur(8px)';

    modal.innerHTML = `
        <div class="glass-panel rounded-2xl p-8 max-w-md text-center animate-fadeIn">
            <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="material-symbols-outlined text-green-500" style="font-size: 40px;">check_circle</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
            <p class="text-gray-400 mb-6">Your password has been reset successfully. You can now login with your new password.</p>
            <a href="login.html" class="btn-primary inline-block px-8 py-3 rounded-lg font-semibold">
                Go to Login
            </a>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Toggle password visibility
 * @param {string} inputId - Input element ID
 * @param {HTMLElement} button - Toggle button element
 */
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('.material-symbols-outlined');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
    }
}

/**
 * Show error message
 * @param {HTMLElement} element - Error message element
 * @param {string} message - Error message text
 */
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

/**
 * Clear error message
 * @param {HTMLElement} element - Error message element
 */
function clearError(element) {
    element.textContent = '';
    element.style.display = 'none';
}

/**
 * Show notification
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-fadeIn`;
    notification.style.background = type === 'success' ? '#10b981' : '#3b82f6';
    notification.style.color = 'white';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add loading spinner CSS
const style = document.createElement('style');
style.textContent = `
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
