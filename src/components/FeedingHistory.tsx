import React, { useState, useMemo } from 'react';
import './FeedingHistory.css';
import { useFeeding } from '../context/FeedingContext';
import { FeedingSession } from '../types';

const FeedingHistory: React.FC = () => {
  const { deleteSession, getSessionsByDate, getDailySummary } = useFeeding();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');
  const [editingSession, setEditingSession] = useState<FeedingSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get sessions for selected date
  const sessionsForDate = useMemo(() => {
    const date = new Date(selectedDate);
    return getSessionsByDate(date);
  }, [selectedDate, getSessionsByDate]);

  // Get weekly summary data
  const weeklySummary = useMemo(() => {
    const selectedDateObj = new Date(selectedDate);
    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const summary = getDailySummary(date);

      weekData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate().toString(),
        sessions: summary.totalSessions,
        totalTime: summary.totalTime,
        dateObj: date,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: date.toDateString() === selectedDateObj.toDateString()
      });
    }

    return weekData;
  }, [selectedDate, getDailySummary]);

  const handleEditSession = (session: FeedingSession) => {
    setEditingSession(session);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this feeding session?')) {
      setIsDeleting(true);
      try {
        await deleteSession(sessionId);
        alert('Session deleted successfully! 🗑️');
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Error deleting session. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert('CSV export feature coming soon! 📊');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export feature coming soon! 📄');
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
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
        <button className="date-nav-btn prev" onClick={() => handleDateNavigation('prev')}>
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

        <button className="date-nav-btn next" onClick={() => handleDateNavigation('next')}>
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
            {weeklySummary.map((day, index) => (
              <div
                key={index}
                className={`summary-card ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(day.dateObj.toISOString().split('T')[0])}
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
                {day.isToday && <div className="today-indicator">Today</div>}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sessions-list">
          <div className="list-header">
            <h2>Sessions for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h2>
            <div className="daily-stats">
              <div className="daily-stat">
                <span className="stat-icon">🍼</span>
                <span className="stat-value">{sessionsForDate.length}</span>
                <span className="stat-label">sessions</span>
              </div>
              <div className="daily-stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{sessionsForDate.reduce((total, session) => total + (session.duration || 0), 0)}</span>
                <span className="stat-label">minutes</span>
              </div>
            </div>
          </div>

          <div className="sessions-grid">
            {sessionsForDate.length === 0 ? (
              <div className="no-sessions">
                <div className="no-sessions-icon">📭</div>
                <div className="no-sessions-message">No feeding sessions recorded for this date</div>
              </div>
            ) : (
              sessionsForDate.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-time">
                    <div className="time-display">
                      {session.startTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="duration-display">{session.duration || 0} min</div>
                  </div>

                  <div className="session-type">
                    <div className="type-icon">
                      {session.breastType === 'left' || session.breastType === 'right' ? '🤱' :
                       session.breastType === 'both' ? '👶' : '🍼'}
                    </div>
                    <div className="type-info">
                      <div className="type-label">{getTypeLabel(session.breastType)}</div>
                      {session.bottleVolume && (
                        <div className="volume-info">{session.bottleVolume}ml</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="session-notes">
                  <div className="notes-content">{session.notes || 'No notes recorded'}</div>
                </div>

                <div className="session-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditSession(session)}
                  >
                    <span className="btn-icon">✏️</span>
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={isDeleting}
                  >
                    <span className="btn-icon">🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
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
                  <input
                    type="time"
                    defaultValue={editingSession.startTime.toTimeString().slice(0, 5)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    defaultValue={editingSession.duration || 0}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Feeding Type</label>
                <select
                  className="form-input"
                  defaultValue={editingSession.breastType}
                >
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
                  defaultValue={editingSession.notes || ''}
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
                  alert('Edit functionality coming soon! ✏️');
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