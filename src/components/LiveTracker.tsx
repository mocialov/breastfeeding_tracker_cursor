import React, { useState, useEffect, useCallback } from 'react';
import { useFeeding } from '../context/FeedingContext';
import { BreastType } from '../types';
import { formatDistanceToNow } from 'date-fns';

import './LiveTracker.css';

const LiveTracker: React.FC = () => {
  const { state, startLiveSession, updateLiveSession, endLiveSession } = useFeeding();
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bottleVolume, setBottleVolume] = useState<number>(120);
  const [showBottleModal, setShowBottleModal] = useState(false);

  const { liveSession } = state;
  
  // Debug logging
  useEffect(() => {
    console.log('LiveTracker state:', { liveSession, elapsedTime });
  }, [liveSession, elapsedTime]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (liveSession && !liveSession.isPaused) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - liveSession.startTime.getTime() - liveSession.pausedTime);
      }, 1000);
    } else if (!liveSession) {
      // Reset elapsed time when session ends
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [liveSession]);

  const handleStartSession = useCallback((breastType: BreastType) => {
    if (breastType === 'bottle') {
      setShowBottleModal(true);
    } else {
      startLiveSession(breastType);
      setElapsedTime(0);
    }
  }, [startLiveSession]);

  const handlePauseResume = useCallback(() => {
    if (!liveSession) return;

    if (liveSession.isPaused) {
      // Resume
      updateLiveSession({
        isPaused: false,
        pausedTime: liveSession.pausedTime + (Date.now() - liveSession.startTime.getTime() - liveSession.pausedTime - elapsedTime)
      });
    } else {
      // Pause
      updateLiveSession({ isPaused: true });
    }
  }, [liveSession, elapsedTime, updateLiveSession]);

  const handleSwitchBreast = useCallback(() => {
    if (!liveSession) return;

    const newBreast: BreastType = liveSession.currentBreast === 'left' ? 'right' : 'left';
    updateLiveSession({ currentBreast: newBreast });
  }, [liveSession, updateLiveSession]);



  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getBreastIcon = (breastType: BreastType) => {
    switch (breastType) {
      case 'left': return '👈';
      case 'right': return '👉';
      case 'both': return '👈👉';
      case 'bottle': return '🍼';
      default: return '👶';
    }
  };

  if (!liveSession) {
    return (
      <div className="live-tracker">
        <div className="tracker-header">
          <h1>👶 Live Feeding Tracker</h1>
          <p>Start tracking your feeding session</p>
        </div>
        
        <div className="breast-selection">
          <h2>Select Breast to Start</h2>
          <div className="breast-buttons">
            <button 
              className="breast-btn left"
              onClick={() => handleStartSession('left')}
            >
              <span className="breast-icon">👈</span>
              <span>Left Breast</span>
            </button>
            
            <button 
              className="breast-btn right"
              onClick={() => handleStartSession('right')}
            >
              <span className="breast-icon">👉</span>
              <span>Right Breast</span>
            </button>
            
            <button 
              className="breast-btn both"
              onClick={() => handleStartSession('both')}
            >
              <span className="breast-icon">👈👉</span>
              <span>Both Breasts</span>
            </button>
            
            <button 
              className="breast-btn bottle"
              onClick={() => handleStartSession('bottle')}
            >
              <span className="breast-icon">🍼</span>
              <span>Bottle</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-tracker">
      <div className="tracker-header">
        <h1>👶 Live Feeding Session</h1>
        <p>Started {formatDistanceToNow(liveSession.startTime)} ago</p>
      </div>

      <div className="session-info">
        <div className="current-breast">
          <span className="breast-icon large">
            {getBreastIcon(liveSession.currentBreast)}
          </span>
          <h2>Current: {liveSession.currentBreast.charAt(0).toUpperCase() + liveSession.currentBreast.slice(1)}</h2>
        </div>

        <div className="timer-display">
          ⏰
          <div className="time">{formatTime(elapsedTime)}</div>
          <div className="timer-label">Elapsed Time</div>
        </div>
      </div>

      <div className="control-buttons">
        <button 
          className={`control-btn ${liveSession.isPaused ? 'resume' : 'pause'}`}
          onClick={handlePauseResume}
        >
          {liveSession.isPaused ? '▶️' : '⏸️'}
          {liveSession.isPaused ? 'Resume' : 'Pause'}
        </button>

        {liveSession.currentBreast !== 'bottle' && (
          <button 
            className="control-btn switch"
            onClick={handleSwitchBreast}
                      >
              🔄
              Switch Breast
            </button>
        )}

        <button 
          className="control-btn stop"
          onClick={() => setShowNotesModal(true)}
        >
          ⏹️
          End Session
        </button>
      </div>

      {showBottleModal && (
        <div className="notes-modal">
          <div className="notes-content">
            <h3>🍼 Bottle Volume</h3>
            <p>Enter the bottle volume for this feeding session:</p>
            
            <div className="form-group">
              <label htmlFor="bottle-volume">Volume (ml)</label>
              <input
                id="bottle-volume"
                type="number"
                value={bottleVolume}
                onChange={(e) => setBottleVolume(parseInt(e.target.value) || 120)}
                min="1"
                max="500"
                placeholder="e.g., 120"
                required
              />
            </div>
            
            <div className="notes-actions">
                          <button 
              className="btn-secondary"
              onClick={() => {
                setShowBottleModal(false);
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              onClick={() => {
                startLiveSession('bottle', bottleVolume);
                setElapsedTime(0);
                setShowBottleModal(false);
              }}
            >
              Start Bottle Session
            </button>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="notes-modal">
          <div className="notes-content">
            <h3>📝 Session Notes</h3>
            <p>Please add notes about this feeding session (minimum 500 characters):</p>
            
            <label htmlFor="session-notes" className="sr-only">Session Notes</label>
            <textarea
              id="session-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the feeding session, any issues, baby's behavior, etc..."
              rows={8}
              minLength={500}
            />
            
            <div className="notes-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={async () => {
                  if (notes.trim().length >= 500) {
                    try {
                      console.log('Ending live session with notes:', notes);
                      await endLiveSession(new Date(), notes);
                      console.log('Live session ended successfully');
                      setNotes('');
                      setShowNotesModal(false);
                    } catch (error) {
                      console.error('Error ending live session:', error);
                      // Keep the modal open if there's an error
                    }
                  }
                }}
                disabled={notes.trim().length < 500}
              >
                End Session
              </button>
            </div>
            
            <div className="char-count">
              {notes.length}/500 characters minimum
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracker;
