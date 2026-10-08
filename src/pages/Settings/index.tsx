import { useEffect, useState } from 'react';
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
    Shield,
    Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isDemo } from '../../lib/config';
import { LanguageToggle, useLang } from '../../lib/i18n';

interface Category {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
}

export default function Settings() {
    const { t } = useLang();
    const [activeTab, setActiveTab] = useState('platforms');
    const [categories, setCategories] = useState<Category[]>([]);

    const tabs = [
        { id: 'general', label: t('Genel', 'General'), icon: SettingsIcon },
        { id: 'platforms', label: t('Platformlar', 'Platforms'), icon: MessageSquare },
        { id: 'team', label: t('Ekip', 'Team'), icon: Users },
        { id: 'billing', label: t('Faturalandırma', 'Billing'), icon: CreditCard },
    ];

    useEffect(() => {
        supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })
            .then(({ data }) => setCategories((data || []) as Category[]));
    }, []);

    // Connection management needs a live backend; in the demo the buttons are shown but inactive.
    const demoDisabled = isDemo
        ? { disabled: true, title: t('Demo modunda devre dışı', 'Disabled in demo mode') }
        : {};

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
            <div className="flex-1 min-w-0">
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
                                    <h2 className="text-2xl font-bold text-gray-900">{t('Platform Entegrasyonları', 'Platform Integrations')}</h2>
                                    <p className="text-gray-500">{t('Chatbot ve Sesli Asistan servislerini bağlayın.', 'Connect your chatbot and voice agent services.')}</p>
                                </div>

                                {isDemo && (
                                    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                        {t(
                                            'Bu sayfa örnek bir kurulumu gösterir. Demoda hiçbir harici servise bağlantı yoktur; bağlantı düğmeleri bu yüzden devre dışıdır.',
                                            'This page shows a sample setup. The demo is not connected to any external service, which is why the connection buttons are disabled.'
                                        )}
                                    </div>
                                )}

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
                                                    <p className="text-sm text-gray-500">{t('Evolution API ile bağlı', 'Connected via Evolution API')}</p>
                                                </div>
                                            </div>
                                            <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-200">{isDemo ? t('Örnek', 'Sample') : t('Aktif', 'Active')}</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium text-gray-500">{t('Instance Adı', 'Instance Name')}</label>
                                                    <div className="text-sm font-medium">FlowAsistan_Main</div>
                                                </div>
                                                <div className="space-y-1 min-w-0">
                                                    <label className="text-xs font-medium text-gray-500">Webhook URL</label>
                                                    <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 truncate">
                                                        https://n8n.example.com/webhook/wa-incoming
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 flex justify-end gap-3">
                                                <Button variant="outline" size="sm" {...demoDisabled}>{t('Yapılandır', 'Configure')}</Button>
                                                <Button variant="destructive" size="sm" {...demoDisabled}>{t('Bağlantıyı Kes', 'Disconnect')}</Button>
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
                                                    <p className="text-sm text-gray-500">{t('Sesli asistan motoru', 'Voice agent engine')}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-gray-100 text-gray-600">{t('Bağlı Değil', 'Not Connected')}</Badge>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600 mb-4">
                                                {t(
                                                    'Vapi.ai hesabınızı bağlayarak sesli asistan özelliklerini aktifleştirin. API anahtarına ihtiyacınız olacak.',
                                                    'Connect your Vapi.ai account to enable the voice agent features. You will need an API key.'
                                                )}
                                            </p>
                                            <div className="flex justify-end gap-3">
                                                <Button className="bg-purple-600 hover:bg-purple-700 text-white" {...demoDisabled}>{t('Bağla', 'Connect')}</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}

                        {activeTab === 'general' && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('Uygulama Ayarları', 'Application Settings')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between py-3">
                                            <div className="space-y-0.5">
                                                <h4 className="font-medium text-gray-900">{t('Dil', 'Language')}</h4>
                                                <p className="text-sm text-gray-500">{t('Panel dilini seçin', 'Choose the panel language')}</p>
                                            </div>
                                            <LanguageToggle />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t('Görüşme Kategorileri', 'Conversation Categories')}</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            {t('Yapay zeka her görüşmeyi bu kategorilerden birine atar.', 'The AI assigns every conversation to one of these categories.')}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {categories.length === 0 ? (
                                            <p className="py-4 text-sm text-gray-400">{t('Kategori bulunamadı.', 'No categories found.')}</p>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {categories.map(category => (
                                                    <div key={category.id} className="flex items-center gap-3 py-3">
                                                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color || '#94a3b8' }} />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                                            {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {(activeTab === 'team' || activeTab === 'billing') && (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Shield className="h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">{t('Bu özellik yakında geliyor', 'This feature is coming soon')}</h3>
                                <p className="text-gray-500 text-sm max-w-sm text-center">
                                    {t(
                                        'Ekip yönetimi ve faturalandırma modülleri şu anda geliştirme aşamasındadır.',
                                        'Team management and billing are currently in development.'
                                    )}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
