import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lip_app"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database bağlantı hatası:", err.message);
    process.exit(1);
  }
  console.log("✅ Database bağlantısı başarılı");
});
