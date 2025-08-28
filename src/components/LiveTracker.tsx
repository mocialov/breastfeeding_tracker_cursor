import React, { useState } from 'react';
import './LiveTracker.css';

const LiveTracker: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [bottleVolume, setBottleVolume] = useState(120);

  const handleStartSession = (type: string) => {
    if (type === 'bottle') {
      setShowBottleModal(true);
    } else {
      setActiveSession(type);
      setElapsedTime('00:00');
    }
  };

  const handleStartBottleSession = () => {
    setActiveSession('bottle');
    setElapsedTime('00:00');
    setShowBottleModal(false);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleSwitchBreast = () => {
    if (activeSession === 'left') {
      setActiveSession('right');
    } else if (activeSession === 'right') {
      setActiveSession('left');
    }
  };

  const handleEndSession = () => {
    setShowNotesModal(true);
  };

  const handleSaveSession = () => {
    // Design-only: Just reset the session
    setActiveSession(null);
    setIsPaused(false);
    setElapsedTime('00:00');
    setNotes('');
    setShowNotesModal(false);
  };

  const getBreastIcon = (type: string) => {
    switch (type) {
      case 'left': return '🤱';
      case 'right': return '🤱';
      case 'both': return '👶';
      case 'bottle': return '🍼';
      default: return '👶';
    }
  };

  const getBreastLabel = (type: string) => {
    switch (type) {
      case 'left': return 'Left Breast';
      case 'right': return 'Right Breast';
      case 'both': return 'Both Breasts';
      case 'bottle': return 'Bottle';
      default: return '';
    }
  };

  if (!activeSession) {
    return (
      <div className="live-tracker">
        <div className="tracker-header">
          <div className="header-decoration"></div>
          <h1>
            <span className="header-icon">🌙</span>
            Live Feeding Tracker
          </h1>
          <p>Start tracking your little one's feeding session</p>
        </div>
        
        <div className="session-selector">
          <h2>Choose feeding type to begin</h2>
          <div className="feeding-options">
            <button 
              className="feeding-option left-breast"
              onClick={() => handleStartSession('left')}
            >
              <div className="option-icon">🤱</div>
              <div className="option-content">
                <h3>Left Breast</h3>
                <p>Start left side feeding</p>
              </div>
              <div className="option-accent"></div>
            </button>
            
            <button 
              className="feeding-option right-breast"
              onClick={() => handleStartSession('right')}
            >
              <div className="option-icon">🤱</div>
              <div className="option-content">
                <h3>Right Breast</h3>
                <p>Start right side feeding</p>
              </div>
              <div className="option-accent"></div>
            </button>
            
            <button 
              className="feeding-option both-breasts"
              onClick={() => handleStartSession('both')}
            >
              <div className="option-icon">👶</div>
              <div className="option-content">
                <h3>Both Breasts</h3>
                <p>Alternating feeding session</p>
              </div>
              <div className="option-accent"></div>
            </button>
            
            <button 
              className="feeding-option bottle-feeding"
              onClick={() => handleStartSession('bottle')}
            >
              <div className="option-icon">🍼</div>
              <div className="option-content">
                <h3>Bottle</h3>
                <p>Bottle feeding session</p>
              </div>
              <div className="option-accent"></div>
            </button>
          </div>
        </div>

        {/* Bottle Volume Modal */}
        {showBottleModal && (
          <div className="modal-overlay">
            <div className="modal-content bottle-modal">
              <div className="modal-header">
                <h3>🍼 Bottle Volume</h3>
                <p>How much will baby drink?</p>
              </div>
              
              <div className="volume-input-section">
                <label htmlFor="bottle-volume">Volume (ml)</label>
                <div className="volume-input-wrapper">
                  <input
                    id="bottle-volume"
                    type="number"
                    value={bottleVolume}
                    onChange={(e) => setBottleVolume(parseInt(e.target.value) || 120)}
                    min="1"
                    max="500"
                    className="volume-input"
                  />
                  <span className="volume-unit">ml</span>
                </div>
                <div className="volume-presets">
                  {[60, 90, 120, 150, 180].map(volume => (
                    <button
                      key={volume}
                      className={`volume-preset ${bottleVolume === volume ? 'active' : ''}`}
                      onClick={() => setBottleVolume(volume)}
                    >
                      {volume}ml
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowBottleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleStartBottleSession}
                >
                  Start Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="live-tracker active-session">
      <div className="session-header">
        <div className="session-info">
          <div className="current-feeding">
            <span className="feeding-icon">{getBreastIcon(activeSession)}</span>
            <div className="feeding-details">
              <h2>{getBreastLabel(activeSession)}</h2>
              <p>Active feeding session</p>
            </div>
          </div>
          <div className="session-status">
            <div className={`status-indicator ${isPaused ? 'paused' : 'active'}`}></div>
            <span className="status-text">{isPaused ? 'Paused' : 'Active'}</span>
          </div>
        </div>
      </div>

      <div className="timer-section">
        <div className="timer-display">
          <div className="timer-decoration"></div>
          <div className="timer-content">
            <div className="timer-icon">⏱️</div>
            <div className="timer-time">{elapsedTime}</div>
            <div className="timer-label">Elapsed Time</div>
          </div>
          <div className="timer-glow"></div>
        </div>
      </div>

      <div className="session-controls">
        <button 
          className={`control-btn pause-resume ${isPaused ? 'resume' : 'pause'}`}
          onClick={handlePauseResume}
        >
          <div className="btn-icon">{isPaused ? '▶️' : '⏸️'}</div>
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {(activeSession === 'left' || activeSession === 'right') && (
          <button 
            className="control-btn switch-breast"
            onClick={handleSwitchBreast}
          >
            <div className="btn-icon">🔄</div>
            <span>Switch Side</span>
          </button>
        )}

        <button 
          className="control-btn end-session"
          onClick={handleEndSession}
        >
          <div className="btn-icon">⏹️</div>
          <span>End Session</span>
        </button>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal-content notes-modal">
            <div className="modal-header">
              <h3>📝 Session Notes</h3>
              <p>Add any observations about this feeding session</p>
            </div>
            
            <div className="notes-input-section">
              <label htmlFor="session-notes">Notes (optional)</label>
              <textarea
                id="session-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the feeding go? Any observations about baby's behavior, appetite, or comfort..."
                rows={6}
                className="notes-textarea"
              />
              <div className="notes-helper">
                Share any details that might be helpful for tracking patterns
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveSession}
              >
                Save Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracker;