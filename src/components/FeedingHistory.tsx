import React, { useState } from 'react';
import './FeedingHistory.css';

const FeedingHistory: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');
  const [editingSession, setEditingSession] = useState<string | null>(null);

  // Mock data for design purposes
  const mockSessions = [
    {
      id: '1',
      time: '08:30',
      duration: 15,
      type: 'left',
      icon: '🤱',
      notes: 'Baby was very hungry this morning. Fed well and seemed satisfied.'
    },
    {
      id: '2',
      time: '11:45',
      duration: 12,
      type: 'right',
      icon: '🤱',
      notes: 'Shorter feeding session. Baby fell asleep quickly.'
    },
    {
      id: '3',
      time: '14:20',
      duration: 18,
      type: 'both',
      icon: '👶',
      notes: 'Switched sides during feeding. Baby was alert and content afterwards.'
    },
    {
      id: '4',
      time: '17:00',
      duration: 10,
      type: 'bottle',
      icon: '🍼',
      volume: 120,
      notes: 'Bottle feeding while out. Baby drank most of it.'
    }
  ];

  const mockWeeklySummary = [
    { date: 'Mon', day: '18', sessions: 6, totalTime: 85 },
    { date: 'Tue', day: '19', sessions: 5, totalTime: 72 },
    { date: 'Wed', day: '20', sessions: 7, totalTime: 98 },
    { date: 'Thu', day: '21', sessions: 6, totalTime: 81 },
    { date: 'Fri', day: '22', sessions: 5, totalTime: 69 },
    { date: 'Sat', day: '23', sessions: 4, totalTime: 58 },
    { date: 'Sun', day: '24', sessions: 6, totalTime: 89 }
  ];

  const handleEditSession = (sessionId: string) => {
    setEditingSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    // Design-only: Just show confirmation
    if (window.confirm('Are you sure you want to delete this feeding session?')) {
      alert('Session deleted successfully! 🗑️');
    }
  };

  const handleExportCSV = () => {
    alert('CSV export started! 📊');
  };

  const handleExportPDF = () => {
    alert('PDF export started! 📄');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'left': return 'Left Breast';
      case 'right': return 'Right Breast';
      case 'both': return 'Both Breasts';
      case 'bottle': return 'Bottle';
      default: return type;
    }
  };

  return (
    <div className="feeding-history">
      <div className="history-header">
        <div className="header-content">
          <div className="header-decoration"></div>
          <h1>
            <span className="header-icon">📊</span>
            Feeding History
          </h1>
          <p>Track your baby's feeding patterns and progress</p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="btn-icon">📋</span>
              <span>Sessions</span>
            </button>
            <button
              className={`toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              <span className="btn-icon">📈</span>
              <span>Summary</span>
            </button>
          </div>
          
          <div className="export-actions">
            <button className="btn-secondary export-btn" onClick={handleExportCSV}>
              <span className="btn-icon">📊</span>
              <span>CSV</span>
            </button>
            <button className="btn-secondary export-btn" onClick={handleExportPDF}>
              <span className="btn-icon">📄</span>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="date-navigation">
        <button className="date-nav-btn prev">
          <span>←</span>
          <span>Previous</span>
        </button>
        
        <div className="current-date">
          <div className="date-display">
            <span className="date-icon">📅</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <button className="date-nav-btn next">
          <span>Next</span>
          <span>→</span>
        </button>
      </div>

      {viewMode === 'summary' ? (
        <div className="weekly-summary">
          <div className="summary-header">
            <h2>Weekly Overview</h2>
            <p>Your baby's feeding patterns this week</p>
          </div>
          
          <div className="summary-grid">
            {mockWeeklySummary.map((day, index) => (
              <div 
                key={index} 
                className={`summary-card ${index === 3 ? 'today' : ''}`}
                onClick={() => setSelectedDate(`2024-03-${day.day}`)}
              >
                <div className="summary-date">
                  <div className="day-name">{day.date}</div>
                  <div className="day-number">{day.day}</div>
                </div>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-icon">🍼</span>
                    <span className="stat-value">{day.sessions}</span>
                    <span className="stat-label">sessions</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-value">{day.totalTime}</span>
                    <span className="stat-label">minutes</span>
                  </div>
                </div>
                {index === 3 && <div className="today-indicator">Today</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sessions-list">
          <div className="list-header">
            <h2>Today's Sessions</h2>
            <div className="daily-stats">
              <div className="daily-stat">
                <span className="stat-icon">🍼</span>
                <span className="stat-value">4</span>
                <span className="stat-label">sessions</span>
              </div>
              <div className="daily-stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">55</span>
                <span className="stat-label">minutes</span>
              </div>
            </div>
          </div>
          
          <div className="sessions-grid">
            {mockSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-time">
                    <div className="time-display">{session.time}</div>
                    <div className="duration-display">{session.duration} min</div>
                  </div>
                  
                  <div className="session-type">
                    <div className="type-icon">{session.icon}</div>
                    <div className="type-info">
                      <div className="type-label">{getTypeLabel(session.type)}</div>
                      {session.volume && (
                        <div className="volume-info">{session.volume}ml</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="session-notes">
                  <div className="notes-content">{session.notes}</div>
                </div>

                <div className="session-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditSession(session.id)}
                  >
                    <span className="btn-icon">✏️</span>
                    <span>Edit</span>
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <span className="btn-icon">🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal (Design Only) */}
      {editingSession && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <div className="modal-header">
              <h3>✏️ Edit Session</h3>
              <button 
                className="close-btn"
                onClick={() => setEditingSession(null)}
              >
                ×
              </button>
            </div>
            
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" defaultValue="08:30" className="form-input" />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input type="number" defaultValue="15" className="form-input" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Feeding Type</label>
                <select className="form-input">
                  <option value="left">Left Breast</option>
                  <option value="right">Right Breast</option>
                  <option value="both">Both Breasts</option>
                  <option value="bottle">Bottle</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows={3}
                  defaultValue="Baby was very hungry this morning. Fed well and seemed satisfied."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setEditingSession(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setEditingSession(null);
                  alert('Session updated successfully! ✅');
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedingHistory;