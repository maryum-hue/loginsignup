import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, allProducts]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://dummyjson.com/products?limit=100');
      setAllProducts(response.data.products);
      setProducts(response.data.products);
      
      const uniqueCategories = [...new Set(response.data.products.map(p => p.category))];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...allProducts];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setProducts(filtered);
  };

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      document.getElementById('cart-count').textContent = count;
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingIndex = cart.findIndex(item => item.id === product.id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      alert(`${product.title} added to cart!`);
    } catch (error) {
      alert('Failed to add item to cart');
    }
  };

  const viewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <div className="loading">Loading all products...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Products</h1>
        <p style={styles.subtitle}>{products.length} products available</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.categoryContainer}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.categorySelect}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={styles.noResults}>
          <p>No products found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div 
              key={product.id} 
              className="product-card"
              onClick={() => viewProduct(product.id)}
            >
              <div style={styles.imageContainer}>
                <img 
                  src={product.thumbnail} 
                  alt={product.title}
                  style={styles.productImage}
                />
                {product.discountPercentage > 10 && (
                  <span className="discount-badge">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <p style={styles.category}>{product.category}</p>
                <p style={styles.description}>
                  {product.description.substring(0, 60)}...
                </p>
                
                <div style={styles.rating}>
                  <span style={styles.stars}>
                    {'★'.repeat(Math.round(product.rating))}
                    {'☆'.repeat(5 - Math.round(product.rating))}
                  </span>
                  <span style={styles.ratingText}>({product.rating})</span>
                </div>
                
                <div style={styles.priceContainer}>
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  {product.discountPercentage && (
                    <span style={styles.originalPrice}>
                      ${(product.price * (1 + product.discountPercentage/100)).toFixed(2)}
                    </span>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => addToCart(e, product)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#666',
    fontSize: '18px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    gap: '20px',
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '500px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 20px',
    border: '2px solid #ddd',
    borderRadius: '25px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  categoryContainer: {
    minWidth: '200px',
  },
  categorySelect: {
    width: '100%',
    padding: '12px 20px',
    border: '2px solid #ddd',
    borderRadius: '25px',
    fontSize: '16px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  imageContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  category: {
    color: '#667eea',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'capitalize',
  },
  description: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: 1.4,
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  stars: {
    color: '#ffc107',
    fontSize: '16px',
  },
  ratingText: {
    color: '#666',
    fontSize: '14px',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: '#999',
    fontSize: '16px',
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    fontSize: '18px',
  },
};

export default ProductsPage;