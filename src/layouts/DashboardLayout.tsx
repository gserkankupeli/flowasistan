
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function DashboardLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50/50">
            <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <Sidebar />
            <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
