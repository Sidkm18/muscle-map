/**
 * Workout Calculator - Calculations and DOM Updates
 */

// Store exercises
let workoutExercises = [];

// Epley Formula for 1RM: 1RM = weight × (1 + reps/30)
function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

// Calculate calories burned (rough estimate: 0.07 × weight × reps × sets)
function calculateCaloriesBurned(weight, reps, sets) {
    return Math.round(0.07 * weight * reps * sets);
}

// Calculate total volume
function calculateTotalVolume() {
    return workoutExercises.reduce((total, exercise) => {
        return total + (exercise.weight * exercise.reps * exercise.sets);
    }, 0);
}

// Calculate total sets
function calculateTotalSets() {
    return workoutExercises.reduce((total, exercise) => {
        return total + exercise.sets;
    }, 0);
}

// Calculate average 1RM (from all exercises)
function calculateEstimated1RM() {
    if (workoutExercises.length === 0) return 0;
    
    const maxWeight = Math.max(...workoutExercises.map(ex => ex.weight));
    const maxReps = workoutExercises.find(ex => ex.weight === maxWeight)?.reps || 1;
    
    return calculate1RM(maxWeight, maxReps);
}

// Calculate total calories
function calculateTotalCalories() {
    return workoutExercises.reduce((total, exercise) => {
        return total + calculateCaloriesBurned(exercise.weight, exercise.reps, exercise.sets);
    }, 0);
}

// Update the display
function updateDisplay() {
    document.getElementById('total-volume').textContent = calculateTotalVolume().toLocaleString();
    document.getElementById('est-1rm').textContent = calculateEstimated1RM();
    document.getElementById('est-calories').textContent = calculateTotalCalories();
    document.getElementById('total-sets').textContent = calculateTotalSets();
    
    // Show/hide clear button
    const clearBtn = document.getElementById('clear-btn');
    if (workoutExercises.length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
}

// Render exercise list
function renderExerciseList() {
    const listContainer = document.getElementById('exercise-list');
    
    if (workoutExercises.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500 text-sm py-4">No exercises added yet</p>';
        return;
    }
    
    listContainer.innerHTML = workoutExercises.map((exercise, index) => {
        const volume = exercise.weight * exercise.reps * exercise.sets;
        const est1rm = calculate1RM(exercise.weight, exercise.reps);
        const calories = calculateCaloriesBurned(exercise.weight, exercise.reps, exercise.sets);
        
        return `
            <div class="bg-background-dark border border-white/10 rounded-lg p-4 flex justify-between items-start hover:border-primary/50 transition-colors">
                <div class="flex-1">
                    <p class="font-bold text-white mb-2">${exercise.weight} lbs × ${exercise.reps} reps × ${exercise.sets} sets</p>
                    <div class="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <span class="text-gray-400">Volume:</span>
                            <p class="text-primary font-bold">${volume} lbs</p>
                        </div>
                        <div>
                            <span class="text-gray-400">Est. 1RM:</span>
                            <p class="text-primary font-bold">${est1rm} lbs</p>
                        </div>
                        <div>
                            <span class="text-gray-400">Calories:</span>
                            <p class="text-primary font-bold">${calories} kcal</p>
                        </div>
                    </div>
                </div>
                <button class="ml-4 text-red-400 hover:text-red-300 transition-colors" onclick="removeExercise(${index})">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
        `;
    }).join('');
}

// Add exercise from form
function addExercise(weight, sets, reps) {
    if (!weight || !sets || !reps) {
        alert('Please fill in all fields');
        return;
    }
    
    workoutExercises.push({
        weight: parseFloat(weight),
        sets: parseInt(sets),
        reps: parseInt(reps)
    });
    
    // Clear form
    document.getElementById('weight-input').value = '';
    document.getElementById('sets-input').value = '';
    document.getElementById('reps-input').value = '';
    
    renderExerciseList();
    updateDisplay();
}

// Remove exercise
function removeExercise(index) {
    workoutExercises.splice(index, 1);
    renderExerciseList();
    updateDisplay();
}

// Clear all exercises
function clearAllExercises() {
    workoutExercises = [];
    renderExerciseList();
    updateDisplay();
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('exercise-form');
    const clearBtn = document.getElementById('clear-btn');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const weight = document.getElementById('weight-input').value;
        const sets = document.getElementById('sets-input').value;
        const reps = document.getElementById('reps-input').value;
        addExercise(weight, sets, reps);
    });
    
    clearBtn.addEventListener('click', clearAllExercises);
    
    // Initialize display
    updateDisplay();
});
