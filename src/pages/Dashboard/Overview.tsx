
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowUpRight, MessageSquare, Phone, Users, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Pzt', chatbot: 4000, voice: 2400 },
    { name: 'Sal', chatbot: 3000, voice: 1398 },
    { name: 'Çar', chatbot: 2000, voice: 9800 },
    { name: 'Per', chatbot: 2780, voice: 3908 },
    { name: 'Cum', chatbot: 1890, voice: 4800 },
    { name: 'Cmt', chatbot: 2390, voice: 3800 },
    { name: 'Paz', chatbot: 3490, voice: 4300 },
];

export default function Overview() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Genel Bakış
                    <div className="h-1 w-20 bg-blue-600 rounded-full mt-2"></div>
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Son güncelleme: Şimdi</span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: 'Toplam Etkileşim', value: '1,234', change: '+20.1%', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Chatbot Mesajları', value: '845', change: '+15%', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { title: 'Sesli Aramalar', value: '389', change: '+32%', icon: Phone, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'Aktif Müşteriler', value: '2,890', change: '+12%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                ].map((item, i) => (
                    <Card key={i} hoverEffect className="group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {item.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${item.bg}`}>
                                <item.icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900 mt-2">{item.value}</div>
                            <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                                <ArrowUpRight className="h-3 w-3" />
                                {item.change} <span className="text-gray-400 font-normal">geçen aya göre</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4" hoverEffect>
                    <CardHeader>
                        <CardTitle>Etkileşim Trendleri</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorChatbot" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" vertical={false} />
                                    <XAxis dataKey="name" className="text-xs text-gray-500" tickLine={false} axisLine={false} />
                                    <YAxis className="text-xs text-gray-500" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="chatbot" stroke="#8884d8" fillOpacity={1} fill="url(#colorChatbot)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="voice" stroke="#82ca9d" fillOpacity={1} fill="url(#colorVoice)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3" hoverEffect>
                    <CardHeader>
                        <CardTitle>Son Aktiviteler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 mt-2">
                            {[1, 2, 3, 4].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="relative h-2 w-2 rounded-full bg-blue-600 mr-4">
                                        <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-75"></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Yeni randevu oluşturuldu</p>
                                        <p className="text-xs text-muted-foreground text-gray-500">Ahmet Y. - WhatsApp Bot • 2 dk önce</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
