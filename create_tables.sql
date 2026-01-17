-- LipApp MySQL Database Schema

-- day_entries tablosu
CREATE TABLE IF NOT EXISTS day_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  photo1_url TEXT,
  photo2_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- tasks tablosu
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  period VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  done TINYINT(1) DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- capsules tablosu
CREATE TABLE IF NOT EXISTS capsules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  note TEXT NOT NULL,
  unlock_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- moods tablosu
CREATE TABLE IF NOT EXISTS moods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  energy INT NOT NULL,
  happiness INT NOT NULL,
  stress INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  hydration_count INT DEFAULT 0,
  movement_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- personal_reminders tablosu
CREATE TABLE IF NOT EXISTS personal_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  text VARCHAR(500) NOT NULL,
  done TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
