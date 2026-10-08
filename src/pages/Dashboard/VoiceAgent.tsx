import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Pause, Download, Search, BarChart3, Clock, CheckCircle, XCircle, ChevronLeft, VolumeX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { StatsCard } from '../../components/StatsCard';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';
import { supabase } from '../../lib/supabase';
import { isDemo } from '../../lib/config';
import { useLang } from '../../lib/i18n';
import { dayKey, formatDuration, lastDays } from '../../lib/format';

// direction and transcript are optional: they are shown when the row carries them
type CallAnalytics = Database['public']['Tables']['call_analytics']['Row'] & {
    direction?: 'incoming' | 'outgoing' | null;
    transcript?: string | null;
};

const CATEGORY_COLORS = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#6B7280', '#EF4444'];

export default function VoiceAgent() {
    const { t, locale } = useLang();
    const [viewMode, setViewMode] = useState<'dashboard' | 'calls'>('calls');
    const [calls, setCalls] = useState<CallAnalytics[]>([]);
    const [selectedCall, setSelectedCall] = useState<CallAnalytics | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('call_analytics')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setCalls(data);
                // on wide screens open the latest call right away; on mobile start with the list
                if (data.length > 0 && window.innerWidth >= 768) {
                    setSelectedCall(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCall = (call: CallAnalytics | null) => {
        setSelectedCall(call);
        setActiveTab('summary');
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    };

    const handlePlayPause = () => {
        if (!selectedCall?.recording_url || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const filteredCalls = calls.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLocaleLowerCase(locale);
        return (
            (c.customer_phone || '').toLowerCase().includes(q) ||
            (c.summary || '').toLocaleLowerCase(locale).includes(q) ||
            (c.category || '').toLocaleLowerCase(locale).includes(q)
        );
    });

    // Calculate Dashboard Stats
    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.duration && c.duration > 0);
    const avgDuration = answeredCalls.length > 0
        ? Math.round(answeredCalls.reduce((acc, curr) => acc + (curr.duration || 0), 0) / answeredCalls.length)
        : 0;
    const missedCalls = totalCalls - answeredCalls.length;

    const categoryCounts: Record<string, number> = {};
    calls.forEach(c => {
        const key = c.category || t('Kategorisiz', 'Uncategorized');
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    });
    const categoryData = Object.entries(categoryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const dailyCounts: Record<string, { answered: number; missed: number }> = {};
    calls.forEach(c => {
        const key = dayKey(new Date(c.created_at));
        dailyCounts[key] = dailyCounts[key] || { answered: 0, missed: 0 };
        if (c.duration && c.duration > 0) dailyCounts[key].answered += 1;
        else dailyCounts[key].missed += 1;
    });
    const dailyData = lastDays(14).map(day => ({
        name: day.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
        answered: dailyCounts[dayKey(day)]?.answered || 0,
        missed: dailyCounts[dayKey(day)]?.missed || 0,
    }));

    const directionBadge = (call: CallAnalytics) => {
        if (call.direction === 'outgoing') {
            return <span className="flex items-center text-xs text-indigo-600 gap-1"><PhoneOutgoing className="h-3 w-3" /> {t('Giden', 'Outbound')}</span>;
        }
        if (call.direction === 'incoming') {
            return <span className="flex items-center text-xs text-green-600 gap-1"><PhoneIncoming className="h-3 w-3" /> {t('Gelen', 'Inbound')}</span>;
        }
        return <span className="flex items-center text-xs text-green-600 gap-1"><PhoneIncoming className="h-3 w-3" /> {t('Arama', 'Call')}</span>;
    };

    return (
        <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col">
            {/* Header / Tabs */}
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div className="flex gap-1">
                    <button
                        onClick={() => setViewMode('calls')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                            viewMode === 'calls'
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-50"
                        )}
                    >
                        <Phone className="h-4 w-4" />
                        {t('Arama Kayıtları', 'Call Log')}
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
                        <BarChart3 className="h-4 w-4" />
                        {t('Analitik', 'Analytics')}
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="space-y-6 overflow-y-auto p-1">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard title={t('Toplam Arama', 'Total Calls')} value={totalCalls.toString()} icon={Phone} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
                        <StatsCard title={t('Ortalama Süre', 'Average Duration')} value={formatDuration(avgDuration)} icon={Clock} iconColor="text-blue-600" iconBg="bg-blue-50" />
                        <StatsCard title={t('Başarılı Görüşme', 'Completed Calls')} value={answeredCalls.length.toString()} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
                        <StatsCard title={t('Kaçırılan Çağrı', 'Missed Calls')} value={missedCalls.toString()} icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2" hoverEffect>
                            <CardHeader>
                                <CardTitle>{t('Günlük Arama Sayısı (14 gün)', 'Daily Calls (14 days)')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dailyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} className="text-xs text-gray-500" />
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                            <Bar dataKey="answered" name={t('Görüşülen', 'Answered')} stackId="a" fill="#6366f1" />
                                            <Bar dataKey="missed" name={t('Cevapsız', 'Missed')} stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-1" hoverEffect>
                            <CardHeader>
                                <CardTitle>{t('Sonuç Kategorileri', 'Outcome Categories')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={categoryData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                                {categoryData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden min-h-0">
                    {/* Sidebar List */}
                    <div className={cn("w-full md:w-80 border-r border-gray-200 flex-col shrink-0", selectedCall ? "hidden md:flex" : "flex")}>
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold mb-4">{t('Aramalar', 'Calls')}</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('Arama kayıtlarında ara...', 'Search the call log...')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">{t('Yükleniyor...', 'Loading...')}</div>
                            ) : filteredCalls.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">{t('Kayıt bulunamadı.', 'No records found.')}</div>
                            ) : (
                                filteredCalls.map(call => (
                                    <div
                                        key={call.id}
                                        onClick={() => selectCall(call)}
                                        className={cn(
                                            "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                                            selectedCall?.id === call.id ? "bg-blue-50 hover:bg-blue-50" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {call.customer_phone || t('Bilinmeyen Numara', 'Unknown Number')}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(call.created_at).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {directionBadge(call)}
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{formatDuration(call.duration)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                {call.category || t('Kategorisiz', 'Uncategorized')}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className={cn("flex-1 flex-col bg-gray-50 min-w-0", selectedCall ? "flex" : "hidden md:flex")}>
                        {selectedCall ? (
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <div className="min-h-20 px-4 md:px-8 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <button onClick={() => selectCall(null)} className="md:hidden text-blue-600" aria-label={t('Listeye dön', 'Back to list')}>
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="h-12 w-12 shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="text-lg font-bold text-gray-900 truncate">
                                                {selectedCall.customer_phone || t('Bilinmeyen Numara', 'Unknown Number')}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {new Date(selectedCall.created_at).toLocaleString(locale)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedCall.recording_url && (
                                            <Button variant="outline" onClick={() => window.open(selectedCall.recording_url!, '_blank')}>
                                                <Download className="mr-2 h-4 w-4" /> {t('İndir', 'Download')}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                                    {/* Audio Player Card */}
                                    {selectedCall.recording_url ? (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                <audio
                                                    key={selectedCall.id}
                                                    ref={audioRef}
                                                    src={selectedCall.recording_url}
                                                    onEnded={() => setIsPlaying(false)}
                                                    onPause={() => setIsPlaying(false)}
                                                    onPlay={() => setIsPlaying(true)}
                                                    onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                                                    onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                                                    className="hidden"
                                                />
                                                <button
                                                    onClick={handlePlayPause}
                                                    className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shrink-0"
                                                >
                                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="h-2 bg-gray-100 rounded-full w-full relative cursor-pointer group">
                                                        <div
                                                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                                            onClick={(e) => {
                                                                if (!audioRef.current) return;
                                                                const rect = e.currentTarget.getBoundingClientRect();
                                                                const percent = (e.clientX - rect.left) / rect.width;
                                                                audioRef.current.currentTime = percent * duration;
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="h-full bg-blue-500 rounded-full relative transition-all duration-100"
                                                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                                        >
                                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-2 select-none">
                                                        <span>{formatDuration(currentTime)}</span>
                                                        <span>{formatDuration(duration || selectedCall.duration)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : isDemo && (
                                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm text-gray-500">
                                            <VolumeX className="h-5 w-5 shrink-0 text-gray-400" />
                                            {t(
                                                'Demo kayıtlarında ses dosyası yok. Gerçek kurulumda arama kaydı burada oynatılır ve indirilebilir.',
                                                'Demo records have no audio file. In a live setup the call recording plays here and can be downloaded.'
                                            )}
                                        </div>
                                    )}

                                    {/* Tabs */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
                                        <div className="flex border-b border-gray-200">
                                            <button
                                                onClick={() => setActiveTab('summary')}
                                                className={cn(
                                                    "flex-1 py-4 text-sm font-medium border-b-2 transition-colors",
                                                    activeTab === 'summary' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-600 hover:bg-gray-50"
                                                )}
                                            >
                                                {t('AI Özeti', 'AI Summary')}
                                            </button>
                                            {selectedCall.transcript && (
                                                <button
                                                    onClick={() => setActiveTab('transcript')}
                                                    className={cn(
                                                        "flex-1 py-4 text-sm font-medium border-b-2 transition-colors",
                                                        activeTab === 'transcript' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {t('Transkript', 'Transcript')}
                                                </button>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            {activeTab === 'transcript' && selectedCall.transcript ? (
                                                <div className="space-y-3 text-sm">
                                                    {selectedCall.transcript.split('\n').map((line, i) => {
                                                        const separator = line.indexOf(':');
                                                        const speaker = separator > 0 ? line.slice(0, separator) : '';
                                                        const text = separator > 0 ? line.slice(separator + 1).trim() : line;
                                                        return (
                                                            <p key={i} className="leading-relaxed text-gray-700">
                                                                {speaker && <span className="mr-2 font-semibold text-gray-900">{speaker}:</span>}
                                                                {text}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm max-w-none text-gray-600">
                                                    <h4 className="text-gray-900 font-semibold mb-2">{t('Görüşme Özeti', 'Call Summary')}</h4>
                                                    <p>{selectedCall.summary || t('Özet bulunmuyor.', 'No summary available.')}</p>

                                                    <h4 className="text-gray-900 font-semibold mt-6 mb-2">{t('Sonuç Kategorisi', 'Outcome Category')}</h4>
                                                    <Badge>{selectedCall.category || t('Belirsiz', 'Unclear')}</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <Phone className="h-16 w-16 mb-4 opacity-50" />
                                <p>{t('Bir arama kaydı seçin', 'Select a call record')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
