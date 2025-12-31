import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Assignment from './pages/Assignment';
import Payment from './pages/Payment';
import Quiz from './pages/Quiz';
import Login from './pages/loginsignup';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading application...</div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/attendance" element={user ? <Attendance /> : <Navigate to="/" />} />
          <Route path="/assignment" element={user ? <Assignment /> : <Navigate to="/" />} />
          <Route path="/payment" element={user ? <Payment /> : <Navigate to="/" />} />
          <Route path="/quiz" element={user ? <Quiz /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;