CREATE TABLE IF NOT EXISTS userprofile (
  idusers INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(45) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  role ENUM('user', 'photographer', 'videographer', 'musician', 'artist', 'admin') DEFAULT 'user',
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idusers),
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role_created (role, created),
  CONSTRAINT chk_email CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$') OR email IS NULL),
  CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
