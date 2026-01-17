# LIP Backend API

LIP mobil uygulamasının Node.js/Express tabanlı REST API backend servisidir. Kullanıcı yönetimi, ruh hali takibi ve AI destekli motivasyon mesajları sunar.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: Email doğrulamalı kayıt ve JWT authentication
- **Ruh Hali Takibi**: Günlük enerji, mutluluk ve stres seviyeleri kaydı
- **AI Motivasyon**: OpenAI ile kişiselleştirilmiş motivasyon mesajları
- **Günlük Kayıtlar**: Fotoğraf ve not ekleyebilme
- **Email Servisi**: Gmail OAuth2 ile doğrulama emaili gönderimi

## 📦 Gereksinimler

- Node.js 16+
- MySQL 8.0+
- OpenAI API Key
- Gmail OAuth2 credentials

## ⚙️ Kurulum

1. **Bağımlılıkları yükle:**
```bash
npm install
```

2. **Veritabanını oluştur:**
```bash
mysql -u root -p < create_tables.sql
```

3. **`.env` dosyası oluştur:**
```env
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lip_app
```

4. **Serveri başlat:**
```bash
node server.js
```

Server varsayılan olarak `http://localhost:3000` adresinde çalışır.

## 📚 API Dokümantasyonu

Detaylı API kullanımı için [API_USAGE.md](API_USAGE.md) dosyasına bakabilirsiniz.

## 🛠️ Teknolojiler

- **Express.js** - Web framework
- **MySQL2** - Veritabanı
- **OpenAI** - AI motivasyon mesajları
- **JWT** - Authentication
- **Nodemailer** - Email servisi
- **Multer** - Dosya yükleme
