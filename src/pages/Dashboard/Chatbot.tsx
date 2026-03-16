import { useState, useEffect } from 'react';
import { MessageSquare, Search, ArrowUpRight, CheckCircle, Clock, AlertCircle, RefreshCw, User, Phone, AlignLeft, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/StatsCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
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
    const [viewMode, setViewMode] = useState<'dashboard' | 'inbox'>('inbox');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);

    const platforms = [
        { id: 'all', label: 'Tümü', icon: MessageSquare },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
        { id: 'instagram', label: 'Instagram', icon: MessageSquare },
        { id: 'telegram', label: 'Telegram', icon: MessageSquare },
        { id: 'webchat', label: 'Web Chat', icon: MessageSquare },
    ];

    // No chat auto-scroll needed anymore

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
                async (payload) => {
                    console.log('Realtime update:', payload);
                    // For simplicity, re-fetch list to get joined data easily.
                    // Optimistic updates are harder with joins without manual handling.
                    await fetchConversations();
                }
            )
            .subscribe();
    };

    // Filter Logic
    const filteredConversations = conversations.filter(c => {
        if (selectedPlatform !== 'all' && c.platform_type !== selectedPlatform) return false;
        return true;
    });

    // Removed legacy send message logic as we don't send messages here now

    // Helper to extract last message content safely
    const getLastMessage = (c: Conversation) => {
        const msgs = c.messages;
        if (msgs && msgs.length > 0) {
            const last = msgs[msgs.length - 1];
            return last.content;
        }
        return 'Mesaj yok';
    };

    // Derived Stats for Dashboard View (Using filteredConversations so tabs work)
    const totalMessages = filteredConversations.reduce((acc, curr) => acc + (curr.message_count || 0), 0);
    const activeCount = filteredConversations.filter(c => c.status === 'active').length;
    const completedCount = filteredConversations.filter(c => c.status === 'completed').length;
    const urgentCount = filteredConversations.filter(c => c.priority === 'urgent').length;

    // Dummy chart data maps for UI (Static for now as aggregating daily trends from simple rows is heavy for client)
    const dailyTrendData = [
        { name: 'Pzt', value: 120 }, { name: 'Sal', value: 150 }, { name: 'Çar', value: 180 },
        { name: 'Per', value: 240 }, { name: 'Cum', value: 200 }, { name: 'Cmt', value: 90 }, { name: 'Paz', value: 60 },
    ];
    const statusData = [
        { name: 'Aktif', value: activeCount },
        { name: 'Tamamlanan', value: completedCount },
        { name: 'Acil', value: urgentCount },
    ];


    return (
        <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header / Tabs */}
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
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
                        Gelen Kutusu
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
                        Bot Analitiği
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
                        title="Yenile"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="space-y-6 overflow-y-auto p-1 custom-scrollbar">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard title="Toplam Mesaj" value={totalMessages.toString()} change="Aktif" icon={MessageSquare} iconColor="text-blue-600" iconBg="bg-blue-50" />
                        <StatsCard title="Aktif Konuşmalar" value={activeCount.toString()} change="Canlı" trend="neutral" icon={Clock} iconColor="text-orange-600" iconBg="bg-orange-50" />
                        <StatsCard title="Tamamlanan" value={completedCount.toString()} change="Başarılı" icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
                        <StatsCard title="Acil İlgi Bekleyen" value={urgentCount.toString()} change="Kritik" trend="down" icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="col-span-2" hoverEffect>
                            <CardHeader>
                                <CardTitle>Günlük Mesaj Trendi</CardTitle>
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
                                            <YAxis axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMsgs)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1" hoverEffect>
                            <CardHeader>
                                <CardTitle>Durum Dağılımı</CardTitle>
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
                <div className="flex flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
                    {/* Left Sidebar: Conversation List */}
                    <div className="w-80 border-r border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Müşteri ara..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                                    Yükleniyor...
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm p-4 text-center">
                                    <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                                    Henüz konuşma yok.
                                </div>
                            ) : (
                                filteredConversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={cn(
                                            "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                                            selectedConversation?.id === conv.id ? "bg-blue-50 hover:bg-blue-50" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm text-gray-900 truncate pr-2">
                                                {conv.customers?.first_name
                                                    ? `${conv.customers.first_name} ${conv.customers.last_name || ''}`
                                                    : 'İsimsiz Müşteri'
                                                }
                                            </span>
                                            <span className="text-[10px] text-gray-500 shrink-0">
                                                {conv.last_message_at ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1 mb-2 h-4">
                                            {getLastMessage(conv)}
                                        </p>
                                        <div className="flex gap-2">
                                            <Badge variant={conv.status === 'active' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
                                                {conv.status || 'active'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-gray-500">
                                                {conv.platform_type || 'web'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Content: Chat Window */}
                    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
                        {selectedConversation ? (
                            <div className="flex-1 overflow-y-auto p-8 animate-in fade-in duration-300 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-6">

                                    {/* Müşteri Başlık Kartı */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6">
                                        <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-2xl font-bold border border-blue-100">
                                            {selectedConversation.customers?.first_name?.[0] || <User className="h-8 w-8 text-blue-400" />}
                                            {selectedConversation.customers?.last_name?.[0] || ''}
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-900">
                                                        {selectedConversation.customers?.first_name
                                                            ? `${selectedConversation.customers.first_name} ${selectedConversation.customers.last_name || ''}`
                                                            : 'İsimsiz Müşteri'
                                                        }
                                                    </h2>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={selectedConversation.status === 'active' ? 'success' : 'secondary'} className="px-2 py-0.5">
                                                            {selectedConversation.status || 'active'}
                                                        </Badge>
                                                        <Badge variant="outline" className="px-2 py-0.5 capitalize text-gray-500 bg-gray-50">
                                                            {selectedConversation.platform_type || 'web'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button className="shrink-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none shadow-none">
                                                    Detaylı Profili Gör
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Müşteri Bilgileri Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">İletişim Bilgileri</h3>

                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-gray-400">Telefon Numarası</p>
                                                    <p className="text-sm font-semibold text-gray-900">{selectedConversation.customers?.phone || 'Kayıtlı Değil'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-medium text-gray-400">Son Etkileşim</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {selectedConversation.last_message_at
                                                            ? new Date(selectedConversation.last_message_at).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
                                                            : 'Bilinmiyor'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                            <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-2">Konuşma Özeti</h3>

                                            <div className="flex items-start gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 shrink-0 flex items-center justify-center mt-0.5">
                                                    <AlignLeft className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[11px] font-medium text-gray-400 mb-1">Yapay Zeka Analizi</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                        {selectedConversation.summary || 'Bu konuşma için henüz bir özet oluşturulmamış.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
                                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <User className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Müşteri Seçilmedi</h3>
                                <p className="text-sm">Detayları görüntülemek için sol taraftan bir müşteri seçin.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
