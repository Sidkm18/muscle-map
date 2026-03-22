-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS muscle_map;
USE muscle_map;

-- =========================
-- USER
-- =========================
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

-- =========================
-- USER STATS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS user_stats (
    user_id INT PRIMARY KEY,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,1),
    daily_calories INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- USER FITNESS PROFILES TABLE
-- =========================
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

-- =========================
-- MEMBERSHIPS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS memberships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_name VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive', 'Cancelled') DEFAULT 'Active',
    renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);