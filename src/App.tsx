import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LiveTracker from './components/LiveTracker';
import ManualEntry from './components/ManualEntry';
import FeedingHistory from './components/FeedingHistory';
import Navigation from './components/Navigation';

// Get the basename for GitHub Pages deployment
const basename = process.env.NODE_ENV === 'production'
  ? '/breastfeeding_tracker_cursor'
  : '';

function App() {
  return (
    <Router basename={basename}>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LiveTracker />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
            <Route path="/history" element={<FeedingHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;