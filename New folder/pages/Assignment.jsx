import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagescss/Assignment.css';

const Assignment = () => {
  const navigate = useNavigate();
  
  // Fake assignments data
  const assignments = [
    { 
      id: 1, 
      title: 'Data Structures Assignment 1', 
      course: 'Data Structures',
      dueDate: 'Dec 20, 2024', 
      status: 'Submitted',
      marks: '18/20',
      submissionDate: 'Dec 18, 2024'
    },
    { 
      id: 2, 
      title: 'Database Systems Project', 
      course: 'Database Systems',
      dueDate: 'Dec 22, 2024', 
      status: 'Pending',
      marks: 'Not Graded',
      submissionDate: '-'
    },
    { 
      id: 3, 
      title: 'Web Development Lab 3', 
      course: 'Web Development',
      dueDate: 'Dec 15, 2024', 
      status: 'Submitted Late',
      marks: '15/20',
      submissionDate: 'Dec 16, 2024'
    },
    { 
      id: 4, 
      title: 'Algorithms Assignment 2', 
      course: 'Algorithms',
      dueDate: 'Dec 25, 2024', 
      status: 'Not Started',
      marks: '-',
      submissionDate: '-'
    },
    { 
      id: 5, 
      title: 'OS Project Report', 
      course: 'Operating Systems',
      dueDate: 'Dec 28, 2024', 
      status: 'In Progress',
      marks: '-',
      submissionDate: '-'
    },
  ];

  // Fake course materials
  const materials = [
    { id: 1, name: 'Assignment Guidelines.pdf', course: 'Data Structures', type: 'PDF', size: '2.4 MB' },
    { id: 2, name: 'Project Requirements.docx', course: 'Database Systems', type: 'DOC', size: '1.8 MB' },
    { id: 3, name: 'Lab Manual.zip', course: 'Web Development', type: 'ZIP', size: '5.2 MB' },
    { id: 4, name: 'Sample Solutions.pdf', course: 'Algorithms', type: 'PDF', size: '3.1 MB' },
  ];

  const [selectedAssignment, setSelectedAssignment] = useState(null);

  return (
    <div className="assignment-container">
      <nav className="navbar">
        <div className="logo">Student Portal</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link active" onClick={() => navigate('/assignment')}>Assignments</button>
          <button className="nav-link" onClick={() => navigate('/payment')}>Payments</button>
          <button className="nav-link" onClick={() => navigate('/quiz')}>Quizzes</button>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Assignments & Submissions</h1>
        <p>Track and submit your assignments</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Assignments</h3>
          <div className="stats-number">12</div>
          <div className="stats-label">This semester</div>
        </div>

        <div className="stats-card">
          <h3>Submitted</h3>
          <div className="stats-number">8</div>
          <div className="stats-label">Assignments submitted</div>
        </div>

        <div className="stats-card">
          <h3>Pending</h3>
          <div className="stats-number">3</div>
          <div className="stats-label">Assignments pending</div>
        </div>

        <div className="stats-card">
          <h3>Average Score</h3>
          <div className="stats-number">85%</div>
          <div className="stats-label">Overall grade average</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>My Assignments</h3>
          <button className="btn btn-primary">Submit New Assignment</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Course</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.id}>
                <td>{assignment.title}</td>
                <td>{assignment.course}</td>
                <td>{assignment.dueDate}</td>
                <td>
                  <span className={`status ${assignment.status.toLowerCase().replace(' ', '-')}`}>
                    {assignment.status}
                  </span>
                </td>
                <td>{assignment.marks}</td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedAssignment(assignment)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Course Materials</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Course</th>
              <th>Type</th>
              <th>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td>{material.name}</td>
                <td>{material.course}</td>
                <td>
                  <span className={`file-type ${material.type.toLowerCase()}`}>
                    {material.type}
                  </span>
                </td>
                <td>{material.size}</td>
                <td>
                  <button className="btn btn-secondary btn-sm">Download</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Details Modal */}
      {selectedAssignment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedAssignment.title}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedAssignment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="assignment-details">
                <div className="detail-row">
                  <span className="detail-label">Course:</span>
                  <span className="detail-value">{selectedAssignment.course}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Due Date:</span>
                  <span className="detail-value">{selectedAssignment.dueDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status ${selectedAssignment.status.toLowerCase().replace(' ', '-')}`}>
                    {selectedAssignment.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Marks:</span>
                  <span className="detail-value">{selectedAssignment.marks}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Submission Date:</span>
                  <span className="detail-value">{selectedAssignment.submissionDate}</span>
                </div>
              </div>
              {selectedAssignment.status === 'Pending' && (
                <div className="submission-form">
                  <h4>Submit Assignment</h4>
                  <div className="form-group">
                    <label>Upload File</label>
                    <input type="file" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Comments</label>
                    <textarea className="form-control" rows="3" placeholder="Add any comments..."></textarea>
                  </div>
                  <button className="btn btn-primary">Submit Assignment</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;