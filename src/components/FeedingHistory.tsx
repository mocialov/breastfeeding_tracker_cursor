import React, { useState } from 'react';
import { useFeeding } from '../context/FeedingContext';
import { FeedingSession } from '../types';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './FeedingHistory.css';

const FeedingHistory: React.FC = () => {
  const { state, updateSession, deleteSession, getDailySummary } = useFeeding();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingSession, setEditingSession] = useState<FeedingSession | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

  const { sessions } = state;

  // Get sessions for selected date
  const sessionsForDate = sessions.filter(session => 
    isSameDay(new Date(session.startTime), selectedDate)
  );

  // Get weekly summary
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklySummary = weekDays.map(date => ({
    date,
    summary: getDailySummary(date)
  }));

  const handleEditSession = (session: FeedingSession) => {
    setEditingSession({ ...session });
  };

  const handleUpdateSession = (updatedSession: FeedingSession) => {
    updateSession(updatedSession);
    setEditingSession(null);
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    setShowDeleteConfirm(null);
  };

  const toggleNotes = (sessionId: string) => {
    const newShowNotes = new Set(showNotes);
    if (newShowNotes.has(sessionId)) {
      newShowNotes.delete(sessionId);
    } else {
      newShowNotes.add(sessionId);
    }
    setShowNotes(newShowNotes);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Start Time', 'End Time', 'Duration (min)', 'Type', 'Bottle Volume (ml)', 'Notes'],
      ...sessions.map(session => [
        format(session.startTime, 'yyyy-MM-dd'),
        format(session.startTime, 'HH:mm'),
        session.endTime ? format(session.endTime, 'HH:mm') : '',
        session.duration?.toString() || '',
        session.breastType,
        session.bottleVolume?.toString() || '',
        session.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breastfeeding-sessions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Breastfeeding Sessions Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on ${format(new Date(), 'PPP')}`, 20, 30);

    // Summary table
    const summaryData = weeklySummary.map(({ date, summary }) => [
      format(date, 'MMM dd'),
      summary.totalSessions.toString(),
      `${summary.totalTime} min`,
      `${summary.leftBreastTime} min`,
      `${summary.rightBreastTime} min`,
      `${summary.bottleTime} min`,
      `${summary.bottleVolume} ml`
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Date', 'Sessions', 'Total Time', 'Left Breast', 'Right Breast', 'Bottle Time', 'Bottle Volume']],
      body: summaryData,
      theme: 'grid'
    });

    // Sessions table
    const sessionsData = sessionsForDate.map(session => [
      format(session.startTime, 'HH:mm'),
      session.duration?.toString() || '',
      session.breastType,
      session.bottleVolume?.toString() || '',
      session.notes?.substring(0, 50) + (session.notes && session.notes.length > 50 ? '...' : '') || ''
    ]);

    if (sessionsData.length > 0) {
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Time', 'Duration', 'Type', 'Bottle Volume', 'Notes']],
        body: sessionsData,
        theme: 'grid'
      });
    }

    doc.save(`breastfeeding-report-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
  };

  const getBreastIcon = (breastType: string) => {
    switch (breastType) {
      case 'left': return '👈';
      case 'right': return '👉';
      case 'both': return '👈👉';
      case 'bottle': return '🍼';
      default: return '👶';
    }
  };

  if (editingSession) {
    return (
      <div className="feeding-history">
        <div className="history-header">
          <h1>✏️ Edit Session</h1>
          <button 
            className="btn-secondary"
            onClick={() => setEditingSession(null)}
          >
            Cancel
          </button>
        </div>
        
        <EditSessionForm 
          session={editingSession}
          onSave={handleUpdateSession}
          onCancel={() => setEditingSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="feeding-history">
      <div className="history-header">
        <h1>📊 Feeding History</h1>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📊 List
            </button>
            <button
              className={`toggle-btn ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              📈 Summary
            </button>
          </div>
          
          <div className="export-buttons">
            <button className="btn-secondary" onClick={exportToCSV}>
              📥 CSV
            </button>
            <button className="btn-secondary" onClick={exportToPDF}>
              📥 PDF
            </button>
          </div>
        </div>
      </div>

      <div className="date-selector">
        <button 
          className="date-nav-btn"
          onClick={() => setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() - 1);
            return newDate;
          })}
        >
          ← Previous
        </button>
        
        <div className="current-date">
          📅
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            max={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        
        <button 
          className="date-nav-btn"
          onClick={() => setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + 1);
            if (newDate <= new Date()) {
              return newDate;
            }
            return prev;
          })}
          disabled={isSameDay(selectedDate, new Date())}
        >
          Next →
        </button>
      </div>

      {viewMode === 'summary' ? (
        <div className="weekly-summary">
          <h2>Weekly Summary</h2>
          <div className="summary-grid">
            {weeklySummary.map(({ date, summary }) => (
              <div 
                key={date.toISOString()} 
                className={`summary-card ${isSameDay(date, selectedDate) ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="summary-date">{format(date, 'EEE')}</div>
                <div className="summary-date-full">{format(date, 'MMM dd')}</div>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Sessions:</span>
                    <span className="stat-value">{summary.totalSessions}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{summary.totalTime} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Left:</span>
                    <span className="stat-value">{summary.leftBreastTime} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Right:</span>
                    <span className="stat-value">{summary.rightBreastTime} min</span>
                  </div>
                  {summary.bottleTime > 0 && (
                    <div className="stat">
                      <span className="stat-label">Bottle:</span>
                      <span className="stat-value">{summary.bottleTime} min</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="sessions-list">
        <h2>Sessions for {format(selectedDate, 'PPP')}</h2>
        
        {sessionsForDate.length === 0 ? (
          <div className="no-sessions">
            <p>No feeding sessions recorded for this date.</p>
          </div>
        ) : (
          <div className="sessions-grid">
            {sessionsForDate.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-time">
                    <span className="time">{format(session.startTime, 'HH:mm')}</span>
                    {session.endTime && (
                      <span className="duration">({session.duration} min)</span>
                    )}
                  </div>
                  <div className="session-type">
                    <span className="breast-icon">{getBreastIcon(session.breastType)}</span>
                    <span className="type-label">{session.breastType}</span>
                    {session.bottleVolume && (
                      <span className="bottle-volume">{session.bottleVolume}ml</span>
                    )}
                  </div>
                </div>

                {session.notes && (
                  <div className="session-notes">
                    <button 
                      className="notes-toggle"
                      onClick={() => toggleNotes(session.id)}
                    >
                      {showNotes.has(session.id) ? '🙈' : '👁️'}
                      Notes
                    </button>
                    {showNotes.has(session.id) && (
                      <div className="notes-content">{session.notes}</div>
                    )}
                  </div>
                )}

                <div className="session-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditSession(session)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => setShowDeleteConfirm(session.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="delete-modal">
          <div className="delete-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this feeding session? This action cannot be undone.</p>
            <div className="delete-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleDeleteSession(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Edit Session Form Component
interface EditSessionFormProps {
  session: FeedingSession;
  onSave: (session: FeedingSession) => void;
  onCancel: () => void;
}

const EditSessionForm: React.FC<EditSessionFormProps> = ({ session, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    startDate: format(session.startTime, 'yyyy-MM-dd'),
    startTime: format(session.startTime, 'HH:mm'),
    duration: session.duration?.toString() || '',
    breastType: session.breastType,
    bottleVolume: session.bottleVolume?.toString() || '',
    notes: session.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const duration = parseInt(formData.duration);
    if (!duration || duration <= 0 || duration > 480) {
      alert('Duration must be between 1 minute and 8 hours (480 minutes)');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const updatedSession: FeedingSession = {
      ...session,
      startTime: startDateTime,
      endTime: endDateTime,
      duration: duration,
      breastType: formData.breastType,
      bottleVolume: formData.breastType === 'bottle' ? parseInt(formData.bottleVolume) : undefined,
      notes: formData.notes.trim() || undefined
    };

    onSave(updatedSession);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-section">
        <h2>Edit Session</h2>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-start-date">Start Date</label>
            <input
              id="edit-start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-start-time">Start Time</label>
            <input
              id="edit-start-time"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-duration">Duration (minutes)</label>
            <input
              id="edit-duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              min="1"
              max="480"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-breast-type">Feeding Type</label>
          <select
            id="edit-breast-type"
            value={formData.breastType}
            onChange={(e) => setFormData(prev => ({ ...prev, breastType: e.target.value as any }))}
          >
            <option value="left">Left Breast</option>
            <option value="right">Right Breast</option>
            <option value="both">Both Breasts</option>
            <option value="bottle">Bottle</option>
          </select>
        </div>

        {formData.breastType === 'bottle' && (
          <div className="form-group">
            <label htmlFor="edit-bottle-volume">Bottle Volume (ml)</label>
            <input
              id="edit-bottle-volume"
              type="number"
              value={formData.bottleVolume}
              onChange={(e) => setFormData(prev => ({ ...prev, bottleVolume: e.target.value }))}
              min="1"
              max="500"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="edit-notes">Notes</label>
          <textarea
            id="edit-notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            placeholder="Session notes..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

export default FeedingHistory;
