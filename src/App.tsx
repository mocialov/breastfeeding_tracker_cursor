import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LiveTracker from './components/LiveTracker';
import ManualEntry from './components/ManualEntry';
import FeedingHistory from './components/FeedingHistory';
import Navigation from './components/Navigation';
import Debug from './components/Debug';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeedingProvider } from './context/FeedingContext';
import { isDebugMode } from './lib/debug';

// Get the basename for GitHub Pages deployment
const basename = process.env.NODE_ENV === 'production'
  ? '/breastfeeding_tracker_cursor'
  : '';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        🔄 Loading...
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Router basename={basename}>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LiveTracker />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
            <Route path="/history" element={<FeedingHistory />} />
            {isDebugMode() ? (
              <Route path="/debug" element={<Debug />} />
            ) : (
              <Route path="/debug" element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '50vh',
                  fontSize: '18px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  <div>
                    <h2>🔒 Debug Access Restricted</h2>
                    <p>Debug tools are not available in this environment.</p>
                    <p>To enable debug tools, set <code>REACT_APP_DEBUG=true</code> in your <code>.env.local</code> file.</p>
                  </div>
                </div>
              } />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <FeedingProvider>
        <AppContent />
      </FeedingProvider>
    </AuthProvider>
  );
}

export default App;