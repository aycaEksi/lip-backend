// Test: Login -> Mood Save

const email = "test1768576368357@test.com";
const password = "123456";

console.log("1️⃣ Login yapılıyor...");

fetch("http://localhost:3000/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
})
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      console.log("✅ Login başarılı, token alındı");
      console.log("Token:", data.token.substring(0, 20) + "...");
      
      console.log("\n2️⃣ Mood kaydediliyor...");
      
      return fetch("http://localhost:3000/api/moods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.token}`
        },
        body: JSON.stringify({
          energy: 8,
          happiness: 7,
          stress: 3,
          note: "Test mood - iyiyim"
        })
      });
    } else {
      throw new Error("Token alınamadı: " + JSON.stringify(data));
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("✅ Mood kaydedildi:", data);
  })
  .catch(err => {
    console.error("❌ Hata:", err.message);
  });
