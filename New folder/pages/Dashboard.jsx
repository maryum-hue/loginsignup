import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../pagescss/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fake user data - in real app, this would come from Firestore
  const fakeUserData = {
    name: 'John Doe',
    studentId: 'STU2024001',
    email: 'john.doe@university.edu',
    course: 'Computer Science',
    semester: '4',
    enrollmentDate: '2022-09-01',
    cgpa: '3.75',
    attendance: '92%',
    assignmentsSubmitted: '8/10',
    feesPaid: '$2,500/$3,000'
  };

  // Fake course data
  const fakeCourses = [
    { id: 1, name: 'Data Structures', code: 'CS201', instructor: 'Dr. Smith', schedule: 'Mon, Wed 10:00 AM' },
    { id: 2, name: 'Database Systems', code: 'CS202', instructor: 'Dr. Johnson', schedule: 'Tue, Thu 2:00 PM' },
    { id: 3, name: 'Web Development', code: 'CS203', instructor: 'Prof. Williams', schedule: 'Mon, Fri 11:00 AM' },
    { id: 4, name: 'Algorithms', code: 'CS204', instructor: 'Dr. Brown', schedule: 'Wed, Fri 3:00 PM' }
  ];

  // Fake upcoming events
  const fakeEvents = [
    { id: 1, title: 'Midterm Exam - Data Structures', date: 'Dec 20, 2024', time: '10:00 AM' },
    { id: 2, title: 'Assignment Submission - Web Dev', date: 'Dec 22, 2024', time: '11:59 PM' },
    { id: 3, title: 'Project Presentation', date: 'Dec 25, 2024', time: '2:00 PM' },
    { id: 4, title: 'Final Exam - Database Systems', date: 'Dec 28, 2024', time: '9:00 AM' }
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/');
    } else {
      // In real app, fetch user data from Firestore
      setUserData(fakeUserData);
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">Student Portal</div>
        <div className="nav-links">
          <button className="nav-link active" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link" onClick={() => navigate('/assignment')}>Assignments</button>
          <button className="nav-link" onClick={() => navigate('/payment')}>Payments</button>
          <button className="nav-link" onClick={() => navigate('/quiz')}>Quizzes</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Welcome back, {userData.name}!</h1>
        <p>Student ID: {userData.studentId} | Course: {userData.course} | Semester: {userData.semester}</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>CGPA</h3>
          <div className="stats-number">{userData.cgpa}</div>
          <div className="stats-label">Current Grade Point Average</div>
        </div>

        <div className="stats-card">
          <h3>Attendance</h3>
          <div className="stats-number">{userData.attendance}</div>
          <div className="stats-label">Overall Attendance Rate</div>
        </div>

        <div className="stats-card">
          <h3>Assignments</h3>
          <div className="stats-number">{userData.assignmentsSubmitted}</div>
          <div className="stats-label">Submitted / Total</div>
        </div>

        <div className="stats-card">
          <h3>Fees Status</h3>
          <div className="stats-number">{userData.feesPaid}</div>
          <div className="stats-label">Paid / Total Fees</div>
        </div>
      </div>

      <div className="table-container">
        <h3>My Courses</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Instructor</th>
              <th>Schedule</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fakeCourses.map(course => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.instructor}</td>
                <td>{course.schedule}</td>
                <td><span className="status active">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Upcoming Events</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fakeEvents.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.time}</td>
                <td><span className="status upcoming">Upcoming</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;