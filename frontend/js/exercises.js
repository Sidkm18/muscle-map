/**
 * Exercise Library - DOM Manipulation and Filtering
 */

// Exercise Database
const exercises = [
    { id: 1, name: 'Barbell Bench Press', category: 'chest', difficulty: 'Intermediate', reps: '6-8' },
    { id: 2, name: 'Dumbbell Flyes', category: 'chest', difficulty: 'Beginner', reps: '10-12' },
    { id: 3, name: 'Cable Crossover', category: 'chest', difficulty: 'Beginner', reps: '12-15' },
    { id: 4, name: 'Incline Bench Press', category: 'chest', difficulty: 'Intermediate', reps: '8-10' },

    { id: 5, name: 'Deadlift', category: 'back', difficulty: 'Advanced', reps: '4-6' },
    { id: 6, name: 'Barbell Rows', category: 'back', difficulty: 'Intermediate', reps: '6-8' },
    { id: 7, name: 'Pull-ups', category: 'back', difficulty: 'Intermediate', reps: '8-12' },
    { id: 8, name: 'Lat Pulldown', category: 'back', difficulty: 'Beginner', reps: '10-15' },

    { id: 9, name: 'Barbell Squats', category: 'legs', difficulty: 'Advanced', reps: '6-8' },
    { id: 10, name: 'Leg Press', category: 'legs', difficulty: 'Beginner', reps: '8-12' },
    { id: 11, name: 'Leg Curls', category: 'legs', difficulty: 'Beginner', reps: '12-15' },
    { id: 12, name: 'Leg Extensions', category: 'legs', difficulty: 'Beginner', reps: '12-15' },

    { id: 13, name: 'Overhead Press', category: 'shoulders', difficulty: 'Intermediate', reps: '6-8' },
    { id: 14, name: 'Lateral Raises', category: 'shoulders', difficulty: 'Beginner', reps: '12-15' },
    { id: 15, name: 'Shoulder Shrugs', category: 'shoulders', difficulty: 'Beginner', reps: '10-12' },
    { id: 16, name: 'Face Pulls', category: 'shoulders', difficulty: 'Beginner', reps: '15-20' },

    { id: 17, name: 'Barbell Curls', category: 'arms', difficulty: 'Beginner', reps: '8-10' },
    { id: 18, name: 'Tricep Dips', category: 'arms', difficulty: 'Intermediate', reps: '8-12' },
    { id: 19, name: 'Hammer Curls', category: 'arms', difficulty: 'Beginner', reps: '10-12' },
    { id: 20, name: 'Rope Pushdowns', category: 'arms', difficulty: 'Beginner', reps: '12-15' }
];

// Current filter state
let currentFilter = 'all';

/**
 * Display exercises based on current filter
 */
function displayExercises() {
    const container = document.getElementById('exercises-container');
    const countElement = document.getElementById('exercise-count');

    // Filter exercises
    let filteredExercises = exercises;
    if (currentFilter !== 'all') {
        filteredExercises = exercises.filter(exercise => exercise.category === currentFilter);
    }

    // Clear container
    container.innerHTML = '';

    // Display each exercise as a card
    filteredExercises.forEach(exercise => {
        const difficultyColor = exercise.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
            exercise.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400';

        const card = document.createElement('div');
        card.className = 'group bg-surface-dark border border-white/10 hover:border-primary p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-10px_rgba(223,255,0,0.2)]';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <h3 class="font-display text-xl uppercase text-white group-hover:text-primary transition-colors">${exercise.name}</h3>
                <span class="material-symbols-outlined text-primary text-2xl">fitness_center</span>
            </div>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Category:</span>
                    <span class="text-primary font-bold capitalize">${exercise.category}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Difficulty:</span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${difficultyColor}">${exercise.difficulty}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">Rep Range:</span>
                    <span class="text-gray-300 font-mono">${exercise.reps}</span>
                </div>
            </div>
            <button class="w-full mt-6 px-4 py-2 bg-primary hover:bg-white text-black font-bold rounded-lg transition-colors">
                Add to Workout
            </button>
        `;
        container.appendChild(card);
    });

    // Update count
    countElement.textContent = `Showing ${filteredExercises.length} of ${exercises.length} exercises`;
}

/**
 * Setup filter button event listeners
 */
function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            buttons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-black');
                btn.classList.add('bg-white/10', 'text-white');
            });

            // Add active class to clicked button
            this.classList.add('bg-primary', 'text-black');
            this.classList.remove('bg-white/10', 'text-white');

            // Update filter and display
            currentFilter = this.getAttribute('data-category');
            displayExercises();
        });
    });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    displayExercises();
    setupFilterButtons();
});
