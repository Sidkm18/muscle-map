CREATE TABLE IF NOT EXISTS connect_posts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_type VARCHAR(20) NOT NULL,
    media_type VARCHAR(20) NOT NULL,
    media_path VARCHAR(255) NOT NULL,
    caption TEXT NULL,
    crop_scale DECIMAL(4,2) NULL,
    crop_x SMALLINT NULL,
    crop_y SMALLINT NULL,
    crop_rotation SMALLINT NULL,
    like_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_connect_posts_created_at (created_at),
    INDEX idx_connect_posts_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
