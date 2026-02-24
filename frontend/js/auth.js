/**
 * Demo User Credentials
 * Email: demo@musclemap.com
 * Password: Demo@123
 */
const DEMO_USER = {
    email: 'demo@musclemap.com',
    password: 'Demo@123',
    name: 'Demo User',
    userId: 'demo_user_001'
};

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

/**
 * Handle login form submission
 */
function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Clear previous errors
    clearLoginErrors();

    // Validate inputs
    if (!email || !password) {
        showLoginError('Please enter both email and password');
        return;
    }

    // Check demo credentials
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
        // Successful login
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(DEMO_USER));

        // Check if user has completed onboarding
        const onboardingCompleted = localStorage.getItem('userOnboardingData');

        // Show success message
        showLoginSuccess();

        // Redirect after short delay
        setTimeout(() => {
            if (onboardingCompleted) {
                window.location.href = '../index.html'; // Go to dashboard
            } else {
                window.location.href = 'onboarding.html'; // Go to onboarding
            }
        }, 1000);
    } else {
        // Invalid credentials
        showLoginError('Invalid email or password. Try demo@musclemap.com / Demo@123');
    }
}

/**
 * Show login error message
 */
function showLoginError(message) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    emailInput.classList.add('border-red-500/50');
    passwordInput.classList.add('border-red-500/50');

    // Create or update error message
    let errorDiv = document.getElementById('login-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'login-error';
        errorDiv.className = 'mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm';
        const form = emailInput.closest('form');
        form.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

/**
 * Clear login errors
 */
function clearLoginErrors() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const errorDiv = document.getElementById('login-error');

    if (emailInput) emailInput.classList.remove('border-red-500/50');
    if (passwordInput) passwordInput.classList.remove('border-red-500/50');
    if (errorDiv) errorDiv.style.display = 'none';
}

/**
 * Show login success message
 */
function showLoginSuccess() {
    const form = document.querySelector('form');
    let successDiv = document.getElementById('login-success');

    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'login-success';
        successDiv.className = 'mt-4 p-3 bg-primary/10 border border-primary/50 rounded-lg text-primary text-sm flex items-center gap-2';
        form.appendChild(successDiv);
    }

    successDiv.innerHTML = `
        <span class="material-symbols-outlined text-primary" style="font-size: 20px;">check_circle</span>
        <span>Login successful! Redirecting...</span>
    `;
    successDiv.style.display = 'flex';
}

/**
 * Handle logout
 */
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'pages/login.html';
}

/**
 * Password validation and strength checker
 */
function validatePassword(value) {
    // Requirements
    const hasLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[^A-Za-z0-9]/.test(value);

    // Update UI Helper
    function updateRequirement(id, isValid) {
        const el = document.getElementById(id);
        const checkIcon = el.querySelector('.icon-check');
        const circleIcon = el.querySelector('.icon-circle');
        const text = el.querySelector('span:last-child');

        if (isValid) {
            checkIcon.classList.remove('hidden');
            circleIcon.classList.add('hidden');
            text.classList.remove('text-gray-500');
            text.classList.add('text-gray-300');
        } else {
            checkIcon.classList.add('hidden');
            circleIcon.classList.remove('hidden');
            text.classList.remove('text-gray-300');
            text.classList.add('text-gray-500');
        }
    }

    updateRequirement('req-length', hasLength);
    updateRequirement('req-uppercase', hasUpper);
    updateRequirement('req-number', hasNumber);
    updateRequirement('req-symbol', hasSymbol);

    // Update Strength Bars
    const score = [hasLength, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById(`strength-bar-${i}`);
        if (i <= score) {
            bar.classList.remove('bg-white/10');
            bar.classList.add('bg-primary', 'shadow-neon');
        } else {
            bar.classList.remove('bg-primary', 'shadow-neon');
            bar.classList.add('bg-white/10');
        }
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(buttonElement) {
    const input = document.getElementById('password-input');
    const icon = buttonElement.querySelector('span');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
        icon.classList.add('text-primary');
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
        icon.classList.remove('text-primary');
    }
}

/**
 * Validate confirm password match
 */
function validateConfirmPassword() {
    const confirmInput = document.getElementById('confirm-password-input');
    const pwd = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('confirm-error-msg');
    const successIcon = document.getElementById('confirm-success-icon');
    const errorIcon = document.getElementById('confirm-error-icon');

    if (confirmInput.value === '') {
        // Default/Empty state
        confirmInput.classList.remove('border-red-500/50', 'shadow-error', 'border-primary/50', 'shadow-neon');
        errorMsg.classList.add('hidden');
        successIcon.classList.add('hidden');
        errorIcon.classList.add('hidden');
    } else if (confirmInput.value !== pwd) {
        // Error state
        confirmInput.classList.add('border-red-500/50', 'shadow-error');
        confirmInput.classList.remove('border-primary/50', 'shadow-neon');
        errorMsg.classList.remove('hidden');
        successIcon.classList.add('hidden');
        errorIcon.classList.remove('hidden');
    } else {
        // Success state
        confirmInput.classList.remove('border-red-500/50', 'shadow-error');
        confirmInput.classList.add('border-primary/50', 'shadow-neon');
        errorMsg.classList.add('hidden');
        successIcon.classList.remove('hidden');
        errorIcon.classList.add('hidden');
    }
}

/**
 * Toggle password visibility for login page
 */
function toggleLoginPasswordVisibility(buttonElement) {
    const input = document.getElementById('login-password');
    const icon = buttonElement.querySelector('span');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
        icon.classList.add('text-primary');
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
        icon.classList.remove('text-primary');
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    const pwdInput = document.getElementById('password-input');
    if (pwdInput) {
        validatePassword(pwdInput.value);
    }

    // Add event listener for confirm password validation
    const confirmInput = document.getElementById('confirm-password-input');
    if (confirmInput) {
        confirmInput.addEventListener('input', validateConfirmPassword);
    }
});
