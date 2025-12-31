import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagescss/Quiz.css';

const Quiz = () => {
  const navigate = useNavigate();
  
  // Fake quiz data
  const upcomingQuizzes = [
    {
      id: 1,
      title: 'Data Structures - Quiz 3',
      course: 'Data Structures',
      date: 'Dec 22, 2024',
      time: '10:00 AM - 11:00 AM',
      duration: '60 minutes',
      totalMarks: 20,
      status: 'Upcoming'
    },
    {
      id: 2,
      title: 'Database Systems - Mid Quiz',
      course: 'Database Systems',
      date: 'Dec 24, 2024',
      time: '2:00 PM - 3:30 PM',
      duration: '90 minutes',
      totalMarks: 30,
      status: 'Upcoming'
    },
    {
      id: 3,
      title: 'Web Development - Final Quiz',
      course: 'Web Development',
      date: 'Dec 28, 2024',
      time: '11:00 AM - 12:00 PM',
      duration: '60 minutes',
      totalMarks: 25,
      status: 'Upcoming'
    },
  ];

  const completedQuizzes = [
    {
      id: 4,
      title: 'Algorithms - Quiz 2',
      course: 'Algorithms',
      date: 'Dec 10, 2024',
      score: '18/20',
      percentage: '90%',
      grade: 'A',
      status: 'Completed'
    },
    {
      id: 5,
      title: 'OS Concepts - Quiz 1',
      course: 'Operating Systems',
      date: 'Nov 28, 2024',
      score: '14/20',
      percentage: '70%',
      grade: 'B',
      status: 'Completed'
    },
    {
      id: 6,
      title: 'Networks - Quiz 1',
      course: 'Computer Networks',
      date: 'Nov 20, 2024',
      score: '16/20',
      percentage: '80%',
      grade: 'A-',
      status: 'Completed'
    },
  ];

  // Fake quiz questions for preview
  const sampleQuestions = [
    {
      id: 1,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correct: 1
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correct: 1
    },
  ];

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizStarted(true);
    setShowQuizModal(true);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit quiz
      setQuizCompleted(true);
    }
  };

  const handleSubmitQuiz = () => {
    alert('Quiz submitted successfully!');
    setShowQuizModal(false);
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuestions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correct++;
      }
    });
    return `${correct}/${sampleQuestions.length}`;
  };

  return (
    <div className="quiz-container">
      <nav className="navbar">
        <div className="logo">Student Portal</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link" onClick={() => navigate('/assignment')}>Assignments</button>
          <button className="nav-link" onClick={() => navigate('/payment')}>Payments</button>
          <button className="nav-link active" onClick={() => navigate('/quiz')}>Quizzes</button>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Quiz & Exam Center</h1>
        <p>Take quizzes and view your performance</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Quizzes</h3>
          <div className="stats-number">9</div>
          <div className="stats-label">This semester</div>
        </div>

        <div className="stats-card">
          <h3>Completed</h3>
          <div className="stats-number">6</div>
          <div className="stats-label">Quizzes completed</div>
        </div>

        <div className="stats-card">
          <h3>Average Score</h3>
          <div className="stats-number">85%</div>
          <div className="stats-label">Overall average</div>
        </div>

        <div className="stats-card">
          <h3>Next Quiz</h3>
          <div className="stats-number">Dec 22</div>
          <div className="stats-label">Data Structures Quiz</div>
        </div>
      </div>

      <div className="table-container">
        <h3>Upcoming Quizzes</h3>
        <div className="quizzes-grid">
          {upcomingQuizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <div className="quiz-header">
                <h4>{quiz.title}</h4>
                <span className="quiz-status upcoming">Upcoming</span>
              </div>
              <div className="quiz-details">
                <p><strong>Course:</strong> {quiz.course}</p>
                <p><strong>Date:</strong> {quiz.date}</p>
                <p><strong>Time:</strong> {quiz.time}</p>
                <p><strong>Duration:</strong> {quiz.duration}</p>
                <p><strong>Marks:</strong> {quiz.totalMarks}</p>
              </div>
              <button 
                className="btn btn-primary btn-block"
                onClick={() => handleStartQuiz(quiz)}
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="table-container">
        <h3>Completed Quizzes</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Course</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {completedQuizzes.map(quiz => (
              <tr key={quiz.id}>
                <td>{quiz.title}</td>
                <td>{quiz.course}</td>
                <td>{quiz.date}</td>
                <td>{quiz.score}</td>
                <td>{quiz.percentage}</td>
                <td>
                  <span className={`grade grade-${quiz.grade}`}>
                    {quiz.grade}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && selectedQuiz && (
        <div className="modal-overlay">
          <div className="modal quiz-modal">
            <div className="modal-header">
              <h3>{selectedQuiz.title}</h3>
              {!quizCompleted && (
                <div className="quiz-timer">
                  <span className="timer-icon">⏰</span>
                  <span className="time-remaining">60:00</span>
                </div>
              )}
              <button 
                className="close-btn"
                onClick={() => {
                  setShowQuizModal(false);
                  setQuizStarted(false);
                  setQuizCompleted(false);
                  setCurrentQuestion(0);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {!quizStarted ? (
                <div className="quiz-instructions">
                  <h4>Instructions</h4>
                  <ul>
                    <li>This quiz contains {sampleQuestions.length} questions</li>
                    <li>Duration: {selectedQuiz.duration}</li>
                    <li>Total Marks: {selectedQuiz.totalMarks}</li>
                    <li>Each question carries equal marks</li>
                    <li>Do not refresh the page during the quiz</li>
                    <li>Ensure stable internet connection</li>
                  </ul>
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={() => setQuizStarted(true)}
                  >
                    Start Quiz
                  </button>
                </div>
              ) : !quizCompleted ? (
                <div className="quiz-questions">
                  <div className="quiz-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      Question {currentQuestion + 1} of {sampleQuestions.length}
                    </div>
                  </div>

                  <div className="question-container">
                    <h4>Question {currentQuestion + 1}</h4>
                    <p className="question-text">
                      {sampleQuestions[currentQuestion].question}
                    </p>
                    
                    <div className="options-container">
                      {sampleQuestions[currentQuestion].options.map((option, index) => (
                        <div 
                          key={index}
                          className={`option ${answers[sampleQuestions[currentQuestion].id] === index ? 'selected' : ''}`}
                          onClick={() => handleAnswerSelect(sampleQuestions[currentQuestion].id, index)}
                        >
                          <div className="option-letter">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="option-text">{option}</div>
                        </div>
                      ))}
                    </div>

                    <div className="quiz-navigation">
                      {currentQuestion > 0 && (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => setCurrentQuestion(currentQuestion - 1)}
                        >
                          Previous
                        </button>
                      )}
                      <button 
                        className="btn btn-primary"
                        onClick={handleNextQuestion}
                        disabled={answers[sampleQuestions[currentQuestion].id] === undefined}
                      >
                        {currentQuestion === sampleQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="quiz-results">
                  <div className="result-icon">🎉</div>
                  <h4>Quiz Completed!</h4>
                  <div className="score-display">
                    Your Score: <span className="score">{calculateScore()}</span>
                  </div>
                  <p className="result-message">
                    Great job! You have completed the quiz.
                  </p>
                  <button 
                    className="btn btn-primary btn-block"
                    onClick={handleSubmitQuiz}
                  >
                    View Detailed Results
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;