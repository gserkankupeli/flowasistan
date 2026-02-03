import { useState } from 'react';
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
import { Download, Calendar, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const data = [
    { name: 'Pzt', successful: 40, failed: 10, total: 50 },
    { name: 'Sal', successful: 30, failed: 5, total: 35 },
    { name: 'Çar', successful: 20, failed: 25, total: 45 },
    { name: 'Per', successful: 27, failed: 8, total: 35 },
    { name: 'Cum', successful: 18, failed: 12, total: 30 },
    { name: 'Cmt', successful: 23, failed: 5, total: 28 },
    { name: 'Paz', successful: 34, failed: 3, total: 37 },
];

const pieData = [
    { name: 'WhatsApp', value: 400 },
    { name: 'Web', value: 300 },
    { name: 'Instagram', value: 300 },
    { name: 'Telefon', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Reports() {
    const [dateRange] = useState('Bu Hafta');

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Raporlar ve Analizler</h2>
                    <p className="text-gray-500 mt-1">Sistem performansını ve müşteri etkileşimlerini analiz edin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 bg-white">
                        <Calendar className="h-4 w-4" />
                        {dateRange}
                    </Button>
                    <Button variant="outline" size="icon" className="bg-white">
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="h-4 w-4" />
                        Dışa Aktar
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ortalama Yanıt Süresi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">1.2sn</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            %12 iyileşme <span className="text-gray-400 ml-1">geçen haftaya göre</span>
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Müşteri Memnuniyeti</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">4.8/5</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            +0.2 puan <span className="text-gray-400 ml-1">artış</span>
                        </p>
                    </CardContent>
                </Card>
                <Card hoverEffect>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Otomasyon Oranı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-gray-900">%85</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Hedeflenen: %80
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart */}
                <Card className="col-span-1" hoverEffect>
                    <CardHeader>
                        <CardTitle>Günlük Etkileşim Dağılımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
                                    <XAxis dataKey="name" className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <YAxis className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="successful" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                                    <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Chart */}
                <Card className="col-span-1" hoverEffect>
                    <CardHeader>
                        <CardTitle>Kanal Bazlı Trafik</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" vertical={false} />
                                    <XAxis dataKey="name" className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <YAxis className="text-xs text-gray-500" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
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
                        <CardTitle>Platform Kullanımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
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
                            <div className="flex justify-center gap-4 text-xs text-gray-500 mt-4 flex-wrap">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2" hoverEffect>
                    <CardHeader>
                        <CardTitle>Son Raporlar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { name: 'Haftalık Performans Raporu', date: '03.02.2025', size: '2.4 MB', type: 'PDF' },
                                { name: 'Müşteri Etkileşim Analizi', date: '01.02.2025', size: '1.8 MB', type: 'XLSX' },
                                { name: 'Ocak Ayı Özeti', date: '31.01.2025', size: '5.1 MB', type: 'PDF' },
                            ].map((file, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{file.name}</div>
                                            <div className="text-xs text-gray-500">{file.date} • {file.size}</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download className="h-4 w-4 text-gray-500" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
