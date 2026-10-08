import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Mail, Phone, Calendar, Clock, MessageSquare, Trash2, X, UserPlus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/i18n';
import { formatDuration, platformLabel, statusLabel } from '../../lib/format';

type Customer = Database['public']['Tables']['customers']['Row'];

interface HistoryItem {
    id: string;
    kind: 'chat' | 'call';
    date: string;
    title: string;
    summary: string | null;
    category: string | null;
    color: string | null;
}

export default function Customers() {
    const { t, locale } = useLang();
    const location = useLocation();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', email: '' });

    useEffect(() => {
        fetchCustomers();

        const channel = supabase
            .channel('customers_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'customers' },
                () => {
                    fetchCustomers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Opened from another page (e.g. the chatbot inbox) with a customer preselected
    const preselectedId = (location.state as { customerId?: string } | null)?.customerId;
    useEffect(() => {
        if (!preselectedId || selectedCustomer) return;
        const match = customers.find(c => c.id === preselectedId);
        if (match) setSelectedCustomer(match);
    }, [preselectedId, customers]);

    useEffect(() => {
        if (selectedCustomer) fetchHistory(selectedCustomer);
        else setHistory([]);
    }, [selectedCustomer?.id]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setCustomers(data as Customer[]);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (customer: Customer) => {
        setHistoryLoading(true);
        try {
            const { data: chats, error: chatError } = await supabase
                .from('chatbot_conversations')
                .select(`
                    id, summary, platform_type, status, last_message_at, message_count,
                    categories ( name, color )
                `)
                .eq('customer_id', customer.id)
                .order('last_message_at', { ascending: false });
            if (chatError) throw chatError;

            const { data: calls, error: callError } = await supabase
                .from('call_analytics')
                .select('*')
                .eq('customer_phone', customer.phone)
                .order('created_at', { ascending: false });
            if (callError) throw callError;

            const items: HistoryItem[] = [
                ...(chats || []).map((c: any) => ({
                    id: c.id,
                    kind: 'chat' as const,
                    date: c.last_message_at,
                    title: `${platformLabel(c.platform_type)} · ${c.message_count || 0} ${t('mesaj', 'messages')} · ${statusLabel(c.status, t)}`,
                    summary: c.summary,
                    category: c.categories?.name ?? null,
                    color: c.categories?.color ?? null,
                })),
                ...(calls || []).map((c: any) => ({
                    id: c.id,
                    kind: 'call' as const,
                    date: c.created_at,
                    title: `${t('Sesli arama', 'Voice call')} · ${formatDuration(c.duration)}`,
                    summary: c.summary,
                    category: c.category,
                    color: null,
                })),
            ].filter(item => item.date).sort((a, b) => b.date.localeCompare(a.date));

            setHistory(items);
        } catch (error) {
            console.error('Error fetching customer history:', error);
            setHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleDeleteCustomer = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        if (window.confirm(t("Bu müşteriyi silmek istediğinize emin misiniz? Tüm konuşma geçmişi de silinecek.", "Are you sure you want to delete this customer? Their conversation history will be deleted too."))) {
            try {
                const { error } = await supabase.from('customers').delete().eq('id', id);
                if (error) throw error;
                if (selectedCustomer?.id === id) setSelectedCustomer(null);
                fetchCustomers();
            } catch (err) {
                console.error("Müşteri silinirken hata oluştu:", err);
                alert(t("Silme işlemi başarısız.", "The customer could not be deleted."));
            }
        }
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            const { error } = await supabase
                .from('customers')
                .insert([{
                    first_name: formData.firstName.trim(),
                    last_name: formData.lastName.trim() || null,
                    phone: formData.phone.trim(),
                    email: formData.email.trim() || null,
                }])
                .select();
            if (error) throw error;

            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', phone: '', email: '' });
            fetchCustomers();
        } catch (err) {
            console.error('Error creating customer:', err);
            setFormError(t('Müşteri kaydedilemedi. Telefon numarası zaten kayıtlı olabilir.', 'The customer could not be saved. The phone number may already exist.'));
        }
    };

    const filteredCustomers = customers.filter(c => {
        if (!searchQuery) return true;
        const q = searchQuery.toLocaleLowerCase(locale);
        return (
            c.first_name?.toLocaleLowerCase(locale).includes(q) ||
            c.last_name?.toLocaleLowerCase(locale).includes(q) ||
            c.phone?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q)
        );
    });

    const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Customer List */}
            <div className={cn("flex-col border-r border-gray-200 transition-all duration-300 shrink-0", selectedCustomer ? "hidden md:flex md:w-80" : "flex w-full")}>
                <div className="p-4 border-b border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{t('Müşteriler', 'Customers')}</h2>
                        <Button size="sm" onClick={() => setIsModalOpen(true)}>
                            <UserPlus className="mr-1.5 h-4 w-4" />
                            {t('Yeni Müşteri', 'New Customer')}
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('İsim, telefon veya email ara...', 'Search by name, phone or email...')}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={cn("bg-gray-50 text-gray-500 font-medium border-b border-gray-200 sticky top-0", selectedCustomer ? "hidden" : "")}>
                            <tr>
                                <th className="px-4 py-3">{t('Ad Soyad', 'Name')}</th>
                                <th className="px-4 py-3 hidden sm:table-cell">{t('İletişim', 'Contact')}</th>
                                <th className="px-4 py-3">{t('Durum', 'Status')}</th>
                                <th className="px-4 py-3 hidden sm:table-cell">{t('Son Etkileşim', 'Last Interaction')}</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">{t('Yükleniyor...', 'Loading...')}</td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        {searchQuery ? t('Arama sonucu bulunamadı.', 'No results found.') : t('Henüz müşteri yok.', 'No customers yet.')}
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr
                                        key={customer.id}
                                        onClick={() => setSelectedCustomer(customer)}
                                        className={cn(
                                            "hover:bg-gray-50 cursor-pointer transition-colors",
                                            selectedCustomer?.id === customer.id ? "bg-blue-50 hover:bg-blue-50" : ""
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium text-xs">
                                                    {customer.first_name?.[0] || 'M'}{customer.last_name?.[0] || ''}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-[13px]">{customer.first_name || t('İsimsiz', 'Unnamed')} {customer.last_name || ''}</div>
                                                    {selectedCustomer && <div className="text-xs font-medium text-gray-400 mt-0.5">{customer.phone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={cn("px-4 py-3 hidden sm:table-cell", selectedCustomer ? "!hidden" : "")}>
                                            <div className="text-gray-900 font-medium text-[13px]">{customer.phone}</div>
                                            <div className="text-gray-400 font-medium text-xs">{customer.email || t('Email yok', 'No email')}</div>
                                        </td>
                                        <td className={cn("px-4 py-3", selectedCustomer ? "hidden" : "")}>
                                            <Badge variant={customer.status === 'active' ? 'success' : customer.status === 'completed' ? 'secondary' : 'warning'}>
                                                {statusLabel(customer.status || 'active', t)}
                                            </Badge>
                                        </td>
                                        <td className={cn("px-4 py-3 text-gray-500 font-medium text-[13px] hidden sm:table-cell", selectedCustomer ? "!hidden" : "")}>
                                            {customer.last_interaction_date ? new Date(customer.last_interaction_date).toLocaleDateString(locale) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-400 hover:text-red-700 hover:bg-red-50"
                                                onClick={(e) => handleDeleteCustomer(e, customer.id)}
                                                title={t('Sil', 'Delete')}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail View */}
            {selectedCustomer && (
                <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden min-w-0 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-semibold">{t('Müşteri Detayı', 'Customer Details')}</h2>
                        <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>{t('Kapat', 'Close')}</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Header Card */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start gap-6">
                                <div className="h-20 w-20 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}
                                </div>
                                <div className="flex-1 pt-2 min-w-0">
                                    <h1 className="text-2xl font-bold text-gray-900">{selectedCustomer.first_name} {selectedCustomer.last_name}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={selectedCustomer.status === 'active' ? 'success' : 'secondary'}>{statusLabel(selectedCustomer.status, t)}</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {selectedCustomer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                                            <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                                            <span className="truncate">{selectedCustomer.email || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            {t('Son etkileşim:', 'Last interaction:')} {selectedCustomer.last_interaction_date ? new Date(selectedCustomer.last_interaction_date).toLocaleDateString(locale) : '-'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                            {t('Toplam etkileşim:', 'Total interactions:')} {history.length || selectedCustomer.total_interactions}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interaction History */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
                                <h3 className="text-lg font-semibold mb-4">{t('Etkileşim Geçmişi', 'Interaction History')}</h3>
                                {historyLoading ? (
                                    <div className="py-12 text-center text-gray-400">{t('Yükleniyor...', 'Loading...')}</div>
                                ) : history.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <Calendar className="h-12 w-12 mb-3 opacity-20" />
                                        <p>{t('Henüz etkileşim verisi yok.', 'No interactions yet.')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {history.map(item => (
                                            <div key={`${item.kind}-${item.id}`} className="relative pl-10 pb-5 last:pb-0">
                                                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100" />
                                                <div className={cn(
                                                    "absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center",
                                                    item.kind === 'chat' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                                )}>
                                                    {item.kind === 'chat' ? <MessageSquare className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                                                    {item.category && (
                                                        <span
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider"
                                                            style={{ backgroundColor: item.color ? `${item.color}15` : '#f1f5f9', color: item.color || '#64748b' }}
                                                        >
                                                            {item.category}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(item.date).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {item.summary && <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.summary}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{t('Yeni Müşteri', 'New Customer')}</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8 text-gray-500 rounded-full hover:bg-gray-100">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            {formError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{formError}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ad', 'First name')}</label>
                                    <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Soyad', 'Last name')}</label>
                                    <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Telefon', 'Phone')}</label>
                                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+90 555 123 4567" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('İptal', 'Cancel')}</Button>
                                <Button type="submit">{t('Kaydet', 'Save')}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
