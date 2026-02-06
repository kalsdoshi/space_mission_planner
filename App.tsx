
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MissionSetup } from './components/MissionSetup';
import { FlightRecorder } from './components/FlightRecorder';
import { ReplaySystem } from './components/ReplaySystem';
import { OrbitSimulator } from './components/OrbitSimulator';
import { MissionAssistant } from './components/MissionAssistant';
import { AboutSection } from './components/AboutSection';
import { Login } from './components/Login';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  return (
    <ThemeProvider>
      <HashRouter>
        {!user ? (
          <Login onLogin={setUser} />
        ) : (
          <Layout user={user} onLogout={() => setUser(null)}>
            <Routes>
              <Route path="/" element={<MissionSetup />} />
              <Route path="/recorder" element={<FlightRecorder />} />
              <Route path="/assistant" element={<MissionAssistant />} />
              <Route path="/simulator" element={<OrbitSimulator />} />
              <Route path="/replay" element={<ReplaySystem />} />
              <Route path="/about" element={<AboutSection />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
