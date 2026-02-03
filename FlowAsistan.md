# FlowAsistan - Proje Dokümantasyonu

## 📋 Proje Özeti

**Proje Adı:** FlowAsistan

**Proje Türü:** Web Uygulaması (CRM & Dashboard Sistemi)

**Amaç:** İşletmelere özel chatbot ve sesli AI agent hizmetlerinin birleştirilmiş CRM takip sistemi. Chatbot ve Sesli AI Agent sistemleri üzerinden gerçekleşen müşteri etkileşimlerinin izlenmesi, kategorilenmesi ve raporlanması.

**Hedef Kitle:** Genel sektör (tüm işletmeler)

---

## 🎯 Ana Modüller

### 1. Chatbot Modülü
Farklı platformlardaki chatbot etkileşimlerini yönetir. Müşteri ihtiyacına göre platformlar dinamik olarak eklenip çıkarılabilir.

**Desteklenen Platformlar:**
- WhatsApp Chatbot
- Facebook Messenger Chatbot
- Instagram Chatbot
- Web Chat Widget
- Telegram Chatbot
- (Gelecekte yeni platformlar eklenebilir)

### 2. Sesli AI Agent Modülü
Telefon görüşmeleri üzerinden yapılan AI destekli etkileşimleri yönetir.

**Arama Tipleri:**
- Gelen Aramalar (Incoming Calls)
- Giden Aramalar (Outgoing Calls)

---

## 🏗️ Uygulama Yapısı ve Navigasyon

### Ana Menü Yapısı (Sidebar)

```
📊 Genel Bakış (Ana Dashboard)
   └─ Her iki modülün toplu özet istatistikleri

💬 Chatbot
   ├─ Tüm Platformlar
   ├─ WhatsApp
   ├─ Facebook
   ├─ Instagram
   ├─ Web Chat
   └─ Telegram

📞 Sesli AI Agent
   ├─ Tüm Aramalar
   ├─ Gelen Aramalar
   └─ Giden Aramalar

👥 Tüm Müşteriler
   └─ Birleşik müşteri listesi (tüm kanallardan)

📈 Raporlar
   └─ Detaylı analiz ve raporlama sayfası

⚙️ Ayarlar
   ├─ Platform Yönetimi
   ├─ Webhook Yapılandırma
   ├─ Kategori Yönetimi
   └─ Kullanıcı Yönetimi

🔔 Bildirimler
   └─ Sistem bildirimleri ve uyarılar
```

---

## 📊 Dashboard Detayları

### 1. Genel Bakış Dashboard (Ana Sayfa)

**Üst KPI Kartları (Grid - 4 Kart):**
- Toplam Etkileşim Sayısı (Bugün/Hafta/Ay seçeneği)
- Chatbot Etkileşimleri
- Sesli Agent Etkileşimleri
- Genel Başarı Oranı (%)

**Grafikler:**
- **İki Modül Karşılaştırma Grafiği** (Bar Chart)
  - X ekseni: Chatbot vs Sesli Agent
  - Y ekseni: Etkileşim sayısı
  - Zaman aralığı seçici (Bugün/Hafta/Ay/Özel)

- **Kategori Dağılımı** (Pie Chart)
  - Tüm etkileşimlerin kategori bazlı dağılımı
  - Renk kodlu gösterim

- **Zaman Bazlı Trend** (Line Chart)
  - Son 7/14/30 gün trendi
  - İki çizgi: Chatbot & Sesli Agent

**Son Etkileşimler Tablosu:**
- Son 10 etkileşim
- Sütunlar: Tarih, Müşteri Adı, Kanal/Platform, Kategori, Durum
- Her satır tıklanabilir → Müşteri detay sayfasına yönlendirme

---

### 2. Chatbot Dashboard

**Platform Seçici (Tab/Pills Navigation):**
- Tümü
- WhatsApp (ikon ile)
- Facebook (ikon ile)
- Instagram (ikon ile)
- Web Chat (ikon ile)
- Telegram (ikon ile)

**NOT:** Sadece aktif olan platformlar gösterilir. Pasif platformlar gizlenir.

**KPI Kartları (Seçili platforma göre):**
- Toplam Mesaj Sayısı
- Aktif Konuşma Sayısı
- Başarılı Tamamlananlar
- Acil Aksiyona İhtiyaç Duyanlar

**Grafikler:**
- **Kategori Dağılımı** (Donut Chart)
  - ✅ Başarılı/Tamamlandı
  - ⏳ Beklemede
  - ⚠️ Acil Aksiyona İhtiyaç Var
  - ❌ Olumsuz Sonuçlandı
  - 📞 Geri Arama Talebi
  - ℹ️ Bilgi Talebi

