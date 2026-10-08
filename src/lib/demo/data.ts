// Seed data for demo mode. Everything here is fictional: a sample clinic ("Lumina Klinik")
// using FlowAsistan. Text fields are stored in both languages and resolved on read.

export interface L10n { tr: string; en: string }
export const L = (tr: string, en: string): L10n => ({ tr, en });

export type Row = Record<string, any>;
export type DemoDb = Record<string, Row[]>;

const MIN = 60_000;
const ago = (minutes: number) => new Date(Date.now() - minutes * MIN).toISOString();

let idCounter = 0;
export const newId = () => {
    idCounter += 1;
    return `demo-${idCounter.toString().padStart(4, '0')}-${Math.random().toString(36).slice(2, 8)}`;
};

// Deterministic pseudo-random so the demo looks the same on every visit
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

export const CATEGORIES = [
    { key: 'success', name: L('Başarılı/Tamamlandı', 'Successful'), description: L('Randevu alındı, satış gerçekleşti, sorun çözüldü', 'Appointment booked, sale closed, issue resolved'), color: '#10B981' },
    { key: 'pending', name: L('Beklemede', 'Pending'), description: L('Müşteri düşünüyor, geri dönüş bekliyor', 'Customer is deciding, waiting for a reply'), color: '#F59E0B' },
    { key: 'urgent', name: L('Acil Aksiyona İhtiyaç Var', 'Needs Urgent Action'), description: L('Şikayet var, sorun çözülmedi, memnuniyetsiz', 'Complaint, unresolved issue, unhappy customer'), color: '#EF4444' },
    { key: 'negative', name: L('Olumsuz Sonuçlandı', 'Closed – Lost'), description: L('İptal, satış olmadı, ilgilenmiyor', 'Cancelled, no sale, not interested'), color: '#6B7280' },
    { key: 'callback', name: L('Geri Arama Talebi', 'Callback Requested'), description: L('İnsan ile görüşmek istiyor', 'Wants to talk to a person'), color: '#3B82F6' },
    { key: 'info', name: L('Bilgi Talebi', 'Information Request'), description: L('Sadece bilgi aldı, karar aşamasında değil', 'Only asked for information'), color: '#8B5CF6' },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];
const categoryId = (key: CategoryKey) => `cat-${key}`;

const CUSTOMERS: [string, string, string, string | null][] = [
    ['Elif', 'Kaya', '+90 555 010 11 01', 'elif.kaya@example.com'],
    ['Mert', 'Demir', '+90 555 010 11 02', null],
    ['Zeynep', 'Arslan', '+90 555 010 11 03', 'zeynep.arslan@example.com'],
    ['Can', 'Öztürk', '+90 555 010 11 04', null],
    ['Selin', 'Yıldız', '+90 555 010 11 05', 'selin.yildiz@example.com'],
    ['Burak', 'Şahin', '+90 555 010 11 06', null],
    ['Ayşe', 'Çelik', '+90 555 010 11 07', 'ayse.celik@example.com'],
    ['Emre', 'Aydın', '+90 555 010 11 08', null],
    ['Deniz', 'Koç', '+90 555 010 11 09', 'deniz.koc@example.com'],
    ['Gizem', 'Polat', '+90 555 010 11 10', null],
    ['Onur', 'Kurt', '+90 555 010 11 11', 'onur.kurt@example.com'],
    ['Naz', 'Erdem', '+90 555 010 11 12', null],
    ['Hakan', 'Özkan', '+90 555 010 11 13', null],
    ['Derya', 'Aksoy', '+90 555 010 11 14', 'derya.aksoy@example.com'],
];
const customerId = (index: number) => `cus-${(index + 1).toString().padStart(2, '0')}`;

type Msg = ['u' | 'a', L10n];
interface ConversationSeed {
    customer: number;
    platform: 'whatsapp' | 'instagram' | 'telegram' | 'webchat';
    category: CategoryKey;
    status: 'active' | 'completed' | 'abandoned';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    minutesAgo: number;
    summary: L10n;
    messages: Msg[];
}

