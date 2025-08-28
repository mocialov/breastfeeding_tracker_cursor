import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <div className="brand-icon">🌙</div>
          <div className="brand-text">
            <div className="brand-name">BabyTracker</div>
            <div className="brand-tagline">Nurturing moments</div>
          </div>
        </div>
        
        <div className="nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">🏠</div>
            <span className="nav-text">Live Tracker</span>
            <div className="nav-indicator"></div>
          </NavLink>
          
          <NavLink 
            to="/manual-entry" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">✏️</div>
            <span className="nav-text">Add Session</span>
            <div className="nav-indicator"></div>
          </NavLink>
          
          <NavLink 
            to="/history" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <div className="nav-icon">📊</div>
            <span className="nav-text">History</span>
            <div className="nav-indicator"></div>
          </NavLink>
        </div>

        <div className="nav-user">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <div className="user-name">Sarah</div>
            <div className="user-status">Mom of Emma</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;