import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Calendar,
    Check,
    Inbox,
    MessageSquare,
    Phone,
    Sparkles,
    Workflow,
} from 'lucide-react';
import { APP_BASE, isDemo } from '../../lib/config';
import { LanguageToggle, useLang } from '../../lib/i18n';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.5 },
};

const CHANNELS = [
    { name: 'WhatsApp', color: '#22c55e' },
    { name: 'Instagram', color: '#ec4899' },
    { name: 'Telegram', color: '#0ea5e9' },
    { name: 'Web Chat', color: '#6366f1' },
];

/** A small, static rendition of the panel used as the hero visual */
function PanelPreview() {
    const { t } = useLang();

    const rows = [
        { name: 'Zeynep Arslan', channel: 'WhatsApp', tag: t('Acil', 'Urgent'), color: '#EF4444', text: t('Dolgu sonrası ağrım geçmedi, kimse dönmedi.', 'Still in pain after my filling, nobody replied.') },
        { name: 'Mert Demir', channel: 'Instagram', tag: t('Geri Arama', 'Callback'), color: '#3B82F6', text: t('Biriyle telefonda konuşabilir miyim?', 'Can I talk to someone on the phone?') },
        { name: 'Elif Kaya', channel: 'WhatsApp', tag: t('Başarılı', 'Successful'), color: '#10B981', text: t('14:00 olsun.', 'Let’s do 2:00 PM.') },
    ];

    return (
        <div className="relative mx-auto w-full max-w-5xl">
            <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-[40px] bg-gradient-to-b from-[#30c4cd]/25 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-t-2xl border border-b-0 border-white/15 bg-white shadow-2xl">
                {/* window bar */}
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-[11px] font-medium text-gray-400 border border-gray-100">flowasistan.flowixy.com{APP_BASE}</span>
                </div>

                <div className="grid gap-4 bg-gray-50/60 p-4 text-left md:grid-cols-5 md:p-6">
                    {/* KPI tiles */}
                    <div className="grid grid-cols-3 gap-3 md:col-span-5">
                        {[
                            { label: t('Toplam Etkileşim', 'Total Conversations'), value: '129', tone: 'text-emerald-500', note: t('Güncel', 'Up to date') },
                            { label: t('Aktif Görüşmeler', 'Active Conversations'), value: '6', tone: 'text-orange-500', note: t('Canlı devam eden', 'Currently open') },
                            { label: t('Aksiyon Bekleyen', 'Needs Action'), value: '4', tone: 'text-red-500', note: t('Müdahale gerekli', 'Follow-up required') },
                        ].map(kpi => (
                            <div key={kpi.label} className="rounded-2xl border border-gray-100 bg-white p-3 md:p-4">
                                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.label}</p>
                                <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">{kpi.value}</p>
                                <p className={`mt-0.5 truncate text-[11px] font-bold ${kpi.tone}`}>{kpi.note}</p>
                            </div>
                        ))}
                    </div>

                    {/* live feed */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-3">
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            {t('Son Etkileşimler (Canlı)', 'Latest Conversations (Live)')}
                        </p>
                        <div className="space-y-2.5">
                            {rows.map(row => (
                                <div key={row.name} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-[13px] font-bold text-gray-900">{row.name}</p>
                                            <span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${row.color}15`, color: row.color }}>{row.tag}</span>
                                        </div>
                                        <p className="truncate text-xs text-gray-500">{row.channel} · {row.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI summary */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 md:col-span-2">
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Sparkles className="h-4 w-4 text-[#215ebb]" />
                            {t('Yapay Zeka Özeti', 'AI Summary')}
                        </p>
                        <p className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                            {t(
                                'İmplant tedavisi için taksit seçeneklerini sordu. Detayları bir yetkiliyle telefonda konuşmak istiyor.',
                                'Asked about payment plans for an implant treatment. Wants to discuss the details with a staff member by phone.'
                            )}
                        </p>
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-red-50/60 p-3">
                            <span className="flex items-center gap-2 text-xs font-bold text-red-800">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                {t('Geri arama bekliyor', 'Waiting for a callback')}
                            </span>
                            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-600">
                                <Check className="h-3 w-3" />
                                {t('Çözüldü', 'Resolved')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    const { t } = useLang();

    const features = [
        {
            icon: Inbox,
            title: t('Birleşik gelen kutusu', 'Unified inbox'),
            text: t(
                'WhatsApp, Instagram, Telegram ve web sohbetleri müşteri bazında tek listede; mesaj geçmişiyle birlikte.',
                'WhatsApp, Instagram, Telegram and web chats in one list per customer, with the full message history.'
            ),
        },
        {
            icon: Sparkles,
            title: t('Yapay zekâ özeti ve kategori', 'AI summary and category'),
            text: t(
                'Her görüşme kısa bir özet ve sonuç kategorisiyle gelir: başarılı, beklemede, bilgi talebi, geri arama, acil.',
                'Every conversation arrives with a short summary and an outcome category: successful, pending, information request, callback, urgent.'
            ),
        },
        {
            icon: AlertCircle,
            title: t('Aksiyon kuyruğu', 'Action queue'),
            text: t(
                'İnsanla görüşmek isteyen ya da şikâyeti olan müşteriler en üstte durur. Aradıktan sonra tek tıkla kapatırsınız.',
                'Customers who ask for a person or file a complaint stay on top. Close the item with one click after you call.'
            ),
        },
        {
            icon: Phone,
            title: t('Sesli asistan kayıtları', 'Voice agent call log'),
            text: t(
                'Gelen ve giden her arama için süre, özet, transkript ve ses kaydı aynı ekranda.',
                'Duration, summary, transcript and recording for every inbound and outbound call on one screen.'
            ),
        },
        {
            icon: Calendar,
            title: t('Randevu takvimi', 'Appointment calendar'),
            text: t(
                'Botların ve ekibin oluşturduğu randevular tek takvimde; yeni randevu eklemek birkaç saniye.',
                'Appointments booked by the bots and by your team in one calendar; adding a new one takes seconds.'
            ),
        },
        {
            icon: BarChart3,
            title: t('Raporlar', 'Reports'),
            text: t(
                'Kanal, kategori ve günlük trend kırılımları; seçtiğiniz aralığı CSV olarak dışa aktarın.',
                'Breakdowns by channel, category and day; export the selected range as CSV.'
            ),
        },
    ];

    const steps = [
        {
            title: t('Kanallarınızı bağlayın', 'Connect your channels'),
            text: t(
                'Chatbot ve sesli asistan akışlarınız görüşme bittiğinde FlowAsistan’a tek bir webhook ile kayıt gönderir.',
                'When a conversation ends, your chatbot and voice agent flows send a record to FlowAsistan through a single webhook.'
            ),
        },
        {
            title: t('Yapay zekâ müşteriyle konuşur', 'The AI talks to the customer'),
            text: t(
                'Soruları yanıtlar, randevu oluşturur, gerekli bilgileri toplar; mesai dışında da.',
                'It answers questions, books appointments and collects the details you need, outside working hours too.'
            ),
        },
        {
            title: t('Görüşme özetlenir ve sınıflandırılır', 'The conversation is summarized and classified'),
            text: t(
                'Dil modeli özeti yazar, sonuç kategorisini ve önceliği belirler; kayıt panele anında düşer.',
                'A language model writes the summary and sets the outcome category and priority; the record lands in the panel instantly.'
            ),
        },
        {
            title: t('Ekibiniz yalnız gerekeni takip eder', 'Your team follows up only where needed'),
            text: t(
                'Yüzlerce konuşmayı okumak yerine geri arama ve acil listesine bakarsınız.',
                'Instead of reading hundreds of chats, you look at the callback and urgent list.'
            ),
        },
    ];

    const audiences = [
        t('Klinikler ve sağlık merkezleri', 'Clinics and health centers'),
        t('Güzellik ve bakım merkezleri', 'Beauty and wellness centers'),
        t('Emlak ve danışmanlık ofisleri', 'Real estate and consulting offices'),
        t('E-ticaret ve servis işletmeleri', 'E-commerce and service businesses'),
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 antialiased">
            {/* Navigation */}
            <header className="absolute inset-x-0 top-0 z-30">
                <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-black/10">
                            <img src="/logo.svg" alt="" className="h-7 w-7 object-contain" />
                        </span>
                        <span className="text-xl font-extrabold tracking-tight text-white">FlowAsistan</span>
                    </Link>
                    <nav className="hidden items-center gap-8 text-sm font-semibold text-blue-100 md:flex">
                        <a href="#features" className="transition-colors hover:text-white">{t('Özellikler', 'Features')}</a>
                        <a href="#how" className="transition-colors hover:text-white">{t('Nasıl çalışır', 'How it works')}</a>
                        <a href="#channels" className="transition-colors hover:text-white">{t('Kanallar', 'Channels')}</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <LanguageToggle className="border-white/20" />
                        {!isDemo && (
                            <Link to="/auth/login" className="hidden text-sm font-semibold text-white hover:underline sm:block">
                                {t('Giriş Yap', 'Sign In')}
                            </Link>
                        )}
                        <Link to={APP_BASE} className="hidden rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0b2a55] shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 sm:block">
                            {isDemo ? t('Canlı Demo', 'Live Demo') : t('Panele Git', 'Open Panel')}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden bg-[#071a33] pt-36 text-center">
                <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#215ebb]/40 blur-[120px]" />
                <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-[#30c4cd]/25 blur-[120px]" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <div className="relative mx-auto max-w-6xl px-5">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[13px] font-semibold text-blue-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#30c4cd]" />
                            {t('Chatbot ve sesli asistanlar için CRM paneli', 'The CRM panel for chatbots and voice agents')}
                        </p>
                        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
                            {t('Yapay zekânın yaptığı her görüşme,', 'Every conversation your AI handles,')}{' '}
                            <span className="bg-gradient-to-r from-[#7fb2ff] to-[#30c4cd] bg-clip-text text-transparent">
                                {t('tek panelde.', 'in one panel.')}
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-blue-100/90">
                            {t(
                                'FlowAsistan; WhatsApp, Instagram, Telegram ve web chatbot’larınızla sesli asistanınızın müşterilerle yaptığı görüşmeleri özetler, kategorilere ayırır ve insan müdahalesi gerekenleri öne çıkarır.',
                                'FlowAsistan summarizes and categorizes the conversations your WhatsApp, Instagram, Telegram and web chatbots and your voice agent have with customers, and surfaces the ones that need a person.'
                            )}
                        </p>
                        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link to={APP_BASE} className="group inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-[#0b2a55] shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5">
                                {isDemo ? t('Canlı Demoyu Aç', 'Open the Live Demo') : t('Panele Git', 'Open the Panel')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <a href="#how" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10">
                                {t('Nasıl çalışır?', 'How does it work?')}
                            </a>
                        </div>
                        {isDemo && (
                            <p className="mt-5 text-sm font-medium text-blue-200/80">
                                {t('Kayıt gerekmez · Kurmaca verilerle çalışır · Türkçe ve İngilizce', 'No sign-up · Runs on fictional data · Turkish and English')}
                            </p>
                        )}
                    </motion.div>

                    <motion.div className="mt-16" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
                        <PanelPreview />
                    </motion.div>
                </div>
            </section>

            {/* Channels */}
            <section id="channels" className="border-b border-gray-100 bg-white py-14">
                <div className="mx-auto max-w-6xl px-5 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-400">{t('Tek panel, bütün kanallar', 'One panel, every channel')}</p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {CHANNELS.map(channel => (
                            <span key={channel.name} className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-gray-800 shadow-sm">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                                {channel.name}
                            </span>
                        ))}
                        <span className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-gray-800 shadow-sm">
                            <Phone className="h-4 w-4 text-purple-600" />
                            {t('Telefon (sesli asistan)', 'Phone (voice agent)')}
                        </span>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="bg-gray-50 py-24">
                <div className="mx-auto max-w-6xl px-5">
                    <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-[#215ebb]">{t('Özellikler', 'Features')}</p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            {t('Botlar konuşur, siz yalnız sonuca bakarsınız', 'The bots do the talking, you look at the outcome')}
                        </h2>
                        <p className="mt-4 text-lg text-gray-500">
                            {t(
                                'Otomasyon konuşma sayısını artırır; asıl iş hangisinin takip istediğini görmektir. FlowAsistan bunun için var.',
                                'Automation multiplies the number of conversations; the real work is seeing which ones need follow-up. That is what FlowAsistan is for.'
                            )}
                        </p>
                    </motion.div>

                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                {...fadeUp}
                                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                                className="rounded-3xl border border-gray-100 bg-white p-7 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#215ebb] to-[#30c4cd] text-white shadow-lg shadow-blue-500/20">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                                <p className="mt-2 leading-relaxed text-gray-500">{feature.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="bg-white py-24">
                <div className="mx-auto max-w-6xl px-5">
                    <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-[#215ebb]">{t('Nasıl çalışır', 'How it works')}</p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                            {t('Görüşmeden takibe dört adım', 'Four steps from conversation to follow-up')}
                        </h2>
                    </motion.div>

                    <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, i) => (
                            <motion.div key={step.title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }} className="relative rounded-3xl border border-gray-100 bg-gray-50 p-7">
                                <span className="text-5xl font-extrabold tracking-tight text-[#215ebb]/15">{`0${i + 1}`}</span>
                                <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                                <p className="mt-2 leading-relaxed text-gray-500">{step.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div {...fadeUp} className="mt-10 flex flex-col items-start gap-4 rounded-3xl border border-gray-100 bg-white p-7 md:flex-row md:items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#215ebb]">
                            <Workflow className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">{t('Altyapı', 'Under the hood')}</h3>
                            <p className="mt-1 leading-relaxed text-gray-500">
                                {t(
                                    'React ve TypeScript arayüz, Supabase üzerinde Postgres ve gerçek zamanlı güncelleme. Kayıtlar n8n akışlarından webhook ile gelir; bu yüzden mevcut chatbot ve sesli asistan kurulumunuzu değiştirmeden bağlanır.',
                                    'A React and TypeScript interface on Supabase Postgres with realtime updates. Records arrive by webhook from n8n flows, so it plugs into your existing chatbot and voice agent setup without changing it.'
                                )}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Audience */}
            <section className="border-y border-gray-100 bg-gray-50 py-16">
                <div className="mx-auto max-w-6xl px-5 text-center">
                    <h2 className="text-2xl font-extrabold tracking-tight">{t('Müşteri iletişimi yoğun işletmeler için', 'For businesses with heavy customer communication')}</h2>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        {audiences.map(audience => (
                            <span key={audience} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-gray-700 shadow-sm">
                                <Check className="h-4 w-4 text-emerald-500" />
                                {audience}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-6xl px-5">
                    <motion.div {...fadeUp} className="relative overflow-hidden rounded-[32px] bg-[#071a33] px-6 py-16 text-center md:px-16">
                        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#215ebb]/50 blur-[90px]" />
                        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#30c4cd]/30 blur-[90px]" />
                        <div className="relative">
                            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                {t('Paneli kendiniz deneyin', 'Try the panel yourself')}
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100/90">
                                {isDemo
                                    ? t(
                                        'Demo, örnek bir kliniğin verileriyle tarayıcınızda çalışır. Görüşmeleri açın, randevu ekleyin, yeni bir görüşmenin panele düşüşünü izleyin.',
                                        'The demo runs in your browser with the data of a sample clinic. Open conversations, add an appointment, and watch a new conversation land in the panel.'
                                    )
                                    : t('Hesabınıza giriş yapın ve görüşmelerinizi takip etmeye başlayın.', 'Sign in and start following up on your conversations.')}
                            </p>
                            <Link to={APP_BASE} className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-base font-bold text-[#0b2a55] shadow-xl shadow-black/20 transition-transform hover:-translate-y-0.5">
                                {isDemo ? t('Canlı Demoyu Aç', 'Open the Live Demo') : t('Panele Git', 'Open the Panel')}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white py-10">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-gray-500 md:flex-row">
                    <div className="flex items-center gap-3">
                        <img src="/logo.svg" alt="" className="h-7 w-7 object-contain" />
                        <span className="font-bold text-gray-900">FlowAsistan</span>
                        <span className="text-gray-300">·</span>
                        <span>
                            {t('Bir', 'A')}{' '}
                            <a href="https://flowixy.com" target="_blank" rel="noreferrer" className="font-semibold text-[#215ebb] hover:underline">Flowixy</a>{' '}
                            {t('ürünüdür', 'product')}
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="#features" className="hover:text-gray-900">{t('Özellikler', 'Features')}</a>
                        <a href="#how" className="hover:text-gray-900">{t('Nasıl çalışır', 'How it works')}</a>
                        <Link to={APP_BASE} className="hover:text-gray-900">{isDemo ? 'Demo' : 'Panel'}</Link>
                        <span>© {new Date().getFullYear()} Flowixy</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
