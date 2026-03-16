import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneIncoming, Play, Pause, Download, Search, MoreVertical, BarChart3, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatsCard } from '../../components/StatsCard';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';
import { supabase } from '../../lib/supabase';

type CallAnalytics = Database['public']['Tables']['call_analytics']['Row'];

function formatDuration(seconds: number | null) {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceAgent() {
    const [viewMode, setViewMode] = useState<'dashboard' | 'calls'>('calls');
    const [calls, setCalls] = useState<CallAnalytics[]>([]);
    const [selectedCall, setSelectedCall] = useState<CallAnalytics | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
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
                if (data.length > 0) {
                    setSelectedCall(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching calls:', error);
        } finally {
            setLoading(false);
        }
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

    // Calculate Dashboard Stats
    const totalCalls = calls.length;
    const avgDuration = calls.length > 0
        ? Math.round(calls.reduce((acc, curr) => acc + (curr.duration || 0), 0) / calls.length)
        : 0;
    const completedCalls = calls.filter(c => c.category !== 'Cevapsız' && c.category !== 'Sorunlu').length; // Basit bir varsayım
    const missedCalls = calls.filter(c => c.duration === 0 || !c.duration).length;

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
                        Arama Kayıtları
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
                        Analitik
                    </button>
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="space-y-6 overflow-y-auto p-1">
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <StatsCard title="Toplam Arama" value={totalCalls.toString()} change="-" icon={Phone} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
                        <StatsCard title="Ortalama Süre" value={formatDuration(avgDuration)} change="-" trend="up" icon={Clock} iconColor="text-blue-600" iconBg="bg-blue-50" />
                        <StatsCard title="Başarılı Görüşme" value={completedCalls.toString()} change="-" icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
                        <StatsCard title="Kaçırılan Çağrı" value={missedCalls.toString()} change="-" trend="down" icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
                    </div>

                    {/* Placeholder Charts for now */}
                    <div className="p-10 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        Grafikler yakında eklenecek...
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-80 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold mb-4">Aramalar</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Arama kayıtlarında ara..."
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                            ) : calls.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">Kayıt bulunamadı.</div>
                            ) : (
                                calls.map(call => (
                                    <div
                                        key={call.id}
                                        onClick={() => setSelectedCall(call)}
                                        className={cn(
                                            "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                                            selectedCall?.id === call.id ? "bg-blue-50 hover:bg-blue-50" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                                {call.customer_phone || 'Bilinmeyen Numara'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* Assuming all calls are incoming/unified for now as direction isn't in requirements yet */}
                                            <span className="flex items-center text-xs text-green-600 gap-1"><PhoneIncoming className="h-3 w-3" /> Arama</span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{formatDuration(call.duration)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                {call.category || 'Kategorisiz'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {selectedCall ? (
                            <div className="h-full flex flex-col">
                                {/* Header */}
                                <div className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">
                                                {selectedCall.customer_phone || 'Bilinmeyen Numara'}
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                {new Date(selectedCall.created_at).toLocaleString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {selectedCall.recording_url && (
                                            <Button variant="outline" onClick={() => window.open(selectedCall.recording_url!, '_blank')}>
                                                <Download className="mr-2 h-4 w-4" /> İndir
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                    {/* Audio Player Card */}
                                    {selectedCall.recording_url && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                <audio
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
                                                AI Özeti
                                            </button>
                                            {/* Transcript tab removed for now as not in requirements, or can be added if data available */}
                                        </div>

                                        <div className="p-6">
                                            <div className="prose prose-sm max-w-none text-gray-600">
                                                <h4 className="text-gray-900 font-semibold mb-2">Görüşme Özeti</h4>
                                                <p>{selectedCall.summary || 'Özet bulunmuyor.'}</p>

                                                <h4 className="text-gray-900 font-semibold mt-6 mb-2">Sonuç Kategorisi</h4>
                                                <Badge>{selectedCall.category || 'Belirsiz'}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <Phone className="h-16 w-16 mb-4 opacity-50" />
                                <p>Bir arama kaydı seçin</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
