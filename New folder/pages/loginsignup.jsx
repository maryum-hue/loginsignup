import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagescss/login.css';
import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { setDoc, doc } from "firebase/firestore";


const Login = () => {
    
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    course: '',
    semester: '1',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const courses = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Artificial Intelligence',
    'Cyber Security'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Save additional user data to Firestore
        await setDoc(doc(db, 'students', user.uid), {
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId,
          course: formData.course,
          semester: formData.semester,
          createdAt: new Date().toISOString()
        });

        alert('Account created successfully!');
        navigate('/dashboard');
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isSignup ? 'Student Sign Up' : 'Student Login'}</h2>
        <p className="subtitle">
          {isSignup ? 'Create your student account' : 'Welcome back! Please login to continue'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  className="form-control"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  placeholder="Enter student ID"
                />
              </div>

              <div className="form-group">
                <label>Course</label>
                <select
                  name="course"
                  className="select-control"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  className="select-control"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div className="switch-auth">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="switch-btn"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;