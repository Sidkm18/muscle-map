/**
 * Payment Page JavaScript
 * Handles payment method switching and validation
 */

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

let selectedPaymentMethod = 'card';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get plan details from URL params or localStorage
    loadPlanDetails();

    // Prevent form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => e.preventDefault());
    });
});

/**
 * Load plan details from URL or localStorage
 */
function loadPlanDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'premium';

    // In a real app, fetch plan details from backend
    const plans = {
        basic: {
            name: 'Basic Plan',
            duration: 'Monthly Subscription',
            price: 499,
            discount: 0
        },
        standard: {
            name: 'Standard Plan',
            duration: '6 Months Subscription',
            price: 2499,
            discount: 300
        },
        premium: {
            name: 'Premium Plan',
            duration: 'Annual Subscription',
            price: 5999,
            discount: 1200
        }
    };

    const selectedPlan = plans[plan] || plans.premium;
    updatePlanDisplay(selectedPlan);
}

/**
 * Update plan display in order summary
 */
function updatePlanDisplay(plan) {
    document.getElementById('planName').textContent = plan.name;
    document.getElementById('planDuration').textContent = plan.duration;
    document.getElementById('planPrice').textContent = `₹${plan.price.toLocaleString()}`;
    document.getElementById('discount').textContent = `-₹${plan.discount.toLocaleString()}`;

    // Calculate GST
    const subtotal = plan.price - plan.discount;
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;

    document.getElementById('gst').textContent = `₹${gst.toLocaleString()}`;
    document.getElementById('totalAmount').textContent = `₹${total.toLocaleString()}`;

    // Update pay button amounts
    const payButtons = document.querySelectorAll('.pay-button');
    payButtons.forEach(btn => {
        btn.textContent = `Pay ₹${total.toLocaleString()}`;
    });
}

/**
 * Switch payment method
 */
function switchPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.method === method);
    });

    // Update forms
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });

    const formIds = {
        card: 'cardForm',
        upi: 'upiForm',
        netbanking: 'netbankingForm',
        wallet: 'walletForm'
    };

    document.getElementById(formIds[method]).classList.add('active');
}

/**
 * Format card number with spaces
 */
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');

    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }

    input.value = formatted;

    // Detect card type
    detectCardType(value);
}

/**
 * Detect card type from number
 */
function detectCardType(number) {
    const icon = document.getElementById('cardBrandIcon');

    if (!number) {
        icon.textContent = '💳';
        return;
    }

    // Visa
    if (/^4/.test(number)) {
        icon.textContent = '💳';
        icon.style.color = '#1434CB';
    }
    // Mastercard
    else if (/^5[1-5]/.test(number)) {
        icon.textContent = '💳';
        icon.style.color = '#EB001B';
    }
    // American Express
    else if (/^3[47]/.test(number)) {
        icon.textContent = '💳';
        icon.style.color = '#006FCF';
    }
    // RuPay
    else if (/^6/.test(number)) {
        icon.textContent = '💳';
        icon.style.color = '#00A650';
    }
    else {
        icon.textContent = '💳';
        icon.style.color = '#000';
    }
}

/**
 * Format expiry date
 */
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    input.value = value;
}

/**
 * Validate card number using Luhn algorithm
 */
function validateCardNumber(number) {
    const digits = number.replace(/\D/g, '');

    if (digits.length < 13 || digits.length > 19) {
        return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Validate expiry date
 */
function validateExpiry(expiry) {
    const parts = expiry.split('/');
    if (parts.length !== 2) return false;

    const month = parseInt(parts[0]);
    const year = parseInt('20' + parts[1]);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

/**
 * Process card payment
 */
function processCardPayment(event) {
    event.preventDefault();

    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVV = document.getElementById('cardCVV').value;
    const cardName = document.getElementById('cardName').value;

    let isValid = true;

    // Validate card number
    if (!validateCardNumber(cardNumber)) {
        showError(document.getElementById('cardNumber'), 'Invalid card number');
        isValid = false;
    } else {
        clearError(document.getElementById('cardNumber'));
    }

    // Validate expiry
    if (!validateExpiry(cardExpiry)) {
        showError(document.getElementById('cardExpiry'), 'Invalid or expired date');
        isValid = false;
    } else {
        clearError(document.getElementById('cardExpiry'));
    }

    // Validate CVV
    if (cardCVV.length < 3 || cardCVV.length > 4) {
        showError(document.getElementById('cardCVV'), 'Invalid CVV');
        isValid = false;
    } else {
        clearError(document.getElementById('cardCVV'));
    }

    // Validate name
    if (cardName.length < 3) {
        showError(document.getElementById('cardName'), 'Please enter cardholder name');
        isValid = false;
    } else {
        clearError(document.getElementById('cardName'));
    }

    if (isValid) {
        processPayment();
    }
}

/**
 * Process UPI payment
 */
function processUPIPayment(event) {
    event.preventDefault();

    const upiId = document.getElementById('upiId').value;
    const upiPattern = /^[\w.-]+@[\w.-]+$/;

    if (!upiPattern.test(upiId)) {
        showError(document.getElementById('upiId'), 'Invalid UPI ID');
        return;
    }

    clearError(document.getElementById('upiId'));
    processPayment();
}

/**
 * Select UPI option
 */
function selectUPIOption(app) {
    processPayment();
}

/**
 * Process net banking payment
 */
function processNetBanking(event) {
    event.preventDefault();

    const bank = document.getElementById('bankSelect').value;

    if (!bank) {
        showError(document.getElementById('bankSelect'), 'Please select a bank');
        return;
    }

    clearError(document.getElementById('bankSelect'));
    processPayment();
}

/**
 * Select bank
 */
function selectBank(bank) {
    document.getElementById('bankSelect').value = bank;
}

/**
 * Select wallet
 */
function selectWallet(wallet) {
    processPayment();
}

/**
 * Process payment (simulate)
 */
function processPayment() {
    // Show processing modal
    const processingModal = document.getElementById('processingModal');
    processingModal.classList.add('active');

    // Simulate payment processing
    setTimeout(() => {
        processingModal.classList.remove('active');

        // Generate transaction ID
        const transactionId = 'TXN' + Date.now();
        document.getElementById('transactionId').textContent = transactionId;

        // Show success modal
        const successModal = document.getElementById('successModal');
        successModal.classList.add('active');

        // Save payment data
        localStorage.setItem('paymentCompleted', 'true');
        localStorage.setItem('transactionId', transactionId);
    }, 2000);
}

/**
 * Apply promo code
 */
function applyPromo() {
    const promoInput = document.getElementById('promoInput');
    const code = promoInput.value.trim().toUpperCase();

    if (!code) {
        alert('Please enter a promo code');
        return;
    }

    // Demo promo codes
    const promoCodes = {
        'SAVE10': 0.10,
        'FIRST50': 0.50,
        'WELCOME': 0.15
    };

    if (promoCodes[code]) {
        const discount = promoCodes[code];
        alert(`Promo code applied! You get ${discount * 100}% off`);
        promoInput.value = '';

        // Recalculate total (this is simplified)
        // In real app, recalculate from backend
    } else {
        alert('Invalid promo code');
    }
}

/**
 * Show error message
 */
function showError(input, message) {
    input.classList.add('error');
    const errorElement = input.parentElement.querySelector('.error-message') ||
        input.parentElement.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
    }
}

/**
 * Clear error message
 */
function clearError(input) {
    input.classList.remove('error');
    const errorElement = input.parentElement.querySelector('.error-message') ||
        input.parentElement.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
    }
}