- **Günlük Etkileşim Trendi** (Area Chart)
  - Son 30 gün
  - Hover ile günlük detay

- **Saatlik Yoğunluk** (Bar Chart)
  - 24 saatlik dilimlerde etkileşim yoğunluğu
  - En yoğun saatleri belirler

- **Başarı Oranı Trendi** (Line Chart)
  - Haftalık/aylık başarı oranı değişimi

**Müşteri Listesi Tablosu:**
- Filtreleme özellikleri:
  - Tarihe göre
  - Kategoriye göre
  - Arama (isim, telefon)
- Sütunlar:
  - Müşteri Adı
  - Platform (ikon)
  - İlk İletişim Tarihi
  - Son İletişim Tarihi
  - Kategori (renkli badge)
  - Durum
  - Aksiyonlar (Detay Görüntüle butonu)
- Sayfalama (pagination)
- Satır başına kayıt seçeneği (10/25/50/100)

---

### 3. Sesli AI Agent Dashboard

**Arama Tipi Seçici (Tab Navigation):**
- Tümü
- Gelen Aramalar (🔽 ikon)
- Giden Aramalar (🔼 ikon)

**KPI Kartları:**
- Toplam Arama Sayısı
- Ortalama Arama Süresi
- Başarılı Aramalar
- Cevapsız/Başarısız Aramalar

**Grafikler:**
- **Kategori Dağılımı** (Donut Chart)
  - Chatbot ile aynı kategoriler

- **Günlük Arama Trendi** (Area Chart)
  - Son 30 gün
  - Gelen/Giden ayrımı (iki çizgi)

- **Arama Süresi Dağılımı** (Histogram)
  - 0-1 dk, 1-3 dk, 3-5 dk, 5-10 dk, 10+ dk
  - Süre gruplarına göre dağılım

- **Saatlik Yoğunluk** (Bar Chart)
  - 24 saatlik dilimlerde arama yoğunluğu

- **Başarı Oranı Trendi** (Line Chart)
  - Haftalık/aylık başarı oranı

**Müşteri Listesi Tablosu:**
- Filtreleme: Tarih, Kategori, Arama Tipi, Arama
- Sütunlar:
  - Müşteri Adı
  - Telefon
  - Arama Tipi (ikon: gelen/giden)
  - Arama Tarihi
  - Süre (dakika:saniye formatında)
  - Kategori (renkli badge)
  - Durum
  - Aksiyonlar (Detay Görüntüle, Dinle)
- Sayfalama

---

## 👤 Müşteri Detay Sayfası

### Chatbot Müşteri Detayı

**Üst Bilgi Kartı:**
- Profil fotoğrafı placeholder
- Müşteri Adı - Soyadı
- Telefon numarası
- Email (varsa)
- Platform ikonu ve adı
- İlk iletişim tarihi
- Son iletişim tarihi

**Konuşma Geçmişi Bölümü:**
- Mesajlaşma transkripti (WhatsApp benzeri görünüm)
- Tarih/saat damgaları
- Müşteri mesajları (sağda)
- Bot mesajları (solda)
- Scroll edilebilir alan

**Alınan Bilgiler Kartı:**
- İsim
- Soyisim
- Telefon
- Email
- Randevu Tarihi (varsa)
- Randevu Saati (varsa)
- Talep Edilen Hizmet/Ürün
- Özel Notlar
- Diğer toplanan veriler (dinamik)

**Durum ve Kategori Kartı:**
- Mevcut Kategori (dropdown ile değiştirilebilir)
- Durum (Aktif/Pasif/Tamamlandı)
- Etiketler (çoklu seçilebilir, renkli)
- Öncelik Seviyesi (Düşük/Orta/Yüksek/Acil)

**Manuel Not Ekleme Alanı:**
- Zengin metin editörü
- Notları kaydetme
- Not geçmişi (zaman damgalı)
- Not yazan kullanıcı bilgisi

**Geçmiş Etkileşimler:**
- Bu müşteriyle daha önce yapılan tüm konuşmaların listesi
- Timeline görünümü
- Her etkileşim tıklanabilir (detay görüntüleme)

**Aksiyon Butonları:**
- Kategori Güncelle
- Not Ekle
- Manuel Arama Başlat
- WhatsApp'ta Aç (dış link)
- Müşteriyi Dışa Aktar

---

### Sesli AI Agent Müşteri Detayı

**Üst Bilgi Kartı:**
- Profil fotoğrafı placeholder
- Müşteri Adı - Soyadı
- Telefon numarası
- Email (varsa)
- Arama Tipi ikonu (Gelen/Giden)
- İlk arama tarihi
- Son arama tarihi
- Toplam arama sayısı