const CONVERSATIONS: ConversationSeed[] = [
    {
        customer: 0, platform: 'whatsapp', category: 'success', status: 'completed', priority: 'medium', minutesAgo: 6,
        summary: L('Diş beyazlatma için bilgi aldı. Perşembe 14:00 için randevu oluşturuldu, onay mesajı gönderildi.', 'Asked about teeth whitening. Appointment booked for Thursday 2:00 PM and a confirmation was sent.'),
        messages: [
            ['u', L('Merhaba, diş beyazlatma yaptırmak istiyorum. Fiyat ve süre hakkında bilgi alabilir miyim?', 'Hi, I would like to get my teeth whitened. Can I get some info on price and duration?')],
            ['a', L('Merhaba Elif Hanım! Ofis tipi beyazlatma tek seansta yaklaşık 45 dakika sürüyor. Muayene sonrası net fiyat veriyoruz; dilerseniz ücretsiz ön muayene için randevu oluşturabilirim.', 'Hello Elif! In-office whitening takes about 45 minutes in a single session. We give an exact price after an exam; I can book a free consultation if you like.')],
            ['u', L('Olur, bu hafta perşembe öğleden sonra uygun musunuz?', 'Sure, are you available Thursday afternoon this week?')],
            ['a', L('Perşembe 14:00 ve 16:30 boş görünüyor. Hangisini tercih edersiniz?', 'Thursday 2:00 PM and 4:30 PM are open. Which one do you prefer?')],
            ['u', L('14:00 olsun.', 'Let’s do 2:00 PM.')],
            ['a', L('Randevunuz perşembe 14:00 için oluşturuldu. Bir gün önce hatırlatma mesajı göndereceğim. Görüşmek üzere!', 'Your appointment is booked for Thursday at 2:00 PM. I will send a reminder the day before. See you then!')],
        ],
    },
    {
        customer: 1, platform: 'instagram', category: 'callback', status: 'active', priority: 'high', minutesAgo: 14,
        summary: L('İmplant tedavisi için taksit seçeneklerini sordu. Detayları bir yetkiliyle telefonda konuşmak istiyor.', 'Asked about payment plans for an implant treatment. Wants to discuss the details with a staff member by phone.'),
        messages: [
            ['u', L('İmplant fiyatlarınız nedir? Taksit yapıyor musunuz?', 'What are your implant prices? Do you offer payment plans?')],
            ['a', L('Merhaba! İmplant ücreti kullanılacak markaya ve kemik durumuna göre değişiyor. Anlaşmalı kartlara 6 aya kadar taksit imkânımız var.', 'Hello! Implant pricing depends on the brand and bone condition. We offer up to 6 installments with partner cards.')],
            ['u', L('İki implant düşünüyorum, biriyle telefonda konuşabilir miyim?', 'I am considering two implants, can I talk to someone on the phone?')],
            ['a', L('Elbette. Hasta danışmanımızın sizi araması için talebinizi oluşturdum. Size hangi saat aralığında ulaşalım?', 'Of course. I have created a request for our patient coordinator to call you. What time works best?')],
            ['u', L('Bugün 15:00’ten sonra uygunum.', 'I am available today after 3:00 PM.')],
            ['a', L('Not aldım, bugün 15:00’ten sonra aranacaksınız.', 'Noted, you will get a call today after 3:00 PM.')],
        ],
    },
    {
        customer: 2, platform: 'whatsapp', category: 'urgent', status: 'active', priority: 'urgent', minutesAgo: 23,
        summary: L('Dolgu sonrası iki gündür ağrısı olduğunu ve kimsenin dönüş yapmadığını söyledi. Acil geri dönüş bekliyor.', 'Reports two days of pain after a filling and says nobody got back to her. Expects an urgent follow-up.'),
        messages: [
            ['u', L('İki gün önce dolgu yaptırdım, ağrım hâlâ geçmedi. Dün de yazdım kimse dönmedi.', 'I had a filling two days ago and the pain is still there. I wrote yesterday too and nobody replied.')],
            ['a', L('Zeynep Hanım, yaşadığınız durum için çok üzgünüm. Ağrınız sıcak-soğukta mı artıyor, yoksa sürekli mi?', 'Zeynep, I am very sorry about this. Does the pain get worse with hot or cold, or is it constant?')],
            ['u', L('Sürekli zonkluyor, gece uyuyamadım.', 'It throbs constantly, I could not sleep last night.')],
            ['a', L('Anlıyorum. Durumunuzu acil olarak hekiminize iletiyorum ve bugün için öncelikli kontrol talebi açtım. Kliniğimiz sizi en kısa sürede arayacak.', 'I understand. I am escalating this to your dentist as urgent and have opened a priority check-up request for today. The clinic will call you as soon as possible.')],
            ['u', L('Lütfen bugün arayın.', 'Please call me today.')],
        ],
    },
    {
        customer: 3, platform: 'webchat', category: 'info', status: 'completed', priority: 'low', minutesAgo: 41,
        summary: L('Çalışma saatlerini ve adresi sordu. Bilgi verildi, randevu talebi olmadı.', 'Asked about opening hours and address. Information provided, no appointment requested.'),
        messages: [
            ['u', L('Cumartesi açık mısınız?', 'Are you open on Saturdays?')],
            ['a', L('Evet, cumartesi 09:00–15:00 arası hizmet veriyoruz. Hafta içi 09:00–19:00 açığız.', 'Yes, we are open Saturdays 9:00 AM–3:00 PM, and weekdays 9:00 AM–7:00 PM.')],
            ['u', L('Adresiniz nerede?', 'Where are you located?')],
            ['a', L('Kadıköy, Bağdat Caddesi üzerindeyiz; konumu buradan paylaşıyorum. Otoparkımız mevcut.', 'We are on Bağdat Avenue in Kadıköy; I am sharing the location here. Parking is available.')],
        ],
    },
    {
        customer: 4, platform: 'telegram', category: 'pending', status: 'active', priority: 'medium', minutesAgo: 70,
        summary: L('Şeffaf plak tedavisi için fiyat aralığı aldı. Eşiyle konuşup dönüş yapacağını söyledi.', 'Received a price range for clear aligners. Said she will talk to her spouse and get back.'),
        messages: [
            ['u', L('Şeffaf plak tedavisi ne kadar sürüyor?', 'How long does clear aligner treatment take?')],
            ['a', L('Vakaya göre 6–18 ay arasında değişiyor. Ücretsiz dijital tarama ile size özel süre ve fiyat planı çıkarabiliyoruz.', 'It ranges from 6 to 18 months depending on the case. With a free digital scan we can prepare a personal timeline and price plan.')],
            ['u', L('Fiyat aralığı nedir?', 'What is the price range?')],
            ['a', L('Ortalama fiyat aralığını ilettim. Tarama için randevu oluşturmamı ister misiniz?', 'I have shared the typical price range. Would you like me to book a scan?')],
            ['u', L('Eşimle konuşup size döneceğim.', 'I will talk to my spouse and get back to you.')],
        ],
    },
    {
        customer: 5, platform: 'whatsapp', category: 'callback', status: 'active', priority: 'high', minutesAgo: 110,
        summary: L('Özel sağlık sigortasının kanal tedavisini karşılayıp karşılamadığını sordu. 17:00’den sonra aranmak istiyor.', 'Asked whether his private insurance covers root canal treatment. Wants a call after 5:00 PM.'),
        messages: [
            ['u', L('Özel sigortam var, kanal tedavisini karşılıyor mu?', 'I have private insurance, does it cover a root canal?')],
            ['a', L('Anlaşmalı olduğumuz sigortalar için provizyon alabiliyoruz. Sigorta şirketinizi ve poliçe numaranızı paylaşırsanız kontrol ettirebilirim.', 'We can get pre-approval for our partner insurers. If you share your insurer and policy number, I can have it checked.')],
            ['u', L('Şu an işteyim, 17:00’den sonra arayabilir misiniz?', 'I am at work right now, can you call me after 5:00 PM?')],
            ['a', L('Tabii, 17:00 sonrası için geri arama talebinizi oluşturdum.', 'Sure, I have created a callback request for after 5:00 PM.')],
        ],
    },
    {
        customer: 6, platform: 'instagram', category: 'success', status: 'completed', priority: 'low', minutesAgo: 150,
        summary: L('Mevcut randevusunu salıdan cumaya erteledi. Yeni saat onaylandı.', 'Rescheduled her existing appointment from Tuesday to Friday. New time confirmed.'),
        messages: [
            ['u', L('Salı günkü randevumu erteleyebilir miyim?', 'Can I reschedule my Tuesday appointment?')],
            ['a', L('Elbette Ayşe Hanım. Cuma 11:00 veya 15:30 uygun, hangisini istersiniz?', 'Of course, Ayşe. Friday 11:00 AM or 3:30 PM is available, which do you prefer?')],
            ['u', L('Cuma 11:00 lütfen.', 'Friday 11:00 AM please.')],
            ['a', L('Randevunuz cuma 11:00 olarak güncellendi.', 'Your appointment has been moved to Friday 11:00 AM.')],
        ],
    },
    {
        customer: 7, platform: 'webchat', category: 'negative', status: 'completed', priority: 'low', minutesAgo: 200,
        summary: L('Zirkonyum kaplama fiyatını yüksek buldu, şimdilik ilgilenmediğini belirtti.', 'Found the zirconia crown price too high and said he is not interested for now.'),
        messages: [
            ['u', L('Zirkonyum kaplama diş başı ne kadar?', 'How much is a zirconia crown per tooth?')],
            ['a', L('Diş başı fiyat bilgisini ilettim. Muayenede size özel bir plan da çıkarabiliriz.', 'I have shared the per-tooth price. We can also prepare a personal plan at an exam.')],
            ['u', L('Bütçemi aşıyor, şimdilik düşünmüyorum. Teşekkürler.', 'That is over my budget, I will pass for now. Thanks.')],
            ['a', L('Anlıyorum, ilginiz için teşekkür ederiz. Kampanya dönemlerinde size haber vermemizi ister misiniz?', 'Understood, thank you for your interest. Would you like us to notify you during campaigns?')],
        ],
    },
    {
        customer: 8, platform: 'whatsapp', category: 'success', status: 'completed', priority: 'medium', minutesAgo: 240,
        summary: L('Yıllık kontrol ve diş taşı temizliği için pazartesi 10:30 randevusu aldı.', 'Booked an annual check-up and scaling for Monday 10:30 AM.'),
        messages: [
            ['u', L('Diş taşı temizliği için randevu almak istiyorum.', 'I would like to book a scaling appointment.')],
            ['a', L('Memnuniyetle. Pazartesi 10:30 ya da çarşamba 17:00 uygun.', 'Gladly. Monday 10:30 AM or Wednesday 5:00 PM is available.')],
            ['u', L('Pazartesi 10:30 olur.', 'Monday 10:30 works.')],
            ['a', L('Randevunuz oluşturuldu. Kontrol muayenesi de aynı seansta yapılacak.', 'Your appointment is booked. The check-up will be done in the same session.')],
        ],
    },
    {
        customer: 9, platform: 'whatsapp', category: 'info', status: 'completed', priority: 'low', minutesAgo: 300,
        summary: L('İlk muayenede gerekli belgeleri ve otopark durumunu sordu.', 'Asked which documents are needed for the first visit and about parking.'),
        messages: [
            ['u', L('İlk gelişte yanımda ne getirmeliyim?', 'What should I bring to my first visit?')],
            ['a', L('Kimliğiniz yeterli. Varsa eski röntgenlerinizi de getirebilirsiniz.', 'Your ID is enough. If you have previous X-rays, feel free to bring them.')],
            ['u', L('Teşekkürler.', 'Thanks.')],
        ],
    },
    {
        customer: 10, platform: 'telegram', category: 'callback', status: 'active', priority: 'medium', minutesAgo: 390,
        summary: L('Şirket çalışanları için kurumsal anlaşma koşullarını sordu. Yetkiliyle görüşmek istiyor.', 'Asked about corporate agreement terms for his company’s employees. Wants to speak with a manager.'),
        messages: [
            ['u', L('40 kişilik bir ekibimiz var, kurumsal anlaşma yapıyor musunuz?', 'We have a team of 40, do you offer corporate agreements?')],
            ['a', L('Evet, kurumsal anlaşmalarımız mevcut. Detaylar için kurumsal ilişkiler sorumlumuzun sizi aramasını sağlayabilirim.', 'Yes, we do. I can have our corporate relations manager call you with the details.')],
            ['u', L('Olur, yarın öğleden önce arasınlar.', 'OK, have them call tomorrow before noon.')],
            ['a', L('Talebinizi yarın 12:00 öncesi için oluşturdum.', 'I have created the request for tomorrow before 12:00.')],
        ],
    },
    {
        customer: 11, platform: 'instagram', category: 'pending', status: 'active', priority: 'low', minutesAgo: 480,
        summary: L('Gülüş tasarımı fiyatlarını sordu, kampanya dönemini bekleyeceğini söyledi.', 'Asked about smile design pricing and said she will wait for a campaign.'),
        messages: [
            ['u', L('Gülüş tasarımı kampanyanız var mı?', 'Do you have a smile design campaign?')],
            ['a', L('Şu an aktif bir kampanyamız yok, ancak ay sonunda duyurulacak. Ön görüşme için ücretsiz randevu oluşturabilirim.', 'There is no active campaign right now, but one will be announced at the end of the month. I can book a free consultation.')],
            ['u', L('Kampanyayı bekleyeceğim, haber verirseniz sevinirim.', 'I will wait for the campaign, please let me know.')],
        ],
    },
];

