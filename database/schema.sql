-- Canonical schema for the current XAMPP-backed MuscleMap application.
-- Apply this file first, then database/seed.sql for demo data.
-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS muscle_map;
USE muscle_map;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

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
    profile_photo MEDIUMTEXT COMMENT 'Stores an app-relative upload path; legacy rows may still contain data URLs.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- EXERCISES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    recommended_reps VARCHAR(20),
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_exercise_name (name),
    KEY idx_exercises_muscle_group (muscle_group)
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
    billing_duration_months INT NOT NULL DEFAULT 1,
    monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- WORKOUT PROGRAMS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS workout_programs (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
    description TEXT NOT NULL,
    weekly_split TEXT NOT NULL,
    exercises_json LONGTEXT NOT NULL,
    duration_weeks SMALLINT UNSIGNED NOT NULL DEFAULT 8,
    frequency_per_week TINYINT UNSIGNED NOT NULL DEFAULT 4,
    session_minutes VARCHAR(40) NOT NULL DEFAULT '45-60',
    access_tier ENUM('Free', 'Premium') NOT NULL DEFAULT 'Free',
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- WORKOUT CALCULATOR SETS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS workout_calculator_sets (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    weight DECIMAL(8,2) NOT NULL,
    reps SMALLINT UNSIGNED NOT NULL,
    bodyweight DECIMAL(8,2) NULL,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_workout_calculator_sets_user (user_id),
    INDEX idx_workout_calculator_sets_logged_at (logged_at),
    CONSTRAINT fk_workout_calculator_sets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- CONTACT MESSAGES TABLE
-- =========================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    subject VARCHAR(40) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_messages_created_at (created_at),
    INDEX idx_contact_messages_subject (subject),
    CONSTRAINT fk_contact_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
