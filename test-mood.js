// Test mood endpoint
const token = "YOUR_TOKEN_HERE"; // Login'den aldığınız token'ı buraya yapıştırın

const testData = {
  energy: 8,
  happiness: 7,
  stress: 3,
  note: "Test mood"
};

console.log("📤 Mood test isteği gönderiliyor...");

fetch("http://localhost:3000/api/moods", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(testData)
})
  .then(res => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("✅ Response:", data);
  })
  .catch(err => {
    console.error("❌ Hata:", err.message);
  });
