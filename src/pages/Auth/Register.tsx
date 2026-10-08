import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Loader2, Mail, Lock, AlertCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_BASE } from '../../lib/config';
import { useLang } from '../../lib/i18n';

export default function Register() {
    const navigate = useNavigate();
    const { t } = useLang();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (authData.user) {
            navigate(APP_BASE);
        } else {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    {t('Hesap Oluşturun', 'Create an Account')}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {t('FlowAsistan ile müşteri süreçlerinizi yönetmeye başlayın.', 'Start managing your customer conversations with FlowAsistan.')}
                </p>
            </div>

            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
                <CardHeader className="px-0 lg:px-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-0 lg:px-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="fullName">
                                {t('Ad Soyad', 'Full Name')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder={t('Adınız Soyadınız', 'Your full name')}
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">
                                {t('E-posta Adresi', 'Email Address')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                {t('Şifre', 'Password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('Kayıt Yapılıyor...', 'Creating account...')}
                                </>
                            ) : (
                                t('Kayıt Ol', 'Sign Up')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">{t('Zaten hesabınız var mı?', 'Already have an account?')}</span>{' '}
                        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            {t('Giriş Yapın', 'Sign in')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
