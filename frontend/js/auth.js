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
async function handleLogin(event) {
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

    try {
        const response = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            showLoginSuccess();

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        } else {
            showLoginError(data.error || 'Invalid credentials');
        }
    } catch (error) {
        showLoginError('Network error. Please try again.');
    }
}

/**
 * Handle registration form submission
 */
async function handleRegister(event) {
    event.preventDefault();

    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.getElementById('password-input');
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch('http://localhost:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = './login.html';
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

/**
 * Show login error message
 */
function showLoginError(message) {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    emailInput.classList.add('border-danger');
    passwordInput.classList.add('border-danger');

    let errorDiv = document.getElementById('login-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'login-error';
        errorDiv.className = 'status-box error mt-3';
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

    if (emailInput) emailInput.classList.remove('border-danger');
    if (passwordInput) passwordInput.classList.remove('border-danger');
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
        successDiv.className = 'status-box success mt-3';
        form.appendChild(successDiv);
    }

    successDiv.textContent = 'Login successful. Redirecting...';
    successDiv.style.display = 'block';
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
        if (!el) return;
        el.classList.toggle('is-valid', isValid);
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
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(buttonElement) {
    const input = document.getElementById('password-input');

    if (input.type === 'password') {
        input.type = 'text';
        buttonElement.textContent = 'Hide';
        buttonElement.classList.add('text-primary');
    } else {
        input.type = 'password';
        buttonElement.textContent = 'Show';
        buttonElement.classList.remove('text-primary');
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
        confirmInput.classList.remove('border-danger');
        errorMsg.classList.remove('visible');
        successIcon.classList.add('is-hidden');
        errorIcon.classList.add('is-hidden');
    } else if (confirmInput.value !== pwd) {
        confirmInput.classList.add('border-danger');
        errorMsg.classList.add('visible');
        successIcon.classList.add('is-hidden');
        errorIcon.classList.remove('is-hidden');
    } else {
        confirmInput.classList.remove('border-danger');
        errorMsg.classList.remove('visible');
        successIcon.classList.remove('is-hidden');
        errorIcon.classList.add('is-hidden');
    }
}

/**
 * Toggle password visibility for login page
 */
function toggleLoginPasswordVisibility(buttonElement) {
    const input = document.getElementById('login-password');

    if (input.type === 'password') {
        input.type = 'text';
        buttonElement.textContent = 'Hide';
        buttonElement.classList.add('text-primary');
    } else {
        input.type = 'password';
        buttonElement.textContent = 'Show';
        buttonElement.classList.remove('text-primary');
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
