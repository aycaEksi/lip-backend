import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID ? "VAR" : "YOK");
console.log("GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET ? "VAR" : "YOK");
console.log("GOOGLE_REFRESH_TOKEN =", process.env.GOOGLE_REFRESH_TOKEN ? "VAR" : "YOK");




import express from "express";
import cors from "cors";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { sendMail } from "./mail.js";

// JWT secret key (.env'ye ekle)
const JWT_SECRET = process.env.JWT_SECRET || "lip-app-secret-key-2026";


const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log("Gelen istek:", req.method, req.url);
  next();
});


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------------- REGISTER ---------------- */

app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  
  // Önce email'in var olup olmadığını kontrol et
  const checkEmailSql = "SELECT id, is_verified FROM users WHERE email = ?";
  
  db.query(checkEmailSql, [email], async (err, results) => {
    if (err) {
      console.error("❌ Email kontrol hatası:", err);
      return res.status(500).json({ error: "Sunucu hatası" });
    }
    
    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.is_verified) {
        return res.status(400).json({ 
          error: "Bu email zaten kayıtlı. Lütfen giriş yapın." 
        });
      } else {
        return res.status(400).json({ 
          error: "Bu email zaten kayıtlı ama doğrulanmamış. Lütfen emailinizi kontrol edin." 
        });
      }
    }
    
    // 6 haneli doğrulama kodu üret
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const sql = `
      INSERT INTO users (email, password, verification_token, is_verified)
      VALUES (?, ?, ?, false)
    `;

    console.log("🔍 Kayıt verisi:", { email, password, verificationCode });

    db.query(sql, [email, password, verificationCode], async (err, result) => {
    if (err) {
      console.error("❌ Database hatası:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("✅ Kullanıcı kaydedildi, ID:", result.insertId);
    console.log("📧 Gönderilen doğrulama kodu:", verificationCode);

    try {
      await sendMail({
        to: email,
        subject: "Hesabını Doğrula - LipApp",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Merhaba 👋</h2>
            <p>LipApp hesabını doğrulamak için aşağıdaki kodu kullan:</p>
            <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
              ${verificationCode}
            </div>
            <p style="color: #666;">Bu kod 10 dakika geçerlidir.</p>
            <p style="color: #999; font-size: 12px;">Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
          </div>
        `,
      });

      res.status(201).json({
        message: "Doğrulama kodu email adresinize gönderildi",
        email: email
      });
    } catch (mailError) {
      console.error("❌ Mail gönderme hatası:", mailError);
      res.status(201).json({
        message: "Kayıt başarılı ama mail gönderilemedi",
        email: email
      });
    }
    });
  });
});

/* ---------------- VERIFY CODE ---------------- */

app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;

  console.log("🔍 Doğrulama isteği:", { email, code });

  const sql = `
    UPDATE users
    SET is_verified = true, verification_token = NULL
    WHERE email = ? AND verification_token = ? AND is_verified = false
  `;

  db.query(sql, [email, code], (err, result) => {
    if (err) {
      console.error("❌ Database hatası:", err);
      return res.status(500).json({ error: "Hata oluştu" });
    }

    console.log("🔍 Etkilenen satır sayısı:", result.affectedRows);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Geçersiz kod veya email" });
    }

    res.json({ 
      message: "Email doğrulandı! Artık giriş yapabilirsin 🎉",
      success: true
    });
  });
});

/* ---------------- LOGIN ---------------- */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT id, email, is_verified FROM users WHERE email=? AND password=?`;

  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });

    if (results.length === 0)
      return res.status(401).json({ error: "Hatalı email veya şifre" });

    const user = results[0];

    if (!user.is_verified)
      return res.status(401).json({ error: "Email doğrulanmamış. Lütfen mailinizi kontrol edin." });

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" } // 30 gün geçerli
    );

    res.json({
      message: "Giriş başarılı",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.is_verified
      }
    });
  });
});

/* ---------------- AUTH MIDDLEWARE ---------------- */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Token bulunamadı. Lütfen giriş yapın." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token" });
    }
    req.user = user; // user bilgisini request'e ekle
    next();
  });
};

/* ---------------- GET USER PROFILE ---------------- */

app.get("/api/profile", authenticateToken, (req, res) => {
  const sql = `SELECT id, email, is_verified FROM users WHERE id = ?`;
  
  db.query(sql, [req.user.userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Sunucu hatası" });
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı" });
    }
    
    const user = results[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.is_verified
      }
    });
  });
});

/* ---------------- AI MOTIVATION ---------------- */

