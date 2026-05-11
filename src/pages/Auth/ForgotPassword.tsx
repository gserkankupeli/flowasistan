import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        });

        setLoading(false);

        if (error) {
            setError('Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.');
        } else {
            setSuccess(true);
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
                    Şifremi Unuttum
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
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
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                            <CheckCircle className="h-4 w-4" />
                            Şifre sıfırlama e-postası gönderildi. Lütfen gelen kutunuzu kontrol edin.
                        </div>
                    )}
                </CardHeader>
                <CardContent className="px-0 lg:px-6">
                    {!success && (
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="email">
                                    E-posta Adresi
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@sirket.com"
                                        className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    'Sıfırlama Bağlantısı Gönder'
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm">
                        <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Giriş sayfasına dön
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
