import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(cart);
      
      if (cart.length === 0) {
        alert('Your cart is empty!');
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = 5.99;
    const tax = subtotal * 0.08;
    return (subtotal + shipping + tax).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCVC) {
      alert('Please fill in payment details');
      return;
    }
    
    // Process order (simulated)
    alert('Order placed successfully! Thank you for your purchase.');
    
    // Clear cart
    localStorage.removeItem('cart');
    document.getElementById('cart-count').textContent = '0';
    
    // Redirect to home
    navigate('/');
  };

  if (cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Checkout</h1>
      
      <div style={styles.checkoutContainer}>
        <form onSubmit={handleSubmit} style={styles.formSection}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Shipping Information</h2>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Payment Details</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Card Number *</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date *</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="MM/YY"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>CVC *</label>
                <input
                  type="text"
                  name="cardCVC"
                  value={formData.cardCVC}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>
          
          <button type="submit" style={styles.submitButton}>
            Place Order - ${calculateTotal()}
          </button>
        </form>

        <div style={styles.summarySection}>
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            
            <div style={styles.orderItems}>
              {cartItems.map((item, index) => (
                <div key={index} style={styles.orderItem}>
                  <img 
                    src={item.thumbnail} 
                    alt={item.title}
                    style={styles.orderImage}
                  />
                  <div style={styles.orderDetails}>
                    <p style={styles.orderTitle}>{item.title}</p>
                    <p style={styles.orderQuantity}>Qty: {item.quantity}</p>
                  </div>
                  <p style={styles.orderPrice}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div style={styles.summaryDetails}>
              <div style={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${cartItems.reduce((t, i) => t + (i.price * i.quantity), 0).toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Shipping:</span>
                <span>$5.99</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Tax:</span>
                <span>${(cartItems.reduce((t, i) => t + (i.price * i.quantity), 0) * 0.08).toFixed(2)}</span>
              </div>
              <div style={styles.summaryDivider}></div>
              <div style={styles.grandTotal}>
                <strong>Total:</strong>
                <strong>${calculateTotal()}</strong>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/cart')}
            style={styles.backButton}
          >
            ← Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    minHeight: '80vh',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '30px',
    textAlign: 'center',
  },
  checkoutContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '22px',
    color: '#333',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
  },
  submitButton: {
    width: '100%',
    padding: '20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '20px',
  },
  summarySection: {
    position: 'sticky',
    top: '20px',
    height: 'fit-content',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    marginBottom: '20px',
  },
  summaryTitle: {
    fontSize: '22px',
    color: '#333',
    marginBottom: '20px',
  },
  orderItems: {
    maxHeight: '300px',
    overflowY: 'auto',
    marginBottom: '20px',
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  orderImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  orderDetails: {
    flex: 1,
  },
  orderTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '5px',
  },
  orderQuantity: {
    fontSize: '13px',
    color: '#666',
  },
  orderPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  summaryDetails: {
    padding: '20px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: '#666',
  },
  summaryDivider: {
    height: '1px',
    backgroundColor: '#f0f0f0',
    margin: '20px 0',
  },
  grandTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default CheckoutPage;