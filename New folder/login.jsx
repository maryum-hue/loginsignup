// App.jsx
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_example_key_replace_with_your_own",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isAuthenticated) {
    return <MainPage user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      <div className="auth-container">
        <div className="auth-card">
          
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1>Welcome</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Sign in to continue' : 'Create your account'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="toggle-container">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="auth-form">
            
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="show-password-btn"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={!isLogin}
                  minLength="6"
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`submit-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>

            <div className="form-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="switch-btn"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        </div>

        <p className="footer-text">
          Secure authentication powered by Firebase
        </p>
      </div>
    </div>
  );
};

// Main Page Component
const MainPage = ({ user, onLogout }) => {
  return (
    <div className="main-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-logo">
            <div className="logo-icon"></div>
            <span className="logo-text">Dashboard</span>
          </div>
          <div className="nav-user">
            <div className="user-info">
              <p className="user-name">{user?.email || 'User'}</p>
              <p className="user-status">Logged in</p>
            </div>
            <button
              onClick={onLogout}
              className="logout-btn"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h1>Welcome back! 👋</h1>
          <p>You're successfully authenticated and ready to go.</p>
        </div>

        {/* Content Grid */}
        <div className="cards-grid">
          {/* Card 1 */}
          <div className="info-card">
            <div className="card-icon blue">
              <svg viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Account Verified</h3>
            <p>Your email has been verified and your account is secure.</p>
          </div>

          {/* Card 2 */}
          <div className="info-card">
            <div className="card-icon green">
              <svg viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3>User Info</h3>
            <p>Email: {user?.email}</p>
            <p>User ID: {user?.uid?.substring(0, 8)}...</p>
          </div>

          {/* Card 3 */}
          <div className="info-card">
            <div className="card-icon purple">
              <svg viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3>Secure Session</h3>
            <p>Your session is encrypted and protected.</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section">
          <button className="action-btn">
            Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <p>© 2024 Your App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;