app.post("/api/motivation", async (req, res) => {
  try {
    const { energy, happiness, stress, note } = req.body;

    const prompt = `
Sen bir motivasyon koçusun.
Kullanıcının ruh hali:
Enerji: ${energy}/10
Mutluluk: ${happiness}/10
Stres: ${stress}/10
Not: ${note}

1. Bu değerlere göre kullanıcının ruh halini tek kelime ile tanımla (örn: "Dinç", "Yorgun", "Huzurlu", "Gergin", "Enerjik", "Melankolik" gibi)
2. Kullanıcıya 1 cümle uzunluğunda, samimi ve motive edici bir mesaj yaz.

SADECE şu JSON formatında cevap ver:
{
  "mood": "tek kelime ruh hali",
  "message": "motivasyon mesajı"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    res.json({
      mood: aiResponse.mood,
      message: aiResponse.message,
    });
  } catch (err) {
    console.error("❌ AI hatası:", err);
    res.status(500).json({ error: "AI hata verdi" });
  }
});

/* ---------------- SERVER ---------------- */

// ==================== DAY ENTRIES ====================
app.post("/api/day-entries", authenticateToken, (req, res) => {
  const { date, note, photo1_url, photo2_url } = req.body;
  const userId = req.user.userId;

  const sql = `
    INSERT INTO day_entries (user_id, date, note, photo1_url, photo2_url)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE note = ?, photo1_url = ?, photo2_url = ?
  `;

  db.query(sql, [userId, date, note, photo1_url, photo2_url, note, photo1_url, photo2_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Entry kaydedildi", id: result.insertId });
  });
});

app.get("/api/day-entries/:date", authenticateToken, (req, res) => {
  const { date } = req.params;
  const userId = req.user.userId;

  const sql = "SELECT * FROM day_entries WHERE user_id = ? AND date = ?";
  db.query(sql, [userId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length > 0 ? results[0] : null);
  });
});

app.get("/api/day-entries", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM day_entries WHERE user_id = ? ORDER BY date DESC";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ==================== TASKS ====================
app.post("/api/tasks", authenticateToken, (req, res) => {
  const { period, title, due_date } = req.body;
  const userId = req.user.userId;

  const sql = "INSERT INTO tasks (user_id, period, title, due_date) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, period, title, due_date || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Task eklendi", id: result.insertId });
  });
});

app.get("/api/tasks", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { period } = req.query;

  let sql = "SELECT * FROM tasks WHERE user_id = ?";
  const params = [userId];

  if (period) {
    sql += " AND period = ?";
    params.push(period);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, done, due_date } = req.body;
  const userId = req.user.userId;

  const sql = "UPDATE tasks SET title = ?, done = ?, due_date = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [title, done, due_date, id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task bulunamadı" });
    res.json({ message: "Task güncellendi" });
  });
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Task bulunamadı" });
    res.json({ message: "Task silindi" });
  });
});

// ==================== CAPSULES ====================
app.post("/api/capsules", authenticateToken, (req, res) => {
  const { title, note, unlock_at } = req.body;
  const userId = req.user.userId;

  const sql = "INSERT INTO capsules (user_id, title, note, unlock_at) VALUES (?, ?, ?, ?)";
  db.query(sql, [userId, title, note, unlock_at], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Kapsül oluşturuldu", id: result.insertId });
  });
});

app.get("/api/capsules", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM capsules WHERE user_id = ? ORDER BY unlock_at ASC";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/api/capsules/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const sql = "DELETE FROM capsules WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Kapsül bulunamadı" });
    res.json({ message: "Kapsül silindi" });
  });
});

// ==================== MOODS ====================
app.post("/api/moods", authenticateToken, async (req, res) => {
  const { energy, happiness, stress, note } = req.body;
  const userId = req.user.userId;

  try {
    // AI'dan tek kelimelik durum al
    const prompt = `
Kullanıcının ruh hali değerleri:
Enerji: ${energy}/10
Mutluluk: ${happiness}/10
Stres: ${stress}/10

Bu değerlere göre kullanıcının ruh halini TEK TÜRKÇE KELİME ile tanımla.
Örnekler: Dinç, Yorgun, Huzurlu, Gergin, Enerjik, Melankolik, Mutlu, Stresli, Sakin, Neşeli

Sadece tek kelime döndür, başka bir şey yazma.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10
    });

    const durum = completion.choices[0].message.content.trim();
    console.log("🎭 AI'dan gelen durum:", durum);

    // Mood'u database'e kaydet
    const sql = "INSERT INTO moods (user_id, energy, happiness, stress, note, durum) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [userId, energy, happiness, stress, note || null, durum], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        message: "Mood kaydedildi", 
        id: result.insertId,
        durum: durum
      });
    });
  } catch (err) {
    console.error("❌ AI hatası:", err.message);
    // AI hatası olursa durum olmadan kaydet
    const sql = "INSERT INTO moods (user_id, energy, happiness, stress, note) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userId, energy, happiness, stress, note || null], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Mood kaydedildi (durum belirlenemedi)", id: result.insertId });
    });
  }
});

