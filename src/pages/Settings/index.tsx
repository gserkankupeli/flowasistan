import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings as SettingsIcon,
    MessageSquare,
    CreditCard,
    Users,
    Globe,
    Shield
} from 'lucide-react';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('platforms');

    const tabs = [
        { id: 'general', label: 'Genel', icon: SettingsIcon },
        { id: 'platforms', label: 'Platformlar', icon: MessageSquare },
        { id: 'team', label: 'Ekip', icon: Users },
        { id: 'billing', label: 'Faturalandırma', icon: CreditCard },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-8rem)]">
            {/* Settings Navigation */}
            <Card className="w-full md:w-64 h-fit shrink-0">
                <CardContent className="p-4">
                    <nav className="flex flex-col gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                                    activeTab === tab.id
                                        ? "bg-blue-50 text-blue-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-blue-600" : "text-gray-400")} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </CardContent>
            </Card>

            {/* Content Area */}
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {activeTab === 'platforms' && (
                            <>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Platform Entegrasyonları</h2>
                                    <p className="text-gray-500">Chatbot ve Sesli Asistan servislerini bağlayın.</p>
                                </div>

                                <div className="grid gap-6">
                                    {/* WhatsApp Connection */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                                                    <MessageSquare className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">WhatsApp Business</CardTitle>
                                                    <p className="text-sm text-gray-500">Evolution API ile bağlı</p>
                                                </div>
                                            </div>
                                            <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-200">Aktif</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">Instance Adı</label>
                                                    <div className="text-sm font-medium">FlowAsistan_Main</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">Webhook URL</label>
                                                    <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 truncate">
                                                        https://n8n.webhook.com/webhook/wa-incoming
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end gap-3">
                                                <Button variant="outline" size="sm">Yapılandır</Button>
                                                <Button variant="destructive" size="sm">Bağlantıyı Kes</Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Vapi.ai Connection */}
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                                    <Globe className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">Vapi.ai Voice</CardTitle>
                                                    <p className="text-sm text-gray-500">Sesli asistan motoru</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-gray-100 text-gray-600">Bağlı Değil</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Vapi.ai hesabınızı bağlayarak sesli asistan özelliklerini aktifleştirin. API anahtarına ihtiyacınız olacak.
                                            </p>
                                            <div className="flex justify-end gap-3">
                                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">Bağla</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}

                        {activeTab === 'general' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Uygulama Ayarları</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div className="space-y-0.5">
                                            <h4 className="font-medium text-gray-900">Karanlık Mod</h4>
                                            <p className="text-sm text-gray-500">Uygulama temasını koyu renklere çevir</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                        <div className="space-y-0.5">
                                            <h4 className="font-medium text-gray-900">Masaüstü Bildirimleri</h4>
                                            <p className="text-sm text-gray-500">Yeni mesaj geldiğinde bildirim göster</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {(activeTab === 'team' || activeTab === 'billing') && (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Shield className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Bu özellik yakında geliyor</h3>
                                <p className="text-gray-500 text-sm max-w-sm text-center">
                                    Ekip yönetimi ve faturalandırma modülleri şu anda geliştirme aşamasındadır.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
