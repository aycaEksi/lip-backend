import { db } from "./db.js";

// Database bağlantısını test et
db.connect((err) => {
  if (err) {
    console.error("❌ Database bağlantı hatası:", err);
    process.exit(1);
  }
  console.log("✅ Database bağlantısı başarılı");
});

// Users tablosunu kontrol et
const checkTableSql = "DESCRIBE users";
db.query(checkTableSql, (err, result) => {
  if (err) {
    console.error("❌ Tablo kontrol hatası:", err);
  } else {
    console.log("\n📋 Users tablosu yapısı:");
    console.table(result);
  }
});

// Mevcut kayıtları kontrol et
const selectSql = "SELECT id, email, verification_token, is_verified FROM users";
db.query(selectSql, (err, results) => {
  if (err) {
    console.error("❌ Veri okuma hatası:", err);
  } else {
    console.log("\n📊 Mevcut kullanıcılar:");
    console.table(results);
  }
  
  // Bağlantıyı kapat
  setTimeout(() => {
    db.end();
    console.log("\n✅ Test tamamlandı");
  }, 1000);
});
