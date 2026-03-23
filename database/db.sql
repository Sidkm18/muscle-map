-- =========================
-- CREATE DATABASE
-- =========================
CREATE DATABASE FitnessDB;
USE FitnessDB;

-- =========================
-- USER
-- =========================
CREATE TABLE User (
    UserID INT PRIMARY KEY,
    Name VARCHAR(100),
    Age INT,
    Email VARCHAR(100),
    Height DECIMAL(5,2),
    Weight DECIMAL(5,2),
    BMI DECIMAL(5,2)
);

-- =========================
-- TRAINEE (specialization)
-- =========================
CREATE TABLE Trainee (
    UserID INT PRIMARY KEY,
    FitnessGoal VARCHAR(100),
    TargetWeight DECIMAL(5,2),

    FOREIGN KEY (UserID)
    REFERENCES User(UserID)
);

-- =========================
-- TRAINER (specialization)
-- =========================
CREATE TABLE Trainer (
    UserID INT PRIMARY KEY,
    Certification VARCHAR(100),
    ExperienceYears INT,

    FOREIGN KEY (UserID)
    REFERENCES User(UserID)
);

-- =========================
-- ACTIVITY
-- =========================
CREATE TABLE Activity (
    ActivityID INT PRIMARY KEY,
    Date DATE,
    UserID INT,

    FOREIGN KEY (UserID)
    REFERENCES User(UserID)
);

-- =========================
-- WORKOUT SESSION
-- =========================
CREATE TABLE Workout_Session (
    WorkoutID INT PRIMARY KEY,
    Duration INT,
    CaloriesBurned INT,

    FOREIGN KEY (WorkoutID)
    REFERENCES Activity(ActivityID)
);

-- =========================
-- FOOD LOG
-- =========================
CREATE TABLE Food_Log (
    LogID INT PRIMARY KEY,
    TotalCalories INT,
    TotalProtein INT,

    FOREIGN KEY (LogID)
    REFERENCES Activity(ActivityID)
);

-- =========================
-- EXERCISE (superclass)
-- =========================
CREATE TABLE Exercise (
    ExerciseID INT PRIMARY KEY,
    Name VARCHAR(100),
    Difficulty VARCHAR(50),
    MuscleGroup VARCHAR(100)
);

-- =========================
-- STRENGTH EXERCISE
-- =========================
CREATE TABLE Strength_Exercise (
    ExerciseID INT PRIMARY KEY,
    Equipment VARCHAR(100),
    Force VARCHAR(50),
    TypicalReps INT,

    FOREIGN KEY (ExerciseID)
    REFERENCES Exercise(ExerciseID)
);

-- =========================
-- CARDIO EXERCISE
-- =========================
CREATE TABLE Cardio_Exercise (
    ExerciseID INT PRIMARY KEY,
    Duration INT,
    Distance DECIMAL(6,2),

    FOREIGN KEY (ExerciseID)
    REFERENCES Exercise(ExerciseID)
);

-- =========================
-- FLEXIBILITY EXERCISE
-- =========================
CREATE TABLE Flexibility_Exercise (
    ExerciseID INT PRIMARY KEY,
    StretchTime INT,

    FOREIGN KEY (ExerciseID)
    REFERENCES Exercise(ExerciseID)
);

-- =========================
-- FOOD ITEM (superclass)
-- =========================
CREATE TABLE Food_Item (
    FoodID INT PRIMARY KEY,
    Name VARCHAR(100),
    Calories INT,
    Protein INT
);

-- =========================
-- SOLID FOOD
-- =========================
CREATE TABLE Solid_Food (
    FoodID INT PRIMARY KEY,
    WeightGrams INT,

    FOREIGN KEY (FoodID)
    REFERENCES Food_Item(FoodID)
);

-- =========================
-- BEVERAGE
-- =========================
CREATE TABLE Beverage (
    FoodID INT PRIMARY KEY,
    VolumeML INT,

    FOREIGN KEY (FoodID)
    REFERENCES Food_Item(FoodID)
);

-- =========================
-- WORKOUT EXERCISE (M:N)
-- =========================
CREATE TABLE Workout_Exercise (
    WorkoutExerciseID INT PRIMARY KEY,
    WorkoutID INT,
    ExerciseID INT,

    FOREIGN KEY (WorkoutID)
    REFERENCES Workout_Session(WorkoutID),

    FOREIGN KEY (ExerciseID)
    REFERENCES Exercise(ExerciseID)
);

-- =========================
-- SET PERFORMANCE (weak entity)
-- =========================
CREATE TABLE Set_Performance (
    WorkoutExerciseID INT,
    SetOrder INT,
    Reps INT,
    Weight DECIMAL(6,2),

    PRIMARY KEY (WorkoutExerciseID, SetOrder),

    FOREIGN KEY (WorkoutExerciseID)
    REFERENCES Workout_Exercise(WorkoutExerciseID)
);

-- =========================
-- LOG FOOD (M:N)
-- =========================
CREATE TABLE Log_Food (
    LogFoodID INT PRIMARY KEY,
    LogID INT,
    FoodID INT,

    FOREIGN KEY (LogID)
    REFERENCES Food_Log(LogID),

    FOREIGN KEY (FoodID)
    REFERENCES Food_Item(FoodID)
);