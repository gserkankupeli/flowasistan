type Translate = (tr: string, en: string) => string;

export function timeAgo(dateStr: string | null | undefined, t: Translate) {
    if (!dateStr) return '';
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return t('Az önce', 'Just now');
    if (seconds < 3600) return t(`${Math.floor(seconds / 60)}dk önce`, `${Math.floor(seconds / 60)}m ago`);
    if (seconds < 86400) return t(`${Math.floor(seconds / 3600)}sa önce`, `${Math.floor(seconds / 3600)}h ago`);
    return t(`${Math.floor(seconds / 86400)}g önce`, `${Math.floor(seconds / 86400)}d ago`);
}

export function statusLabel(status: string | null | undefined, t: Translate) {
    switch (status) {
        case 'active': return t('Aktif', 'Active');
        case 'completed': return t('Tamamlandı', 'Completed');
        case 'abandoned': return t('Yarım Kaldı', 'Abandoned');
        case 'inactive': return t('Pasif', 'Inactive');
        case 'confirmed': return t('Onaylandı', 'Confirmed');
        case 'pending': return t('Beklemede', 'Pending');
        case 'cancelled': return t('İptal', 'Cancelled');
        default: return status || '-';
    }
}

export function platformLabel(platform: string | null | undefined) {
    switch (platform?.toLowerCase()) {
        case 'whatsapp': return 'WhatsApp';
        case 'instagram': return 'Instagram';
        case 'telegram': return 'Telegram';
        case 'facebook': return 'Facebook';
        case 'webchat': return 'Web Chat';
        default: return platform || 'Web';
    }
}

export function formatDuration(seconds: number | null | undefined) {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Local calendar day key (YYYY-MM-DD) for grouping by day */
export function dayKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** The last `days` calendar days, oldest first */
export function lastDays(days: number) {
    const today = new Date();
    return Array.from({ length: days }, (_, i) =>
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i)));
}

/** Triggers a client-side CSV download; values are quoted for Excel compatibility */
export function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
    const escape = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map(line => line.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