**Ses Kaydı Player:**
- Oynat/Duraklat butonları
- İleri/Geri alma (10 saniye)
- Ses seviyesi kontrolü
- Oynatma hızı ayarı (0.5x, 1x, 1.5x, 2x)
- Progress bar
- Toplam süre gösterimi
- İndirme butonu

**Konuşma Özeti Kartı:**
- AI tarafından oluşturulmuş konuşma özeti
- Anahtar noktalar (bullet points)
- Müşteri talepleri
- Verilen cevaplar
- Alınan aksiyonlar

**Konuşma Transkripti:**
- Ses-metin dönüşümü (transcript)
- Zaman damgalı (00:15, 00:32 gibi)
- Konuşan kişi ayrımı (Müşteri/AI Agent)
- Aranabilir metin
- Scroll edilebilir

**Alınan Bilgiler Kartı:**
- İsim
- Soyisim
- Telefon
- Email
- Randevu Tarihi (varsa)
- Randevu Saati (varsa)
- Talep Edilen Hizmet/Ürün
- Fiyat Teklifi (varsa)
- Diğer toplanan veriler

**Durum ve Kategori Kartı:**
- Mevcut Kategori (dropdown)
- Arama Sonucu (Başarılı/Başarısız/Cevapsız)
- Etiketler
- Öncelik Seviyesi

**Manuel Not Ekleme Alanı:**
- Chatbot ile aynı özellikler

**Geçmiş Aramalar:**
- Bu müşteriyle yapılan tüm aramalar
- Timeline görünümü
- Her arama için: tarih, süre, kategori
- Dinle butonu

**Aksiyon Butonları:**
- Kategori Güncelle
- Not Ekle
- Yeniden Ara
- Transkripti İndir
- Ses Kaydını İndir
- Müşteriyi Dışa Aktar

---

## 📈 Raporlar Sayfası

**Rapor Tipleri:**

### 1. Özet Rapor
- Seçilen tarih aralığı için genel istatistikler
- PDF/Excel export
- Parametreler:
  - Başlangıç tarihi
  - Bitiş tarihi
  - Modül seçimi (Chatbot/Sesli Agent/Her ikisi)
  - Platform seçimi (Chatbot için)

### 2. Kategori Analiz Raporu
- Kategori bazlı detaylı dökümantasyon
- Trend analizleri
- Export özelliği

### 3. Platform Performans Raporu
- Her platform için ayrı performans metrikleri
- Karşılaştırmalı analiz
- En iyi/en kötü performans gösteren platformlar

### 4. Kullanıcı/Agent Performans Raporu
- Hangi AI agent/chatbot en başarılı
- Ortalama yanıt süreleri
- Müşteri memnuniyeti skorları

### 5. Zaman Bazlı Analiz
- Saatlik/günlük/haftalık/aylık kırılımlar
- Yoğunluk haritaları
- Sezonsal trendler

**Rapor Filtreleme Seçenekleri:**
- Tarih aralığı (özel/preset)
- Modül (Chatbot/Sesli Agent)
- Platform (Chatbot için)
- Kategori
- Durum
- Kullanıcı/Agent

**Export Formatları:**
- PDF (detaylı rapor, grafikler dahil)
- Excel (.xlsx)
- CSV

---

## ⚙️ Ayarlar Sayfası

### 1. Platform Yönetimi

**Platform Listesi Tablosu:**
- Sütunlar:
  - Platform Adı
  - Platform Tipi (Chatbot/Sesli Agent)
  - Durum (Aktif/Pasif - Toggle switch)
  - Webhook URL
  - Son Güncelleme
  - Aksiyonlar (Düzenle/Sil)

**Platform Ekleme:**
- "Yeni Platform Ekle" butonu
- Modal/Form:
  - Platform Adı
  - Platform Tipi (dropdown)
  - Platform İkonu (seçilebilir)
  - Webhook URL
  - API Anahtarı (şifreli gösterim)
  - Durum (Aktif/Pasif)

**Platform Düzenleme:**
- Mevcut bilgileri görüntüleme
- Güncelleme imkanı
- Test webhook butonu

---

### 2. Webhook Yapılandırma

**Webhook Endpoint Listesi:**
Her platform için otomatik oluşturulmuş webhook URL'leri:
```
https://flowasistan.com/api/webhook/whatsapp
https://flowasistan.com/api/webhook/facebook
https://flowasistan.com/api/webhook/instagram
https://flowasistan.com/api/webhook/webchat
https://flowasistan.com/api/webhook/telegram
https://flowasistan.com/api/webhook/voice-agent-incoming
https://flowasistan.com/api/webhook/voice-agent-outgoing
```

**Her webhook için:**
- Kopyala butonu
- Test gönder butonu
- Webhook geçmişi (son 10 istek)
- İstek/yanıt detayları
- Hata logları

