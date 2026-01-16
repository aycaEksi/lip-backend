import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "lip-app-secret-key-2026";

// User ID 20 için token oluştur (ayca_sukran_eksi@hotmail.com)
const token = jwt.sign(
  { userId: 20, email: "ayca_sukran_eksi@hotmail.com" },
  JWT_SECRET,
  { expiresIn: "30d" }
);

console.log("🔑 Test Token:");
console.log(token);
console.log("\n📋 Test komutu:");
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/moods/latest-durum`);

// Fetch ile test
console.log("\n🧪 Test yapılıyor...\n");

fetch("http://localhost:3000/api/moods/latest-durum", {
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log("✅ API Response:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error("❌ Hata:", err.message);
  });
