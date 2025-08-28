import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [babyName, setBabyName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { signIn, signUp, updateProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          // Update profile with additional information
          if (fullName || babyName || babyBirthDate) {
            await updateProfile({
              full_name: fullName || undefined,
              baby_name: babyName || undefined,
              baby_birth_date: babyBirthDate || undefined,
            });
          }
          setMessage({ 
            type: 'success', 
            text: 'Account created successfully! Please check your email to verify your account.' 
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setBabyName('');
    setBabyBirthDate('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>👶 Breastfeeding Tracker</h1>
          <p>{isLogin ? 'Welcome back! Sign in to continue.' : 'Create your account to start tracking'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="babyName">Baby's Name (Optional)</label>
              <input
                type="text"
                id="babyName"
                value={babyName}
                onChange={(e) => setBabyName(e.target.value)}
                placeholder="Baby's name"
              />
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="babyBirthDate">Baby's Birth Date (Optional)</label>
              <input
                type="date"
                id="babyBirthDate"
                value={babyBirthDate}
                onChange={(e) => setBabyBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              minLength={6}
            />
          </div>

          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="link-button"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="auth-actions">
            <button
              type="button"
              className="link-button"
              onClick={() => {
                // TODO: Implement password reset
                setMessage({ type: 'error', text: 'Password reset functionality coming soon!' });
              }}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;

