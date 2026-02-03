import { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Pause, Download, FileText, Search, MoreVertical } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';

// Mock data
type VoiceConversation = Database['public']['Tables']['voice_conversations']['Row'] & {
    customer?: { first_name: string; last_name: string; phone: string };
};

const mockCalls: VoiceConversation[] = [
    {
        id: '1',
        customer_id: 'c1',
        call_direction: 'incoming',
        phone_number: '+905551234567',
        duration_seconds: 185,
        recording_url: '#',
        transcript: "Müşteri: Merhaba, randevu almak istiyorum. \nAgent: Tabii, hangi gün için yardımcı olabilirim? \nMüşteri: Yarın öğleden sonra müsaitlik var mı? \nAgent: Evet, saat 14:00 ve 15:30 boş. Hangisini istersiniz? \nMüşteri: 15:30 olsun lütfen.",
        summary: 'Müşteri yarın 15:30 için randevu oluşturdu.',
        category_id: null,
        call_status: 'completed',
        collected_data: null,
        tags: [],
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        call_started_at: new Date().toISOString(),
        call_ended_at: new Date().toISOString(),
        customer: { first_name: 'Ahmet', last_name: 'Yılmaz', phone: '+905551234567' }
    },
    {
        id: '2',
        customer_id: 'c2',
        call_direction: 'outgoing',
        phone_number: '+905329998877',
        duration_seconds: 0,
        recording_url: null,
        transcript: null,
        summary: 'Müşteriye ulaşılamadı.',
        category_id: null,
        call_status: 'missed',
        collected_data: null,
        tags: [],
        priority: 'low',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        call_started_at: new Date().toISOString(),
        call_ended_at: null,
        customer: { first_name: 'Selin', last_name: 'Demir', phone: '+905329998877' }
    }
];

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceAgent() {
    const [selectedCall, setSelectedCall] = useState<VoiceConversation | null>(mockCalls[0]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
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
                    {mockCalls.map(call => (
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
                                    {call.customer?.first_name} {call.customer?.last_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(call.call_started_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                {call.call_direction === 'incoming' ? (
                                    <span className="flex items-center text-xs text-green-600 gap-1"><PhoneIncoming className="h-3 w-3" /> Gelen</span>
                                ) : (
                                    <span className="flex items-center text-xs text-blue-600 gap-1"><PhoneOutgoing className="h-3 w-3" /> Giden</span>
                                )}
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{formatDuration(call.duration_seconds)}</span>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant={call.call_status === 'completed' ? 'success' : 'destructive'} className="text-[10px] px-1.5 py-0 h-5">
                                    {call.call_status}
                                </Badge>
                            </div>
                        </div>
                    ))}
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
                                        {selectedCall.customer?.first_name} {selectedCall.customer?.last_name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{selectedCall.phone_number}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> İndir</Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Audio Player Card */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                                    >
                                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-1/3 rounded-full"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                                            <span>01:15</span>
                                            <span>{formatDuration(selectedCall.duration_seconds)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    <button
                                        onClick={() => setActiveTab('transcript')}
                                        className={cn(
                                            "flex-1 py-4 text-sm font-medium border-b-2 transition-colors",
                                            activeTab === 'transcript' ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <FileText className="h-4 w-4" /> Transkript
                                        </span>
                                    </button>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'summary' ? (
                                        <div className="prose prose-sm max-w-none text-gray-600">
                                            <h4 className="text-gray-900 font-semibold mb-2">Görüşme Özeti</h4>
                                            <p>{selectedCall.summary}</p>

                                            <h4 className="text-gray-900 font-semibold mt-6 mb-2">Tespit Edilen Kategori</h4>
                                            <Badge>{selectedCall.category_id || 'Randevu Talebi'}</Badge>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedCall.transcript?.split('\n').map((line, i) => (
                                                <div key={i} className={cn("p-3 rounded-lg text-sm", line.startsWith('Agent:') ? "bg-blue-50 ml-8" : "bg-gray-50 mr-8")}>
                                                    <p className="font-medium text-xs mb-1 text-gray-500">{line.split(':')[0]}</p>
                                                    <p className="text-gray-800">{line.split(':')[1]}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
    );
}
