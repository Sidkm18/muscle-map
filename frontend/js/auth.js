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
