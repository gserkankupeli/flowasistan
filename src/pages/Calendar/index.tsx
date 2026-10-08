import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Video,
    Phone,
    MapPin,
    Plus,
    MoreHorizontal,
    X
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../lib/i18n';

interface AppointmentType {
    id: string;
    title: string;
    clientName: string;
    clientPhone: string;
    type: string;
    date: Date;
    duration: number;
    status: string;
    notes: string;
    color: string;
    createdAt: Date;
}

// Dummy Assignments removed, fetch from DB now.
// Helper to determine color based on type or status
function getColorForAppointment(status: string) {
    switch (status) {
        case 'confirmed': return 'bg-emerald-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-indigo-500';
    }
}

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of month (0 = Sunday, 1 = Monday ...)
// We adjust it so Monday is 0, Sunday is 6 for Turkish calendar logic
function getFirstDayOfMonth(year: number, month: number) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

const MONTHS = {
    tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const DAYS = {
    tr: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FULL_DAYS = {
    tr: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

export default function Calendar() {
    const { t, lang, locale } = useLang();
    const months = MONTHS[lang];
    const days = DAYS[lang];
    const fullDays = FULL_DAYS[lang];
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isLoading, setIsLoading] = useState(true);

    // State for appointments
    const [appointments, setAppointments] = useState<AppointmentType[]>([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        clientName: '',
        clientPhone: '',
        type: 'video',
        time: '12:00',
        duration: 30
    });

    // Derived state for calendar grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Calculate previous month's trailing days
    const prevMonthDays = getDaysInMonth(year, month - 1);

    // Fetch appointments from Supabase
    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            // First date of month and last date to filter initially or just fetch all for now
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    created_at,
                    treatment,
                    status,
                    notes,
                    doctor_name,
                    customers (
                        first_name,
                        last_name,
                        phone
                    )
                `);

            if (error) throw error;
            
            if (data) {
                const mappedData: AppointmentType[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.treatment || item.notes || t('Randevu', 'Appointment'), // treatment represents the topic/type often
                    clientName: item.customers ? `${item.customers.first_name || ''} ${item.customers.last_name || ''}`.trim() : (item.doctor_name || t('İsimsiz Müşteri', 'Unnamed Customer')),
                    clientPhone: item.customers?.phone || t('Bilinmiyor', 'Unknown'),
                    type: item.treatment || t('Genel', 'General'), // mapping treatment to type concept for now
                    // Strip the timezone offset/Z so the browser parses the text literally as local time safely
                    date: item.appointment_date ? new Date((item.appointment_date as string).replace(/(Z|[+-]\d{2}:\d{2})$/, '')) : new Date(),
                    duration: 30, // DB doesn't have duration currently, default to 30
                    status: item.status || 'pending',
                    notes: item.notes || '',
                    color: getColorForAppointment(item.status || 'pending'),
                    createdAt: new Date(item.created_at || item.appointment_date),
                }));
                setAppointments(mappedData);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Filter appointments for the selected day
    const selectedDayAppointments = appointments.filter(app =>
        app.date.getFullYear() === selectedDate.getFullYear() &&
        app.date.getMonth() === selectedDate.getMonth() &&
        app.date.getDate() === selectedDate.getDate()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    // Get recently added appointments (last 10)
    const recentAppointments = [...appointments]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    };

    const isSelected = (day: number) => {
        return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    };

    const hasAppointments = (day: number) => {
        return appointments.some(app =>
            app.date.getDate() === day &&
            app.date.getMonth() === month &&
            app.date.getFullYear() === year
        );
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    };

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();

        // Parse time to set on selected date
        const [hours, minutes] = formData.time.split(':').map(Number);
        const apptDate = new Date(selectedDate);
        apptDate.setHours(hours, minutes, 0, 0);

        try {
            // Because there's no duration/type in DB, we map them into notes/treatment for now
            // To prevent Supabase/browser shifting due to UTC conversions,
            // we will format the date explicitly as a string WITHOUT an offset (Naive datetime).
            // This ensures "10:00" is saved as "10:00" textually, and parsed identically.
            const pad = (num: number) => String(num).padStart(2, '0');
            const localIsoString = `${apptDate.getFullYear()}-${pad(apptDate.getMonth() + 1)}-${pad(apptDate.getDate())}T${pad(apptDate.getHours())}:${pad(apptDate.getMinutes())}:00`;

            const newAppointmentRecord: any = {
                appointment_date: localIsoString,
                treatment: formData.title || formData.type, // Map title to treatment
                doctor_name: formData.clientName, // Store clientName in doctor_name temporarily since we don't have customer_id lookup here yet
                notes: t(`Süre: ${formData.duration} dk. Tel: ${formData.clientPhone}`, `Duration: ${formData.duration} min. Phone: ${formData.clientPhone}`),
                status: 'confirmed'
            };

            const { data, error } = await (supabase as any)
                .from('appointments')
                .insert([newAppointmentRecord])
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                // Optimistically add to UI, but real app should rely on DB relations
                const newAppt: AppointmentType = {
                    id: data[0].id,
                    title: formData.title || t('Yeni Randevu', 'New Appointment'),
                    clientName: formData.clientName || t('İsimsiz Müşteri', 'Unnamed Customer'),
                    clientPhone: formData.clientPhone,
                    type: formData.type,
                    date: apptDate,
                    duration: formData.duration,
                    status: 'confirmed',
                    notes: '',
                    color: getColorForAppointment('confirmed'),
                    createdAt: new Date(),
                };
                setAppointments([...appointments, newAppt]);
            }
        } catch (error) {
            console.error('Error creating appointment:', error);
            // Optionally add error toast here
        }

        setIsModalOpen(false);
        // Reset form
        setFormData({ title: '', clientName: '', clientPhone: '', type: 'video', time: '12:00', duration: 30 });
    };

    const handleDeleteAppointment = async (id: string) => {
        if (!window.confirm(t('Bu randevuyu iptal etmek (silmek) istediğinize emin misiniz?', 'Are you sure you want to cancel (delete) this appointment?'))) {
            return;
        }

        try {
            const { data, error } = await supabase
                .from('appointments')
                .delete()
                .eq('id', id)
                .select(); // Ask Supabase to return the deleted row(s) to confirm it actually happened

            if (error) throw error;

            if (!data || data.length === 0) {
                // If no rows were returned, Supabase didn't let us delete it (usually an RLS issue)
                alert(t('Randevu silinemedi. Supabase yetki kısıtlaması (RLS) nedeniyle işlem reddedilmiş olabilir. Lütfen Supabase panelinden "appointments" tablosu için Delete (Silme) izni olup olmadığını kontrol edin.', 'The appointment could not be deleted. The request may have been rejected by a Supabase permission (RLS) rule. Please check the Delete policy of the "appointments" table.'));
                return;
            }

            // Remove from local state only if successfully deleted from DB
            setAppointments(appointments.filter(app => app.id !== id));
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert(t('Randevu silinirken bir hata oluştu.', 'Something went wrong while deleting the appointment.'));
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] xl:h-[calc(100vh-6rem)] flex flex-col xl:flex-row gap-6">

            {/* Left Column: Calendar Grid */}
            <div className="flex-1 min-h-[600px] xl:min-h-0 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100/60 flex items-center justify-between bg-gradient-to-r from-white to-gray-50/30">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100/50 shadow-sm shadow-blue-100">
                            <CalendarIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                {t('Takvim', 'Calendar')}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">{t('Toplantılar ve Etkinlikler', 'Meetings and Events')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={goToToday}
                            className="text-gray-600 font-medium border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                        >
                            {t('Bugün', 'Today')}
                        </Button>
                        <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-inner">
                            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
                                <ChevronLeft className="h-4 w-4 text-gray-600" />
                            </Button>
                            <span className="w-32 text-center font-semibold text-gray-900 text-sm">
                                {months[month]} {year}
                            </span>
                            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm">
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Calendar Body */}
                <div className="p-8 flex-1 flex flex-col">
                    {/* Days of Week */}
                    <div className="grid grid-cols-7 mb-4">
                        {days.map(day => (
                            <div key={day} className="text-center font-bold text-xs text-gray-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2 flex-1">
                        {/* Empty cells for previous month */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 border border-transparent flex flex-col items-center opacity-30 select-none">
                                <span className="text-sm font-medium text-gray-400">{prevMonthDays - firstDay + i + 1}</span>
                            </div>
                        ))}

                        {/* Actual days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const today = isToday(day);
                            const selected = isSelected(day);
                            const hasApnt = hasAppointments(day);

                            return (
                                <motion.button
                                    key={day}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={cn(
                                        "relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 group border",
                                        selected
                                            ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-600/20"
                                            : today
                                                ? "bg-blue-50 border-blue-100 flex"
                                                : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50 hover:shadow-sm"
                                    )}
                                >
                                    <span className={cn(
                                        "text-base font-semibold transition-colors duration-200",
                                        selected ? "text-white" : today ? "text-blue-700" : "text-gray-700",
                                        "group-hover:text-blue-600",
                                        selected && "group-hover:text-white"
                                    )}>
                                        {day}
                                    </span>

                                    {/* Indicator Dots */}
                                    {hasApnt && (
                                        <div className="absolute bottom-2 flex gap-1">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                selected ? "bg-white" : "bg-blue-500"
                                            )} />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Column: Interaction Details */}
            <div className="w-full xl:w-96 flex flex-col gap-6 xl:overflow-y-auto xl:max-h-full custom-scrollbar">

                {/* Action Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 shadow-lg shadow-blue-500/20 text-white flex flex-col justify-between shrink-0 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <h3 className="font-semibold text-blue-100 text-sm mb-1">{t('Hızlı İşlem', 'Quick Action')}</h3>
                        <h2 className="text-xl font-bold mb-4">{t('Yeni Toplantı Planla', 'Schedule a New Meeting')}</h2>
                        <Button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-blue-700 hover:bg-gray-50 shadow-md border-0 group">
                            <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
                            {t('Randevu Oluştur', 'Create Appointment')}
                        </Button>
                    </div>
                </div>

                {/* Daily Schedule Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden min-h-[420px]">
                    <div className="p-6 border-b border-gray-100/60 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {selectedDate.getDate()} {months[selectedDate.getMonth()]}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                {fullDays[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}
                            </p>
                        </div>
                        {selectedDayAppointments.length > 0 ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1.5 font-bold rounded-xl text-sm">
                                {selectedDayAppointments.length} {t('Randevu', selectedDayAppointments.length === 1 ? 'appointment' : 'appointments')}
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-gray-50 text-gray-400 px-3 py-1.5 font-medium rounded-xl text-sm">
                                {t('Boş Gün', 'Free Day')}
                            </Badge>
                        )}
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {selectedDayAppointments.length > 0 ? (
                                selectedDayAppointments.map((app, index) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative pl-4 pb-4 last:pb-0"
                                    >
                                        {/* Timeline Line */}
                                        <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-100 group-last:bg-transparent"></div>
                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute left-[-3.5px] top-2 w-2 h-2 rounded-full ring-4 ring-white shadow-sm z-10",
                                            app.color
                                        )}></div>

                                        {/* Appointment Card */}
                                        <div 
                                            onClick={() => setSelectedAppointment(app)}
                                            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1 block">
                                                        {formatTime(app.date)} - {formatTime(new Date(app.date.getTime() + app.duration * 60000))}
                                                    </span>
                                                    <h4 className="font-bold text-gray-900 text-base">{app.title}</h4>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-gray-700 -mt-1 -mr-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs shrink-0 border border-gray-200">
                                                    {app.clientName.charAt(0)}
                                                </div>
                                                <div className="text-sm">
                                                    <p className="font-semibold text-gray-800">{app.clientName}</p>
                                                    <p className="text-gray-500 text-xs">{app.clientPhone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50 border-gray-100 gap-1.5 py-1">
                                                    {app.type === 'video' && <Video className="h-3 w-3" />}
                                                    {app.type === 'call' && <Phone className="h-3 w-3" />}
                                                    {app.type === 'in-person' && <MapPin className="h-3 w-3" />}
                                                    {app.type === 'video' ? t('Video Konferans', 'Video Call') : app.type === 'call' ? t('Telefon Görüşmesi', 'Phone Call') : t('Yüzyüze', 'In Person')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-10 flex flex-col items-center justify-center text-center px-4"
                                >
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                        <CalendarIcon className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">{t('Bu tarihte planlı bir etkinlik yok.', 'Nothing is scheduled for this date.')}</p>
                                    <p className="text-sm text-gray-400 mt-1">{t('Gününüzü planlamak için yeni bir randevu oluşturun.', 'Create a new appointment to plan your day.')}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Recently Added Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden shrink-0">
                    <div className="p-6 border-b border-gray-100/60 pb-4">
                        <h3 className="text-lg font-bold text-gray-900">{t('Son Eklenenler', 'Recently Added')}</h3>
                        <p className="text-sm font-medium text-gray-500">{t('Sisteme yeni girilen randevular', 'Appointments recently added to the system')}</p>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                        {recentAppointments.length > 0 ? (
                            recentAppointments.map((app) => (
                                <div 
                                    key={`recent-${app.id}`} 
                                    onClick={() => setSelectedAppointment(app)}
                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                                >
                                    <div className={cn("w-2 h-2 rounded-full shrink-0", app.color)} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm truncate">{app.clientName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                            <span className="truncate">{app.title}</span>
                                            <span>•</span>
                                            <span className="shrink-0">{app.date.toLocaleDateString(locale)} {formatTime(app.date)}</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg shrink-0">
                                        {formatTime(app.createdAt)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-sm text-gray-500">
                                {isLoading ? t('Yükleniyor...', 'Loading...') : t('Henüz randevu bulunmuyor.', 'No appointments yet.')}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">{t('Randevu Oluştur', 'Create Appointment')}</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8 text-gray-500 rounded-full hover:bg-gray-100">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateAppointment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('Toplantı Konusu', 'Subject')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder={t('Örn: Ürün Demosu', 'e.g. Product demo')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Müşteri Adı', 'Customer Name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.clientName}
                                            onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Telefon Numarası', 'Phone Number')}</label>
                                        <input
                                            type="tel"
                                            value={formData.clientPhone}
                                            onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                            placeholder="+90 555 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Tarih', 'Date')}</label>
                                        <div className="w-full px-3 py-2 border border-gray-100 bg-gray-50 rounded-xl text-gray-600 cursor-not-allowed">
                                            {selectedDate.toLocaleDateString(locale)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Saat', 'Time')}</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Tür', 'Type')}</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                        >
                                            <option value="video">{t('Video Konferans', 'Video Call')}</option>
                                            <option value="call">{t('Telefon Görüşmesi', 'Phone Call')}</option>
                                            <option value="in-person">{t('Yüzyüze', 'In Person')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Süre (Dk)', 'Duration (min)')}</label>
                                        <select
                                            value={formData.duration}
                                            onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                        >
                                            <option value={15}>{t('15 Dakika', '15 minutes')}</option>
                                            <option value={30}>{t('30 Dakika', '30 minutes')}</option>
                                            <option value={45}>{t('45 Dakika', '45 minutes')}</option>
                                            <option value={60}>{t('1 Saat', '1 hour')}</option>
                                            <option value={90}>{t('1.5 Saat', '1.5 hours')}</option>
                                            <option value={120}>{t('2 Saat', '2 hours')}</option>
                                            <option value={180}>{t('3 Saat', '3 hours')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}> {t('İptal', 'Cancel')} </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"> {t('Kaydet', 'Save')} </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAppointment(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-0 overflow-hidden"
                        >
                            {/* Header Gradient */}
                            <div className={cn("h-24 w-full flex items-start justify-end p-4", selectedAppointment.color || "bg-blue-500")}>
                                <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)} className="h-8 w-8 text-white/80 hover:text-white rounded-full hover:bg-white/20">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Avatar & Main Info */}
                            <div className="px-6 pb-6 mt-6">
                                <div className="flex items-center gap-5">
                                    <div className="h-20 w-20 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center text-gray-800 font-bold text-3xl shrink-0">
                                        {selectedAppointment.clientName.charAt(0)}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-1">{selectedAppointment.clientName}</h3>
                                        <p className="text-gray-500 font-medium">{selectedAppointment.title}</p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">{t('Tarih & Saat', 'Date & Time')}</p>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {selectedAppointment.date.toLocaleDateString(locale)} • {formatTime(selectedAppointment.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            {selectedAppointment.type === 'video' ? <Video className="h-5 w-5" /> : selectedAppointment.type === 'call' ? <Phone className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">{t('Görüşme Tipi', 'Meeting Type')}</p>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {selectedAppointment.type === 'video' ? t('Video Konferans', 'Video Call') : selectedAppointment.type === 'call' ? t('Telefon Görüşmesi', 'Phone Call') : t('Yüzyüze', 'In Person')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">{t('İletişim', 'Contact')}</p>
                                            <p className="font-semibold text-gray-900 text-sm">{selectedAppointment.clientPhone}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedAppointment.notes && (
                                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                            <p className="text-xs text-gray-500 font-medium mb-1">{t('Notlar / Detaylar', 'Notes / Details')}</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">{selectedAppointment.notes}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 flex gap-3">
                                    <Button onClick={() => setSelectedAppointment(null)} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                                        {t('Kapat', 'Close')}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                                        className="w-full rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    >
                                        {t('İptal Et', 'Cancel Appointment')}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
