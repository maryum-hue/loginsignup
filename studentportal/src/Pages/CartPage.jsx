import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayRemove, 
  setDoc,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './cart.css'; // We'll create this CSS file

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingCost, setShippingCost] = useState(5.99);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadCart(currentUser.uid);
      } else {
        // If no user, use localStorage as fallback
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(localCart);
        setLoading(false);
      }
    });

    // Listen for cart updates from other components
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      unsubscribe();
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleCartUpdate = () => {
    if (user) {
      loadCart(user.uid);
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(localCart);
    }
  };

  const loadCart = async (userId = null) => {
    try {
      setLoading(true);
      
      if (userId) {
        // Load from Firebase
        const cartRef = doc(db, "carts", userId);
        const cartSnap = await getDoc(cartRef);
        
        if (cartSnap.exists()) {
          const cartData = cartSnap.data();
          setCartItems(cartData.items || []);
        } else {
          setCartItems([]);
        }
      } else {
        // Load from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(cart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (!user) {
      updateLocalQuantity(productId, newQuantity);
      return;
    }

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    try {
      setUpdating(true);
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) return;

      const cartData = cartSnap.data();
      const updatedItems = cartData.items.map(item => {
        if (item.productId === productId) {
          const quantityChange = newQuantity - item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            lastUpdated: Timestamp.now()
          };
        }
        return item;
      });

      // Calculate total items and price changes
      const item = cartData.items.find(i => i.productId === productId);
      if (!item) return;

      const priceChange = (newQuantity - item.quantity) * item.price;

      await updateDoc(cartRef, {
        items: updatedItems,
        totalItems: increment(newQuantity - item.quantity),
        totalPrice: increment(priceChange),
        lastUpdated: Timestamp.now()
      });

      await loadCart(user.uid);
      toast.success('Cart updated');
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const updateLocalQuantity = (productId, newQuantity) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0);

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    updateCartCount();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    if (!user) {
      removeLocalItem(productId);
      return;
    }

    try {
      setUpdating(true);
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (!cartSnap.exists()) return;

      const cartData = cartSnap.data();
      const itemToRemove = cartData.items.find(item => item.productId === productId);
      
      if (!itemToRemove) return;

      await updateDoc(cartRef, {
        items: arrayRemove(itemToRemove),
        totalItems: increment(-itemToRemove.quantity),
        totalPrice: increment(-(itemToRemove.price * itemToRemove.quantity)),
        lastUpdated: Timestamp.now()
      });

      await loadCart(user.uid);
      toast.success('Item removed from cart');
      
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const removeLocalItem = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    updateCartCount();
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Item removed from cart');
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    if (!user) {
      localStorage.removeItem('cart');
      setCartItems([]);
      updateCartCount();
      toast.success('Cart cleared');
      return;
    }

    try {
      setUpdating(true);
      const cartRef = doc(db, "carts", user.uid);
      await updateDoc(cartRef, {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: Timestamp.now()
      });

      setCartItems([]);
      updateCartCount();
      toast.success('Cart cleared');
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const updateCartCount = () => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
      cartCountElement.textContent = count;
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + shippingCost + tax - discount;
  };

  const applyCoupon = () => {
    // Simple coupon logic - in production, validate against database
    const coupons = {
      'SAVE10': 0.1,
      'SAVE20': 0.2,
      'WELCOME': 0.15
    };

    if (coupons[couponCode.toUpperCase()]) {
      const discountPercent = coupons[couponCode.toUpperCase()];
      const discountAmount = calculateSubtotal() * discountPercent;
      setDiscount(discountAmount);
      toast.success(`Coupon applied! Saved $${discountAmount.toFixed(2)}`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (!user) {
      toast.info('Please login to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    navigate('/checkout');
  };

  const saveCartForLater = async (productId) => {
    // Implement save for later functionality
    toast.info('Feature coming soon!');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <ToastContainer />
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2 className="empty-cart-title">Your Shopping Cart is Empty</h2>
          <p className="empty-cart-text">Looks like you haven't added any items to your cart yet.</p>
          <div className="empty-cart-actions">
            <button 
              onClick={() => navigate('/')}
              className="shop-button primary"
            >
              Continue Shopping
            </button>
            {!user && (
              <button 
                onClick={() => navigate('/login')}
                className="shop-button secondary"
              >
                Login to View Saved Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <ToastContainer />
      
      <div className="cart-header">
        <h1 className="cart-title">Shopping Cart</h1>
        <div className="cart-stats">
          <span className="cart-item-count">{cartItems.length} items</span>
          <span className="cart-total-items">
            Total: {cartItems.reduce((total, item) => total + item.quantity, 0)} units
          </span>
        </div>
      </div>

      <div className="cart-container">
        <div className="cart-items-section">
          <div className="cart-items-header">
            <h2>Cart Items</h2>
            <button 
              onClick={clearCart}
              className="clear-cart-btn"
              disabled={updating}
            >
              {updating ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={`${item.productId || item.id}`} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image || item.thumbnail || '/default-product.jpg'} 
                    alt={item.name || item.title}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = '/default-product.jpg';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.name || item.title}</h3>
                  <p className="item-category">{item.category}</p>
                  <p className="item-description">
                    {item.description?.substring(0, 100) || 'No description available'}...
                  </p>
                  <div className="item-actions">
                    <button 
                      onClick={() => saveCartForLater(item.productId || item.id)}
                      className="save-later-btn"
                    >
                      Save for later
                    </button>
                  </div>
                </div>
                
                <div className="item-quantity">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item.productId || item.id, item.quantity - 1)}
                      className="quantity-btn minus"
                      disabled={updating || item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId || item.id, item.quantity + 1)}
                      className="quantity-btn plus"
                      disabled={updating}
                    >
                      +
                    </button>
                  </div>
                  <p className="stock-info">
                    {item.maxStock && item.maxStock < 10 && 
                      `Only ${item.maxStock} left in stock`
                    }
                  </p>
                </div>
                
                <div className="item-pricing">
                  <div className="price-per-unit">
                    ${item.price.toFixed(2)} each
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => removeItem(item.productId || item.id)}
                    className="remove-btn"
                    disabled={updating}
                  >
                    {updating ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions">
            <button 
              onClick={() => navigate('/')}
              className="continue-shopping-btn"
            >
              ← Continue Shopping
            </button>
            <div className="coupon-section">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <button 
                onClick={applyCoupon}
                className="apply-coupon-btn"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="summary-card">
            <h2 className="summary-title">Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((total, item) => total + item.quantity, 0)} items):</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>
                {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                <button 
                  onClick={() => setShippingCost(shippingCost === 0 ? 5.99 : 0)}
                  className="shipping-toggle"
                >
                  {shippingCost === 0 ? 'Add shipping' : 'Make it free?'}
                </button>
              </span>
            </div>
            
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-divider"></div>
            
            <div className="grand-total">
              <strong>Estimated Total:</strong>
              <strong className="total-amount">${calculateTotal().toFixed(2)}</strong>
            </div>
            
            <p className="summary-note">
              Shipping & taxes calculated at checkout
            </p>
            
            <button 
              onClick={proceedToCheckout}
              className="checkout-button"
              disabled={updating}
            >
              {updating ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                <span className="payment-icon">💳</span>
                <span className="payment-icon">🏦</span>
                <span className="payment-icon">📱</span>
                <span className="payment-icon">🔗</span>
              </div>
            </div>
            
            <div className="security-notice">
              <span className="security-icon">🔒</span>
              <span>Secure checkout • 256-bit SSL encryption</span>
            </div>
          </div>
          
          <div className="cart-help">
            <h3>Need Help?</h3>
            <p>Contact our customer support 24/7</p>
            <p>Email: support@store.com</p>
            <p>Phone: 1-800-STORES</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;