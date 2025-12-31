import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagescss/Attendance.css';

const Attendance = () => {
  const navigate = useNavigate();

  // Fake attendance data
  const attendanceData = [
    { id: 1, course: 'Data Structures', total: 40, present: 36, percentage: '90%', status: 'Good' },
    { id: 2, course: 'Database Systems', total: 38, present: 35, percentage: '92%', status: 'Good' },
    { id: 3, course: 'Web Development', total: 42, present: 40, percentage: '95%', status: 'Excellent' },
    { id: 4, course: 'Algorithms', total: 36, present: 32, percentage: '89%', status: 'Good' },
    { id: 5, course: 'Operating Systems', total: 34, present: 30, percentage: '88%', status: 'Good' },
    { id: 6, course: 'Computer Networks', total: 32, present: 29, percentage: '91%', status: 'Good' },
  ];

  const monthlyData = [
    { month: 'September', percentage: '94%' },
    { month: 'October', percentage: '92%' },
    { month: 'November', percentage: '90%' },
    { month: 'December', percentage: '95%' },
  ];

  return (
    <div className="attendance-container">
      <nav className="navbar">
        <div className="logo">Student Portal</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link active" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link" onClick={() => navigate('/assignment')}>Assignments</button>
          <button className="nav-link" onClick={() => navigate('/payment')}>Payments</button>
          <button className="nav-link" onClick={() => navigate('/quiz')}>Quizzes</button>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Attendance Overview</h1>
        <p>Track your attendance across all courses</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Overall Attendance</h3>
          <div className="stats-number">92%</div>
          <div className="stats-label">Current Attendance Rate</div>
        </div>

        <div className="stats-card">
          <h3>Total Classes</h3>
          <div className="stats-number">222</div>
          <div className="stats-label">Total classes this semester</div>
        </div>

        <div className="stats-card">
          <h3>Classes Attended</h3>
          <div className="stats-number">204</div>
          <div className="stats-label">Classes attended</div>
        </div>

        <div className="stats-card">
          <h3>Required Minimum</h3>
          <div className="stats-number">75%</div>
          <div className="stats-label">Minimum required attendance</div>
        </div>
      </div>

      <div className="table-container">
        <h3>Course-wise Attendance</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Total Classes</th>
              <th>Present</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map(item => (
              <tr key={item.id}>
                <td>{item.course}</td>
                <td>{item.total}</td>
                <td>{item.present}</td>
                <td>{item.percentage}</td>
                <td>
                  <span className={`status ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Monthly Attendance Trend</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Attendance Percentage</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((item, index) => (
              <tr key={index}>
                <td>{item.month}</td>
                <td>{item.percentage}</td>
                <td>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;