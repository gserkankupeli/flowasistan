import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    MessageSquare,
    Phone,
    ArrowUpRight,
    Clock,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Check } from 'lucide-react';

// Extend the database types for specific joins if needed, 
// or use the generic structure but cast properly.
// For interactions view:
interface Interaction {
    id: string;
    summary: string | null;
    platform: string; // 'whatsapp' | 'web' | 'instagram' | 'phone' in DB it might be platform_type
    status: string;
    last_message_at: string;
    customers: {
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
    } | null;
    categories: {
        name: string;
        color: string;
    } | null;
}

interface UrgentCallback {
    conversation_id: string;
    customer_id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    telegram_id: string | null;
    konusma_ozeti: string | null;
    durum: string | null;
    renk_kodu: string | null;
    son_mesaj_tarihi: string | null;
}

interface DashboardStats {
    totalInteractions: number;
    activeSessions: number;
    urgentActions: number;
}

export default function Overview() {
    const [stats, setStats] = useState<DashboardStats>({
        totalInteractions: 0,
        activeSessions: 0,
        urgentActions: 0
    });
    const [recentActivity, setRecentActivity] = useState<Interaction[]>([]);
    const [urgentCallbacks, setUrgentCallbacks] = useState<UrgentCallback[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock chart data for now (since aggregate queries for charts are complex/better done with RPC or separate logic)
    // You can implement real chart data fetching later similarly.
    const chartData = [
        { name: '09:00', chatbot: 40, voice: 24 },
        { name: '11:00', chatbot: 30, voice: 13 },
        { name: '13:00', chatbot: 20, voice: 58 },
        { name: '15:00', chatbot: 27, voice: 39 },
        { name: '17:00', chatbot: 18, voice: 48 },
        { name: '19:00', chatbot: 23, voice: 38 },
        { name: '21:00', chatbot: 34, voice: 43 },
    ];

    useEffect(() => {
        fetchDashboardData();

        // Realtime Subscription
        const channel = supabase
            .channel('dashboard_overview')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chatbot_conversations'
                },
                () => {
                    fetchDashboardData();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chatbot_conversations'
                },
                () => {
                    fetchDashboardData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch KPI Counts
            // Total Conversations
            const { count: totalCount } = await supabase
                .from('chatbot_conversations')
                .select('*', { count: 'exact', head: true });

            // Active Sessions
            const { count: activeCount } = await supabase
                .from('chatbot_conversations')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active'); // Assuming 'active' is a valid status enum

            // Urgent Actions (e.g. specific category or sentiment. 
            // Assuming we check 'category_id' referring to an "Urgent" category OR checking null summary/errors.
            // For now, let's assume we want to count rows where category might join to "Acil" or similar.
            // But simpler: let's count where status is 'human_handoff' or something critical, or just mock logic for "Urgent" count if DB doesn't have it explicitly.)
            // Let's rely on 'categories' table if possible. For simplicity here: status = 'closed' as "Completed", active as "Waiting".
            // Let's count 'active' as Urgent for this demo if separate critical field missing.

            // Let's fetch recent Activity with Relations
            const { data: activityData, error: activityError } = await supabase
                .from('chatbot_conversations')
                .select(`
          id,
          summary,
          platform: platform_type,
          status,
          last_message_at,
          customers ( first_name, last_name, phone ),
          categories ( name, color )
        `)
                .order('last_message_at', { ascending: false })
                .limit(6);

            if (activityError) throw activityError;

            // Transform raw data to UI shape if needed
            const formattedActivity = (activityData as any[]).map(item => ({
                id: item.id,
                summary: item.summary,
                platform: item.platform,
                status: item.status,
                last_message_at: item.last_message_at,
                customers: item.customers, // might be array or object depending on relation one-to-one/many
                categories: item.categories
            }));

            // Fetch Urgent Callbacks
            const { data: urgentData, error: urgentError } = await supabase
                .from('urgent_callbacks')
                .select('*')
                .limit(10);

            if (urgentError) console.error('Error fetching urgent callbacks:', urgentError);

            setStats({
                totalInteractions: totalCount || 0,
                activeSessions: activeCount || 0,
                urgentActions: urgentData?.length || 0
            });
            setRecentActivity(formattedActivity);
            if (urgentData) setUrgentCallbacks(urgentData as UrgentCallback[]);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform?.toLowerCase()) {
            case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-600" />;
            case 'voice': return <Phone className="h-4 w-4 text-purple-600" />;
            case 'instagram': return <MessageSquare className="h-4 w-4 text-pink-600" />;
            default: return <MessageSquare className="h-4 w-4 text-blue-600" />;
        }
    };

    const getTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Az önce';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}dk önce`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}sa önce`;
        return `${Math.floor(diffInSeconds / 86400)}g önce`;
    };

    const markAsCompleted = async (conversationId: string) => {
        try {
            const { error } = await supabase
                .from('chatbot_conversations')
                .update({ status: 'completed' as const })
                .eq('id', conversationId);

            if (error) throw error;
            fetchDashboardData();
        } catch (error) {
            console.error("Error marking as completed", error);
            alert("İşlem tamamlanırken bir hata oluştu.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-[28px] font-bold tracking-tight text-gray-900">Genel Bakış</h2>
                <p className="text-[15px] text-gray-400 mt-1 font-medium">Chatbot ve sesli asistan performansınızı buradan takip edin.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card hoverEffect>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                        <CardTitle className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Toplam Etkileşim</CardTitle>
                        <MessageSquare className="h-[18px] w-[18px] text-blue-400" />
                    </CardHeader>
                    <CardContent className="bg-transparent">
                        <div className="text-[42px] font-extrabold text-gray-900 tracking-tight leading-none mb-2">{stats.totalInteractions}</div>
                        <p className="text-[13px] text-emerald-500 flex items-center font-bold">
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Güncel
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                        <CardTitle className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Aktif Görüşmeler</CardTitle>
                        <Clock className="h-[18px] w-[18px] text-orange-400" />
                    </CardHeader>
                    <CardContent className="bg-transparent">
                        <div className="text-[42px] font-extrabold text-gray-900 tracking-tight leading-none mb-2">{stats.activeSessions}</div>
                        <p className="text-[13px] text-orange-500 flex items-center font-bold">
                            Canlı devam eden
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-transparent">
                        <CardTitle className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Aksiyon Bekleyen</CardTitle>
                        <AlertCircle className="h-[18px] w-[18px] text-red-400" />
                    </CardHeader>
                    <CardContent className="bg-transparent">
                        <div className="text-[42px] font-extrabold text-gray-900 tracking-tight leading-none mb-2">{stats.urgentActions}</div>
                        <p className="text-[13px] text-red-500 flex items-center font-bold">
                            Müdahale gerekli
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-7">

                {/* Live Interactions Feed */}
                <Card className="md:col-span-4 h-[500px]" hoverEffect>
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            Son Etkileşimler (Canlı)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-y-auto pr-4 custom-scrollbar" style={{ height: '400px' }}>
                        <div className="space-y-5">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400 font-medium">Yükleniyor...</div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-medium">Henüz etkileşim yok.</div>
                            ) : (
                                recentActivity.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-4 p-4 rounded-2xl hover:bg-[#f8fafc] transition-colors border border-transparent hover:border-gray-100 group"
                                    >
                                        <div className="h-11 w-11 rounded-2xl bg-blue-50/50 flex items-center justify-center shrink-0 border border-blue-100/50">
                                            {getPlatformIcon(item.platform)}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-[15px] font-bold text-gray-900 truncate">
                                                    {item.customers?.first_name} {item.customers?.last_name}
                                                </p>
                                                <span className="text-[13px] font-medium text-gray-400 whitespace-nowrap">{getTimeAgo(item.last_message_at)}</span>
                                            </div>
                                            <p className="text-[14px] leading-relaxed text-gray-500 line-clamp-2">
                                                {item.summary || 'Özet bekleniyor...'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        backgroundColor: item.categories?.color ? `${item.categories.color}15` : '#f1f5f9',
                                                        color: item.categories?.color || '#94a3b8'
                                                    }}
                                                >
                                                    {item.categories?.name || 'Kategorisiz'}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase font-bold tracking-wider ${item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chart Section */}
                <Card className="md:col-span-3 h-[500px]" hoverEffect>
                    <CardHeader className="pb-8">
                        <CardTitle className="text-lg font-bold text-gray-900">Etkileşim Yoğunluğu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorChatbot" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#c084fc" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={15} className="text-[12px] font-medium text-gray-400" />
                                    <YAxis axisLine={false} tickLine={false} tickMargin={15} className="text-[12px] font-medium text-gray-400" />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="chatbot"
                                        stroke="#60a5fa"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorChatbot)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="voice"
                                        stroke="#c084fc"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVoice)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Urgent Callbacks Section */}
            <div className="grid gap-6 md:grid-cols-1">
                <Card hoverEffect>
                    <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between bg-red-50/30">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-red-900">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Acil Aksiyon / Geri Arama Bekleyen Müşteriler
                        </CardTitle>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">{urgentCallbacks.length} Kişi Bekliyor</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 font-medium">Yükleniyor...</div>
                        ) : urgentCallbacks.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 font-medium bg-gray-50/50">Şu anda acil aksiyon bekleyen müşteri yok. Harika iş!</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {urgentCallbacks.map((cb) => (
                                    <div key={cb.conversation_id} className="p-5 hover:bg-gray-50/80 transition-colors flex items-center justify-between group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-[15px] font-bold text-gray-900">
                                                    {cb.first_name} {cb.last_name}
                                                </h4>
                                                <span
                                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                                                    style={{ backgroundColor: cb.renk_kodu ? `${cb.renk_kodu}15` : '#f1f5f9', color: cb.renk_kodu || '#94a3b8' }}
                                                >
                                                    {cb.durum}
                                                </span>
                                                <span className="text-xs font-medium text-gray-400">
                                                    {cb.son_mesaj_tarihi ? new Date(cb.son_mesaj_tarihi).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-[13px] text-gray-500 mb-2">
                                                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {cb.phone || 'Telefon yok'}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-1 bg-white inline-block border border-gray-100 px-3 py-1.5 rounded-lg">
                                                <span className="text-gray-400 font-medium mr-1 border-r border-gray-200 pr-2">Özet:</span>
                                                {cb.konusma_ozeti || 'Özet bekleniyor...'}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                onClick={() => markAsCompleted(cb.conversation_id)}
                                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 border-none shadow-none font-bold"
                                                size="sm"
                                            >
                                                <Check className="h-4 w-4 mr-1.5" />
                                                Çözüldü Olarak İşaretle
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