// Conversations that "arrive" while the demo is open, to show the realtime feed
export const INCOMING: (Omit<ConversationSeed, 'customer' | 'minutesAgo'> & { customer: [string, string, string] })[] = [
    {
        customer: ['Kerem', 'Tuna', '+90 555 010 11 21'], platform: 'whatsapp', category: 'callback', status: 'active', priority: 'high',
        summary: L('Çocuğu için ortodonti muayenesi sordu; ödeme detaylarını telefonda görüşmek istiyor.', 'Asked about an orthodontic exam for his child; wants to discuss payment details by phone.'),
        messages: [
            ['u', L('Kızım 11 yaşında, tel taktırmak için ne zaman gelmeliyiz?', 'My daughter is 11, when should we come in for braces?')],
            ['a', L('Bu yaş ortodonti değerlendirmesi için çok uygun. Ücretsiz ilk muayene için randevu oluşturabilirim.', 'That is a great age for an orthodontic evaluation. I can book a free first exam.')],
            ['u', L('Önce ödeme seçeneklerini biriyle konuşmak istiyorum.', 'I would like to talk to someone about payment options first.')],
            ['a', L('Elbette, hasta danışmanımızın sizi araması için talep oluşturdum.', 'Of course, I have created a request for our patient coordinator to call you.')],
        ],
    },
    {
        customer: ['İrem', 'Savaş', '+90 555 010 11 22'], platform: 'webchat', category: 'success', status: 'completed', priority: 'medium',
        summary: L('Web sitesinden yazdı; yarın 09:30 için kontrol randevusu oluşturuldu.', 'Wrote from the website; a check-up was booked for tomorrow 9:30 AM.'),
        messages: [
            ['u', L('Yarın sabah için boş randevunuz var mı?', 'Do you have any openings tomorrow morning?')],
            ['a', L('Yarın 09:30 ve 11:00 uygun.', 'Tomorrow 9:30 AM and 11:00 AM are available.')],
            ['u', L('09:30 lütfen.', '9:30 AM please.')],
            ['a', L('Randevunuz oluşturuldu, görüşmek üzere!', 'Your appointment is booked, see you then!')],
        ],
    },
    {
        customer: ['Tolga', 'Bulut', '+90 555 010 11 23'], platform: 'instagram', category: 'info', status: 'active', priority: 'low',
        summary: L('Diş eti tedavisi hakkında genel bilgi aldı.', 'Got general information about gum treatment.'),
        messages: [
            ['u', L('Diş eti çekilmesi tedavi edilebiliyor mu?', 'Can gum recession be treated?')],
            ['a', L('Evet, nedenine göre farklı tedavi seçenekleri var. Muayene ile en doğru yöntemi belirliyoruz.', 'Yes, there are different options depending on the cause. We determine the right method with an exam.')],
        ],
    },
    {
        customer: ['Pınar', 'Güneş', '+90 555 010 11 24'], platform: 'whatsapp', category: 'urgent', status: 'active', priority: 'urgent',
        summary: L('Faturasında hatalı tutar olduğunu söyledi, acil düzeltme istiyor.', 'Says her invoice shows an incorrect amount and requests an urgent correction.'),
        messages: [
            ['u', L('Faturamda yapılmayan bir işlem görünüyor, lütfen kontrol edin.', 'My invoice lists a procedure that was not done, please check.')],
            ['a', L('Pınar Hanım, durumu muhasebe birimimize acil olarak ilettim. Bugün içinde size dönüş yapılacak.', 'Pınar, I have escalated this to our accounting team as urgent. You will hear back today.')],
        ],
    },
];

