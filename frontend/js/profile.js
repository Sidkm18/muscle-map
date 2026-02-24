/**
 * Profile Page JavaScript
 * Handles tab navigation, profile editing, and data display
 */

// Check if user is logged in
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const editProfileBtn = document.getElementById('editProfileBtn');
const editPhotoBtn = document.getElementById('editPhotoBtn');
const photoUpload = document.getElementById('photoUpload');
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const editProfileForm = document.getElementById('editProfileForm');
const copyBtns = document.querySelectorAll('.copy-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    attachEventListeners();
});

/**
 * Load user data from localStorage or API
 */
function loadUserData() {
    // Try to get onboarding data
    const onboardingData = localStorage.getItem('userOnboardingData');
    const userData = localStorage.getItem('userData');

    let data = {};

    if (onboardingData) {
        data = { ...data, ...JSON.parse(onboardingData) };
    }

    if (userData) {
        data = { ...data, ...JSON.parse(userData) };
    }

    // Populate profile with data
    if (Object.keys(data).length > 0) {
        populateProfile(data);
    }
}

/**
 * Populate profile page with user data
 * @param {Object} data - User data object
 */
function populateProfile(data) {
    // Basic Information
    if (data.username) {
        document.getElementById('displayUsername').textContent = data.username;
        document.getElementById('accountUsername').textContent = '@' + data.username;
    }

    if (data.bio) {
        document.getElementById('displayBio').textContent = data.bio;
    }

    // Physical Stats
    if (data.height) {
        document.getElementById('height').textContent = `${data.height} cm`;
        calculateAndDisplayBMI(data.height, data.weight);
    }

    if (data.weight) {
        document.getElementById('weight').textContent = `${data.weight} kg`;
    }

    if (data.dailyCalories) {
        document.getElementById('calories').textContent = `${data.dailyCalories} kcal`;
    }

    // Fitness Profile
    if (data.gymFrequency) {
        const frequencyText = getFrequencyText(data.gymFrequency);
        document.getElementById('gymFrequency').textContent = frequencyText;
    }

    if (data.expertiseLevel) {
        const expertiseText = capitalizeFirst(data.expertiseLevel);
        document.getElementById('expertiseLevel').textContent = expertiseText;
    }

    if (data.workoutPlan) {
        const planText = getWorkoutPlanText(data.workoutPlan);
        document.getElementById('workoutPlan').textContent = planText;
    }

    if (data.workoutTime) {
        const timeText = getWorkoutTimeText(data.workoutTime);
        document.getElementById('workoutTime').textContent = timeText;
    }

    // Diet & Nutrition
    if (data.dietPreference) {
        const dietText = getDietPreferenceText(data.dietPreference);
        document.getElementById('dietPreference').textContent = dietText;
    }

    if (data.allergies) {
        document.getElementById('allergies').textContent = data.allergies;
    } else {
        document.getElementById('allergies').textContent = 'None';
    }

    if (data.supplements && Array.isArray(data.supplements)) {
        const supplementsText = data.supplements
            .filter(s => s !== 'none')
            .map(s => capitalizeFirst(s.replace('-', ' ')))
            .join(', ');
        document.getElementById('supplements').textContent = supplementsText || 'None';
    }

    // Goals
    if (data.goals && Array.isArray(data.goals)) {
        const goalsContainer = document.getElementById('goalsList');
        goalsContainer.innerHTML = '';

        data.goals.forEach(goal => {
            const goalTag = document.createElement('span');
            goalTag.className = 'goal-tag';
            goalTag.innerHTML = `${getGoalIcon(goal)} ${getGoalText(goal)}`;
            goalsContainer.appendChild(goalTag);
        });
    }

    // Medical Information
    if (data.medicalConditions) {
        document.getElementById('medicalConditions').textContent = data.medicalConditions;
    } else {
        document.getElementById('medicalConditions').textContent = 'None reported';
    }
}

/**
 * Calculate and display BMI
 * @param {number} height - Height in cm
 * @param {number} weight - Weight in kg
 */
function calculateAndDisplayBMI(height, weight) {
    if (!height || !weight) return;

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    document.getElementById('bmi').textContent = bmi;
}

/**
 * Helper function to get frequency text
 */
function getFrequencyText(frequency) {
    const map = {
        'beginner': '1-2 times/week',
        'intermediate': '3-4 times/week',
        'advanced': '5-6 times/week',
        'daily': 'Daily'
    };
    return map[frequency] || frequency;
}

/**
 * Helper function to get workout plan text
 */
function getWorkoutPlanText(plan) {
    const map = {
        'push-pull-legs': 'Push Pull Legs',
        'upper-lower': 'Upper Lower Split',
        'full-body': 'Full Body',
        'circuit': 'Circuit Training',
        'bodybuilding': 'Bodybuilding Split',
        'none': 'No specific plan'
    };
    return map[plan] || plan;
}

/**
 * Helper function to get workout time text
 */
