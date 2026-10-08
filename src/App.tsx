import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './lib/i18n';
import { APP_BASE, isDemo } from './lib/config';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Landing from './pages/Landing';

// The panel is loaded on demand so the public landing page stays light
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Overview = lazy(() => import('./pages/Dashboard/Overview'));
const Chatbot = lazy(() => import('./pages/Dashboard/Chatbot'));
const VoiceAgent = lazy(() => import('./pages/Dashboard/VoiceAgent'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Notifications = lazy(() => import('./pages/Notifications'));

function PageLoader() {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Router>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Public product page */}
                            <Route path="/" element={<Landing />} />

                            {/* Auth routes. The demo has no accounts, so they lead straight to the panel. */}
                            {isDemo ? (
                                <Route path="/auth/*" element={<Navigate to={APP_BASE} replace />} />
                            ) : (
                                <Route path="/auth" element={<AuthLayout />}>
                                    <Route path="login" element={<Login />} />
                                    <Route path="register" element={<Register />} />
                                    <Route path="forgot-password" element={<ForgotPassword />} />
                                </Route>
                            )}

                            {/* Panel routes (protected in the real app, open in the demo) */}
                            <Route element={<ProtectedRoute />}>
                                <Route path={APP_BASE} element={<DashboardLayout />}>
                                    <Route index element={<Overview />} />
                                    <Route path="chatbot" element={<Chatbot />} />
                                    <Route path="voice-agent" element={<VoiceAgent />} />
                                    <Route path="customers" element={<Customers />} />
                                    <Route path="calendar" element={<Calendar />} />
                                    <Route path="reports" element={<Reports />} />
                                    <Route path="settings" element={<Settings />} />
                                    <Route path="notifications" element={<Notifications />} />
                                </Route>
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </Router>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;
