-- Posts table for user-generated content
CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type ENUM('photo', 'video', 'text') DEFAULT 'photo',
  media_url VARCHAR(500) NOT NULL,              -- Path or cloud URL (migration-ready)
  thumbnail_url VARCHAR(500),                  -- For videos
  visibility ENUM('public', 'private', 'friends') DEFAULT 'public',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES userprofile(idusers) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_visibility_created (visibility, created_at),
  INDEX idx_media_type (media_type)
);

-- Tags for filtering posts
CREATE TABLE IF NOT EXISTS post_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_tag (tag)
);
