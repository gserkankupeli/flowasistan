import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_BASE } from '../../lib/config';
import { useLang } from '../../lib/i18n';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useLang();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(t('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.', 'Sign-in failed. Please check your credentials.'));
            setLoading(false);
        } else {
            // Successful login
            navigate(APP_BASE);
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
                    {t('Tekrar Hoşgeldiniz', 'Welcome Back')}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {t('Hesabınıza giriş yaparak panelinizi yönetin.', 'Sign in to manage your panel.')}
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
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                {t('E-posta Adresi', 'Email Address')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@sirket.com"
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                    {t('Şifre', 'Password')}
                                </label>
                                <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                                    {t('Şifremi Unuttum?', 'Forgot password?')}
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('Giriş Yapılıyor...', 'Signing in...')}
                                </>
                            ) : (
                                t('Giriş Yap', 'Sign In')
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">{t('Hesabınız yok mu?', 'No account yet?')}</span>{' '}
                        <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                            {t('Hemen Kayıt Olun', 'Sign up now')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
