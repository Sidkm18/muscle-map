CREATE DATABASE IF NOT EXISTS muscle_map;
USE muscle_map;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other', 'Prefer Not to Say') DEFAULT 'Prefer Not to Say',
    dob DATE,
    bio TEXT,
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_stats (
    user_id INT PRIMARY KEY,
    height DECIMAL(5,2), -- e.g. cm
    weight DECIMAL(5,2), -- e.g. kg
    bmi DECIMAL(4,1),
    daily_calories INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_fitness_profiles (
    user_id INT PRIMARY KEY,
    gym_frequency VARCHAR(50),
    expertise_level VARCHAR(50),
    workout_plan VARCHAR(100),
    workout_time VARCHAR(50),
    diet_preference VARCHAR(50),
    allergies TEXT,
    supplements TEXT,
    medical_conditions TEXT,
    goals TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive', 'Cancelled') DEFAULT 'Active',
    renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    duration_minutes INT,
    calories_burned INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
