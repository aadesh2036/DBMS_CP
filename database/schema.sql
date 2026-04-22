CREATE DATABASE IF NOT EXISTS social_media_db;
USE social_media_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  full_name VARCHAR(100),
  bio TEXT,
  profile_picture_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);

CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE followers (
  follower_id INT AUTO_INCREMENT PRIMARY KEY,
  follower_user_id INT NOT NULL,
  followed_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_follow (follower_user_id, followed_user_id),
  CHECK (follower_user_id <> followed_user_id),
  FOREIGN KEY (follower_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (followed_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(40) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id INT NOT NULL,
  actor_user_id INT NULL,
  details VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE VIEW user_follow_stats AS
SELECT
  u.user_id,
  COALESCE(f.followers_count, 0) AS follower_count,
  COALESCE(g.following_count, 0) AS following_count
FROM users u
LEFT JOIN (
  SELECT followed_user_id, COUNT(*) AS followers_count
  FROM followers
  GROUP BY followed_user_id
) f ON u.user_id = f.followed_user_id
LEFT JOIN (
  SELECT follower_user_id, COUNT(*) AS following_count
  FROM followers
  GROUP BY follower_user_id
) g ON u.user_id = g.follower_user_id;

DELIMITER $$

CREATE TRIGGER audit_posts_insert
AFTER INSERT ON posts
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, entity_type, entity_id, actor_user_id, details)
  VALUES ('INSERT', 'posts', NEW.post_id, NEW.user_id, NULL);
END$$

CREATE TRIGGER audit_likes_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, entity_type, entity_id, actor_user_id, details)
  VALUES ('INSERT', 'likes', NEW.like_id, NEW.user_id, CONCAT('post_id=', NEW.post_id));
END$$

CREATE TRIGGER audit_comments_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, entity_type, entity_id, actor_user_id, details)
  VALUES ('INSERT', 'comments', NEW.comment_id, NEW.user_id, CONCAT('post_id=', NEW.post_id));
END$$

CREATE TRIGGER audit_followers_insert
AFTER INSERT ON followers
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (event_type, entity_type, entity_id, actor_user_id, details)
  VALUES ('INSERT', 'followers', NEW.follower_id, NEW.follower_user_id,
    CONCAT('followed_user_id=', NEW.followed_user_id));
END$$

DELIMITER ;
