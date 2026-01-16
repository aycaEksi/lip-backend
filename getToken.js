import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/oauth2callback"
);

async function main() {
  // 1️⃣ Yetkilendirme linki üret
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // 🔥 refresh_token zorlamak için
    scope: ["https://mail.google.com/"],
  });

  console.log("\nBU LİNKE TIKLA 👇\n");
  console.log(authUrl);
  console.log("\nGiriş yaptıktan sonra URL'deki code= değerini kopyala\n");

  // 2️⃣ Terminalden code iste
  process.stdin.once("data", async (data) => {
    const code = data.toString().trim();

    try {
      const { tokens } = await oAuth2Client.getToken(code);

      console.log("\n🎉 TOKENLAR ALINDI:\n");
      console.log(tokens);

      console.log("\n📌 SADECE BUNU .env'ye KOY:");
      console.log("GOOGLE_REFRESH_TOKEN=" + tokens.refresh_token);
    } catch (err) {
      console.error("\n❌ TOKEN ALINAMADI:\n", err);
    }
  });
}

main();
