import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import Chatbot from './pages/Dashboard/Chatbot';
import VoiceAgent from './pages/Dashboard/VoiceAgent';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="chatbot" element={<Chatbot />} />
          <Route path="voice-agent" element={<VoiceAgent />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<div className="p-4">Bildirimler Sayfası (Yapım Aşamasında)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
