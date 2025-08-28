import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
            <div className="user-name">{user?.email?.split('@')[0] || 'User'}</div>
            <button
              onClick={handleSignOut}
              className="sign-out-btn"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
          <NavLink
            to="/debug"
            className={({ isActive }) => `debug-link ${isActive ? 'active' : ''}`}
            title="Debug Tools"
          >
            🔧
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;