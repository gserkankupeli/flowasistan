import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, ArrowUpRight, CheckCircle, Clock, AlertCircle, RefreshCw, User, Phone, AlignLeft, Calendar, ChevronLeft, Bot } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/StatsCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { appPath } from '../../lib/config';
import { useLang } from '../../lib/i18n';
import { dayKey, lastDays, platformLabel, statusLabel } from '../../lib/format';
import type { Database } from '../../types';

// Define refined types for our usage
type DbConversation = Database['public']['Tables']['chatbot_conversations']['Row'];
type Customer = { first_name: string | null; last_name: string | null; phone: string };

interface Conversation extends DbConversation {
    customers: Customer | null;
    // Helper to access conversation_data as a specific type safely
    messages?: ChatMessage[];
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at?: string;
}

const STATUS_COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

export default function Chatbot() {
    const { t, locale } = useLang();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'dashboard' | 'inbox'>('inbox');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activityDates, setActivityDates] = useState<{ platform: string | null; date: string }[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const platforms = [
        { id: 'all', label: t('Tümü', 'All') },
        { id: 'whatsapp', label: 'WhatsApp' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'telegram', label: 'Telegram' },
        { id: 'webchat', label: 'Web Chat' },
    ];

    useEffect(() => {
        fetchConversations();
        setupRealtimeSubscription();

        return () => {
            supabase.channel('chatbot_list').unsubscribe();
        };
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('chatbot_conversations')
                .select(`
                    *,
                    customers ( first_name, last_name, phone )
                `)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setActivityDates(data
                    .filter((item: any) => item.last_message_at)
                    .map((item: any) => ({ platform: item.platform_type, date: item.last_message_at })));

                // Group by customer_id
                const groupedMap: { [key: string]: Conversation } = {};

                data.forEach((item: any) => {
                    const customerId = item.customer_id;
                    // If no customer_id, use unique row id to keep separate
                    const key = customerId || `unique-${item.id}`;

                    const currentMessages = Array.isArray(item.conversation_data) ? item.conversation_data : [];

                    if (!groupedMap[key]) {
                        groupedMap[key] = {
                            ...item,
                            messages: currentMessages
                        };
                    } else {
                        // Merge messages
                        const existingMessages = groupedMap[key].messages || [];
                        groupedMap[key].messages = [...existingMessages, ...currentMessages];

                        // Update metadata to reflect the most recent activity
                        if (item.last_message_at && groupedMap[key].last_message_at && new Date(item.last_message_at) > new Date(groupedMap[key].last_message_at!)) {
                            groupedMap[key].last_message_at = item.last_message_at;
                            groupedMap[key].status = item.status; // Take status from latest
                            groupedMap[key].summary = item.summary || groupedMap[key].summary;
                        }
                    }
                });

                // Convert back to array and sort messages internally
                const mapped: Conversation[] = Object.values(groupedMap).map(conv => {
                    if (conv.messages && conv.messages.length > 0) {
                        conv.messages.sort((a, b) => {
                            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                            return dateA - dateB;
                        });
                    }
                    return conv;
                });

                // Sort conversations by latest message
                mapped.sort((a, b) => {
                    const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                    const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                    return dateB - dateA;
                });

                setConversations(mapped);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        supabase
            .channel('chatbot_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'chatbot_conversations' },
                async () => {
                    await fetchConversations();
                }
            )
            .subscribe();
    };

    const customerName = (c: Conversation) =>
        c.customers?.first_name
            ? `${c.customers.first_name} ${c.customers.last_name || ''}`.trim()
            : t('İsimsiz Müşteri', 'Unnamed Customer');

    // Filter Logic
    const platformConversations = conversations.filter(c =>
        selectedPlatform === 'all' || c.platform_type === selectedPlatform);

    const filteredConversations = platformConversations.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLocaleLowerCase(locale);
        return (
            customerName(c).toLocaleLowerCase(locale).includes(q) ||
            (c.customers?.phone || '').toLowerCase().includes(q) ||
            (c.summary || '').toLocaleLowerCase(locale).includes(q)
        );
    });

    const selectedConversation = conversations.find(c => c.id === selectedId) || null;

    // Helper to extract last message content safely
    const getLastMessage = (c: Conversation) => {
        const msgs = c.messages;
        if (msgs && msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            return last.content;
        }
        return c.summary || t('Mesaj yok', 'No messages');
    };

    // Derived Stats for Dashboard View (follow the platform tabs)
    const totalMessages = platformConversations.reduce((acc, curr) => acc + (curr.message_count || 0), 0);
    const activeCount = platformConversations.filter(c => c.status === 'active').length;
    const completedCount = platformConversations.filter(c => c.status === 'completed').length;
    const urgentCount = platformConversations.filter(c => c.priority === 'urgent').length;

    const dailyCounts: Record<string, number> = {};
    activityDates.forEach(({ platform, date }) => {
        if (selectedPlatform !== 'all' && platform !== selectedPlatform) return;
        const key = dayKey(new Date(date));
        dailyCounts[key] = (dailyCounts[key] || 0) + 1;
    });
    const dailyTrendData = lastDays(14).map(day => ({
        name: day.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        value: dailyCounts[dayKey(day)] || 0,
    }));
    const statusData = [
        { name: t('Aktif', 'Active'), value: activeCount },
        { name: t('Tamamlanan', 'Completed'), value: completedCount },
        { name: t('Acil', 'Urgent'), value: urgentCount },
    ];


    return (
        <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header / Tabs */}
            <div className="flex flex-wrap justify-between items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div className="flex gap-1">
                    <button
                        onClick={() => setViewMode('inbox')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                            viewMode === 'inbox'
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <MessageSquare className="h-4 w-4" />
                        {t('Gelen Kutusu', 'Inbox')}
                    </button>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                            viewMode === 'dashboard'
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <ArrowUpRight className="h-4 w-4" />
                        {t('Bot Analitiği', 'Bot Analytics')}
                    </button>
                </div>

                {/* Platform Selector */}
                <div className="flex gap-2 overflow-x-auto pb-0 scrollbar-hide">
                    {platforms.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPlatform(p.id)}
                            className={cn(
                                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                selectedPlatform === p.id
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                    <button
                        onClick={() => fetchConversations()}
                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        title={t('Yenile', 'Refresh')}
                    >
                        <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="space-y-6 overflow-y-auto p-1 custom-scrollbar">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard title={t('Toplam Mesaj', 'Total Messages')} value={totalMessages.toString()} change={t('Aktif', 'Active')} icon={MessageSquare} iconColor="text-blue-600" iconBg="bg-blue-50" />
                        <StatsCard title={t('Aktif Konuşmalar', 'Active Conversations')} value={activeCount.toString()} change={t('Canlı', 'Live')} trend="neutral" icon={Clock} iconColor="text-orange-600" iconBg="bg-orange-50" />
                        <StatsCard title={t('Tamamlanan', 'Completed')} value={completedCount.toString()} change={t('Başarılı', 'Successful')} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
                        <StatsCard title={t('Acil İlgi Bekleyen', 'Needs Urgent Attention')} value={urgentCount.toString()} change={t('Kritik', 'Critical')} trend="down" icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2" hoverEffect>
                            <CardHeader>
                                <CardTitle>{t('Günlük Konuşma Trendi (14 gün)', 'Daily Conversations (14 days)')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyTrendData}>
                                            <defs>
                                                <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" name={t('Konuşma', 'Conversations')} stroke="#3b82f6" fillOpacity={1} fill="url(#colorMsgs)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-1" hoverEffect>
                            <CardHeader>
                                <CardTitle>{t('Durum Dağılımı', 'Status Breakdown')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {statusData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full min-h-0">
                    {/* Left Sidebar: Conversation List */}
                    <div className={cn("w-full md:w-80 border-r border-gray-200 flex-col h-full shrink-0", selectedConversation ? "hidden md:flex" : "flex")}>
                        <div className="p-4 border-b border-gray-200 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('Müşteri ara...', 'Search customers...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading && conversations.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                                    {t('Yükleniyor...', 'Loading...')}
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm p-4 text-center">
                                    <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                                    {searchQuery ? t('Arama sonucu bulunamadı.', 'No results found.') : t('Henüz konuşma yok.', 'No conversations yet.')}
                                </div>
                            ) : (
                                filteredConversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedId(conv.id)}
                                        className={cn(
                                            "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                                            selectedConversation?.id === conv.id ? "bg-blue-50 hover:bg-blue-50" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm text-gray-900 truncate pr-2">
                                                {customerName(conv)}
                                            </span>
                                            <span className="text-[10px] text-gray-500 shrink-0">
                                                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1 mb-2 h-4">
                                            {getLastMessage(conv)}
                                        </p>
                                        <div className="flex gap-2">
                                            <Badge variant={conv.status === 'active' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
                                                {statusLabel(conv.status || 'active', t)}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-gray-500">
                                                {platformLabel(conv.platform_type)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Content: Customer & conversation detail */}
                    <div className={cn("flex-1 flex-col bg-gray-50 h-full overflow-hidden min-w-0", selectedConversation ? "flex" : "hidden md:flex")}>
                        {selectedConversation ? (
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="md:hidden inline-flex items-center gap-1 text-sm font-medium text-blue-600"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        {t('Listeye dön', 'Back to list')}
                                    </button>

                                    {/* Müşteri Başlık Kartı */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6">
                                        <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold border border-blue-100">
                                            {selectedConversation.customers?.first_name?.[0] || <User className="h-8 w-8 text-blue-400" />}
                                            {selectedConversation.customers?.last_name?.[0] || ''}
                                        </div>
                                        <div className="flex-1 pt-2 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        {customerName(selectedConversation)}
                                                    </h2>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={selectedConversation.status === 'active' ? 'success' : 'secondary'} className="px-2 py-0.5">
                                                            {statusLabel(selectedConversation.status || 'active', t)}
                                                        </Badge>
                                                        <Badge variant="outline" className="px-2 py-0.5 text-gray-500 bg-gray-50">
                                                            {platformLabel(selectedConversation.platform_type)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => navigate(appPath('customers'), { state: { customerId: selectedConversation.customer_id } })}
                                                    className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-none"
                                                >
                                                    {t('Detaylı Profili Gör', 'View Full Profile')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Müşteri Bilgileri Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('İletişim Bilgileri', 'Contact Details')}</h3>

                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-gray-400">{t('Telefon Numarası', 'Phone Number')}</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedConversation.customers?.phone || t('Kayıtlı Değil', 'Not on file')}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-gray-400">{t('Son Etkileşim', 'Last Interaction')}</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {selectedConversation.last_message_at
                                                            ? new Date(selectedConversation.last_message_at).toLocaleString(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                                                            : t('Bilinmiyor', 'Unknown')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t('Konuşma Özeti', 'Conversation Summary')}</h3>

                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 shrink-0 flex items-center justify-center mt-0.5">
                                                    <AlignLeft className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-medium text-gray-400 mb-1">{t('Yapay Zeka Analizi', 'AI Analysis')}</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                        {selectedConversation.summary || t('Bu konuşma için henüz bir özet oluşturulmamış.', 'No summary has been generated for this conversation yet.')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mesaj Geçmişi */}
                                    {selectedConversation.messages && selectedConversation.messages.length > 0 && (
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-4">{t('Mesaj Geçmişi', 'Message History')}</h3>
                                            <div className="space-y-3">
                                                {selectedConversation.messages.map((msg, i) => (
                                                    <div key={i} className={cn("flex items-end gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                                        {msg.role !== 'user' && (
                                                            <div className="h-7 w-7 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                                                <Bot className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                                            msg.role === 'user'
                                                                ? "bg-blue-600 text-white rounded-br-md"
                                                                : "bg-gray-100 text-gray-800 rounded-bl-md"
                                                        )}>
                                                            <p>{msg.content}</p>
                                                            {msg.created_at && (
                                                                <p className={cn("mt-1 text-[10px]", msg.role === 'user' ? "text-blue-100" : "text-gray-400")}>
                                                                    {new Date(msg.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <User className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{t('Müşteri Seçilmedi', 'No Customer Selected')}</h3>
                                <p className="text-sm">{t('Detayları görüntülemek için sol taraftan bir müşteri seçin.', 'Pick a customer on the left to see the details.')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
