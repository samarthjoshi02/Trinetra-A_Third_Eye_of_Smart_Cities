import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CitizenPortal } from './pages/CitizenPortal';
import { AdminCommandCenter } from './pages/AdminCommandCenter';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Login / Register Portal */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Citizen Portal Console */}
          <Route path="/citizen" element={<CitizenPortal />} />
          
          {/* Admin Command Center */}
          <Route path="/admin" element={<AdminCommandCenter />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
