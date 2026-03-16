import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import Chatbot from './pages/Dashboard/Chatbot';
import VoiceAgent from './pages/Dashboard/VoiceAgent';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="voice-agent" element={<VoiceAgent />} />
              <Route path="customers" element={<Customers />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<div className="p-4">Bildirimler Sayfası (Yapım Aşamasında)</div>} />
            </Route>
          </Route>

          {/* Redirect root to login if needed, handled by ProtectedRoute but useful for direct auth hits */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
