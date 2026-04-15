(function () {
  const WORKOUT_SESSION_STORAGE_KEY = 'mm-current-workout-session';
  const WORKOUT_PANEL_POSITION_KEY = 'mm-workout-panel-position';
  const mount = document.getElementById('exercise-grid');
  const count = document.getElementById('exercise-count');
  const filterRow = document.getElementById('filter-row');
  const subMuscleFilterSection = document.getElementById('sub-muscle-filter-section');
  const subMuscleFilterRow = document.getElementById('sub-muscle-filter-row');
  const equipmentFilterSection = document.getElementById('equipment-filter-section');
  const equipmentFilterRow = document.getElementById('equipment-filter-row');
  const startWorkoutButton = document.getElementById('start-workout-button');
  const workoutSessionCount = document.getElementById('workout-session-count');
  const workoutFloatingPanel = document.getElementById('workout-floating-panel');
  const workoutFloatingTimerBlock = document.getElementById('workout-floating-timer-block');
  const workoutFloatingTimerDisplay = document.getElementById('workout-floating-timer-display');
  const workoutTimerStart = document.getElementById('workout-timer-start');
  const workoutTimerStop = document.getElementById('workout-timer-stop');
  const workoutTimerLap = document.getElementById('workout-timer-lap');
  const workoutTimerReset = document.getElementById('workout-timer-reset');
  const workoutFloatingProgressLabel = document.getElementById('workout-floating-progress-label');
  const workoutFloatingProgressValue = document.getElementById('workout-floating-progress-value');
  const workoutFloatingProgressBar = document.getElementById('workout-floating-progress-bar');
  const workoutFloatingLaps = document.getElementById('workout-floating-laps');
  const workoutFloatingList = document.getElementById('workout-floating-list');
  const app = window.MuscleMap || {};

  if (!mount || !count || !filterRow || !subMuscleFilterSection || !subMuscleFilterRow || !equipmentFilterSection || !equipmentFilterRow || !startWorkoutButton || !workoutSessionCount || !workoutFloatingPanel || !workoutFloatingTimerBlock || !workoutFloatingTimerDisplay || !workoutTimerStart || !workoutTimerStop || !workoutTimerLap || !workoutTimerReset || !workoutFloatingProgressLabel || !workoutFloatingProgressValue || !workoutFloatingProgressBar || !workoutFloatingLaps || !workoutFloatingList) {
    return;
  }

  const subMuscleOptionsByMuscle = {
    chest: ['Upper Chest', 'Middle Chest', 'Lower Chest'],
    back: ['Lats', 'Upper Back', 'Lower Back'],
    shoulders: ['Front Delt', 'Side Delt', 'Rear Delt'],
    arms: ['Biceps', 'Triceps', 'Forearms'],
    legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves']
  };

  const equipmentOptions = [
    { value: 'all', label: 'All Equipment' },
    { value: 'none', label: 'None' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'machine', label: 'Machine' }
  ];

  const allowedEquipmentValues = ['none', 'barbell', 'dumbbell', 'machine'];

  const fallbackExercises = [
    { name: 'Romanian Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Dumbbell hip-hinge movement that emphasizes hamstring stretch and glute control.' },
    { name: 'Single Leg Romanian Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Single-leg dumbbell hinge that builds hamstring strength, balance, and coordination.' },
    { name: 'Bicep Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Classic dumbbell curl for building basic bicep strength and control.' },
    { name: 'Concentration Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Strict single-arm curl that isolates the biceps with focused contraction.' },
    { name: 'Cross Body Hammer Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Hammer curl variation that travels across the body to train the biceps and brachialis.' },
    { name: 'Hammer Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Neutral-grip curl for balanced bicep and forearm development.' },
    { name: 'Pinwheel Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Alternating hammer-style curl that emphasizes the brachialis and outer arm.' },
    { name: 'Preacher Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Bench-supported curl that limits momentum and increases bicep isolation.' },
    { name: 'Reverse Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Overhand dumbbell curl that trains the biceps along with the forearms.' },
    { name: 'Reverse Grip Concentration Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Concentration curl with an overhand grip for extra forearm and bicep demand.' },
    { name: 'Seated Incline Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Incline bench curl that lengthens the biceps and increases range of motion.' },
    { name: 'Spider Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Front-supported curl that keeps tension high through the full movement.' },
    { name: 'Waiter Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Curl performed by holding one dumbbell from underneath to target the inner biceps.' },
    { name: 'Zottman Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Advanced', reps: '10-12', description: 'Curl variation combining a supinated lift with a pronated lowering phase.' },
    { name: 'Single Leg Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Single-leg calf raise with dumbbell load for unilateral calf strength and balance.' },
    { name: 'Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Standing calf raise using dumbbell resistance to build calf strength and endurance.' },
    { name: 'Seated Palms Up Wrist Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Forearms', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Seated wrist curl variation that targets the forearm flexors with controlled palm-up movement.' },
    { name: 'Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Dumbbell deadlift variation that trains the glutes through a controlled hip-hinge pattern.' },
    { name: 'Frog Pumps', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Glute-focused bridge variation with the soles of the feet together for strong top-end contraction.' },
    { name: 'Single Leg Hip Thrust', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Single-leg hip thrust using dumbbell load to build unilateral glute strength and stability.' },
    { name: 'Dumbbell Row', category: 'back', muscle: 'Back', subMuscle: 'Lats', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Single-arm dumbbell row that targets the lats with a strong pulling path and controlled squeeze.' },
    { name: 'Pullover', category: 'back', muscle: 'Back', subMuscle: 'Lats', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Dumbbell pullover that trains the lats through shoulder extension and stretch.' },
    { name: 'Curtsy Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Cross-behind lunge variation that challenges leg strength, balance, and lower-body control.' },
    { name: 'Dumbbell Step Up', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Step-up movement using dumbbells to build quad strength and single-leg stability.' },
    { name: 'Goblet Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Front-loaded squat that keeps the torso upright and emphasizes the quads.' },
    { name: 'Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Basic dumbbell lunge for building quad strength, coordination, and balance.' },
    { name: 'Overhead Dumbbell Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-10', description: 'Lunge variation with dumbbells held overhead to increase stability and quad demand.' },
    { name: 'Reverse Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Backward-stepping lunge that targets the quads while being easier on the knees.' },
    { name: 'Split Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Stationary split-stance squat that builds quad strength and unilateral control.' },
    { name: 'Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Dumbbell squat variation for lower-body strength with a focus on the quads.' },
    { name: 'Seated Overhead Press (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Seated dumbbell press that keeps the focus on the shoulders with less lower-body involvement.' },
    { name: 'Shoulder Press (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Basic dumbbell shoulder press for building balanced pressing strength and control.' },
    { name: 'Upright Row (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Side Delt', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Dumbbell upright row that targets the side delts with an additional upper-trap contribution.' },
    { name: 'Arnold Press (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Rotational pressing movement that trains the shoulders through a long range of motion.' },
    { name: 'Overhead Press (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Classic dumbbell overhead press for building shoulder strength and stability.' },
    { name: 'Front Raise (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Isolation raise focusing on the front delts with controlled lifting and lowering.' },
    { name: 'Lateral Raise (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Side Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Side raise variation that isolates the lateral delts for shoulder width.' },
    { name: 'Seated Lateral Raise (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Side Delt', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-15', description: 'Seated lateral raise that limits body sway and keeps tension on the side delts.' },
    { name: 'Rear Delt Reverse Fly (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Rear Delt', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Reverse fly movement targeting the rear delts and upper back.' },
    { name: 'Chest Supported Reverse Fly (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Rear Delt', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '12-15', description: 'Chest-supported reverse fly for strict rear delt isolation with minimal momentum.' },
    { name: 'Chest Supported Y Raise (Dumbbell)', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Rear Delt', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '12-15', description: 'Y raise on an incline bench that builds rear delt and upper shoulder control.' },
    { name: 'Dumbbell Shrug', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Isolation exercise targeting the trapezius muscles.' },
    { name: 'Single Arm Tricep Extension', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12 each arm', description: 'Overhead single-arm extension for isolating triceps.' },
    { name: 'Dumbbell Skullcrusher', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Lying extension movement targeting triceps.' },
    { name: 'Dumbbell Triceps Extension', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Basic overhead triceps extension for strength and size.' },
    { name: 'Triceps Kickback', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '12-15', description: 'Isolation movement focusing on triceps contraction.' },
    { name: 'Wide Elbow Triceps Press', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Press variation with elbows flared for triceps emphasis.' },
    { name: 'Dumbbell Bent Over Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Basic rowing movement targeting upper back and lats.' },
    { name: 'Chest Supported Incline Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-12', description: 'Row performed on an incline bench for strict upper back isolation.' },
    { name: 'Renegade Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-10 each side', description: 'Core-intensive row variation combining plank stability and pulling.' },
    { name: 'Dumbbell Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Classic dumbbell press for chest strength and stability.' },
    { name: 'Chest Fly', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Isolation movement focusing on chest stretch and contraction.' },
    { name: 'Decline Dumbbell Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Lower Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-12', description: 'Decline press targeting the lower chest.' },
    { name: 'Decline Chest Fly', category: 'chest', muscle: 'Chest', subMuscle: 'Lower Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-15', description: 'Decline fly focusing on lower chest stretch.' },
    { name: 'Dumbbell Squeeze Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Press variation keeping dumbbells together for inner chest activation.' },
    { name: 'Dumbbell Floor Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '8-10', description: 'Limited range press reducing shoulder strain.' },
    { name: 'Hex Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', reps: '10-12', description: 'Close-grip dumbbell press emphasizing inner chest.' },
    { name: 'Incline Dumbbell Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Upper Chest', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '8-12', description: 'Incline press targeting upper chest.' },
    { name: 'Incline Chest Fly', category: 'chest', muscle: 'Chest', subMuscle: 'Upper Chest', equipment: 'Dumbbell', difficulty: 'Beginner', reps: '10-15', description: 'Incline fly for upper chest stretch and isolation.' },
    { name: 'Front Raise', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Beginner', reps: '10-15', description: 'Isolation movement targeting the front deltoids.' },
    { name: 'Overhead Press', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Beginner', reps: '5-8', description: 'Fundamental compound movement for shoulder strength and size.' },
    { name: 'Push Press', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Intermediate', reps: '3-6', description: 'Explosive press using leg drive to lift heavier weights.' },
    { name: 'Seated Overhead Press', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Strict overhead press performed seated to isolate shoulders.' },
    { name: 'Single Arm Landmine Press', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12 each arm', description: 'Unilateral pressing movement using a landmine setup.' },
    { name: 'Standing Military Press', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'Barbell', difficulty: 'Intermediate', reps: '5-8', description: 'Strict standing overhead press focusing on shoulder strength.' },
    { name: 'Upright Row', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Side Delt', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Pulling movement targeting shoulders and traps.' },
    { name: 'Box Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Intermediate', reps: '5-8', description: 'Squat variation using a box to control depth and improve form.' },
    { name: 'Front Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Intermediate', reps: '5-8', description: 'Front-loaded squat emphasizing quads and core stability.' },
    { name: 'Full Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Beginner', reps: '6-10', description: 'Deep squat targeting full lower body with emphasis on quads.' },
    { name: 'Hack Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Barbell variation performed behind the legs to target quads.' },
    { name: 'Barbell Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12 each leg', description: 'Forward stepping movement improving leg strength and balance.' },
    { name: 'Pause Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Advanced', reps: '3-6', description: 'Squat with pause at the bottom to build strength and control.' },
    { name: 'Reverse Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12 each leg', description: 'Backward stepping lunge reducing knee stress and improving stability.' },
    { name: 'Barbell Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'Barbell', difficulty: 'Beginner', reps: '5-10', description: 'Fundamental compound lift for lower body strength.' },
    { name: 'Good Morning', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Hip hinge movement targeting hamstrings and lower back.' },
    { name: 'Romanian Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12', description: 'Controlled deadlift variation focusing on hamstring stretch and glutes.' },
    { name: 'Single Leg Romanian Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Advanced', reps: '8-10 each leg', description: 'Unilateral movement improving balance and hamstring isolation.' },
    { name: 'Straight Leg Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Hamstrings', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Deadlift variation with minimal knee bend emphasizing hamstrings.' },
    { name: 'Barbell Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate', reps: '3-6', description: 'Compound lift targeting glutes, hamstrings, and lower back.' },
    { name: 'Hip Thrust', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12', description: 'Primary glute-building exercise with strong contraction at the top.' },
    { name: 'Partial Glute Bridge', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Barbell', difficulty: 'Beginner', reps: '12-15', description: 'Short-range glute bridge focusing on peak contraction.' },
    { name: 'Sumo Deadlift', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate', reps: '3-6', description: 'Wide stance deadlift emphasizing glutes and inner thighs.' },
    { name: 'Behind the Back Wrist Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Forearms', equipment: 'Barbell', difficulty: 'Intermediate', reps: '12-15', description: 'Wrist curl performed behind the body to target forearm flexors.' },
    { name: 'Seated Wrist Extension', category: 'arms', muscle: 'Arms', subMuscle: 'Forearms', equipment: 'Barbell', difficulty: 'Beginner', reps: '12-15', description: 'Reverse wrist curl targeting forearm extensors for balanced strength.' },
    { name: 'Wide Grip Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Bench press variation with wider grip to emphasize chest activation.' },
    { name: 'Barbell Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Barbell', difficulty: 'Beginner', reps: '5-10', description: 'Fundamental compound movement for building chest strength and size.' },
    { name: 'Decline Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Lower Chest', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Targets lower chest with a decline angle for better contraction.' },
    { name: 'Feet Up Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Bench press variation that removes leg drive to increase chest isolation.' },
    { name: 'Floor Press', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'Barbell', difficulty: 'Intermediate', reps: '5-8', description: 'Partial range press that reduces shoulder strain and targets triceps and chest.' },
    { name: 'Incline Bench Press', category: 'chest', muscle: 'Chest', subMuscle: 'Upper Chest', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Incline press targeting upper chest and front delts.' },
    { name: 'Single Leg Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'Barbell', difficulty: 'Intermediate', reps: '10-15 each leg', description: 'Single-leg calf raise with added resistance for increased intensity.' },
    { name: 'Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'Barbell', difficulty: 'Beginner', reps: '12-20', description: 'Barbell calf raise to build strength and size in the calves.' },
    { name: '21s Bicep Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Advanced', reps: '21 reps', description: 'High-intensity curl variation combining partial and full reps.' },
    { name: 'Barbell Bicep Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12', description: 'Basic barbell curl to build bicep strength and size.' },
    { name: 'Drag Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Curl variation that keeps the bar close to the body for better isolation.' },
    { name: 'EZ Bar Biceps Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Beginner', reps: '8-12', description: 'Curl variation using an EZ bar for reduced wrist strain.' },
    { name: 'Preacher Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '10-12', description: 'Strict curl performed on a preacher bench for isolation.' },
    { name: 'Reverse Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '10-12', description: 'Overhand grip curl targeting biceps and forearms.' },
    { name: 'Spider Curl', category: 'arms', muscle: 'Arms', subMuscle: 'Biceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '10-12', description: 'Curl performed lying on an incline bench for strict form.' },
    { name: 'Close Grip Bench Press', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '6-10', description: 'Bench press variation with a narrow grip to emphasize triceps.' },
    { name: 'JM Press', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Barbell', difficulty: 'Advanced', reps: '6-10', description: 'Hybrid movement between a press and skullcrusher targeting triceps.' },
    { name: 'Skullcrusher', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Isolation exercise targeting triceps through elbow extension.' },
    { name: 'Barbell Triceps Extension', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'Barbell', difficulty: 'Beginner', reps: '10-12', description: 'Overhead or lying extension movement focusing on triceps.' },
    { name: 'Bent Over Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Classic compound rowing movement for building upper back thickness.' },
    { name: 'Landmine Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Rowing variation using a landmine setup for controlled back engagement.' },
    { name: 'Meadows Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Advanced', reps: '8-10 each side', description: 'Single-arm landmine row variation targeting upper back and lats.' },
    { name: 'Pendlay Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Advanced', reps: '5-8', description: 'Explosive row performed from the floor to build strength and power.' },
    { name: 'Rack Pull', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Intermediate', reps: '5-8', description: 'Partial deadlift variation focusing on upper back and traps.' },
    { name: 'T Bar Row', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'Barbell', difficulty: 'Intermediate', reps: '8-12', description: 'Rowing movement using a barbell setup for back thickness.' },
    { name: 'Bird Dog', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Beginner', reps: '10-12 each side', description: 'Stability exercise that strengthens glutes and core while improving balance.' },
    { name: 'Fire Hydrants', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Beginner', reps: '12-15 each side', description: 'Isolation movement targeting glutes through lateral hip rotation.' },
    { name: 'Glute Bridge', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Beginner', reps: '12-15', description: 'Foundational glute exercise focusing on hip extension.' },
    { name: 'Glute Kickback on Floor', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Beginner', reps: '12-15 each leg', description: 'Bodyweight glute isolation exercise performed on all fours.' },
    { name: 'Hip Thrust', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Intermediate', reps: '10-12', description: 'Powerful glute-building movement focusing on hip extension.' },
    { name: 'Lateral Leg Raises', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Beginner', reps: '12-15 each side', description: 'Targets glute medius and improves hip stability.' },
    { name: 'Single Leg Glute Bridge', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Intermediate', reps: '10-12 each leg', description: 'Unilateral glute bridge to improve strength and balance.' },
    { name: 'Single Leg Hip Thrust', category: 'legs', muscle: 'Legs', subMuscle: 'Glutes', equipment: 'None', difficulty: 'Intermediate', reps: '8-10 each leg', description: 'Advanced unilateral hip thrust for increased glute activation.' },
    { name: 'Single Leg Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'None', difficulty: 'Intermediate', reps: '12-15 each leg', description: 'Single-leg calf raise to improve balance and isolate calf muscles.' },
    { name: 'Standing Calf Raise', category: 'legs', muscle: 'Legs', subMuscle: 'Calves', equipment: 'None', difficulty: 'Beginner', reps: '15-20', description: 'Basic calf exercise to build strength and endurance.' },
    { name: 'Superman', category: 'back', muscle: 'Back', subMuscle: 'Lower Back', equipment: 'None', difficulty: 'Beginner', reps: '10-15 or 20-40 sec hold', description: 'Bodyweight exercise that strengthens the lower back and improves spinal stability.' },
    { name: 'Negative Pull Up', category: 'back', muscle: 'Back', subMuscle: 'Lats', equipment: 'None', difficulty: 'Beginner', reps: '6-10', description: 'Focuses on the lowering phase of a pull-up to build strength for full reps.' },
    { name: 'Assisted Pistol Squats', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Intermediate', reps: '6-10', description: 'Single-leg squat variation using support for balance and control.' },
    { name: 'Frog Jumps', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Intermediate', reps: '10-15', description: 'Explosive jumping movement targeting quads and improving power.' },
    { name: 'Jump Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Intermediate', reps: '10-15', description: 'Plyometric squat variation to build leg power and explosiveness.' },
    { name: 'Jumping Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Intermediate', reps: '10-12 each leg', description: 'Alternating jumping lunges to target quads and improve agility.' },
    { name: 'Lateral Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Beginner', reps: '10-12 each side', description: 'Side-to-side lunge targeting quads and inner thighs.' },
    { name: 'Lateral Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Beginner', reps: '10-12', description: 'Side movement squat variation focusing on quads and stability.' },
    { name: 'Lunge', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Beginner', reps: '10-12 each leg', description: 'Basic lower body movement targeting quads and glutes.' },
    { name: 'Pistol Squat', category: 'legs', muscle: 'Legs', subMuscle: 'Quads', equipment: 'None', difficulty: 'Advanced', reps: '5-8', description: 'Single-leg squat requiring strength, balance, and mobility.' },
    { name: 'Handstand Push Up', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'None', difficulty: 'Advanced', reps: '5-10', description: 'Bodyweight overhead press variation performed in a handstand position.' },
    { name: 'Pike Pushup', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'None', difficulty: 'Intermediate', reps: '8-12', description: 'Bodyweight shoulder press variation targeting the front delts.' },
    { name: 'Shoulder Taps', category: 'shoulders', muscle: 'Shoulders', subMuscle: 'Front Delt', equipment: 'None', difficulty: 'Beginner', reps: '10-20', description: 'Core and shoulder stability exercise involving alternating shoulder taps.' },
    { name: 'Dead Hang', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'None', difficulty: 'Beginner', reps: '20-60 sec', description: 'Static hold exercise that improves grip strength and engages upper back muscles.' },
    { name: 'Scapular Pull Ups', category: 'back', muscle: 'Back', subMuscle: 'Upper Back', equipment: 'None', difficulty: 'Beginner', reps: '8-12', description: 'Focuses on scapular movement to strengthen upper back and improve pull-up form.' },
    { name: 'Diamond Push Up', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'None', difficulty: 'Intermediate', reps: '10-15', description: 'Close-grip push-up variation targeting the triceps.' },
    { name: 'Floor Triceps Dip', category: 'arms', muscle: 'Arms', subMuscle: 'Triceps', equipment: 'None', difficulty: 'Beginner', reps: '10-15', description: 'Bodyweight dip variation performed on the floor to target triceps.' },
    { name: 'Clap Push Ups', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Advanced', reps: '8-12', description: 'Explosive bodyweight press where you drive up hard, clap in the air, and land back into the next rep with control.' },
    { name: 'Incline Push Ups', category: 'chest', muscle: 'Chest', subMuscle: 'Upper Chest', equipment: 'None', difficulty: 'Beginner', reps: '8-12', description: 'Hands are elevated on a bench or box so you can press through the upper chest with a smoother, easier angle.' },
    { name: 'Kneeling Push Up', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Beginner', reps: '8-12', description: 'Modified push-up from the knees that helps build chest control, pressing strength, and full-range movement quality.' },
    { name: 'One Arm Push Up', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Advanced', reps: '8-12', description: 'Single-arm chest press variation that challenges strength, stability, and anti-rotation control through the torso.' },
    { name: 'Plank Pushup', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Intermediate', reps: '8-12', description: 'Transition from forearm plank to high plank one side at a time while keeping the chest active and hips steady.' },
    { name: 'Push Up', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Beginner', reps: '8-12', description: 'Classic bodyweight chest press with a controlled drop, strong lockout, and straight-line body position.' },
    { name: 'Push Up - Close Grip', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Intermediate', reps: '8-12', description: 'Close-hand push-up that keeps the chest engaged while increasing the work done by the triceps.' },
    { name: 'Push Up (Weighted)', category: 'chest', muscle: 'Chest', subMuscle: 'Middle Chest', equipment: 'None', difficulty: 'Advanced', reps: '8-12', description: 'Standard push-up pattern performed with added external load to increase chest pressing intensity.' }
  ];

  const colorByLevel = {
    Beginner: 'pill-beginner',
    Intermediate: 'pill-intermediate',
    Advanced: 'pill-advanced'
  };

  let exercises = fallbackExercises.slice();
  let selectedMuscle = 'all';
  let selectedSubMuscle = null;
  let selectedEquipment = null;
  let workoutSession = readWorkoutSession();
  let stopwatchState = createStopwatchState(workoutSession);
  workoutSession.active = false;
  workoutSession.showTimer = false;
  stopwatchState.isRunning = false;
  stopwatchState.startTime = null;
  let workoutTimerInterval = null;
  let dragState = {
    active: false,
    offsetX: 0,
    offsetY: 0
  };
  persistWorkoutSession();
  applySavedPanelPosition();
  syncWorkoutTimerTicker();

  filterRow.addEventListener('click', function (event) {
    const btn = event.target.closest('button[data-filter]');
    if (!btn) {
      return;
    }

    selectedMuscle = btn.getAttribute('data-filter') || 'all';
    selectedSubMuscle = null;
    selectedEquipment = null;
    filterRow.querySelectorAll('.pill').forEach(function (node) {
      node.classList.remove('active');
    });
    btn.classList.add('active');
    renderSubMuscleFilters();
    renderEquipmentFilters();
    render();
  });

  subMuscleFilterRow.addEventListener('click', function (event) {
    const btn = event.target.closest('button[data-sub-muscle-filter]');
    if (!btn) {
      return;
    }

    selectedSubMuscle = btn.getAttribute('data-sub-muscle-filter') || null;
    renderSubMuscleFilters();
    renderEquipmentFilters();
    render();
  });

  equipmentFilterRow.addEventListener('click', function (event) {
    const btn = event.target.closest('button[data-equipment-filter]');
    if (!btn) {
      return;
    }

    selectedEquipment = btn.getAttribute('data-equipment-filter') || 'all';
    renderEquipmentFilters();
    render();
  });

  startWorkoutButton.addEventListener('click', function () {
    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.showTimer = true;
      workoutSession.startedAt = new Date().toISOString();
      resetWorkoutTimer();
      persistWorkoutSession();
      renderSessionStatus();
      render();
      if (window.showToast) {
        window.showToast('Workout started. Use the stopwatch controls when you are ready.', 'success');
      }
      return;
    }

    stopWorkoutTimerTicker();
    workoutSession = createEmptyWorkoutSession();
    stopwatchState = createStopwatchState(workoutSession);
    persistWorkoutSession();
    renderSessionStatus();
    render();
    if (window.showToast) {
      window.showToast('Workout session cleared.', 'success');
    }
  });

  workoutTimerStart.addEventListener('click', function () {
    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.showTimer = true;
      workoutSession.startedAt = new Date().toISOString();
    }

    startWorkoutTimer();
    renderSessionStatus();
  });

  workoutTimerStop.addEventListener('click', function () {
    stopWorkoutTimer();
    renderSessionStatus();
  });

  workoutTimerLap.addEventListener('click', function () {
    if (!stopwatchState.isRunning) {
      return;
    }

    workoutSession.laps.unshift({
      id: createSessionItemId(),
      elapsedTime: getWorkoutElapsedMilliseconds(),
      createdAt: Date.now()
    });
    persistWorkoutSession();
    renderWorkoutTimer();
  });

  workoutTimerReset.addEventListener('click', function () {
    resetWorkoutTimer();
    persistWorkoutSession();
    renderSessionStatus();
  });

  workoutFloatingTimerBlock.addEventListener('pointerdown', function (event) {
    if (event.target.closest('button') || event.target.closest('input') || event.target.closest('label')) {
      return;
    }

    const panelRect = workoutFloatingPanel.getBoundingClientRect();
    dragState.active = true;
    dragState.offsetX = event.clientX - panelRect.left;
    dragState.offsetY = event.clientY - panelRect.top;

    workoutFloatingPanel.classList.add('is-dragging');
    workoutFloatingTimerBlock.setPointerCapture(event.pointerId);
  });

  workoutFloatingTimerBlock.addEventListener('pointermove', function (event) {
    if (!dragState.active) {
      return;
    }

    event.preventDefault();
    movePanelTo(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
  });

  workoutFloatingTimerBlock.addEventListener('pointerup', function (event) {
    if (!dragState.active) {
      return;
    }

    dragState.active = false;
    workoutFloatingPanel.classList.remove('is-dragging');
    workoutFloatingTimerBlock.releasePointerCapture(event.pointerId);
    persistPanelPosition();
  });

  workoutFloatingTimerBlock.addEventListener('pointercancel', function (event) {
    if (!dragState.active) {
      return;
    }

    dragState.active = false;
    workoutFloatingPanel.classList.remove('is-dragging');
    workoutFloatingTimerBlock.releasePointerCapture(event.pointerId);
    persistPanelPosition();
  });

  window.addEventListener('resize', function () {
    const rect = workoutFloatingPanel.getBoundingClientRect();
    if (workoutFloatingPanel.style.left) {
      movePanelTo(rect.left, rect.top);
      persistPanelPosition();
    }
  });

  mount.addEventListener('click', function (event) {
    const actionButton = event.target.closest('button[data-add-workout]');
    if (!actionButton) {
      return;
    }

    const exerciseName = actionButton.getAttribute('data-add-workout');
    const selectedExercise = exercises.find(function (item) {
      return item.name === exerciseName;
    });

    if (!selectedExercise) {
      return;
    }

    if (!workoutSession.active) {
      workoutSession.active = true;
      workoutSession.startedAt = new Date().toISOString();
    }

    workoutSession.items.push({
      id: createSessionItemId(),
      name: selectedExercise.name,
      category: selectedExercise.category,
      sets: 3,
      reps: deriveRepValue(selectedExercise.reps),
      addedAt: new Date().toISOString()
    });

    persistWorkoutSession();
    renderSessionStatus();
    render();

    if (window.showToast) {
      window.showToast(selectedExercise.name + ' added to the current workout.', 'success');
    }
  });

  workoutFloatingList.addEventListener('click', function (event) {
    const removeButton = event.target.closest('button[data-remove-workout-item]');
    if (!removeButton) {
      return;
    }

    const itemId = removeButton.getAttribute('data-remove-workout-item');
    workoutSession.items = workoutSession.items.filter(function (item) {
      return item.id !== itemId;
    });
    persistWorkoutSession();
    renderSessionStatus();
    render();
  });

  workoutFloatingList.addEventListener('input', function (event) {
    const input = event.target.closest('input[data-workout-field]');
    if (!input) {
      return;
    }

    const itemId = input.getAttribute('data-workout-item');
    const field = input.getAttribute('data-workout-field');
    const sessionItem = workoutSession.items.find(function (item) {
      return item.id === itemId;
    });

    if (!sessionItem || (field !== 'sets' && field !== 'reps')) {
      return;
    }

    sessionItem[field] = normalizePositiveNumber(input.value, sessionItem[field]);
    persistWorkoutSession();
    renderSessionStatus();
    renderFloatingPanel();
  });

  function render() {
    const filtered = exercises.filter(function (item) {
      const normalizedMuscle = String(item.category || '').toLowerCase();
      const normalizedSelectedMuscle = String(selectedMuscle || '').toLowerCase();
      const normalizedSubMuscle = String(item.subMuscle || '').toLowerCase();
      const normalizedSelectedSubMuscle = String(selectedSubMuscle || '').toLowerCase();
      const normalizedEquipment = String(item.equipment || '').toLowerCase();
      const normalizedSelectedEquipment = String(selectedEquipment || '').toLowerCase();
      const hasAllowedEquipment = allowedEquipmentValues.indexOf(normalizedEquipment) !== -1;

      const matchesMuscle = normalizedSelectedMuscle === 'all'
        ? true
        : normalizedMuscle === normalizedSelectedMuscle;
      const matchesSubMuscle = selectedSubMuscle === null
        ? true
        : normalizedSubMuscle === normalizedSelectedSubMuscle;
      const matchesEquipment = selectedEquipment === null || normalizedSelectedEquipment === 'all'
        ? true
        : normalizedEquipment === normalizedSelectedEquipment;

      return hasAllowedEquipment && matchesMuscle && matchesSubMuscle && matchesEquipment;
    });

    console.log('[Exercise Filters]', {
      selectedMuscle: selectedMuscle,
      selectedSubMuscle: selectedSubMuscle,
      selectedEquipment: selectedEquipment
    });
    console.log('[Filtered Exercises]', filtered);

    count.textContent = 'Showing ' + filtered.length + ' exercise' + (filtered.length === 1 ? '' : 's');
    mount.innerHTML = filtered.map(function (item) {
      const alreadyAdded = workoutSession.items.some(function (entry) {
        return entry.name === item.name;
      });

      return (
        '<article class="glass-card card">' +
          '<div style="display:flex; gap:.5rem; margin-bottom:.6rem; flex-wrap:wrap;">' +
            '<span class="pill-badge ' + (colorByLevel[item.difficulty] || 'pill-beginner') + '">' + escapeHtml(item.difficulty) + '</span>' +
            '<span class="pill-badge" style="background:rgba(var(--primary-rgb),.12); color:var(--primary); text-transform:capitalize;">' + escapeHtml(item.category) + '</span>' +
          '</div>' +
          '<h3 class="page-title" style="font-size:1.2rem; margin:0 0 .4rem;">' + escapeHtml(item.name) + '</h3>' +
          '<p class="muted" style="margin:0 0 .6rem;">' + escapeHtml(item.description) + '</p>' +
          '<div class="exercise-card-actions">' +
            '<p class="mini-label" style="margin:0;">Recommended: <span class="primary-text">' + escapeHtml(item.reps) + ' reps</span></p>' +
            '<button class="button button-outline exercise-add-button" type="button" data-add-workout="' + escapeHtml(item.name) + '">' + (alreadyAdded ? 'Add Again' : 'Add To Workout') + '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderEquipmentFilters() {
    const shouldShowEquipment = selectedMuscle !== 'all' && selectedSubMuscle !== null;

    equipmentFilterSection.hidden = !shouldShowEquipment;
    if (!shouldShowEquipment) {
      equipmentFilterRow.innerHTML = '';
      return;
    }

    equipmentFilterRow.innerHTML = equipmentOptions.map(function (option) {
      const isActive = selectedEquipment === option.value;
      return (
        '<button class="pill' + (isActive ? ' active' : '') + '" type="button" data-equipment-filter="' + escapeHtml(option.value) + '">' +
          escapeHtml(option.label) +
        '</button>'
      );
    }).join('');
  }

  function renderSubMuscleFilters() {
    const options = subMuscleOptionsByMuscle[selectedMuscle] || [];
    const shouldShowSubMuscles = selectedMuscle !== 'all' && options.length > 0;

    subMuscleFilterSection.hidden = !shouldShowSubMuscles;
    if (!shouldShowSubMuscles) {
      subMuscleFilterRow.innerHTML = '';
      return;
    }

    subMuscleFilterRow.innerHTML = options.map(function (option) {
      const isActive = selectedSubMuscle === option;
      return (
        '<button class="pill' + (isActive ? ' active' : '') + '" type="button" data-sub-muscle-filter="' + escapeHtml(option) + '">' +
          escapeHtml(option) +
        '</button>'
      );
    }).join('');
  }

  function renderSessionStatus() {
    const exerciseCount = workoutSession.items.length;

    startWorkoutButton.textContent = workoutSession.active ? 'Reset Workout' : 'Start Workout';
    startWorkoutButton.classList.toggle('button-outline', workoutSession.active);
    startWorkoutButton.classList.toggle('button-primary', !workoutSession.active);
    workoutSessionCount.classList.add('workout-session-count-text');
    workoutSessionCount.textContent = exerciseCount
      ? exerciseCount + ' exercise' + (exerciseCount === 1 ? '' : 's') + ' in current session.'
      : '';
    syncWorkoutTimerTicker();
    renderWorkoutTimer();
    renderFloatingPanel();
  }

  function normalizeExercise(item) {
    const normalizedCategory = item && item.muscle_group ? item.muscle_group : 'general';
    const normalizedMuscle = item && item.muscle
      ? item.muscle
      : toDisplayMuscle(normalizedCategory);

    return {
      name: item && item.name ? item.name : 'Exercise',
      category: normalizedCategory,
      muscle: normalizedMuscle,
      subMuscle: item && item.subMuscle
        ? item.subMuscle
        : inferSubMuscle(normalizedCategory, item && item.name),
      equipment: item && item.equipment ? item.equipment : 'Other',
      difficulty: item && item.difficulty ? item.difficulty : 'Beginner',
      reps: item && item.recommended_reps ? item.recommended_reps : '8-12',
      description: item && item.description ? item.description : 'Exercise details will be available soon.'
    };
  }

  function toDisplayMuscle(category) {
    const key = String(category || '').toLowerCase();

    if (key === 'chest') {
      return 'Chest';
    }
    if (key === 'back') {
      return 'Back';
    }
    if (key === 'legs') {
      return 'Legs';
    }
    if (key === 'shoulders') {
      return 'Shoulders';
    }
    if (key === 'arms') {
      return 'Arms';
    }

    return 'General';
  }

  function inferSubMuscle(category, name) {
    const normalizedCategory = String(category || '').toLowerCase();
    const normalizedName = String(name || '').toLowerCase();

    if (normalizedCategory === 'chest') {
      if (normalizedName.indexOf('incline') !== -1) {
        return 'Upper Chest';
      }
      if (normalizedName.indexOf('dip') !== -1 || normalizedName.indexOf('decline') !== -1) {
        return 'Lower Chest';
      }
      return 'Middle Chest';
    }

    if (normalizedCategory === 'back') {
      if (normalizedName.indexOf('deadlift') !== -1) {
        return 'Lower Back';
      }
      if (normalizedName.indexOf('pull') !== -1 || normalizedName.indexOf('lat') !== -1) {
        return 'Lats';
      }
      return 'Upper Back';
    }

    if (normalizedCategory === 'shoulders') {
      if (normalizedName.indexOf('lateral') !== -1 || normalizedName.indexOf('side') !== -1) {
        return 'Side Delt';
      }
      if (normalizedName.indexOf('rear') !== -1 || normalizedName.indexOf('face pull') !== -1) {
        return 'Rear Delt';
      }
      return 'Front Delt';
    }

    if (normalizedCategory === 'arms') {
      if (normalizedName.indexOf('tricep') !== -1 || normalizedName.indexOf('pushdown') !== -1) {
        return 'Triceps';
      }
      if (normalizedName.indexOf('forearm') !== -1 || normalizedName.indexOf('wrist') !== -1) {
        return 'Forearms';
      }
      return 'Biceps';
    }

    if (normalizedCategory === 'legs') {
      if (normalizedName.indexOf('calf') !== -1) {
        return 'Calves';
      }
      if (normalizedName.indexOf('hamstring') !== -1 || normalizedName.indexOf('romanian') !== -1) {
        return 'Hamstrings';
      }
      if (normalizedName.indexOf('glute') !== -1 || normalizedName.indexOf('hip thrust') !== -1) {
        return 'Glutes';
      }
      return 'Quads';
    }

    return 'General';
  }

  function loadExercises() {
    exercises = fallbackExercises.slice();
    renderSubMuscleFilters();
    renderEquipmentFilters();
    renderSessionStatus();
    render();
  }

  function createEmptyWorkoutSession() {
    return {
      active: false,
      showTimer: false,
      startedAt: '',
      elapsedTime: 0,
      isRunning: false,
      startTime: null,
      laps: [],
      items: []
    };
  }

  function readWorkoutSession() {
    try {
      const raw = window.localStorage.getItem(WORKOUT_SESSION_STORAGE_KEY);
      if (!raw) {
        return createEmptyWorkoutSession();
      }

      const parsed = JSON.parse(raw);
      const legacyStartTime = parsed && parsed.timerStartedAt
        ? new Date(parsed.timerStartedAt).getTime()
        : null;

      return {
        active: Boolean(parsed && parsed.active),
        showTimer: false,
        startedAt: parsed && parsed.startedAt ? parsed.startedAt : '',
        elapsedTime: normalizePositiveNumber(
          parsed && (parsed.elapsedTime !== undefined ? parsed.elapsedTime : parsed.elapsedSeconds),
          0,
          true
        ),
        isRunning: Boolean(parsed && (parsed.isRunning !== undefined ? parsed.isRunning : parsed.timerRunning)),
        startTime: Number.isFinite(parsed && parsed.startTime)
          ? Number(parsed.startTime)
          : (Number.isFinite(legacyStartTime) ? legacyStartTime : null),
        laps: parsed && Array.isArray(parsed.laps) ? parsed.laps.map(function (lap, index) {
          return {
            id: lap && lap.id ? lap.id : 'lap-' + index,
            elapsedTime: normalizePositiveNumber(lap && lap.elapsedTime, 0, true),
            createdAt: Number(lap && lap.createdAt) || Date.now()
          };
        }) : [],
        items: parsed && Array.isArray(parsed.items) ? parsed.items.map(function (item, index) {
          return {
            id: item && item.id ? item.id : 'session-item-' + index,
            name: item && item.name ? item.name : 'Exercise',
            category: item && item.category ? item.category : 'general',
            sets: normalizePositiveNumber(item && item.sets, 3),
            reps: normalizePositiveNumber(item && item.reps, 10),
            addedAt: item && item.addedAt ? item.addedAt : ''
          };
        }) : []
      };
    } catch (error) {
      return createEmptyWorkoutSession();
    }
  }

  function persistWorkoutSession() {
    syncSessionTimerState();
    window.localStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, JSON.stringify(workoutSession));
  }

  function applySavedPanelPosition() {
    if (!workoutSession.showTimer) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(WORKOUT_PANEL_POSITION_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || !Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) {
        return;
      }

      movePanelTo(parsed.left, parsed.top);
    } catch (error) {
      // Ignore malformed saved positions.
    }
  }

  function persistPanelPosition() {
    const rect = workoutFloatingPanel.getBoundingClientRect();
    window.localStorage.setItem(WORKOUT_PANEL_POSITION_KEY, JSON.stringify({
      left: rect.left,
      top: rect.top
    }));
  }

  function movePanelTo(left, top) {
    const maxLeft = Math.max(0, window.innerWidth - workoutFloatingPanel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - workoutFloatingPanel.offsetHeight);
    const safeLeft = Math.min(Math.max(0, left), maxLeft);
    const safeTop = Math.min(Math.max(0, top), maxTop);

    workoutFloatingPanel.style.left = safeLeft + 'px';
    workoutFloatingPanel.style.top = safeTop + 'px';
    workoutFloatingPanel.style.right = 'auto';
    workoutFloatingPanel.style.bottom = 'auto';
  }

  function renderFloatingPanel() {
    const totalItems = workoutSession.items.length;
    const configuredItems = workoutSession.items.filter(function (item) {
      return Number(item.sets || 0) > 0 && Number(item.reps || 0) > 0;
    }).length;
    const progress = totalItems ? Math.round((configuredItems / totalItems) * 100) : 0;

    workoutFloatingPanel.hidden = !workoutSession.showTimer;
    workoutFloatingPanel.classList.toggle('is-inactive', !workoutSession.active);
    workoutFloatingTimerBlock.hidden = !workoutSession.showTimer;
    workoutFloatingProgressLabel.textContent = workoutSession.active
      ? (totalItems ? configuredItems + ' of ' + totalItems + ' ready for the session' : 'No exercises configured yet.')
      : 'Workout mode is inactive right now.';
    workoutFloatingProgressValue.textContent = workoutSession.active ? progress + '%' : '0%';
    workoutFloatingProgressBar.style.width = workoutSession.active ? progress + '%' : '0%';
    renderWorkoutLaps();

    if (!workoutSession.active) {
      workoutFloatingList.innerHTML = '<div class="workout-floating-empty">Start workout mode to open your live session, then add exercises from the library here.</div>';
      return;
    }

    if (!totalItems) {
      workoutFloatingList.innerHTML = '<div class="workout-floating-empty">Add exercises from the library to build your workout here.</div>';
      return;
    }

    workoutFloatingList.innerHTML = workoutSession.items.map(function (item) {
      return (
        '<article class="workout-floating-item">' +
          '<div class="workout-floating-item-head">' +
            '<div>' +
              '<h3 class="workout-floating-item-title">' + escapeHtml(item.name) + '</h3>' +
              '<p class="muted" style="margin:.2rem 0 0; text-transform:capitalize;">' + escapeHtml(item.category) + '</p>' +
            '</div>' +
            '<button class="button button-outline workout-floating-item-remove" type="button" data-remove-workout-item="' + escapeHtml(item.id) + '">Remove</button>' +
          '</div>' +
          '<div class="workout-floating-inputs">' +
            '<label>' +
              '<span class="mini-label">Sets</span>' +
              '<input type="number" min="1" step="1" value="' + escapeHtml(item.sets) + '" data-workout-item="' + escapeHtml(item.id) + '" data-workout-field="sets" />' +
            '</label>' +
            '<label>' +
              '<span class="mini-label">Reps</span>' +
              '<input type="number" min="1" step="1" value="' + escapeHtml(item.reps) + '" data-workout-item="' + escapeHtml(item.id) + '" data-workout-field="reps" />' +
            '</label>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function renderWorkoutTimer() {
    workoutFloatingTimerBlock.hidden = !workoutSession.showTimer;
    workoutFloatingTimerDisplay.textContent = formatDuration(getWorkoutElapsedMilliseconds());
    workoutTimerStart.disabled = stopwatchState.isRunning;
    workoutTimerStop.disabled = !stopwatchState.isRunning;
    workoutTimerLap.disabled = !stopwatchState.isRunning;
    workoutTimerReset.disabled = !stopwatchState.isRunning && getWorkoutElapsedMilliseconds() === 0;
    renderWorkoutLaps();
  }

  function getWorkoutElapsedMilliseconds() {
    const storedElapsed = Math.max(0, Number(stopwatchState.elapsedTime || 0));
    if (!stopwatchState.isRunning || !Number.isFinite(stopwatchState.startTime)) {
      return storedElapsed;
    }
    return storedElapsed + Math.max(0, Date.now() - stopwatchState.startTime);
  }

  function startWorkoutTimer() {
    if (stopwatchState.isRunning) {
      return;
    }

    stopwatchState.elapsedTime = getWorkoutElapsedMilliseconds();
    stopwatchState.isRunning = true;
    stopwatchState.startTime = Date.now();
    syncSessionTimerState();
    persistWorkoutSession();
    syncWorkoutTimerTicker();
    renderWorkoutTimer();
  }

  function stopWorkoutTimer() {
    if (!stopwatchState.isRunning) {
      return;
    }

    stopwatchState.elapsedTime = getWorkoutElapsedMilliseconds();
    stopwatchState.isRunning = false;
    stopwatchState.startTime = null;
    stopWorkoutTimerTicker();
    syncSessionTimerState();
    renderWorkoutTimer();
    persistWorkoutSession();
  }

  function resetWorkoutTimer() {
    stopWorkoutTimerTicker();
    stopwatchState.elapsedTime = 0;
    stopwatchState.isRunning = false;
    stopwatchState.startTime = null;
    workoutSession.laps = [];
    syncSessionTimerState();
    renderWorkoutTimer();
  }

  function syncWorkoutTimerTicker() {
    stopWorkoutTimerTicker();

    if (workoutSession.active && stopwatchState.isRunning) {
      renderWorkoutTimer();
      workoutTimerInterval = window.setInterval(function () {
        renderWorkoutTimer();
      }, 50);
    }
  }

  function stopWorkoutTimerTicker() {
    if (workoutTimerInterval) {
      window.clearInterval(workoutTimerInterval);
      workoutTimerInterval = null;
    }
  }

  function createStopwatchState(session) {
    return {
      startTime: Number.isFinite(session && session.startTime) ? Number(session.startTime) : null,
      elapsedTime: normalizePositiveNumber(session && session.elapsedTime, 0, true),
      isRunning: Boolean(session && session.isRunning)
    };
  }

  function syncSessionTimerState() {
    workoutSession.elapsedTime = stopwatchState.elapsedTime;
    workoutSession.isRunning = stopwatchState.isRunning;
    workoutSession.startTime = stopwatchState.startTime;
  }

  function renderWorkoutLaps() {
    if (!workoutSession.showTimer) {
      workoutFloatingLaps.hidden = true;
      workoutFloatingLaps.innerHTML = '';
      return;
    }

    if (!workoutSession.laps || !workoutSession.laps.length) {
      workoutFloatingLaps.hidden = true;
      workoutFloatingLaps.innerHTML = '';
      return;
    }

    workoutFloatingLaps.hidden = false;
    workoutFloatingLaps.innerHTML = workoutSession.laps.map(function (lap, index) {
      return (
        '<div class="workout-floating-lap">' +
          '<span class="workout-floating-lap-label">Lap ' + (workoutSession.laps.length - index) + '</span>' +
          '<strong class="workout-floating-lap-time">' + formatDuration(lap.elapsedTime) + '</strong>' +
        '</div>'
      );
    }).join('');
  }

  function deriveRepValue(repsText) {
    const match = String(repsText || '').match(/\d+/);
    return match ? Number(match[0]) : 10;
  }

  function createSessionItemId() {
    return 'session-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }

  function normalizePositiveNumber(value, fallback, allowZero) {
    const number = Number(value);
    if (Number.isNaN(number) || (!allowZero && number <= 0) || (allowZero && number < 0)) {
      return Number(fallback || 1);
    }
    return Math.round(number);
  }

  function formatDuration(totalMilliseconds) {
    const safeMilliseconds = Math.max(0, Number(totalMilliseconds || 0));
    const hours = String(Math.floor(safeMilliseconds / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((safeMilliseconds % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((safeMilliseconds % 60000) / 1000)).padStart(2, '0');
    const centiseconds = String(Math.floor((safeMilliseconds % 1000) / 10)).padStart(2, '0');
    return hours + ':' + minutes + ':' + seconds + '.' + centiseconds;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  loadExercises();
  renderSubMuscleFilters();
  renderEquipmentFilters();
})();
