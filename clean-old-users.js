import { db } from "./db.js";

// Verification token'ı null olan kayıtları sil
const sql = "DELETE FROM users WHERE verification_token IS NULL";

db.query(sql, (err, result) => {
  if (err) {
    console.error("❌ Hata:", err);
  } else {
    console.log(`✅ ${result.affectedRows} eski kayıt silindi`);
  }
  db.end();
});
