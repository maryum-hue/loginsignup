import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ProductsPage from "./Pages/ProductsPage";
import ProductDetailPage from "./Pages/ProductDetailPage";
import CartPage from "./Pages/CartPage";
import CheckoutPage from "./Pages/CheckoutPage";
import LoginPage from "./Pages/Login";
import "./App.css";

function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Function to update cart count
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    };

    // Initial update
    updateCartCount();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <nav style={styles.navbar}>
          <div style={styles.navContainer}>
            <Link to="/" style={styles.logo}>
              🛍️ E-Store
            </Link>
            <div style={styles.navLinks}>
              <Link to="/" style={styles.navLink}>
                Home
              </Link>
              <Link to="/products" style={styles.navLink}>
                Products
              </Link>
              <Link to="/cart" style={styles.cartLink}>
                🛒 Cart
                {cartCount > 0 && (
                  <span style={styles.cartCount}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>

        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Optional: 404 page */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <Link to="/" style={styles.navLink}>Go back to Home</Link>
              </div>
            } />
          </Routes>
        </main>

        <footer style={styles.footer}>
          <div style={styles.footerContent}>
            <div style={styles.footerSection}>
              <h3 style={styles.footerHeading}>🛍️ E-Store</h3>
              <p>Your one-stop shop for all products</p>
            </div>
            <div style={styles.footerSection}>
              <h3 style={styles.footerHeading}>Quick Links</h3>
              <Link to="/" style={styles.footerLink}>Home</Link>
              <Link to="/products" style={styles.footerLink}>Products</Link>
              <Link to="/cart" style={styles.footerLink}>Cart</Link>
            </div>
            <div style={styles.footerSection}>
              <h3 style={styles.footerHeading}>Contact</h3>
              <p>support@estore.com</p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
          <div style={styles.footerBottom}>
            <p>© 2024 E-Store. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

const styles = {
  navbar: {
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: "15px 0",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navLinks: {
    display: "flex",
    gap: "30px",
    alignItems: "center",
  },
  navLink: {
    color: "#555",
    textDecoration: "none",
    fontSize: "16px",
    padding: "8px 0",
    transition: "color 0.3s",
  },
  cartLink: {
    color: "#555",
    textDecoration: "none",
    fontSize: "16px",
    position: "relative",
    padding: "8px 20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.3s",
  },
  cartCount: {
    backgroundColor: "#ff4757",
    color: "white",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "-5px",
    right: "5px",
  },
  mainContent: {
    minHeight: "calc(100vh - 200px)",
    backgroundColor: "#f8f9fa",
  },
  footer: {
    backgroundColor: "#2c3e50",
    color: "white",
    marginTop: "auto",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "40px",
  },
  footerSection: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  footerHeading: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#ecf0f1",
  },
  footerLink: {
    color: "#bdc3c7",
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.3s",
  },
  footerBottom: {
    backgroundColor: "#1a252f",
    padding: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#95a5a6",
  },
};

// Add hover effects
const hoverStyles = `
  .App a:hover {
    color: #667eea;
  }
  
  .App a.cart-link:hover {
    background-color: #e9ecef;
  }
  
  .App a.footer-link:hover {
    color: #ecf0f1;
  }
`;

// Inject styles
const styleSheet = document.styleSheets[0];

export default App;