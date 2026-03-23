USE muscle_map;

-- Mock Exercises
INSERT INTO exercises (name, muscle_group, difficulty, recommended_reps, description, image_url) VALUES
('Bench Press', 'chest', 'Intermediate', '8-12', 'Classic compound movement for chest development.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'),
('Incline Dumbbell Press', 'chest', 'Intermediate', '8-12', 'Targets upper chest with adjustable angle.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'),
('Cable Fly', 'chest', 'Beginner', '12-15', 'Isolation movement for chest definition.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'),
('Deadlift', 'back', 'Advanced', '5-8', 'Full body posterior chain builder.', 'https://images.unsplash.com/photo-1603892853112-a9572472cbf2?auto=format&fit=crop&q=80&w=800'),
('Pull-ups', 'back', 'Intermediate', '8-12', 'Bodyweight lat builder and grip strength.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=800'),
('Barbell Row', 'back', 'Intermediate', '8-12', 'Thick back developer with barbell.', 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&q=80&w=800'),
('Squat', 'legs', 'Advanced', '5-8', 'King of leg exercises, full lower body.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'),
('Leg Press', 'legs', 'Beginner', '10-15', 'Machine-based quad dominant movement.', 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&q=80&w=800'),
('Romanian Deadlift', 'legs', 'Intermediate', '8-12', 'Hamstring and glute focused hip hinge.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'),
('Overhead Press', 'shoulders', 'Intermediate', '6-10', 'Standing barbell press for shoulder mass.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'),
('Lateral Raise', 'shoulders', 'Beginner', '12-15', 'Isolation movement for side delts.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'),
('Barbell Curl', 'arms', 'Beginner', '10-12', 'Classic bicep builder with barbell.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'),
('Tricep Pushdown', 'arms', 'Beginner', '12-15', 'Cable isolation for tricep development.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800'),
('Dips', 'chest', 'Intermediate', '8-12', 'Compound pushing movement for chest and triceps.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'),
('Face Pull', 'shoulders', 'Beginner', '15-20', 'Rear delt and rotator cuff health.', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800')
ON DUPLICATE KEY UPDATE
    muscle_group = VALUES(muscle_group),
    difficulty = VALUES(difficulty),
    recommended_reps = VALUES(recommended_reps),
    description = VALUES(description),
    image_url = VALUES(image_url);

-- Demo User
INSERT INTO users (id, username, email, password_hash, full_name, bio) VALUES
(1, 'demo_user', 'demo@musclemap.com', '$2y$12$OCQSWD8OwIeyB03UGRXGp.ifRqe1ThsjCEuY0meVdAvxwXGMXLAGO', 'Demo User', 'Fitness enthusiast | Building strength one day at a time')
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    password_hash = VALUES(password_hash),
    full_name = VALUES(full_name),
    bio = VALUES(bio);

INSERT INTO user_stats (user_id, height, weight, bmi, daily_calories) VALUES
(1, 175.0, 70.0, 22.9, 2400)
ON DUPLICATE KEY UPDATE
    height = VALUES(height),
    weight = VALUES(weight),
    bmi = VALUES(bmi),
    daily_calories = VALUES(daily_calories);

INSERT INTO user_fitness_profiles (user_id, gym_frequency, expertise_level, workout_plan, workout_time, diet_preference, goals) VALUES
(1, '3-4', 'intermediate', 'push-pull-legs', 'evening', 'omnivore', '["muscle-gain","strength"]')
ON DUPLICATE KEY UPDATE
    gym_frequency = VALUES(gym_frequency),
    expertise_level = VALUES(expertise_level),
    workout_plan = VALUES(workout_plan),
    workout_time = VALUES(workout_time),
    diet_preference = VALUES(diet_preference),
    goals = VALUES(goals);
