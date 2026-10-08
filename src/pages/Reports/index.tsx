import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/i18n';
import { dayKey, downloadCsv, formatDuration, lastDays, platformLabel, statusLabel } from '../../lib/format';

interface ChatRow {
    id: string;
    platform_type: string | null;
    status: string;
    summary: string | null;
    last_message_at: string | null;
    message_count: number | null;
    customers: { first_name: string | null; last_name: string | null; phone: string | null } | null;
    categories: { name: string; color: string | null } | null;
}

interface CallRow {
    id: string;
    created_at: string;
    customer_phone: string | null;
    summary: string | null;
    category: string | null;
    duration: number | null;
}

const COLORS = ['#22c55e', '#ec4899', '#0ea5e9', '#f59e0b', '#8b5cf6', '#64748b'];
const RANGES = [7, 14, 30] as const;

export default function Reports() {
    const { t, locale } = useLang();
    const [range, setRange] = useState<typeof RANGES[number]>(7);
    const [chats, setChats] = useState<ChatRow[]>([]);
    const [calls, setCalls] = useState<CallRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const { data: chatData, error: chatError } = await supabase
                .from('chatbot_conversations')
                .select(`
                    id, platform_type, status, summary, last_message_at, message_count,
                    customers ( first_name, last_name, phone ),
                    categories ( name, color )
                `)
                .order('last_message_at', { ascending: false });
            if (chatError) throw chatError;

            const { data: callData, error: callError } = await supabase
                .from('call_analytics')
                .select('*')
                .order('created_at', { ascending: false });
            if (callError) throw callError;

            setChats((chatData || []) as unknown as ChatRow[]);
            setCalls((callData || []) as CallRow[]);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const days = lastDays(range);
    const since = days[0].getTime();
    const rangeChats = chats.filter(c => c.last_message_at && new Date(c.last_message_at).getTime() >= since);
    const rangeCalls = calls.filter(c => new Date(c.created_at).getTime() >= since);

    // KPIs
    const totalInteractions = rangeChats.length + rangeCalls.length;
    const closedChats = rangeChats.filter(c => c.status === 'completed').length;
    const automationRate = rangeChats.length ? Math.round((closedChats / rangeChats.length) * 100) : 0;
    const answeredCalls = rangeCalls.filter(c => c.duration && c.duration > 0);
    const avgCallDuration = answeredCalls.length
        ? Math.round(answeredCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / answeredCalls.length)
        : 0;

    // Daily chatbot vs. voice
    const perDay: Record<string, { chatbot: number; voice: number }> = {};
    rangeChats.forEach(c => {
        const key = dayKey(new Date(c.last_message_at!));
        perDay[key] = perDay[key] || { chatbot: 0, voice: 0 };
        perDay[key].chatbot += 1;
    });
    rangeCalls.forEach(c => {
        const key = dayKey(new Date(c.created_at));
        perDay[key] = perDay[key] || { chatbot: 0, voice: 0 };
        perDay[key].voice += 1;
    });
    const dailyData = days.map(day => {
        const entry = perDay[dayKey(day)] || { chatbot: 0, voice: 0 };
        return {
            name: day.toLocaleDateString(locale, range === 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' }),
            chatbot: entry.chatbot,
            voice: entry.voice,
            total: entry.chatbot + entry.voice,
        };
    });

    // Channel share
    const channelCounts: Record<string, number> = {};
    rangeChats.forEach(c => {
        const key = platformLabel(c.platform_type);
        channelCounts[key] = (channelCounts[key] || 0) + 1;
    });
    if (rangeCalls.length) channelCounts[t('Telefon', 'Phone')] = rangeCalls.length;
    const pieData = Object.entries(channelCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Chatbot outcome categories
    const categoryCounts: Record<string, { count: number; color: string }> = {};
    rangeChats.forEach(c => {
        const name = c.categories?.name || t('Kategorisiz', 'Uncategorized');
        categoryCounts[name] = categoryCounts[name] || { count: 0, color: c.categories?.color || '#94a3b8' };
        categoryCounts[name].count += 1;
    });
    const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, ...value }))
        .sort((a, b) => b.count - a.count);

    const handleExport = () => {
        const rows = [
            ...rangeChats.map(c => [
                new Date(c.last_message_at!).toLocaleString(locale),
                platformLabel(c.platform_type),
                `${c.customers?.first_name || ''} ${c.customers?.last_name || ''}`.trim(),
                c.customers?.phone,
                c.categories?.name,
                statusLabel(c.status, t),
                c.summary,
            ]),
            ...rangeCalls.map(c => [
                new Date(c.created_at).toLocaleString(locale),
                t('Telefon', 'Phone'),
                '',
                c.customer_phone,
                c.category,
                c.duration ? formatDuration(c.duration) : t('Cevapsız', 'Missed'),
                c.summary,
            ]),
        ];
        downloadCsv(
            `flowasistan-${t('rapor', 'report')}-${range}${t('gun', 'd')}.csv`,
            [t('Tarih', 'Date'), t('Kanal', 'Channel'), t('Müşteri', 'Customer'), t('Telefon', 'Phone'), t('Kategori', 'Category'), t('Durum / Süre', 'Status / Duration'), t('Özet', 'Summary')],
            rows
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('Raporlar ve Analizler', 'Reports & Analytics')}</h2>
                    <p className="text-gray-500 mt-1">{t('Sistem performansını ve müşteri etkileşimlerini analiz edin.', 'Analyze system performance and customer interactions.')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1">
                        <Calendar className="ml-2 h-4 w-4 text-gray-400" />
                        {RANGES.map(option => (
                            <button
                                key={option}
                                onClick={() => setRange(option)}
                                className={cn(
                                    "rounded px-2.5 py-1.5 text-xs font-semibold transition-colors",
                                    range === option ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {option} {t('gün', 'days')}
                            </button>
                        ))}
                    </div>
                    <Button onClick={handleExport} disabled={loading || totalInteractions === 0} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="h-4 w-4" />
                        {t('CSV Dışa Aktar', 'Export CSV')}
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t('Toplam Etkileşim', 'Total Interactions')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{totalInteractions}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {rangeChats.length} chatbot · {rangeCalls.length} {t('sesli arama', 'voice calls')}
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t('Otomasyon Oranı', 'Automation Rate')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{t(`%${automationRate}`, `${automationRate}%`)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('İnsan müdahalesi beklemeden tamamlanan chatbot görüşmeleri', 'Chatbot conversations closed without waiting for a person')}
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">{t('Ortalama Arama Süresi', 'Average Call Duration')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">{formatDuration(avgCallDuration)}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {answeredCalls.length} {t('görüşülen', 'answered')} · {rangeCalls.length - answeredCalls.length} {t('cevapsız arama', 'missed calls')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart */}
                <Card className="col-span-1" hoverEffect>
                    <CardHeader>
                        <CardTitle>{t('Günlük Etkileşim Dağılımı', 'Daily Interactions by Module')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
                                    <XAxis dataKey="name" className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="chatbot" name="Chatbot" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="voice" name={t('Sesli Asistan', 'Voice Agent')} stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Chart */}
                <Card className="col-span-1" hoverEffect>
                    <CardHeader>
                        <CardTitle>{t('Toplam Trafik', 'Total Traffic')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
                                    <XAxis dataKey="name" className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="total" name={t('Toplam', 'Total')} stroke="#8b5cf6" strokeWidth={3} dot={range === 30 ? false : { r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Pie Chart */}
                <Card className="col-span-1" hoverEffect>
                    <CardHeader>
                        <CardTitle>{t('Kanal Kullanımı', 'Channel Usage')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="flex flex-col items-center justify-between h-[280px] w-full">
                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 text-[13px] font-medium text-gray-500 flex-wrap w-full px-2">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2" hoverEffect>
                    <CardHeader>
                        <CardTitle>{t('Chatbot Sonuç Kategorileri', 'Chatbot Outcome Categories')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categoryData.length === 0 ? (
                                <p className="py-8 text-center text-sm text-gray-400">
                                    {loading ? t('Yükleniyor...', 'Loading...') : t('Bu aralıkta veri yok.', 'No data in this range.')}
                                </p>
                            ) : categoryData.map((category, i) => (
                                <motion.div
                                    key={category.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 font-medium text-gray-900">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                                            {category.name}
                                        </span>
                                        <span className="text-gray-500">
                                            {category.count} · {t(`%${Math.round((category.count / rangeChats.length) * 100)}`, `${Math.round((category.count / rangeChats.length) * 100)}%`)}
                                        </span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${(category.count / categoryData[0].count) * 100}%`, backgroundColor: category.color }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
