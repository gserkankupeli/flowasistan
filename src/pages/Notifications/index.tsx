import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Bell, CheckCheck, CheckCircle, Info, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/i18n';
import { timeAgo } from '../../lib/format';
import type { Database } from '../../types';

type Notification = Database['public']['Tables']['notifications']['Row'];

const TYPE_STYLES = {
    urgent: { icon: AlertCircle, className: 'bg-red-50 text-red-600' },
    warning: { icon: AlertTriangle, className: 'bg-amber-50 text-amber-600' },
    success: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-600' },
    system: { icon: Info, className: 'bg-blue-50 text-blue-600' },
};

export default function Notifications() {
    const { t } = useLang();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel('notifications_list')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('is_archived', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications((data || []) as Notification[]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);
        if (error) console.error('Error updating notification:', error);
        fetchNotifications();
    };

    const markAllAsRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('is_read', false);
        if (error) console.error('Error updating notifications:', error);
        fetchNotifications();
    };

    const deleteNotification = async (id: string) => {
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (error) console.error('Error deleting notification:', error);
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const visible = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-[28px] font-bold tracking-tight text-gray-900">{t('Bildirimler', 'Notifications')}</h2>
                    <p className="text-[15px] text-gray-400 mt-1 font-medium">
                        {unreadCount > 0
                            ? t(`${unreadCount} okunmamış bildirim`, `${unreadCount} unread`)
                            : t('Tüm bildirimler okundu.', 'You are all caught up.')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1">
                        {(['all', 'unread'] as const).map(option => (
                            <button
                                key={option}
                                onClick={() => setFilter(option)}
                                className={cn(
                                    "rounded px-3 py-1.5 text-xs font-semibold transition-colors",
                                    filter === option ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {option === 'all' ? t('Tümü', 'All') : t('Okunmamış', 'Unread')}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        {t('Tümünü okundu işaretle', 'Mark all as read')}
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="py-16 text-center text-gray-400 font-medium">{t('Yükleniyor...', 'Loading...')}</div>
                    ) : visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Bell className="h-12 w-12 mb-3 opacity-20" />
                            <p>{t('Gösterilecek bildirim yok.', 'No notifications to show.')}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {visible.map(notification => {
                                const style = TYPE_STYLES[notification.type] || TYPE_STYLES.system;
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn("flex items-start gap-4 p-5 transition-colors", notification.is_read ? "bg-white" : "bg-blue-50/40")}
                                    >
                                        <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center", style.className)}>
                                            <style.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <h4 className="text-[15px] font-bold text-gray-900">{notification.title}</h4>
                                                {!notification.is_read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                                                <span className="text-xs font-medium text-gray-400">{timeAgo(notification.created_at, t)}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{notification.message}</p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            {!notification.is_read && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => markAsRead(notification.id)} title={t('Okundu işaretle', 'Mark as read')}>
                                                    <CheckCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteNotification(notification.id)} title={t('Sil', 'Delete')}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