function getWorkoutTimeText(time) {
    const map = {
        'early-morning': 'Early Morning (5 AM - 8 AM)',
        'morning': 'Morning (8 AM - 12 PM)',
        'afternoon': 'Afternoon (12 PM - 5 PM)',
        'evening': 'Evening (5 PM - 8 PM)',
        'night': 'Night (8 PM - 11 PM)',
        'flexible': 'Flexible'
    };
    return map[time] || time;
}

/**
 * Helper function to get diet preference text
 */
function getDietPreferenceText(diet) {
    const map = {
        'vegetarian': 'Vegetarian',
        'non-vegetarian': 'Non-Vegetarian',
        'vegan': 'Vegan',
        'keto': 'Keto',
        'paleo': 'Paleo',
        'flexible': 'Flexible'
    };
    return map[diet] || diet;
}

/**
 * Helper function to get goal icon
 */
function getGoalIcon(goal) {
    const map = {
        'weight-loss': '⚖️',
        'muscle-gain': '💪',
        'strength': '🏋️',
        'endurance': '🏃',
        'flexibility': '🧘',
        'general-fitness': '✨'
    };
    return map[goal] || '🎯';
}

/**
 * Helper function to get goal text
 */
function getGoalText(goal) {
    const map = {
        'weight-loss': 'Weight Loss',
        'muscle-gain': 'Muscle Gain',
        'strength': 'Build Strength',
        'endurance': 'Endurance',
        'flexibility': 'Flexibility',
        'general-fitness': 'General Fitness'
    };
    return map[goal] || capitalizeFirst(goal);
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Edit profile button
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditModal);
    }

    // Edit photo button
    if (editPhotoBtn) {
        editPhotoBtn.addEventListener('click', () => photoUpload.click());
    }

    // Photo upload
    if (photoUpload) {
        photoUpload.addEventListener('change', handlePhotoChange);
    }

    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }

    // Close modal on background click
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    // Edit form submission
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Cancel button
    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEditModal);
    }

    // Copy referral code
    copyBtns.forEach(btn => {
        btn.addEventListener('click', copyReferralCode);
    });

    // Toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', handleToggleChange);
    });
}

/**
 * Switch between tabs
 * @param {string} tabName - Tab identifier
 */
function switchTab(tabName) {
    // Update buttons
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
}

/**
 * Open edit profile modal
 */
function openEditModal() {
    // Pre-fill form with current data
    const userData = getUserData();

    document.getElementById('editFullName').value = userData.fullName || '';
    document.getElementById('editEmail').value = userData.email || '';
    document.getElementById('editPhone').value = userData.phone || '';
    document.getElementById('editBio').value = userData.bio || '';

    editModal.classList.add('active');
}

/**
 * Close edit profile modal
 */
function closeEditModal() {
    editModal.classList.remove('active');
}

/**
 * Get user data from localStorage
 */
function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : {};
}

/**
 * Handle profile photo change
 */
function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) return;

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
        document.getElementById('profileImage').src = e.target.result;

        // Save to localStorage
        const userData = getUserData();
        userData.profilePhoto = e.target.result;
        localStorage.setItem('userData', JSON.stringify(userData));
    };
    reader.readAsDataURL(file);
}

/**
 * Handle profile update form submission
 */
function handleProfileUpdate(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = getUserData();

    // Update user data
    userData.fullName = document.getElementById('editFullName').value;
    userData.email = document.getElementById('editEmail').value;
    userData.phone = document.getElementById('editPhone').value;
    userData.bio = document.getElementById('editBio').value;

    // Save to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update display
    if (userData.fullName) {
        document.getElementById('displayName').textContent = userData.fullName;
        document.getElementById('fullName').textContent = userData.fullName;
    }

    if (userData.email) {
        document.getElementById('email').textContent = userData.email;
        document.getElementById('accountEmail').textContent = userData.email;
    }

    if (userData.phone) {
        document.getElementById('phone').textContent = userData.phone;
    }

    if (userData.bio) {
        document.getElementById('displayBio').textContent = userData.bio;
    }

    // Close modal
    closeEditModal();

    // Show success message
    showNotification('Profile updated successfully!', 'success');
}

/**
 * Copy referral code to clipboard
 */
function copyReferralCode(event) {
    const button = event.currentTarget;
    const referralCode = 'JOHN2026'; // In real app, get from user data

    navigator.clipboard.writeText(referralCode).then(() => {
        button.textContent = '✓ Copied!';
        setTimeout(() => {
            button.textContent = '📋 Copy';
        }, 2000);
    }).catch(() => {
        alert('Failed to copy referral code');
    });
}

/**
 * Handle toggle switch changes
 */
function handleToggleChange(event) {
    const toggle = event.target;
    const setting = toggle.closest('.preference-row').querySelector('.preference-label').textContent;

    // Save preference
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    preferences[setting] = toggle.checked;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));

    // Show notification
    const status = toggle.checked ? 'enabled' : 'disabled';
    showNotification(`${setting} ${status}`, 'info');
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);
