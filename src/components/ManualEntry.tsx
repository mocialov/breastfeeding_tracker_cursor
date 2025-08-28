import React, { useState } from 'react';
import { useFeeding } from '../context/FeedingContext';
import { BreastType, FeedingSession } from '../types';
import { format } from 'date-fns';

import './ManualEntry.css';

const ManualEntry: React.FC = () => {
  const { addSession } = useFeeding();
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    duration: '',
    endTime: '',
    breastType: 'left' as BreastType,
    bottleVolume: '',
    notes: ''
  });
  const [useEndTime, setUseEndTime] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Check if start date/time is in the future
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    if (startDateTime > new Date()) {
      newErrors.push('Start date and time cannot be in the future');
    }

    if (useEndTime) {
      // Validate end time
      const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);
      if (endDateTime <= startDateTime) {
        newErrors.push('End time must be after start time');
      }
    } else {
      // Validate duration
      const duration = parseInt(formData.duration);
      if (!duration || duration <= 0 || duration > 480) { // Max 8 hours
        newErrors.push('Duration must be between 1 minute and 8 hours');
      }
    }

    // Validate bottle volume for bottle feeding
    if (formData.breastType === 'bottle' && (!formData.bottleVolume || parseInt(formData.bottleVolume) <= 0)) {
      newErrors.push('Bottle volume is required for bottle feeding');
    }

    // Validate notes length
    if (formData.notes.trim().length > 0 && formData.notes.trim().length < 500) {
      newErrors.push('Notes must be at least 500 characters or empty');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      let endDateTime: Date | undefined;
      let duration: number | undefined;

      if (useEndTime) {
        endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);
        duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);
      } else {
        duration = parseInt(formData.duration);
        endDateTime = new Date(startDateTime.getTime() + duration * 60000);
      }

      const session: FeedingSession = {
        id: Date.now().toString(),
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        breastType: formData.breastType,
        bottleVolume: formData.breastType === 'bottle' ? parseInt(formData.bottleVolume) : undefined,
        notes: formData.notes.trim() || undefined,
        isActive: false
      };

      addSession(session);

      // Reset form
      setFormData({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        duration: '',
        endTime: '',
        breastType: 'left',
        bottleVolume: '',
        notes: ''
      });
      setUseEndTime(false);
      setErrors([]);

    } catch (error) {
      console.error('Error adding session:', error);
      setErrors(['Failed to add session. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="manual-entry">
      <div className="entry-header">
        <h1>➕ Manual Entry</h1>
        <p>Add a past feeding session</p>
      </div>

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-section">
          <h2>📅 Date & Time</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
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
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>⏰ Duration</h2>
          
          <div className="duration-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useEndTime}
                onChange={(e) => setUseEndTime(e.target.checked)}
              />
              Use end time instead of duration
            </label>
          </div>

          {useEndTime ? (
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                min="1"
                max="480"
                placeholder="e.g., 15"
                required
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>👶 Feeding Type</h2>
          
          <div className="breast-selection">
            {(['left', 'right', 'both', 'bottle'] as BreastType[]).map(type => (
              <label key={type} className={`breast-option ${formData.breastType === type ? 'selected' : ''}`}>
                <input
                  type="radio"
                  id={`breastType-${type}`}
                  name="breastType"
                  value={type}
                  checked={formData.breastType === type}
                  onChange={(e) => handleInputChange('breastType', e.target.value)}
                />
                <span className="breast-icon">{getBreastIcon(type)}</span>
                <span className="breast-label">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type === 'both' && ' Breasts'}
                </span>
              </label>
            ))}
          </div>

          {formData.breastType === 'bottle' && (
            <div className="form-group">
              <label htmlFor="bottleVolume">Bottle Volume (ml)</label>
              <input
                type="number"
                id="bottleVolume"
                value={formData.bottleVolume}
                onChange={(e) => handleInputChange('bottleVolume', e.target.value)}
                min="1"
                max="500"
                placeholder="e.g., 120"
                required
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>📝 Notes (Optional)</h2>
          <div className="form-group">
            <label htmlFor="notes">Session Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Describe the feeding session, any issues, baby's behavior, etc... (minimum 500 characters if provided)"
              rows={6}
              minLength={500}
            />
            {formData.notes.length > 0 && (
              <div className="char-count">
                {formData.notes.length}/500 characters minimum
              </div>
            )}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                ⚠️ {error}
              </div>
            ))}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            💾
            {isSubmitting ? 'Adding Session...' : 'Add Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualEntry;
