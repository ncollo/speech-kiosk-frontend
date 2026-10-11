import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import KioskShell from './components/Kiosk/KioskShell';
import WelcomeConsentScreen from './components/WelcomeConsent/WelcomeConsentScreen';
import ClinicianUnlockScreen from './components/ClinicianUnlock/ClinicianUnlockScreen';
import SessionSummaryScreen from './components/SessionSummary/SessionSummaryScreen';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<WelcomeConsentScreen />} />
        <Route path="/kiosk" element={<KioskShell />} />
        <Route path="/clinician/unlock" element={<ClinicianUnlockScreen />} />
        <Route path="/summary" element={<SessionSummaryScreen />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
