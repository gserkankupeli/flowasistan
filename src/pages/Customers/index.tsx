import { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, Calendar, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import type { Database } from '../../types';

// Mock data
type Customer = Database['public']['Tables']['customers']['Row'];

const mockCustomers: Customer[] = [
    {
        id: 'c1',
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone: '+905551234567',
        email: 'ahmet@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_interaction_date: new Date().toISOString(),
        total_interactions: 15,
        status: 'active'
    },
    {
        id: 'c2',
        first_name: 'Ayşe',
        last_name: 'Demir',
        phone: '+905329876543',
        email: 'ayse@example.com',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date().toISOString(),
        last_interaction_date: new Date(Date.now() - 86400000).toISOString(),
        total_interactions: 8,
        status: 'completed'
    },
    {
        id: 'c3',
        first_name: 'Mehmet',
        last_name: 'Kaya',
        phone: '+905321112233',
        email: null,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date().toISOString(),
        last_interaction_date: new Date(Date.now() - 86400000 * 2).toISOString(),
        total_interactions: 3,
        status: 'inactive'
    }
];

export default function Customers() {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    return (
        <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Customer List */}
            <div className={cn("flex flex-col border-r border-gray-200 transition-all duration-300", selectedCustomer ? "w-80" : "w-full")}>
                <div className="p-4 border-b border-gray-200 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Müşteriler</h2>
                        <Button size="sm">Yeni Müşteri</Button>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="İsim, telefon veya email ara..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={cn("bg-gray-50 text-gray-500 font-medium border-b border-gray-200 sticky top-0", selectedCustomer ? "hidden" : "")}>
                            <tr>
                                <th className="px-4 py-3">Ad Soyad</th>
                                <th className="px-4 py-3">İletişim</th>
                                <th className="px-4 py-3">Durum</th>
                                <th className="px-4 py-3">Son Etkileşim</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockCustomers.map(customer => (
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
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs">
                                                {customer.first_name?.[0]}{customer.last_name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{customer.first_name} {customer.last_name}</div>
                                                {selectedCustomer && <div className="text-xs text-gray-500">{customer.phone}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cn("px-4 py-3", selectedCustomer ? "hidden" : "")}>
                                        <div className="text-gray-900">{customer.phone}</div>
                                        <div className="text-gray-500 text-xs">{customer.email}</div>
                                    </td>
                                    <td className={cn("px-4 py-3", selectedCustomer ? "hidden" : "")}>
                                        <Badge variant={customer.status === 'active' ? 'success' : customer.status === 'completed' ? 'secondary' : 'warning'}>
                                            {customer.status}
                                        </Badge>
                                    </td>
                                    <td className={cn("px-4 py-3 text-gray-500", selectedCustomer ? "hidden" : "")}>
                                        {new Date(customer.last_interaction_date || '').toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail View */}
            {selectedCustomer && (
                <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="h-16 px-6 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-semibold">Müşteri Detayı</h2>
                        <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>Kapat</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Header Card */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-6">
                                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}
                                </div>
                                <div className="flex-1 pt-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900">{selectedCustomer.first_name} {selectedCustomer.last_name}</h1>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline">ID: {selectedCustomer.id}</Badge>
                                                <Badge variant={selectedCustomer.status === 'active' ? 'success' : 'secondary'}>{selectedCustomer.status}</Badge>
                                            </div>
                                        </div>
                                        <Button>Düzenle</Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            {selectedCustomer.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            {selectedCustomer.email || '-'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            Son: {new Date(selectedCustomer.last_interaction_date || '').toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MessageSquare className="h-4 w-4 text-gray-400" />
                                            Top: {selectedCustomer.total_interactions}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Interaction History Placeholder */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
                                <h3 className="text-lg font-semibold mb-4">Etkileşim Geçmişi</h3>
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Calendar className="h-12 w-12 mb-3 opacity-20" />
                                    <p>Henüz etkileşim verisi yok.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
