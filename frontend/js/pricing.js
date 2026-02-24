/**
 * Pricing & Membership - Discount Logic and Calculations
 */

// Pricing data - base prices per month
const pricing = {
    basic: 100,
    pro: 250,
    elite: 500
};

/**
 * Calculate discount percentage based on duration
 * Longer commitments = better discounts
 */
function getDiscountPercentage(durationMonths) {
    switch (parseInt(durationMonths)) {
        case 1:
            return 0;
        case 3:
            return 5;
        case 12:
            return 15;
        default:
            return 0;
    }
}

/**
 * Get membership name in readable format
 */
function getMembershipName(membership) {
    const names = {
        basic: 'Basic',
        pro: 'Pro',
        elite: 'Elite'
    };
    return names[membership] || 'Unknown';
}

/**
 * Get duration name in readable format
 */
function getDurationName(months) {
    switch (parseInt(months)) {
        case 1:
            return '1 Month';
        case 3:
            return '3 Months';
        case 12:
            return '1 Year';
        default:
            return 'Unknown';
    }
}

/**
 * Calculate total price with discounts
 */
function calculatePrice() {
    // Get selected values
    const membership = document.querySelector('input[name="membership"]:checked').value;
    const duration = document.querySelector('input[name="duration"]:checked').value;

    // Get base price
    const basePrice = pricing[membership];

    // Calculate discount
    const discountPercent = getDiscountPercentage(duration);
    const durationMonths = parseInt(duration);

    // Calculate subtotal (base price × months)
    const subtotal = basePrice * durationMonths;

    // Apply discount
    const discountAmount = subtotal * (discountPercent / 100);
    const totalPrice = subtotal - discountAmount;

    // Update DOM with results
    updatePriceSummary(membership, duration, discountPercent, basePrice, subtotal, totalPrice);
}

/**
 * Update the price summary display
 */
function updatePriceSummary(membership, duration, discountPercent, basePrice, subtotal, totalPrice) {
    // Update membership display
    document.getElementById('selected-membership').textContent = getMembershipName(membership);

    // Update duration display
    document.getElementById('selected-duration').textContent = getDurationName(duration);

    // Update base price
    document.getElementById('base-price').textContent = `₹${(basePrice * parseInt(duration)).toFixed(2)}`;

    // Update discount
    document.getElementById('discount').textContent = discountPercent > 0 ? `-${discountPercent}%` : 'No Discount';

    // Update subtotal
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;

    // Update total price
    document.getElementById('total-price').textContent = `₹${totalPrice.toFixed(2)}`;

    // Add animation to total price
    const totalElement = document.getElementById('total-price');
    totalElement.classList.add('scale-110');
    setTimeout(() => totalElement.classList.remove('scale-110'), 300);
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to radio buttons
    const membershipRadios = document.querySelectorAll('input[name="membership"]');
    const durationRadios = document.querySelectorAll('input[name="duration"]');

    membershipRadios.forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    durationRadios.forEach(radio => {
        radio.addEventListener('change', calculatePrice);
    });

    // Initial calculation
    calculatePrice();
});

/**
 * Proceed to payment page with selected plan
 */
function proceedToPayment() {
    // Get selected values
    const membership = document.querySelector('input[name="membership"]:checked').value;
    const duration = document.querySelector('input[name="duration"]:checked').value;

    // Redirect to payment page with plan details
    window.location.href = `payment.html?plan=${membership}&duration=${duration}`;
}
