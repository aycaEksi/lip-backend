import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }) {
  try {
    // Gmail SMTP ile basit kullanım
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Bağlantıyı test et
    await transporter.verify();
    console.log("✅ SMTP bağlantısı başarılı");

    const info = await transporter.sendMail({
      from: `"LipApp" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Mail gönderildi:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail gönderme hatası:", error.message);
    throw error;
  }
}