interface CallSeed {
    customer: number;
    category: L10n;
    duration: number;
    minutesAgo: number;
    direction: 'incoming' | 'outgoing';
    summary: L10n;
    transcript?: L10n;
}

const CALLS: CallSeed[] = [
    {
        customer: 12, category: L('Randevu Alındı', 'Appointment Booked'), duration: 142, minutesAgo: 18, direction: 'incoming',
        summary: L('Diş ağrısı şikayetiyle aradı. Sesli asistan bugün 16:00 için acil muayene randevusu oluşturdu.', 'Called about a toothache. The voice agent booked an urgent exam for today at 4:00 PM.'),
        transcript: L(
            'Asistan: Lumina Klinik, ben dijital asistanınız. Size nasıl yardımcı olabilirim?\nMüşteri: Dün geceden beri dişim ağrıyor, bugün gelebilir miyim?\nAsistan: Geçmiş olsun. Bugün 16:00’da acil muayene için boşluğumuz var, sizin için ayırayım mı?\nMüşteri: Evet lütfen.\nAsistan: Adınızı ve soyadınızı alabilir miyim?\nMüşteri: Hakan Özkan.\nAsistan: Randevunuz bugün 16:00 için oluşturuldu Hakan Bey. Adres bilgisini SMS ile gönderiyorum.',
            'Agent: Lumina Clinic, this is your digital assistant. How can I help you?\nCustomer: My tooth has been aching since last night, can I come in today?\nAgent: Sorry to hear that. We have an opening for an urgent exam today at 4:00 PM, shall I reserve it for you?\nCustomer: Yes please.\nAgent: May I have your full name?\nCustomer: Hakan Özkan.\nAgent: Your appointment is booked for today at 4:00 PM, Hakan. I am sending the address by SMS.'
        ),
    },
    {
        customer: 13, category: L('Bilgi Talebi', 'Information Request'), duration: 96, minutesAgo: 52, direction: 'incoming',
        summary: L('Çocuk diş hekimliği hizmeti olup olmadığını ve muayene ücretini sordu. Bilgi verildi.', 'Asked whether pediatric dentistry is available and about the exam fee. Information provided.'),
        transcript: L(
            'Asistan: Lumina Klinik, size nasıl yardımcı olabilirim?\nMüşteri: Çocuk diş hekiminiz var mı?\nAsistan: Evet, hafta içi her gün çocuk diş hekimimiz hizmet veriyor. İlk muayene ücretsizdir.\nMüşteri: Tamam, eşimle konuşup tekrar arayacağım.\nAsistan: Elbette, dilediğiniz zaman WhatsApp hattımızdan da randevu alabilirsiniz.',
            'Agent: Lumina Clinic, how can I help you?\nCustomer: Do you have a pediatric dentist?\nAgent: Yes, our pediatric dentist is available every weekday. The first exam is free.\nCustomer: OK, I will talk to my spouse and call back.\nAgent: Of course, you can also book anytime through our WhatsApp line.'
        ),
    },
    {
        customer: 1, category: L('Geri Arama Talebi', 'Callback Requested'), duration: 71, minutesAgo: 95, direction: 'incoming',
        summary: L('İmplant ödeme planı için yetkiliyle görüşmek istedi. Geri arama kaydı açıldı.', 'Wanted to speak with staff about an implant payment plan. A callback was logged.'),
    },
    {
        customer: 4, category: L('Hatırlatma', 'Reminder'), duration: 38, minutesAgo: 160, direction: 'outgoing',
        summary: L('Yarınki randevu için hatırlatma araması yapıldı, müşteri katılacağını onayladı.', 'Reminder call for tomorrow’s appointment; the customer confirmed attendance.'),
    },
    {
        customer: 7, category: L('Cevapsız', 'Missed'), duration: 0, minutesAgo: 205, direction: 'outgoing',
        summary: L('Kampanya bilgilendirmesi için arandı, yanıt alınamadı.', 'Called about a campaign, no answer.'),
    },
    {
        customer: 2, category: L('Şikayet', 'Complaint'), duration: 188, minutesAgo: 260, direction: 'incoming',
        summary: L('Dolgu sonrası ağrı şikayetini iletti. Kayıt acil olarak işaretlendi ve hekime yönlendirildi.', 'Reported pain after a filling. The record was flagged urgent and routed to the dentist.'),
        transcript: L(
            'Asistan: Lumina Klinik, size nasıl yardımcı olabilirim?\nMüşteri: İki gün önce dolgu yaptırdım, ağrım geçmedi.\nAsistan: Çok üzgünüm. Ağrınız sürekli mi, yoksa bir şey yiyip içerken mi artıyor?\nMüşteri: Sürekli.\nAsistan: Durumunuzu acil olarak hekiminize iletiyorum. Bugün içinde sizi arayacaklar.\nMüşteri: Lütfen geç kalmasınlar.\nAsistan: Kaydınızı öncelikli olarak işaretledim.',
            'Agent: Lumina Clinic, how can I help you?\nCustomer: I had a filling two days ago and the pain has not gone away.\nAgent: I am very sorry. Is the pain constant, or does it get worse when eating or drinking?\nCustomer: Constant.\nAgent: I am escalating this to your dentist as urgent. They will call you today.\nCustomer: Please do not be late.\nAgent: I have flagged your record as a priority.'
        ),
    },
    {
        customer: 8, category: L('Randevu Alındı', 'Appointment Booked'), duration: 117, minutesAgo: 330, direction: 'incoming',
        summary: L('Diş taşı temizliği için pazartesi 10:30 randevusu oluşturuldu.', 'Scaling appointment booked for Monday 10:30 AM.'),
    },
    {
        customer: 10, category: L('Bilgi Talebi', 'Information Request'), duration: 154, minutesAgo: 420, direction: 'incoming',
        summary: L('Kurumsal anlaşma koşulları hakkında genel bilgi aldı.', 'Got general information about corporate agreement terms.'),
    },
    {
        customer: 5, category: L('Geri Arama Talebi', 'Callback Requested'), duration: 64, minutesAgo: 500, direction: 'incoming',
        summary: L('Sigorta provizyonu için mesai sonrası aranmak istedi.', 'Asked for a call after work hours about insurance pre-approval.'),
    },
    {
        customer: 11, category: L('Cevapsız', 'Missed'), duration: 0, minutesAgo: 560, direction: 'outgoing',
        summary: L('Randevu teyidi için arandı, ulaşılamadı.', 'Called to confirm an appointment, could not be reached.'),
    },
];

