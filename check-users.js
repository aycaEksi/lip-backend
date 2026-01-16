import { db } from "./db.js";

const sql = "SELECT id, email, verification_token, is_verified FROM users ORDER BY id DESC LIMIT 5";

db.query(sql, (err, results) => {
  if (err) {
    console.error("❌ Hata:", err);
  } else {
    console.table(results);
  }
  db.end();
});
