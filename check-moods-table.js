import { db } from "./db.js";

console.log("📋 Moods tablosunu kontrol ediyorum...\n");

db.query("SHOW TABLES LIKE 'moods'", (err, results) => {
  if (err) {
    console.error("❌ Hata:", err.message);
  } else if (results.length === 0) {
    console.log("❌ 'moods' tablosu YOK! Oluşturmak için create_tables.sql çalıştırın.\n");
  } else {
    console.log("✅ 'moods' tablosu VAR\n");
    
    // Tablo yapısını göster
    db.query("DESCRIBE moods", (err, cols) => {
      if (!err) {
        console.log("Moods tablo yapısı:");
        console.table(cols);
      }
    });
  }
  
  setTimeout(() => db.end(), 1000);
});
