import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LiveTracker from './components/LiveTracker';
import ManualEntry from './components/ManualEntry';
import FeedingHistory from './components/FeedingHistory';
import Navigation from './components/Navigation';
import Auth from './components/Auth';
import { FeedingProvider } from './context/FeedingContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Get the basename for GitHub Pages deployment
const basename = process.env.NODE_ENV === 'production'
  ? '/breastfeeding_tracker_cursor'
  : '';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </>
  );
};

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router basename={basename}>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <LiveTracker />
            </ProtectedRoute>
          } />
          <Route path="/manual-entry" element={
            <ProtectedRoute>
              <ManualEntry />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <FeedingHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

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
