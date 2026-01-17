# LipApp API Kullanım Kılavuzu

## Kurulum

1. **MySQL Tablolarını Oluştur:**
```bash
mysql -u root -p lip_app < create_tables.sql
```

2. **Server'ı Başlat:**
```bash
node server.js
```

## Authentication

Tüm endpoint'ler JWT token gerektirir.

**Header:**
```
Authorization: Bearer <token>
```

---

## 📅 Day Entries (Günlük Kayıtlar)

### Günlük Entry Kaydet
```
POST /api/day-entries
Content-Type: application/json

{
  "date": "2026-01-16",
  "note": "Bugün harika geçti!",
  "photo1_url": "http://...",
  "photo2_url": "http://..."
}
```

### Belirli Günün Entry'sini Getir
```
GET /api/day-entries/2026-01-16
```

### Tüm Entry'leri Getir
```
GET /api/day-entries
```

---

## ✅ Tasks (Görevler)

### Task Ekle
```
POST /api/tasks
Content-Type: application/json

{
  "period": "daily",
  "title": "Su iç",
  "due_date": "2026-01-20"
}
```

**period:** daily, weekly, monthly, yearly

### Task Listele
```
GET /api/tasks
GET /api/tasks?period=daily
```

### Task Güncelle
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Su iç (8 bardak)",
  "done": 1,
  "due_date": "2026-01-20"
}
```

### Task Sil
```
DELETE /api/tasks/:id
```

---

## 💊 Capsules (Zaman Kapsülleri)

### Kapsül Oluştur
```
POST /api/capsules
Content-Type: application/json

{
  "title": "2027'ye Mesaj",
  "note": "Gelecekteki ben, umarım mutlusundur...",
  "unlock_at": "2027-01-16T00:00:00"
}
```

### Kapsülleri Listele
```
GET /api/capsules
```

### Kapsül Sil
```
DELETE /api/capsules/:id
```

---

## 😊 Moods (Ruh Hali)

### Mood Kaydet
```
POST /api/moods
Content-Type: application/json

{
  "energy": 8,
  "happiness": 7,
  "stress": 3,
  "note": "Bugün iyiyim"
}
```

### Mood Geçmişi
```
GET /api/moods?limit=30
```

### Son Mood
```
GET /api/moods/latest
```

---

## 👤 Avatar

### Avatar Güncelle
```
POST /api/avatar
Content-Type: application/json

{
  "hair_style": "long",           // Saç stili
  "hair_color": "#8B4513",        // Saç rengi (hex veya string)
  "eye_color": "#3498DB",         // Göz rengi
  "skin_tone": "#F5CBA7",         // Ten rengi
  "gender": "female",             // Cinsiyet (male/female/other)
  "top_clothing": "tshirt",       // Üst kıyafet
  "top_clothing_color": "#E74C3C", // Üst kıyafet rengi
  "bottom_clothing": "jeans",     // Alt kıyafet
  "bottom_clothing_color": "#34495E" // Alt kıyafet rengi
}
```

**Not:** Tüm alanlar opsiyonel. Sadece güncellemek istediğiniz alanları gönderebilirsiniz.

### Avatar Getir
```
GET /api/avatar

Dönen veri:
{
  "id": 1,
  "user_id": 5,
  "hair_style": "long",
  "hair_color": "#8B4513",
  "eye_color": "#3498DB",
  "skin_tone": "#F5CBA7",
  "gender": "female",
  "top_clothing": "tshirt",
  "top_clothing_color": "#E74C3C",
  "bottom_clothing": "jeans",
  "bottom_clothing_color": "#34495E",
  "updated_at": "2026-01-16T10:30:00.000Z"
}
```

---

## 💧 Focus Daily (Günlük Odaklanma)

### Focus Verisi Kaydet
```
POST /api/focus-daily
Content-Type: application/json

{
  "date": "2026-01-16",
  "hydration_count": 5,
  "movement_count": 3
}
```

### Focus Verisi Getir
```
GET /api/focus-daily/2026-01-16
```

---

## 🔔 Personal Reminders (Kişisel Hatırlatıcılar)

### Hatırlatıcı Ekle
```
POST /api/personal-reminders
Content-Type: application/json

{
  "date": "2026-01-16",
  "text": "Doktor randevusu 14:00"
}
```

### Günlük Hatırlatıcıları Getir
```
GET /api/personal-reminders/2026-01-16
```

### Hatırlatıcı Güncelle
```
PUT /api/personal-reminders/:id
Content-Type: application/json

{
  "done": 1
}
```

veya metni de güncelle:
```json
{
  "done": 1,
  "text": "Doktor randevusu 15:00"
}
```

### Hatırlatıcı Sil
```
DELETE /api/personal-reminders/:id
```

---

## Flutter/Dart Entegrasyon Örneği

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'http://YOUR_SERVER_IP:3000/api';
  String? _token;

  void setToken(String token) {
    _token = token;
  }

  Future<Map<String, dynamic>> saveDayEntry({
    required String date,
    String? note,
    String? photo1Url,
    String? photo2Url,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/day-entries'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
      body: jsonEncode({
        'date': date,
        'note': note,
        'photo1_url': photo1Url,
        'photo2_url': photo2Url,
      }),
    );

    return jsonDecode(response.body);
  }

  Future<List<dynamic>> getTasks({String? period}) async {
    String url = '$baseUrl/tasks';
    if (period != null) {
      url += '?period=$period';
    }

    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $_token',
      },
    );

    return jsonDecode(response.body);
  }

  Future<void> saveMood({
    required int energy,
    required int happiness,
    required int stress,
    String? note,
  }) async {
    await http.post(
      Uri.parse('$baseUrl/moods'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
      body: jsonEncode({
        'energy': energy,
        'happiness': happiness,
        'stress': stress,
        'note': note,
      }),
    );
  }

  Future<void> updateFocusDaily({
    required String date,
    required int hydrationCount,
    required int movementCount,
  }) async {
    await http.post(
      Uri.parse('$baseUrl/focus-daily'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
      body: jsonEncode({
        'date': date,
        'hydration_count': hydrationCount,
        'movement_count': movementCount,
      }),
    );
  }
}
```

---

## Hata Kodları

- **200** - Başarılı
- **201** - Oluşturuldu
- **400** - Geçersiz istek
- **401** - Yetkisiz (token geçersiz/yok)
- **403** - Yasaklı
- **404** - Bulunamadı
- **500** - Sunucu hatası