app.get("/api/moods", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { limit = 30 } = req.query;

  const sql = "SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT ?";
  db.query(sql, [userId, parseInt(limit)], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/moods/latest", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM moods WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length > 0 ? results[0] : null);
  });
});

// Sadece son durum kelimesini getir
app.get("/api/moods/latest-durum", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  console.log("🔍 /api/moods/latest-durum - userId:", userId);
  
  const sql = "SELECT durum, created_at FROM moods WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Database hatası:", err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log("📊 Query sonucu:", results);
    
    if (results.length === 0) {
      console.log("⚠️ Kullanıcıya ait mood bulunamadı");
      return res.json({ durum: null, created_at: null });
    }
    
    console.log("✅ Gönderilen veri:", results[0]);
    res.json(results[0]);
  });
});

// ==================== AVATAR ====================
app.post("/api/avatar", authenticateToken, (req, res) => {
  const { hair_style, hair_color, outfit, outfit_color } = req.body;
  const userId = req.user.userId;

  const sql = `
    INSERT INTO avatars (user_id, hair_style, hair_color, outfit, outfit_color)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      hair_style = ?, hair_color = ?, outfit = ?, outfit_color = ?
  `;

  db.query(sql, [
    userId, hair_style, hair_color, outfit, outfit_color,
    hair_style, hair_color, outfit, outfit_color
  ], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Avatar güncellendi" });
  });
});

app.get("/api/avatar", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM avatars WHERE user_id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length > 0 ? results[0] : null);
  });
});

// ==================== AVATAR PREFS ====================
app.post("/api/avatar-prefs", authenticateToken, (req, res) => {
  const { hair, eyes, outfit } = req.body;
  const userId = req.user.userId;

  const sql = `
    INSERT INTO avatar_prefs (user_id, hair, eyes, outfit)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE hair = ?, eyes = ?, outfit = ?
  `;

  db.query(sql, [userId, hair, eyes, outfit, hair, eyes, outfit], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Avatar tercihleri güncellendi" });
  });
});

app.get("/api/avatar-prefs", authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const sql = "SELECT * FROM avatar_prefs WHERE user_id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length > 0 ? results[0] : { hair: 0, eyes: 0, outfit: 0 });
  });
});

// ==================== FOCUS DAILY ====================
app.post("/api/focus-daily", authenticateToken, (req, res) => {
  const { date, hydration_count, movement_count } = req.body;
  const userId = req.user.userId;

  const sql = `
    INSERT INTO focus_daily (user_id, date, hydration_count, movement_count)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      hydration_count = ?, movement_count = ?
  `;

  db.query(sql, [
    userId, date, hydration_count, movement_count,
    hydration_count, movement_count
  ], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Focus verisi kaydedildi" });
  });
});

app.get("/api/focus-daily/:date", authenticateToken, (req, res) => {
  const { date } = req.params;
  const userId = req.user.userId;

  const sql = "SELECT * FROM focus_daily WHERE user_id = ? AND date = ?";
  db.query(sql, [userId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results.length > 0 ? results[0] : { hydration_count: 0, movement_count: 0 });
  });
});

// ==================== PERSONAL REMINDERS ====================
app.post("/api/personal-reminders", authenticateToken, (req, res) => {
  const { date, text } = req.body;
  const userId = req.user.userId;

  const sql = "INSERT INTO personal_reminders (user_id, date, text) VALUES (?, ?, ?)";
  db.query(sql, [userId, date, text], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Hatırlatıcı eklendi", id: result.insertId });
  });
});

app.get("/api/personal-reminders/:date", authenticateToken, (req, res) => {
  const { date } = req.params;
  const userId = req.user.userId;

  const sql = "SELECT * FROM personal_reminders WHERE user_id = ? AND date = ? ORDER BY id ASC";
  db.query(sql, [userId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.put("/api/personal-reminders/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { done, text } = req.body;
  const userId = req.user.userId;

  let sql, params;
  if (text !== undefined) {
    sql = "UPDATE personal_reminders SET done = ?, text = ? WHERE id = ? AND user_id = ?";
    params = [done, text, id, userId];
  } else {
    sql = "UPDATE personal_reminders SET done = ? WHERE id = ? AND user_id = ?";
    params = [done, id, userId];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hatırlatıcı bulunamadı" });
    res.json({ message: "Hatırlatıcı güncellendi" });
  });
});

app.delete("/api/personal-reminders/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  const sql = "DELETE FROM personal_reminders WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Hatırlatıcı bulunamadı" });
    res.json({ message: "Hatırlatıcı silindi" });
  });
});

/* ---------------- SERVER ---------------- */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
