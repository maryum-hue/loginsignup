import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pagescss/Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  
  // Fake payment data
  const payments = [
    {
      id: 1,
      invoiceNo: 'INV-2024-001',
      description: 'Tuition Fee - Semester 4',
      amount: '$1,500',
      dueDate: 'Jan 15, 2024',
      status: 'Paid',
      paymentDate: 'Jan 10, 2024',
      method: 'Credit Card'
    },
    {
      id: 2,
      invoiceNo: 'INV-2024-002',
      description: 'Library Fee',
      amount: '$200',
      dueDate: 'Feb 10, 2024',
      status: 'Paid',
      paymentDate: 'Feb 5, 2024',
      method: 'Bank Transfer'
    },
    {
      id: 3,
      invoiceNo: 'INV-2024-003',
      description: 'Lab Fee',
      amount: '$300',
      dueDate: 'Mar 15, 2024',
      status: 'Paid',
      paymentDate: 'Mar 12, 2024',
      method: 'Credit Card'
    },
    {
      id: 4,
      invoiceNo: 'INV-2024-004',
      description: 'Tuition Fee - Semester 5',
      amount: '$1,500',
      dueDate: 'Dec 30, 2024',
      status: 'Pending',
      paymentDate: '-',
      method: '-'
    },
    {
      id: 5,
      invoiceNo: 'INV-2024-005',
      description: 'Exam Fee',
      amount: '$100',
      dueDate: 'Dec 25, 2024',
      status: 'Overdue',
      paymentDate: '-',
      method: '-'
    },
  ];

  // Fake payment methods
  const paymentMethods = [
    { id: 1, type: 'Credit Card', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Bank Transfer', bank: 'ABC Bank', account: '****1234' },
    { id: 3, type: 'Debit Card', last4: '8888', expiry: '06/26' },
  ];

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'credit_card',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleMakePayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentData({
      ...paymentData,
      amount: payment.amount.replace('$', '')
    });
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    alert('Payment submitted successfully!');
    setShowPaymentModal(false);
    // In real app, integrate with payment gateway
  };

  return (
    <div className="payment-container">
      <nav className="navbar">
        <div className="logo">Student Portal</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => navigate('/attendance')}>Attendance</button>
          <button className="nav-link" onClick={() => navigate('/assignment')}>Assignments</button>
          <button className="nav-link active" onClick={() => navigate('/payment')}>Payments</button>
          <button className="nav-link" onClick={() => navigate('/quiz')}>Quizzes</button>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <div className="welcome-section">
        <h1>Fee & Payment Management</h1>
        <p>View and manage your fee payments</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Fees</h3>
          <div className="stats-number">$3,600</div>
          <div className="stats-label">This academic year</div>
        </div>

        <div className="stats-card">
          <h3>Paid</h3>
          <div className="stats-number">$2,000</div>
          <div className="stats-label">Amount paid</div>
        </div>

        <div className="stats-card">
          <h3>Pending</h3>
          <div className="stats-number">$1,600</div>
          <div className="stats-label">Amount pending</div>
        </div>

        <div className="stats-card">
          <h3>Due Soon</h3>
          <div className="stats-number">$1,500</div>
          <div className="stats-label">Due within 30 days</div>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3>Payment History</h3>
          <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
            Make Payment
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td>{payment.invoiceNo}</td>
                <td>{payment.description}</td>
                <td>{payment.amount}</td>
                <td>{payment.dueDate}</td>
                <td>
                  <span className={`status ${payment.status.toLowerCase()}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => handleMakePayment(payment)}
                    disabled={payment.status === 'Paid'}
                  >
                    {payment.status === 'Paid' ? 'View Receipt' : 'Pay Now'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-container">
        <h3>Saved Payment Methods</h3>
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <div key={method.id} className={`payment-method ${method.isDefault ? 'default' : ''}`}>
              <div className="method-icon">
                {method.type === 'Credit Card' && '💳'}
                {method.type === 'Debit Card' && '💳'}
                {method.type === 'Bank Transfer' && '🏦'}
              </div>
              <div className="method-details">
                <h4>{method.type}</h4>
                <p>
                  {method.last4 ? `**** **** **** ${method.last4}` : ''}
                  {method.bank ? `${method.bank} - ${method.account}` : ''}
                </p>
                {method.expiry && <p>Expires: {method.expiry}</p>}
                {method.isDefault && <span className="default-badge">Default</span>}
              </div>
              <div className="method-actions">
                <button className="btn btn-secondary btn-sm">Edit</button>
                {!method.isDefault && (
                  <button className="btn btn-danger btn-sm">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{selectedPayment ? `Pay ${selectedPayment.amount}` : 'Make Payment'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPayment(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitPayment}>
                {selectedPayment && (
                  <div className="payment-summary">
                    <h4>Payment Details</h4>
                    <div className="detail-row">
                      <span>Invoice:</span>
                      <span>{selectedPayment.invoiceNo}</span>
                    </div>
                    <div className="detail-row">
                      <span>Description:</span>
                      <span>{selectedPayment.description}</span>
                    </div>
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span className="amount">{selectedPayment.amount}</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Payment Method</label>
                  <select 
                    className="form-control"
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {paymentData.method.includes('card') && (
                  <>
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={paymentData.expiry}
                          onChange={(e) => setPaymentData({...paymentData, expiry: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="123"
                          value={paymentData.cvv}
                          onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentData.method === 'bank_transfer' && (
                  <div className="bank-details">
                    <h4>Bank Transfer Details</h4>
                    <p>Account Name: University Name</p>
                    <p>Account Number: 1234567890</p>
                    <p>Bank: ABC Bank</p>
                    <p>SWIFT/BIC: ABCDEFGH</p>
                    <p>Reference: Your Student ID</p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-block">
                  Pay {selectedPayment ? selectedPayment.amount : paymentData.amount ? `$${paymentData.amount}` : '$0'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;