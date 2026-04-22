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