**Webhook Güvenliği:**
- Secret key oluşturma
- IP beyaz listesi
- Rate limiting ayarları

---

### 3. Kategori Yönetimi

**Mevcut Kategoriler:**
1. ✅ Başarılı/Tamamlandı
   - Renk: Yeşil (#10B981)
   - Açıklama: Randevu alındı, satış gerçekleşti, sorun çözüldü

2. ⏳ Beklemede
   - Renk: Sarı (#F59E0B)
   - Açıklama: Müşteri düşünüyor, geri dönüş bekliyor

3. ⚠️ Acil Aksiyona İhtiyaç Var
   - Renk: Kırmızı (#EF4444)
   - Açıklama: Şikayet var, sorun çözülmedi, memnuniyetsiz

4. ❌ Olumsuz Sonuçlandı
   - Renk: Gri (#6B7280)
   - Açıklama: İptal, satış olmadı, ilgilenmiyor

5. 📞 Geri Arama Talebi
   - Renk: Mavi (#3B82F6)
   - Açıklama: İnsan ile görüşmek istiyor

6. ℹ️ Bilgi Talebi
   - Renk: Mor (#8B5CF6)
   - Açıklama: Sadece bilgi aldı, karar aşamasında değil

**Kategori İşlemleri:**
- Yeni kategori ekleme
- Mevcut kategori düzenleme (isim, renk, ikon, açıklama)
- Kategori silme (eğer kullanımda değilse)
- Kategori sıralaması (drag & drop)

---

### 4. Kullanıcı Yönetimi

**Kullanıcı Rolleri:**
1. **Admin**
   - Tüm erişim hakları
   - Kullanıcı yönetimi
   - Sistem ayarları

2. **Yönetici**
   - Dashboard görüntüleme
   - Müşteri yönetimi
   - Rapor oluşturma
   - Kategori güncelleme

3. **Kullanıcı**
   - Dashboard görüntüleme (sadece okuma)
   - Müşteri detayları görüntüleme
   - Not ekleme

**Kullanıcı Listesi Tablosu:**
- Sütunlar:
  - Ad Soyad
  - Email
  - Rol
  - Son Giriş
  - Durum (Aktif/Pasif)
  - Aksiyonlar

**Kullanıcı Ekleme/Düzenleme:**
- Form alanları:
  - Ad
  - Soyad
  - Email
  - Şifre (ekleme için zorunlu)
  - Rol seçimi
  - Durum
  - İzinler (özel izinler checkbox listesi)

---

### 5. Genel Sistem Ayarları

**Bildirim Ayarları:**
- Email bildirimleri (açık/kapalı)
- Push bildirimleri (açık/kapalı)
- Bildirim seçenekleri:
  - Acil müşteriler için anında
  - Günlük özet rapor
  - Haftalık performans raporu

**Görünüm Ayarları:**
- Tema (Açık/Koyu/Sistem)
- Dil seçimi (Türkçe/İngilizce)
- Tarih formatı
- Saat formatı (12/24 saat)
- Zaman dilimi

**Veri Ayarları:**
- Otomatik yedekleme (açık/kapalı)
- Yedekleme sıklığı (günlük/haftalık/aylık)
- Veri saklama süresi (30/60/90/180 gün/sınırsız)
- Eski verileri arşivleme

---

## 🔔 Bildirimler Sayfası

**Bildirim Merkezi:**
- Okunmamış bildirimler (badge ile sayı)
- Tüm bildirimler
- Arşivlenmiş bildirimler

**Bildirim Tipleri:**
1. **Acil Müşteri Bildirimi** (🔴)
   - "Yeni acil aksiyona ihtiyaç duyan müşteri"
   - Müşteri adı ve platforma yönlendirme

2. **Sistem Bildirimi** (ℹ️)
   - "Platform bağlantısı başarısız"
   - "Yeni güncelleme mevcut"

3. **Başarı Bildirimi** (✅)
   - "Başarılı etkileşim gerçekleşti"
   - Özet bilgi

4. **Uyarı Bildirimi** (⚠️)
   - "Webhook hatası"
   - "Rate limit aşıldı"

**Bildirim İşlemleri:**
- Okundu olarak işaretle
- Arşivle
- Sil
- Tümünü okundu işaretle

---

## 🗄️ Veritabanı Yapısı (Supabase)

### Tablolar ve İlişkiler

#### 1. **customers**
Müşteri temel bilgileri tablosu.

```sql
- id (uuid, primary key)
- first_name (text)
- last_name (text)
- phone (text, unique)
- email (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
- last_interaction_date (timestamp)
- total_interactions (integer, default: 0)
- status (text: active/inactive/completed)
```

#### 2. **chatbot_conversations**
Chatbot konuşmaları tablosu.

```sql
- id (uuid, primary key)
- customer_id (uuid, foreign key -> customers.id)
- platform_id (uuid, foreign key -> platforms.id)
- platform_type (text: whatsapp/facebook/instagram/webchat/telegram)
- conversation_data (jsonb) // Mesaj geçmişi
- summary (text) // AI özeti
- category_id (uuid, foreign key -> categories.id)
- status (text: active/completed/abandoned)
- collected_data (jsonb) // İsim, telefon, randevu vs.
- tags (text[]) // Etiketler array
- priority (text: low/medium/high/urgent)
- created_at (timestamp)
- updated_at (timestamp)
- first_message_at (timestamp)
- last_message_at (timestamp)
- message_count (integer)
```

#### 3. **voice_conversations**
Sesli konuşmalar tablosu.

```sql
- id (uuid, primary key)
- customer_id (uuid, foreign key -> customers.id)
- call_direction (text: incoming/outgoing)
- phone_number (text)
- duration_seconds (integer)
- recording_url (text) // Ses kaydı URL
- transcript (text) // Konuşma transcript
- summary (text) // AI özeti
- category_id (uuid, foreign key -> categories.id)
- call_status (text: answered/missed/failed/completed)
- collected_data (jsonb)
- tags (text[])
- priority (text: low/medium/high/urgent)
- created_at (timestamp)
- updated_at (timestamp)
- call_started_at (timestamp)
- call_ended_at (timestamp)
```

#### 4. **platforms**
Platform yönetimi tablosu.

```sql
- id (uuid, primary key)
- platform_name (text) // WhatsApp, Facebook vb.
- platform_type (text: chatbot/voice_agent)
- is_active (boolean, default: true)
- webhook_url (text)
- api_key (text, encrypted)
- icon_url (text)
- settings (jsonb) // Platform özel ayarlar
- created_at (timestamp)
- updated_at (timestamp)
- last_sync_at (timestamp)
```

#### 5. **categories**
Kategori tanımları tablosu.

```sql
- id (uuid, primary key)
- name (text)
- description (text)
- color (text) // Hex color code
- icon (text) // Emoji veya icon adı
- sort_order (integer)
- is_active (boolean, default: true)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. **notes**
Manuel notlar tablosu.

```sql
- id (uuid, primary key)
- customer_id (uuid, foreign key -> customers.id)
- conversation_id (uuid, nullable) // chatbot veya voice
- conversation_type (text: chatbot/voice)
- user_id (uuid, foreign key -> users.id)
- note_content (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 7. **users**
Sistem kullanıcıları tablosu.

```sql
- id (uuid, primary key)
- email (text, unique)
- password_hash (text)
- first_name (text)
- last_name (text)
- role (text: admin/manager/user)
- is_active (boolean, default: true)
- permissions (jsonb) // Özel izinler
- last_login_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 8. **notifications**
Bildirimler tablosu.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users.id)
- type (text: urgent/system/success/warning)
- title (text)
- message (text)
- link_url (text, nullable)
- is_read (boolean, default: false)
- is_archived (boolean, default: false)
- created_at (timestamp)
- read_at (timestamp, nullable)
```

#### 9. **webhook_logs**
Webhook geçmişi tablosu.

```sql
- id (uuid, primary key)
- platform_id (uuid, foreign key -> platforms.id)
- request_data (jsonb)
- response_data (jsonb)
- status_code (integer)
- success (boolean)
- error_message (text, nullable)
- created_at (timestamp)
```

#### 10. **tags**
Etiket yönetimi tablosu.

```sql
- id (uuid, primary key)
- name (text, unique)
- color (text)
- usage_count (integer, default: 0)
- created_at (timestamp)
```

---

### Veritabanı İlişkileri

```
customers (1) ----< (n) chatbot_conversations
customers (1) ----< (n) voice_conversations
customers (1) ----< (n) notes

platforms (1) ----< (n) chatbot_conversations
platforms (1) ----< (n) webhook_logs

categories (1) ----< (n) chatbot_conversations
categories (1) ----< (n) voice_conversations

users (1) ----< (n) notes
users (1) ----< (n) notifications
```

---

## 🔄 n8n Entegrasyon Akışı

### Webhook Endpoint Yapısı

**Chatbot Platform Webhook Örneği:**
```
POST /api/webhook/whatsapp
Content-Type: application/json

{
  "customer": {
    "first_name": "Ahmet",
    "last_name": "Yılmaz",
    "phone": "+905551234567",
    "email": "ahmet@example.com"
  },
  "conversation": {
    "messages": [
      {
        "sender": "customer",
        "message": "Merhaba, randevu almak istiyorum",
        "timestamp": "2025-02-02T10:30:00Z"
      },
      {
        "sender": "bot",
        "message": "Tabii, hangi tarih için randevu almak istersiniz?",
        "timestamp": "2025-02-02T10:30:05Z"
      }
    ],
    "summary": "Müşteri randevu talebi iletti.",
    "category": "appointment_request",
    "status": "pending"
  },
  "collected_data": {
    "appointment_date": "2025-02-05",
    "appointment_time": "14:00",
    "service_type": "Genel Muayene"
  },
  "metadata": {
    "platform": "whatsapp",
    "conversation_id": "conv_12345",
    "started_at": "2025-02-02T10:30:00Z",
    "ended_at": "2025-02-02T10:35:00Z"
  }
}
```

**Sesli AI Agent Webhook Örneği:**
```
POST /api/webhook/voice-agent
Content-Type: application/json

{
  "customer": {
    "first_name": "Ayşe",
    "last_name": "Demir",
    "phone": "+905559876543",
    "email": null
  },
  "call": {
    "direction": "incoming",
    "duration_seconds": 180,
    "recording_url": "https://storage.example.com/recordings/call_67890.mp3",
    "transcript": "Müşteri: Merhaba, fiyat bilgisi almak istiyorum...",
    "summary": "Müşteri ürün fiyatları hakkında bilgi aldı.",
    "category": "information_request",
    "status": "completed",
    "call_started_at": "2025-02-02T11:00:00Z",
    "call_ended_at": "2025-02-02T11:03:00Z"
  },
  "collected_data": {
    "interest": "Premium Paket",
    "budget": "5000-7000 TL",
    "follow_up_needed": true
  },
  "metadata": {
    "call_id": "call_67890",
    "agent_version": "v2.1"
  }
}
```

---

### n8n Workflow Adımları

**1. Webhook Alındığında:**
- Gelen veriyi parse et
- Müşteri var mı kontrol et (telefon numarasına göre)
  - Yoksa: Yeni müşteri oluştur
  - Varsa: Mevcut müşteriyi güncelle

**2. Konuşma/Arama Kaydı Oluştur:**
- chatbot_conversations veya voice_conversations tablosuna ekle
- customer_id ile ilişkilendir

**3. Kategori Eşleştirme:**
- Gelen kategoriyi categories tablosundan bul
- Eşleştirme yap

**4. Supabase'e Kaydet:**
- Transaction ile tüm verileri kaydet
- Hata durumunda rollback

**5. Realtime Güncelleme:**
- Supabase Realtime ile frontend'e bildirim gönder
- Dashboard otomatik güncellenir

**6. Bildirim Gönderimi:**
- Eğer kategori "Acil Aksiyona İhtiyaç Var" ise
  - notifications tablosuna kayıt ekle
  - Email/Push notification gönder

---

## 🎨 Tasarım ve Teknoloji Önerileri

### Frontend Teknoloji Stack

**Framework:**
- React.js (v18+)
- React Router (sayfa yönlendirme)

**Styling:**
- Tailwind CSS (utility-first CSS)
- Headless UI veya shadcn/ui (component library)

**State Management:**
- React Context API veya Zustand (basit ve performanslı)

**Grafik Kütüphanesi:**
- Recharts (kolay kullanım, özelleştirilebilir)
- Alternatif: Chart.js, Apache ECharts

**Form Yönetimi:**
- React Hook Form + Zod (validation)

**Tablo Component:**
- TanStack Table (eski adıyla React Table)

**Diğer Kütüphaneler:**
- Axios (HTTP istekleri)
- date-fns veya Day.js (tarih işlemleri)
- React Toastify (bildirimler)
- Framer Motion (animasyonlar)

---

### Backend ve Veritabanı

**Veritabanı:**
- Supabase PostgreSQL
- Supabase Realtime (canlı güncellemeler)
- Supabase Auth (kullanıcı kimlik doğrulama)

**API:**
- Supabase REST API
- Supabase JavaScript Client

**Dosya Depolama:**
- Supabase Storage (ses kayıtları için)

---

### Renk Paleti Önerisi

**Ana Renkler:**
- Primary: #3B82F6 (Mavi - CTA'lar, linkler)
- Secondary: #8B5CF6 (Mor - vurgular)
- Success: #10B981 (Yeşil - başarılı işlemler)
- Warning: #F59E0B (Sarı - uyarılar)
- Danger: #EF4444 (Kırmızı - hatalar, acil)
- Info: #06B6D4 (Cyan - bilgilendirme)

**Nötr Renkler:**
- Gray-50: #F9FAFB
- Gray-100: #F3F4F6
- Gray-200: #E5E7EB
- Gray-500: #6B7280
- Gray-700: #374151
- Gray-900: #111827

**Koyu Tema:**
- Background: #0F172A
- Surface: #1E293B
- Text: #F1F5F9

---

### Responsive Breakpoints

```
sm: 640px   // Mobil (landscape)
md: 768px   // Tablet
lg: 1024px  // Küçük laptop
xl: 1280px  // Desktop
2xl: 1536px // Büyük ekran
```

**Mobil Öncelikli Tasarım:**
- Tüm sayfalar mobil uyumlu
- Sidebar → Hamburger menü (mobilde)
- Tablolar → Kartlara dönüşür (mobilde)
- Grafikler → Scroll edilebilir/responsive

---

## 🔐 Güvenlik ve Yetkilendirme

### Kimlik Doğrulama

**Login Sayfası:**
- Email/şifre ile giriş
- "Beni hatırla" seçeneği
- Şifremi unuttum linki
- Supabase Auth kullanımı

**Güvenlik Özellikleri:**
- JWT token tabanlı authentication
- Refresh token mekanizması
- Session timeout (30 dakika hareketsizlik)
- Brute force koruması (5 başarısız denemeden sonra geçici engelleme)

### Rol Bazlı Erişim Kontrolü (RBAC)

**Admin Yetkileri:**
- Tüm sayfalara erişim ✅
- Kullanıcı ekleme/silme/düzenleme ✅
- Platform ekleme/silme ✅
- Sistem ayarları değiştirme ✅
- Tüm raporları görüntüleme ✅
- Veritabanı yönetimi ✅

**Yönetici Yetkileri:**
- Dashboard görüntüleme ✅
- Müşteri detaylarını görüntüleme/düzenleme ✅
- Kategori güncelleme ✅
- Not ekleme/düzenleme ✅
- Raporları görüntüleme/export ✅
- Platform ayarlarını görüntüleme ❌
- Kullanıcı yönetimi ❌

**Kullanıcı Yetkileri:**
- Dashboard görüntüleme (sadece okuma) ✅
- Müşteri detaylarını görüntüleme ✅
- Not ekleme ✅
- Kategori güncelleme ❌
- Müşteri silme ❌
- Raporları görüntüleme ✅
- Export ❌

---

## 📱 Responsive Davranış

### Mobil Görünüm (< 768px)

**Sidebar:**
- Hamburger menü ile açılır/kapanır
- Overlay ile ekranı kaplar
- Menü dışına tıklamada kapanır

**KPI Kartları:**
- 2x2 grid (4 kart)
- Mobilde dikey stack

**Tablolar:**
- Kart görünümüne dönüşür
- Her satır → Bir kart
- Önemli bilgiler üstte
- "Detay Görüntüle" butonu

**Grafikler:**
- Yatay scroll
- Dokunmatik kontroller
- Daha büyük touch target'lar

**Müşteri Detay:**
- Tek sütun layout
- Sekmelere bölünmüş içerik
- Sticky header

### Tablet Görünüm (768px - 1024px)

**Sidebar:**
- Collapsed (ikon only) mod
- Hover'da genişler

**Grid Layout:**
- 2 sütun
- Grafiklerin boyutu optimize

**Tablolar:**
- Tam tablo görünümü
- Scroll bar ile yatay kaydırma

---

## ⚡ Performans Optimizasyonu

**Frontend:**
- Code splitting (React.lazy)
- Image lazy loading
- Debounce/throttle (arama, filtreleme)
- Memoization (React.memo, useMemo)
- Virtual scrolling (büyük listeler için)

**Veritabanı:**
- Index'ler (phone, email, created_at, category_id)
- Query optimization
- Pagination (infinite scroll veya sayfalama)

**Caching:**
- Supabase cache
- Browser cache
- Service Worker (offline destek - opsiyonel)

**Realtime:**
- Supabase Realtime sadece gerekli tablolar için
- WebSocket bağlantı yönetimi
- Reconnection logic

---

## 🧪 Test Senaryoları

### Kritik Akışlar

**1. Yeni Müşteri Kaydı (Chatbot):**
- n8n webhook gönderir
- Müşteri oluşturulur
- Konuşma kaydedilir
- Dashboard'da görünür
- Bildirim gelir (eğer acil ise)

**2. Yeni Arama Kaydı (Voice Agent):**
- n8n webhook gönderir
- Ses kaydı storage'a yüklenir
- Transcript oluşturulur
- Müşteri güncellenir
- Dashboard'da görünür

**3. Kategori Güncelleme:**
- Kullanıcı kategori değiştirir
- Veritabanı güncellenir
- Realtime ile diğer kullanıcılara yansır
- Grafiklerde güncelleme

**4. Platform Aktif/Pasif:**
- Admin platform'u pasif yapar
- Dashboard'da gizlenir
- Webhook devre dışı kalır
- Filtreleme menüsünden kaldırılır

**5. Rapor Export:**
- Kullanıcı tarih aralığı seçer
- Filtreler uygular
- Export butonuna tıklar
- PDF/Excel indirilir

---

## 📋 Ekstra Özellikler (İsteğe Bağlı)

**1. Otomatik Kategorileme:**
- AI/ML ile konuşma içeriğinden otomatik kategori öneri
- Manuel onay sonrası uygulama

**2. Sentiment Analizi:**
- Müşteri memnuniyeti skoru
- Pozitif/Negatif/Nötr etiketleme
- Grafiklerde gösterim

**3. Akıllı Öneri Sistemi:**
- "Bu müşteri için önerilen aksiyon: Geri arama"
- Geçmiş verilere dayalı tahminler

**4. Entegrasyon Modülü:**
- Google Calendar (randevular için)
- Slack/Teams (bildirimler için)
- CRM sistemleri (Salesforce, HubSpot)

**5. Multi-tenancy:**
- Birden fazla işletme yönetimi
- İşletme bazlı izolasyon
- Alt alan adı yapısı (company1.flowasistan.com)

**6. API Dökümantasyonu:**
- Developer portal
- API key yönetimi
- Webhook test arayüzü

**7. Mobil Uygulama:**
- React Native ile iOS/Android
- Push notification
- Offline destek

**8. Voice Player Gelişmiş Özellikler:**
- Önemli anları işaretleme
- Konuşma içi arama (transcript'te kelime arama)
- Paylaş özelliği

**9. Bulk İşlemler:**
- Toplu kategori güncelleme
- Toplu etiket ekleme
- Toplu export

**10. Advanced Filtreleme:**
- Çoklu filtre kombinasyonları
- Kayıtlı filtre setleri
- Akıllı filtre önerileri

---

## 🚀 Proje Teslim Gereksinimleri

### Çıktılar

**1. Tam Fonksiyonel Web Uygulaması:**
- Responsive tasarım (mobil/tablet/desktop)
- Tüm özellikler çalışır durumda
- Cross-browser uyumlu (Chrome, Firefox, Safari, Edge)

**2. Veritabanı:**
- Supabase proje kurulumu
- Tüm tablolar oluşturulmuş
- Row Level Security (RLS) politikaları
- Seed data (örnek veriler)

**3. Webhook Endpoint'leri:**
- Tüm platform webhook'ları hazır
- Test edilmiş
- Error handling

**4. Dökümantasyon:**
- Teknik döküman
- Kullanıcı kılavuzu
- API dökümantasyonu
- Deployment rehberi

**5. Deployment:**
- Vercel/Netlify (frontend)
- Supabase (backend/database)
- Domain bağlantısı
- SSL sertifikası

---

## 📞 İletişim ve Destek

**Proje İletişimi:**
- Düzenli ilerleme raporları
- Weekly demo/review toplantıları
- Bug tracking sistemi
- Feedback döngüsü

**Revizyon Hakkı:**
- 2 major revizyon
- Unlimited minor bug fix

**Destek Süresi:**
- 1 ay ücretsiz destek
- Bug fix garantisi
- Minor güncelleme desteği

---

## ✅ Proje Başarı Kriterleri

1. ✅ Tüm dashboard'lar çalışıyor ve doğru veri gösteriyor
2. ✅ Webhook entegrasyonları sorunsuz çalışıyor
3. ✅ Realtime güncellemeler anında yansıyor
4. ✅ Responsive tasarım tüm cihazlarda düzgün görünüyor
5. ✅ Kullanıcı yetkilendirme sistemi çalışıyor
6. ✅ Raporlar doğru export ediliyor
7. ✅ Ses kayıtları oynatılabiliyor
8. ✅ Kategori sistemi esnek ve özelleştirilebilir
9. ✅ Platform ekleme/çıkarma dinamik çalışıyor
10. ✅ Performans optimize (3 saniyeden hızlı sayfa yüklenmeleri)

---

## 📝 Notlar

- Bu dokümantasyon antigravity veya geliştirici ekip için hazırlanmıştır
- Tüm özellikler detaylı açıklanmıştır
- Eksik veya belirsiz nokta yoktur
- Veritabanı şeması net tanımlanmıştır
- API endpoint'leri örneklerle açıklanmıştır
- Tasarım kılavuzu verilmiştir

**Proje süresince ihtiyaç duyulabilecek tüm teknik detaylar bu dokümanda mevcuttur.**

---

**Proje Adı:** FlowAsistan  
**Versiyon:** 1.0  
**Tarih:** 02 Şubat 2025  
**Hazırlayan:** Claude AI  

---

*Bu dokümantasyon, FlowAsistan projesinin eksiksiz teknik şartnamesini içermektedir. Antigravity veya geliştirme ekibi bu doküman üzerinden projeyi tam olarak geliştirebilir.*
