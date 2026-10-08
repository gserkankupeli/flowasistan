import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LanguageToggle, useLang } from '../lib/i18n';

export default function AuthLayout() {
    const { t } = useLang();
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Brand & Info */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-slate-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90" />
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.1 }}></div>
                </div>
                <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                            <img src="/logo.svg" alt="FlowAsistan Logo" className="h-10 w-10 object-contain" />
                        </div>
                        <span className="text-4xl font-extrabold tracking-tight">FlowAsistan</span>
                    </div>

                    <div className="space-y-6 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-bold leading-tight"
                        >
                            {t('Müşteri etkileşimlerinizi yapay zeka ile yönetin.', 'Manage your customer conversations with AI.')}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg text-blue-100"
                        >
                            {t('Chatbot ve sesli asistan görüşmelerinizi tek bir panelden yönetin, analiz edin ve müşteri memnuniyetini artırın.', 'Manage and analyze your chatbot and voice agent conversations from a single panel, and raise customer satisfaction.')}
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-blue-200">
                        <span>&copy; 2026 FlowAsistan</span>
                        <span>•</span>
                        <span>v1.0.0</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="relative flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="absolute right-4 top-4"><LanguageToggle /></div>
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
