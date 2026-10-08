
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, RotateCcw, FlaskConical } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { isDemo } from '../lib/config';
import { useLang } from '../lib/i18n';
import { resetDemoData, simulateIncomingConversation } from '../lib/demo/client';

function DemoBar() {
    const { t } = useLang();
    const [exhausted, setExhausted] = useState(false);

    return (
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-900 md:px-8">
            <p className="flex items-center gap-2 font-medium">
                <FlaskConical className="h-4 w-4 shrink-0" />
                {t(
                    'Demo — kurmaca verilerle çalışır. Yaptığınız değişiklikler yalnız bu tarayıcı oturumunda kalır.',
                    'Demo — runs on fictional data. Your changes stay in this browser session only.'
                )}
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setExhausted(!simulateIncomingConversation())}
                    disabled={exhausted}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-3 py-1.5 font-semibold text-white transition-colors hover:bg-amber-800 disabled:opacity-50"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    {exhausted
                        ? t('Örnek görüşmeler bitti', 'No more sample conversations')
                        : t('Örnek görüşme simüle et', 'Simulate an incoming conversation')}
                </button>
                <button
                    onClick={() => { resetDemoData(); setExhausted(false); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('Demoyu sıfırla', 'Reset demo')}
                </button>
            </div>
        </div>
    );
}

export default function DashboardLayout() {
    const { lang } = useLang();

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <Sidebar />
            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                {isDemo && <DemoBar />}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* keyed by language so pages re-read their data in the selected language */}
                    <div key={lang} className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
