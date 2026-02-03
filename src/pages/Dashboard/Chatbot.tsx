import { useState } from 'react';
import { MessageSquare, Send, Search, MoreVertical, Paperclip, Mic } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';

// Mock data for initial development
type Conversation = Database['public']['Tables']['chatbot_conversations']['Row'] & {
    customer?: { first_name: string; last_name: string; phone: string };
    last_message?: string;
};

const mockConversations: Conversation[] = [
    {
        id: '1',
        customer_id: 'c1',
        platform_id: 'p1',
        platform_type: 'whatsapp',
        conversation_data: [],
        summary: null,
        category_id: null,
        status: 'active',
        collected_data: null,
        tags: [],
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_message_at: null,
        last_message_at: new Date().toISOString(),
        message_count: 5,
        customer: { first_name: 'Ahmet', last_name: 'Yılmaz', phone: '+905551234567' },
        last_message: 'Randevu için müsaitlik durumunuz nedir?'
    },
    {
        id: '2',
        customer_id: 'c2',
        platform_id: 'p1',
        platform_type: 'instagram',
        conversation_data: [],
        summary: null,
        category_id: null,
        status: 'completed',
        collected_data: null,
        tags: [],
        priority: 'low',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_message_at: null,
        last_message_at: new Date().toISOString(),
        message_count: 2,
        customer: { first_name: 'Ayşe', last_name: 'Demir', phone: 'instagram_user_123' },
        last_message: 'Teşekkürler, iyi günler.'
    },
    {
        id: '3',
        customer_id: 'c3',
        platform_id: 'p1',
        platform_type: 'whatsapp',
        conversation_data: [],
        summary: null,
        category_id: null,
        status: 'active',
        collected_data: null,
        tags: [],
        priority: 'urgent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        first_message_at: null,
        last_message_at: new Date().toISOString(),
        message_count: 10,
        customer: { first_name: 'Mehmet', last_name: 'Kaya', phone: '+905321112233' },
        last_message: 'Acil cevap bekliyorum!'
    }
];

export default function Chatbot() {
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
    const [messageInput, setMessageInput] = useState('');

    const platforms = [
        { id: 'all', label: 'Tümü', icon: MessageSquare },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }, // In a real app, use brand icons
        { id: 'instagram', label: 'Instagram', icon: MessageSquare },
        { id: 'facebook', label: 'Facebook', icon: MessageSquare },
        { id: 'telegram', label: 'Telegram', icon: MessageSquare },
        { id: 'webchat', label: 'Web Chat', icon: MessageSquare },
    ];

    const filteredConversations = selectedPlatform === 'all'
        ? mockConversations
        : mockConversations.filter(c => c.platform_type === selectedPlatform);

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Left Sidebar: Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                {/* Platform Tabs */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">Mesajlar</h2>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {platforms.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPlatform(p.id)}
                                className={cn(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                                    selectedPlatform === p.id
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Müşteri ara..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv)}
                            className={cn(
                                "p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors",
                                selectedConversation?.id === conv.id ? "bg-blue-50 hover:bg-blue-50" : ""
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-gray-900">
                                    {conv.customer?.first_name} {conv.customer?.last_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(conv.last_message_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                                {conv.last_message}
                            </p>
                            <div className="flex gap-2">
                                <Badge variant={conv.status === 'active' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
                                    {conv.status}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-gray-500">
                                    {conv.platform_type}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content: Chat Window */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                    {selectedConversation.customer?.first_name?.[0]}
                                    {selectedConversation.customer?.last_name?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {selectedConversation.customer?.first_name} {selectedConversation.customer?.last_name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <MessageSquare className="h-3 w-3" />
                                            {selectedConversation.platform_type}
                                        </span>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs text-gray-500">{selectedConversation.customer?.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">Müşteri Detayı</Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5 text-gray-500" /></Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-4">
                            {/* Dummy Conversation */}
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%] text-sm shadow-sm">
                                    Merhaba, size nasıl yardımcı olabilirim?
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%] text-sm shadow-sm border border-gray-100">
                                    {selectedConversation.last_message}
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-gray-700">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Bir mesaj yazın..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-gray-400"
                                />
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-gray-700">
                                    <Mic className="h-5 w-5" />
                                </Button>
                                <Button size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                        <p>Bir konuşma seçin</p>
                    </div>
                )}
            </div>
        </div>
    );
}