const APPOINTMENTS: { customer: number; dayOffset: number; time: string; treatment: L10n; status: 'confirmed' | 'pending' | 'cancelled'; notes: L10n }[] = [
    { customer: 12, dayOffset: 0, time: '16:00', treatment: L('Acil Muayene', 'Urgent Exam'), status: 'confirmed', notes: L('Sesli asistan üzerinden oluşturuldu. Diş ağrısı şikayeti.', 'Booked by the voice agent. Toothache.') },
    { customer: 3, dayOffset: 0, time: '11:30', treatment: L('Kontrol Muayenesi', 'Check-up'), status: 'confirmed', notes: L('Web chat üzerinden oluşturuldu.', 'Booked via web chat.') },
    { customer: 0, dayOffset: 1, time: '14:00', treatment: L('Diş Beyazlatma', 'Teeth Whitening'), status: 'confirmed', notes: L('WhatsApp chatbot üzerinden oluşturuldu.', 'Booked by the WhatsApp chatbot.') },
    { customer: 6, dayOffset: 2, time: '11:00', treatment: L('Dolgu', 'Filling'), status: 'confirmed', notes: L('Salıdan cumaya ertelendi.', 'Rescheduled from Tuesday.') },
    { customer: 8, dayOffset: 3, time: '10:30', treatment: L('Diş Taşı Temizliği', 'Scaling'), status: 'confirmed', notes: L('Yıllık kontrol ile birlikte.', 'Together with the annual check-up.') },
    { customer: 4, dayOffset: 1, time: '09:30', treatment: L('Dijital Tarama', 'Digital Scan'), status: 'pending', notes: L('Şeffaf plak ön görüşmesi, müşteri onayı bekleniyor.', 'Clear aligner consultation, waiting for customer confirmation.') },
    { customer: 13, dayOffset: 5, time: '15:00', treatment: L('Çocuk Diş Muayenesi', 'Pediatric Exam'), status: 'pending', notes: L('İlk muayene.', 'First visit.') },
    { customer: 9, dayOffset: -1, time: '13:00', treatment: L('İlk Muayene', 'First Exam'), status: 'confirmed', notes: L('Röntgen çekildi.', 'X-ray taken.') },
    { customer: 7, dayOffset: -2, time: '17:00', treatment: L('Zirkonyum Ön Görüşme', 'Zirconia Consultation'), status: 'cancelled', notes: L('Müşteri iptal etti.', 'Cancelled by the customer.') },
    { customer: 10, dayOffset: 7, time: '12:00', treatment: L('Kurumsal Görüşme', 'Corporate Meeting'), status: 'confirmed', notes: L('Kurumsal anlaşma detayları.', 'Corporate agreement details.') },
];

