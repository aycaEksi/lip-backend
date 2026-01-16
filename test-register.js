// Test için basit kayıt isteği
const testData = {
  email: "test" + Date.now() + "@test.com",
  password: "123456"
};

console.log("📤 Test isteği gönderiliyor:", testData);

fetch("http://localhost:3000/api/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(testData)
})
  .then(res => res.json())
  .then(data => {
    console.log("✅ Response alındı:");
    console.log(data);
  })
  .catch(err => {
    console.error("❌ Hata:", err.message);
  });
