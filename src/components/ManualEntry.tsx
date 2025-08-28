import React, { useState } from 'react';
import './ManualEntry.css';

const ManualEntry: React.FC = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().slice(0, 5),
    duration: '',
    feedingType: 'left',
    bottleVolume: '',
    notes: ''
  });

  const [useEndTime, setUseEndTime] = useState(false);
  const [endTime, setEndTime] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Design-only: Just show success message
    alert('Session added successfully! 🎉');
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toTimeString().slice(0, 5),
      duration: '',
      feedingType: 'left',
      bottleVolume: '',
      notes: ''
    });
  };

  const feedingOptions = [
    { value: 'left', label: 'Left Breast', icon: '🤱', color: 'purple' },
    { value: 'right', label: 'Right Breast', icon: '🤱', color: 'blue' },
    { value: 'both', label: 'Both Breasts', icon: '👶', color: 'teal' },
    { value: 'bottle', label: 'Bottle', icon: '🍼', color: 'peach' }
  ];

  return (
    <div className="manual-entry">
      <div className="entry-header">
        <div className="header-decoration"></div>
        <h1>
          <span className="header-icon">✏️</span>
          Manual Entry
        </h1>
        <p>Add a past feeding session to your records</p>
      </div>

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-section">
          <div className="section-header">
            <h2>📅 When did this feeding happen?</h2>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>⏰ How long was the feeding?</h2>
          </div>
          
          <div className="duration-toggle">
            <label className="toggle-option">
              <input
                type="checkbox"
                checked={useEndTime}
                onChange={(e) => setUseEndTime(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Use end time instead of duration</span>
            </label>
          </div>

          {useEndTime ? (
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <div className="duration-input-wrapper">
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  min="1"
                  max="480"
                  placeholder="15"
                  className="form-input duration-input"
                  required
                />
                <span className="duration-unit">minutes</span>
              </div>
              <div className="duration-presets">
                {[5, 10, 15, 20, 30, 45].map(duration => (
                  <button
                    key={duration}
                    type="button"
                    className={`duration-preset ${formData.duration === duration.toString() ? 'active' : ''}`}
                    onClick={() => handleInputChange('duration', duration.toString())}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>🤱 What type of feeding was this?</h2>
          </div>
          
          <div className="feeding-type-grid">
            {feedingOptions.map(option => (
              <label 
                key={option.value} 
                className={`feeding-type-option ${option.color} ${formData.feedingType === option.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="feedingType"
                  value={option.value}
                  checked={formData.feedingType === option.value}
                  onChange={(e) => handleInputChange('feedingType', e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">{option.icon}</div>
                  <div className="option-label">{option.label}</div>
                </div>
                <div className="option-check">✓</div>
              </label>
            ))}
          </div>

          {formData.feedingType === 'bottle' && (
            <div className="form-group bottle-volume-group">
              <label htmlFor="bottleVolume">Bottle Volume (ml)</label>
              <div className="volume-input-wrapper">
                <input
                  type="number"
                  id="bottleVolume"
                  value={formData.bottleVolume}
                  onChange={(e) => handleInputChange('bottleVolume', e.target.value)}
                  min="1"
                  max="500"
                  placeholder="120"
                  className="form-input volume-input"
                  required
                />
                <span className="volume-unit">ml</span>
              </div>
              <div className="volume-presets">
                {[60, 90, 120, 150, 180, 210].map(volume => (
                  <button
                    key={volume}
                    type="button"
                    className={`volume-preset ${formData.bottleVolume === volume.toString() ? 'active' : ''}`}
                    onClick={() => handleInputChange('bottleVolume', volume.toString())}
                  >
                    {volume}ml
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2>📝 Any notes about this feeding?</h2>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="How did baby feed? Any observations about appetite, comfort, or behavior..."
              rows={4}
              className="form-textarea"
            />
            <div className="notes-helper">
              Add any details that might help track feeding patterns
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary submit-btn">
            <span className="btn-icon">💾</span>
            <span>Save Feeding Session</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualEntry;