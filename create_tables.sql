-- LipApp MySQL Database Schema

-- users tablosu
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255),
  password VARCHAR(255),
  verification_token VARCHAR(255),
  is_verified TINYINT(1) DEFAULT 0
);

-- day_entries tablosu
CREATE TABLE IF NOT EXISTS day_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  note TEXT DEFAULT NULL,
  photo1_path VARCHAR(255) DEFAULT NULL,
  photo2_path VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY uniq_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tasks tablosu
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  period ENUM('daily','weekly','monthly','yearly') NOT NULL,
  title VARCHAR(255) NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  due_date DATE DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- capsules tablosu
CREATE TABLE IF NOT EXISTS capsules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  unlock_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- moods tablosu
CREATE TABLE IF NOT EXISTS moods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  energy INT DEFAULT NULL,
  happiness INT DEFAULT NULL,
  stress INT DEFAULT NULL,
  durum VARCHAR(50) DEFAULT NULL,
  note TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- avatars tablosu (kullanıcı avatar özellikleri)
CREATE TABLE IF NOT EXISTS avatars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  hair_style VARCHAR(50),          -- Saç stili
  hair_color VARCHAR(50),          -- Saç rengi
  eye_color VARCHAR(50),           -- Göz rengi
  skin_tone VARCHAR(50),           -- Ten rengi
  gender VARCHAR(20),              -- Cinsiyet
  top_clothing VARCHAR(50),        -- Üst kıyafet
  top_clothing_color VARCHAR(50),  -- Üst kıyafet rengi
  bottom_clothing VARCHAR(50),     -- Alt kıyafet
  bottom_clothing_color VARCHAR(50), -- Alt kıyafet rengi
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- focus_daily tablosu
CREATE TABLE IF NOT EXISTS focus_daily (
  user_id INT NOT NULL,
  date DATE NOT NULL,
  hydration_count INT NOT NULL DEFAULT 0,
  movement_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- personal_reminders tablosu
CREATE TABLE IF NOT EXISTS personal_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  done TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