const HISTORY_SUMMARIES: Record<CategoryKey, L10n> = {
    success: L('Randevu oluşturuldu ve onay mesajı gönderildi.', 'Appointment booked and confirmation sent.'),
    pending: L('Fiyat bilgisi aldı, dönüş yapacağını belirtti.', 'Received pricing, said they will get back.'),
    urgent: L('Şikayet iletildi, ilgili birime yönlendirildi.', 'Complaint logged and routed to the team.'),
    negative: L('Şimdilik ilgilenmediğini belirtti.', 'Not interested for now.'),
    callback: L('Yetkiliyle görüşmek istedi, geri arama yapıldı.', 'Asked to speak with staff, callback completed.'),
    info: L('Genel bilgi verildi.', 'General information provided.'),
};

function pad(n: number) {
    return String(n).padStart(2, '0');
}

export function createDemoDb(): DemoDb {
    const random = createRandom(20260201);
    const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];

    const categories: Row[] = CATEGORIES.map((c, i) => ({
        id: categoryId(c.key), key: c.key, name: c.name, description: c.description, color: c.color,
        icon: null, sort_order: i + 1, is_active: true, created_at: ago(60 * 24 * 90), updated_at: ago(60 * 24 * 90),
    }));

    const chatbot_conversations: Row[] = CONVERSATIONS.map(c => {
        const step = 2; // minutes between messages
        const start = c.minutesAgo + c.messages.length * step;
        return {
            id: newId(),
            customer_id: customerId(c.customer),
            platform_id: null,
            platform_type: c.platform,
            conversation_data: c.messages.map(([who, content], i) => ({
                role: who === 'u' ? 'user' : 'assistant', content, created_at: ago(start - i * step),
            })),
            summary: c.summary,
            category_id: categoryId(c.category),
            status: c.status,
            collected_data: {},
            tags: [],
            priority: c.priority,
            created_at: ago(start),
            updated_at: ago(c.minutesAgo),
            first_message_at: ago(start),
            last_message_at: ago(c.minutesAgo),
            message_count: c.messages.length,
        };
    });

    // Older, lightweight records so trends and reports have two weeks of history
    const historyCategories: CategoryKey[] = ['success', 'success', 'success', 'info', 'info', 'pending', 'negative', 'callback', 'urgent'];
    const historyPlatforms = ['whatsapp', 'whatsapp', 'whatsapp', 'instagram', 'instagram', 'webchat', 'telegram'] as const;
    for (let day = 1; day <= 13; day++) {
        const perDay = 7 + Math.floor(random() * 6);
        for (let i = 0; i < perDay; i++) {
            const minutesAgo = day * 24 * 60 - Math.floor(random() * 600);
            const category = pick(historyCategories);
            const count = 3 + Math.floor(random() * 12);
            chatbot_conversations.push({
                id: newId(),
                customer_id: customerId(Math.floor(random() * 12)),
                platform_id: null,
                platform_type: pick(historyPlatforms),
                conversation_data: [],
                summary: HISTORY_SUMMARIES[category],
                category_id: categoryId(category),
                status: 'completed',
                collected_data: {},
                tags: [],
                priority: 'medium',
                created_at: ago(minutesAgo + count * 2),
                updated_at: ago(minutesAgo),
                first_message_at: ago(minutesAgo + count * 2),
                last_message_at: ago(minutesAgo),
                message_count: count,
            });
        }
    }

    const call_analytics: Row[] = CALLS.map(c => ({
        id: newId(),
        created_at: ago(c.minutesAgo),
        customer_phone: CUSTOMERS[c.customer][2],
        summary: c.summary,
        category: c.category,
        duration: c.duration,
        recording_url: null,
        direction: c.direction,
        transcript: c.transcript ?? null,
    }));
    const historyCallCategories = [CALLS[0].category, CALLS[0].category, CALLS[1].category, CALLS[2].category, CALLS[3].category, CALLS[4].category];
    for (let day = 1; day <= 13; day++) {
        const perDay = 4 + Math.floor(random() * 4);
        for (let i = 0; i < perDay; i++) {
            const category = pick(historyCallCategories);
            const missed = category === CALLS[4].category;
            call_analytics.push({
                id: newId(),
                created_at: ago(day * 24 * 60 - Math.floor(random() * 600)),
                customer_phone: CUSTOMERS[Math.floor(random() * CUSTOMERS.length)][2],
                summary: missed
                    ? L('Arama yanıtlanmadı.', 'The call was not answered.')
                    : L('Sesli asistan görüşmeyi tamamladı ve özeti kaydetti.', 'The voice agent completed the call and saved the summary.'),
                category,
                duration: missed ? 0 : 40 + Math.floor(random() * 200),
                recording_url: null,
                direction: random() > 0.3 ? 'incoming' : 'outgoing',
                transcript: null,
            });
        }
    }

    const customers: Row[] = CUSTOMERS.map(([first_name, last_name, phone, email], i) => {
        const id = customerId(i);
        const own = chatbot_conversations.filter(c => c.customer_id === id);
        const ownCalls = call_analytics.filter(c => c.customer_phone === phone);
        const last = [...own.map(c => c.last_message_at), ...ownCalls.map(c => c.created_at)].sort().pop() ?? null;
        return {
            id, first_name, last_name, phone, email,
            created_at: ago(60 * 24 * (20 + i * 3)),
            updated_at: last ?? ago(60 * 24),
            last_interaction_date: last,
            total_interactions: own.length + ownCalls.length,
            status: own.some(c => c.status === 'active') ? 'active' : i % 5 === 3 ? 'completed' : 'active',
        };
    });

    const today = new Date();
    const appointments: Row[] = APPOINTMENTS.map((a, i) => {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + a.dayOffset);
        return {
            id: newId(),
            customer_id: customerId(a.customer),
            // Naive local timestamp, same convention the Calendar page writes
            appointment_date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${a.time}:00`,
            created_at: ago(30 + i * 95),
            treatment: a.treatment,
            status: a.status,
            notes: a.notes,
            doctor_name: null,
        };
    });

    const notifications: Row[] = [
        { type: 'urgent', title: L('Acil aksiyon bekleyen müşteri', 'Customer needs urgent action'), message: L('Zeynep Arslan dolgu sonrası ağrı şikayeti iletti ve geri dönüş bekliyor.', 'Zeynep Arslan reported pain after a filling and is waiting for a follow-up.'), link_url: '/app/chatbot', minutesAgo: 23, is_read: false },
        { type: 'urgent', title: L('Yeni geri arama talebi', 'New callback request'), message: L('Mert Demir implant ödeme planı için bugün 15:00’ten sonra aranmak istiyor.', 'Mert Demir wants a call after 3:00 PM today about an implant payment plan.'), link_url: '/app', minutesAgo: 14, is_read: false },
        { type: 'success', title: L('Randevu oluşturuldu', 'Appointment booked'), message: L('Sesli asistan Hakan Özkan için bugün 16:00’ya acil muayene randevusu oluşturdu.', 'The voice agent booked an urgent exam for Hakan Özkan today at 4:00 PM.'), link_url: '/app/calendar', minutesAgo: 18, is_read: false },
        { type: 'success', title: L('Randevu oluşturuldu', 'Appointment booked'), message: L('WhatsApp chatbot Elif Kaya için diş beyazlatma randevusu oluşturdu.', 'The WhatsApp chatbot booked a teeth whitening appointment for Elif Kaya.'), link_url: '/app/calendar', minutesAgo: 6, is_read: true },
        { type: 'warning', title: L('Cevapsız giden arama', 'Unanswered outbound call'), message: L('Emre Aydın’a yapılan kampanya araması yanıtlanmadı.', 'The campaign call to Emre Aydın was not answered.'), link_url: '/app/voice-agent', minutesAgo: 205, is_read: true },
        { type: 'system', title: L('Günlük özet hazır', 'Daily summary ready'), message: L('Dünkü etkileşimlerin özeti Raporlar sayfasında.', 'Yesterday’s interaction summary is available on the Reports page.'), link_url: '/app/reports', minutesAgo: 600, is_read: true },
    ].map(n => ({
        id: newId(), user_id: null, type: n.type, title: n.title, message: n.message, link_url: n.link_url,
        is_read: n.is_read, is_archived: false, created_at: ago(n.minutesAgo), read_at: n.is_read ? ago(n.minutesAgo - 1) : null,
    }));

    return { customers, categories, chatbot_conversations, call_analytics, appointments, notifications };
}

export { categoryId };
