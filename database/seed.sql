USE muscle_map;

-- Mock Exercises
INSERT INTO exercises (name, muscle_group, description, image_url) VALUES 
('Barbell Bench Press', 'chest', 'A classic upper body compound movement that effectively builds the chest, shoulders, and triceps.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'),
('Incline Dumbbell Press', 'chest', 'Targets the upper portion of the pectoralis major and the front deltoids.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'),
('Cable Crossover', 'chest', 'An isolation exercise that provides constant tension on the chest muscles.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'),
('Barbell Deadlift', 'back', 'The ultimate test of total body strength, primarily targeting the posterior chain.', 'https://images.unsplash.com/photo-1603892853112-a9572472cbf2?auto=format&fit=crop&q=80&w=800'),
('Pull-Ups', 'back', 'A fundamental bodyweight exercise for building a wide, strong back.', 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=800'),
('Barbell Squat', 'legs', 'The king of all leg exercises, building massive strength in the quads, hamstrings, and glutes.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'),
('Leg Press', 'legs', 'A machine-based compound movement that allows you to overload the leg muscles safely.', 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?auto=format&fit=crop&q=80&w=800'),
('Overhead Press', 'shoulders', 'A compound pushing movement that builds mass and strength in the shoulders and triceps.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800'),
('Lateral Raises', 'shoulders', 'An isolation exercise crucial for developing the side deltoids and creating wider-looking shoulders.', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'),
('Barbell Curl', 'arms', 'The classic bicep mass builder.', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800');

-- Demo User
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('demouser', 'demo@musclemap.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'Fitness enthusiast | Building strength one day at a time 💪');
-- Password is 'password' (bcrypt hash matches Laravel default factory "password" for simplicity, or we can use the password 'Demo@123' later. I will re-create logic for user so they can just register anyway)

INSERT INTO user_stats (user_id, height, weight, bmi, daily_calories) VALUES
(1, 175.0, 70.0, 22.9, 2000);

INSERT INTO user_fitness_profiles (user_id, gym_frequency, expertise_level, workout_plan, workout_time, diet_preference, goals) VALUES
(1, '3-4 times/week', 'Intermediate', 'Push Pull Legs', 'Evening (5 PM - 8 PM)', 'Non-Vegetarian', 'Muscle Gain, Build Strength, General Fitness');
