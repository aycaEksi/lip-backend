import dotenv from "dotenv";
dotenv.config();
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID ? "VAR" : "YOK");
console.log("GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET ? "VAR" : "YOK");
console.log("GOOGLE_REFRESH_TOKEN =", process.env.GOOGLE_REFRESH_TOKEN ? "VAR" : "YOK");




import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import { db } from "./db.js";
import { transporter } from "./mail.js";


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
  const token = uuidv4();

  const sql = `
    INSERT INTO users (email, password, verification_token, is_verified)
    VALUES (?, ?, ?, false)
  `;

  db.query(sql, [email, password, token], (err) => {
    if (err) return res.status(500).json({ error: err });

    const verifyLink = `${process.env.BASE_URL}/api/verify-email?token=${token}`;

    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Hesabını Doğrula",
      html: `
        <h3>Merhaba 👋</h3>
        <p>Hesabını doğrulamak için aşağıdaki linke tıkla:</p>
        <a href="${verifyLink}">Hesabı Doğrula</a>
      `,
    });

    res.status(201).json({
      message: "Doğrulama maili gönderildi",
    });

  });
});

/* ---------------- VERIFY EMAIL ---------------- */

app.get("/api/verify-email", (req, res) => {
  const { token } = req.query;

  const sql = `
    UPDATE users
    SET is_verified = true, verification_token = NULL
    WHERE verification_token = ?
  `;

  db.query(sql, [token], (err, result) => {
    if (err) return res.status(500).send("Hata oluştu");

    if (result.affectedRows === 0) {
      return res.send("Geçersiz veya süresi dolmuş link");
    }

    res.send("Email doğrulandı! Artık giriş yapabilirsin 🎉");
  });
});

/* ---------------- LOGIN ---------------- */

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email=? AND password=?`;

  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0)
      return res.status(401).json({ error: "Hatalı giriş" });

    if (!results[0].is_verified)
      return res.status(401).json({ error: "Email doğrulanmamış" });

    res.json({ message: "Giriş başarılı" });
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

Kullanıcıya kısa, samimi ve motive edici bir mesaj yaz.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      message: completion.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI hata verdi" });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
