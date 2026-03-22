/**
 * Exercise Library - DOM Manipulation and Filtering
 */

// Exercise Database
let exercises = [];

// Current filter state
let currentFilter = 'all';

/**
 * Display exercises based on current filter
 */
async function displayExercises() {
    const container = document.getElementById('exercises-container');
    const countElement = document.getElementById('exercise-count');
    
    // Fetch exercises if empty
    if (exercises.length === 0) {
        try {
            const response = await fetch('http://localhost:8000/api/exercises');
            if (response.ok) {
                const data = await response.json();
                // Map the backend structure to the frontend structure
                exercises = data.exercises.map(e => ({
                    id: e.id,
                    name: e.name,
                    category: e.muscle_group,
                    description: e.description,
                    difficulty: 'Intermediate', // Mock
                    reps: '8-12' // Mock
                }));
            }
        } catch (e) {
            console.error('Failed to load exercises', e);
            countElement.textContent = `Error loading exercises.`;
            return;
        }
    }

    // Filter exercises
    let filteredExercises = exercises;
    if (currentFilter !== 'all') {
        filteredExercises = exercises.filter(exercise => exercise.category === currentFilter);
    }

    // Clear container
    container.innerHTML = '';

    // Display each exercise as a card
    filteredExercises.forEach(exercise => {
        const difficultyColor = exercise.difficulty === 'Beginner' ? 'difficulty-beginner' :
            exercise.difficulty === 'Intermediate' ? 'difficulty-intermediate' :
                'difficulty-advanced';

        const card = document.createElement('div');
        card.className = 'col-md-6 col-xl-4';
        card.innerHTML = `
            <div class="mm-card mm-card-hover exercise-card p-4">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h3 class="h5 text-uppercase mb-0">${exercise.name}</h3>
                    <span class="mm-icon-block">EX</span>
                </div>
                <div class="d-grid gap-2">
                    <div class="d-flex justify-content-between small">
                        <span class="mm-copy">Category</span>
                        <span class="mm-highlight fw-bold text-capitalize">${exercise.category}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span class="mm-copy">Difficulty</span>
                        <span class="badge ${difficultyColor}">${exercise.difficulty}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                        <span class="mm-copy">Rep Range</span>
                        <span>${exercise.reps}</span>
                    </div>
                </div>
                <button class="btn mm-btn-primary w-100 mt-4" type="button">Add to Workout</button>
            </div>
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
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');

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
