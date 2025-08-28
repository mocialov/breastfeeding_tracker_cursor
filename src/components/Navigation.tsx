import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          🏠
          <span className="nav-text">Live Tracker</span>
        </NavLink>
        
        <NavLink 
          to="/manual-entry" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          ➕
          <span className="nav-text">Manual Entry</span>
        </NavLink>
        
        <NavLink 
          to="/history" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          📊
          <span className="nav-text">History</span>
        </NavLink>

        {user && (
          <div className="user-section">
            <div className="user-info">
              <span className="user-email">{user.email}</span>
            </div>
            <button 
              className="nav-item logout-btn"
              onClick={handleSignOut}
              title="Sign Out"
            >
              🚪
              <span className="nav-text">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
