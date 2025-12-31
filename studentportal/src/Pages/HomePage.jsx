import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  db, 
  auth 
} from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  getDoc,
  Timestamp,
  where
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './home.css';
import { useNavigate } from 'react-router-dom'; // Added for navigation

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [user, setUser] = useState(null);
  const [inCartProducts, setInCartProducts] = useState(new Set());
  const [cartLoading, setCartLoading] = useState({});
  const navigate = useNavigate(); // For navigation

  // Fake products data for initial display
  const fakeProducts = useMemo(() => [
    {
      id: 'fake-1',
      name: 'Premium Wireless Headphones',
      description: 'Noise-cancelling over-ear headphones with 30-hour battery life, Bluetooth 5.0, and crystal clear audio quality.',
      price: 129.99,
      originalPrice: 199.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      stock: 25,
      rating: 4.5,
      reviewCount: 128,
      isNew: true,
      shipping: { free: true },
      createdAt: new Date('2024-01-15'),
      purchaseCount: 45,
      isActive: true
    },
    {
      id: 'fake-2',
      name: 'Organic Cotton T-Shirt',
      description: '100% organic cotton t-shirt, comfortable fit, available in multiple colors.',
      price: 24.99,
      originalPrice: 29.99,
      category: 'clothing',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      stock: 100,
      rating: 4.2,
      reviewCount: 89,
      isNew: false,
      shipping: { free: true, minOrder: 50 },
      createdAt: new Date('2024-01-10'),
      purchaseCount: 210,
      isActive: true
    },
    {
      id: 'fake-3',
      name: 'Smart Fitness Watch',
      description: 'Track your fitness, heart rate, sleep, and receive smartphone notifications.',
      price: 199.99,
      originalPrice: 249.99,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w-400&h=400&fit=crop',
      stock: 15,
      rating: 4.7,
      reviewCount: 256,
      isNew: true,
      shipping: { free: false, cost: 9.99 },
      createdAt: new Date('2024-01-20'),
      purchaseCount: 89,
      isActive: true
    },
    {
      id: 'fake-4',
      name: 'Stainless Steel Water Bottle',
      description: '1L insulated water bottle, keeps drinks cold for 24 hours or hot for 12 hours.',
      price: 34.99,
      originalPrice: 39.99,
      category: 'home',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop',
      stock: 50,
      rating: 4.3,
      reviewCount: 156,
      isNew: false,
      shipping: { free: true },
      createdAt: new Date('2024-01-05'),
      purchaseCount: 178,
      isActive: true
    },
    {
      id: 'fake-5',
      name: 'Professional Blender',
      description: '1500W high-performance blender for smoothies, soups, and food processing.',
      price: 89.99,
      category: 'kitchen',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
      stock: 30,
      rating: 4.6,
      reviewCount: 203,
      isNew: true,
      shipping: { free: false, cost: 12.99 },
      createdAt: new Date('2024-01-18'),
      purchaseCount: 67,
      isActive: true
    },
    {
      id: 'fake-6',
      name: 'Leather Backpack',
      description: 'Genuine leather backpack with laptop compartment and multiple pockets.',
      price: 149.99,
      originalPrice: 199.99,
      category: 'fashion',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      stock: 20,
      rating: 4.4,
      reviewCount: 92,
      isNew: false,
      shipping: { free: true },
      createdAt: new Date('2024-01-12'),
      purchaseCount: 45,
      isActive: true
    },
    {
      id: 'fake-7',
      name: 'Yoga Mat Premium',
      description: 'Non-slip yoga mat with carrying strap, perfect for all types of yoga.',
      price: 29.99,
      category: 'sports',
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop',
      stock: 75,
      rating: 4.1,
      reviewCount: 187,
      isNew: true,
      shipping: { free: true },
      createdAt: new Date('2024-01-22'),
      purchaseCount: 134,
      isActive: true
    },
    {
      id: 'fake-8',
      name: 'Desk Lamp with Wireless Charger',
      description: 'Modern LED desk lamp with built-in wireless charger and adjustable brightness.',
      price: 59.99,
      originalPrice: 79.99,
      category: 'home',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
      stock: 40,
      rating: 4.5,
      reviewCount: 76,
      isNew: true,
      shipping: { free: true },
      createdAt: new Date('2024-01-14'),
      purchaseCount: 89,
      isActive: true
    }
  ], []);

  useEffect(() => {
    fetchProducts();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkCartItems(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchTerm, priceRange]);

  const fetchProducts = async () => {
    try {
      setLoading(false);
      const productsRef = collection(db, "products");
      const q = query(
        productsRef, 
        orderBy("createdAt", "desc"),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      // If no products from Firebase, use fake products
      const allProducts = data.length > 0 ? data : fakeProducts;
      setProducts(allProducts);
      
      // Extract unique categories and sort them
      const uniqueCategories = ['all', ...new Set(allProducts.map(product => product.category))]
        .filter(category => category)
        .sort();
      setCategories(uniqueCategories);
      
      // Calculate price range
      if (allProducts.length > 0) {
        const prices = allProducts.map(p => p.price);
        setPriceRange({
          min: Math.floor(Math.min(...prices)),
          max: Math.ceil(Math.max(...prices))
        });
      }
      
    } catch (error) {
      console.error("Error fetching products:", error);
      // If Firebase fails, use fake products
      setProducts(fakeProducts);
      const uniqueCategories = ['all', ...new Set(fakeProducts.map(product => product.category))]
        .filter(category => category)
        .sort();
      setCategories(uniqueCategories);
      const prices = fakeProducts.map(p => p.price);
      setPriceRange({
        min: Math.floor(Math.min(...prices)),
        max: Math.ceil(Math.max(...prices))
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCartItems = async (userId) => {
    try {
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const productIds = cartData.items?.map(item => item.productId) || [];
        setInCartProducts(new Set(productIds));
      }
    } catch (error) {
      console.error("Error checking cart:", error);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && 
      product.price <= priceRange.max
    );
    
    // Sort products
    switch(sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
        break;
      default:
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy, searchTerm, priceRange]);

  const addToCart = async (product) => {
    if (!user) {
      toast.info("Please login to add items to cart", {
        position: "top-right",
        autoClose: 3000,
      });
      // Optionally redirect to login
      // navigate('/login');
      return;
    }

    setCartLoading(prev => ({ ...prev, [product.id]: true }));

    try {
      const userId = user.uid;
      const cartRef = doc(db, "carts", userId);
      
      // Check if cart exists
      const cartSnap = await getDoc(cartRef);
      
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '/default-product.jpg',
        quantity: 1,
        addedAt: Timestamp.now(),
        category: product.category,
        maxStock: product.stock || 99
      };

      if (!cartSnap.exists()) {
        // Create new cart
        await setDoc(cartRef, {
          userId,
          items: [cartItem],
          totalItems: 1,
          totalPrice: product.price,
          lastUpdated: Timestamp.now(),
          createdAt: Timestamp.now()
        });
      } else {
        const cartData = cartSnap.data();
        const existingItemIndex = cartData.items.findIndex(
          item => item.productId === product.id
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...cartData.items];
          const existingItem = updatedItems[existingItemIndex];
          
          // Check stock limit
          if (existingItem.quantity >= cartItem.maxStock) {
            toast.warning(`Maximum stock limit reached for ${product.name}`);
            return;
          }
          
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
            lastUpdated: Timestamp.now()
          };
          
          await updateDoc(cartRef, {
            items: updatedItems,
            totalItems: increment(1),
            totalPrice: increment(product.price),
            lastUpdated: Timestamp.now()
          });
        } else {
          // Add new item
          await updateDoc(cartRef, {
            items: arrayUnion(cartItem),
            totalItems: increment(1),
            totalPrice: increment(product.price),
            lastUpdated: Timestamp.now()
          });
        }
      }

      // Update local state
      setInCartProducts(prev => new Set([...prev, product.id]));
      
      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'));
      
      toast.success(`${product.name} added to cart!`, {
        position: "top-right",
        autoClose: 2000,
        icon: "🛒"
      });
      
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setCartLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value) || 0
    }));
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
    return Math.round(discount);
  };

  // Function to navigate to product detail page
  const goToProductDetail = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderProductCard = (product) => {
    const isInCart = inCartProducts.has(product.id);
    const isLoading = cartLoading[product.id];
    const discount = calculateDiscount(product.originalPrice, product.price);
    
    return (
      <div key={product.id} className="product-card">
        <div className="product-image-container" onClick={() => goToProductDetail(product.id)} style={{ cursor: 'pointer' }}>
          <img 
            src={product.image || '/default-product.jpg'} 
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/default-product.jpg';
              e.target.classList.add('image-error');
            }}
          />
          {product.isNew && <span className="new-badge">New</span>}
          {discount > 0 && (
            <span className="discount-badge">-{discount}%</span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="low-stock-badge">Only {product.stock} left</span>
          )}
          {(!product.stock || product.stock <= 0) && (
            <span className="out-of-stock-badge">Out of Stock</span>
          )}
        </div>
        
        <div className="product-info">
          <div className="product-category-tag">
            {product.category}
          </div>
          
          <h3 
            className="product-name" 
            title={product.name}
            onClick={() => goToProductDetail(product.id)}
            style={{ cursor: 'pointer', color: '#007bff' }}
          >
            {product.name}
          </h3>
          
          <p className="product-description">
            {product.description?.substring(0, 80) || 'No description available'}
            {product.description?.length > 80 ? '...' : ''}
          </p>
          
          <div className="product-rating">
            {product.rating && (
              <>
                <span className="stars">
                  {'★'.repeat(Math.floor(product.rating))}
                  {'☆'.repeat(5 - Math.floor(product.rating))}
                </span>
                <span className="rating-value">({product.rating})</span>
                {product.reviewCount && (
                  <span className="review-count">({product.reviewCount} reviews)</span>
                )}
              </>
            )}
          </div>
          
          <div className="product-price-section">
            <div className="price-container">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="current-price">
                ${product.price.toFixed(2)}
              </span>
            </div>
            {product.shipping && product.shipping.free && (
              <span className="free-shipping">Free Shipping</span>
            )}
          </div>
          
          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${isInCart ? 'in-cart' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              disabled={isLoading || (!product.stock || product.stock <= 0) || isInCart}
              title={isInCart ? 'Already in cart' : 'Add to cart'}
            >
              {isLoading ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <i className="cart-icon">🛒</i>
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </>
              )}
            </button>
            
            <div className="secondary-actions">
              <button 
                className="quick-view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  goToProductDetail(product.id);
                }}
                title="Quick View"
              >
                👁️ Quick View
              </button>
              <button 
                className="wishlist-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  addToWishlist(product);
                }}
                title="Add to Wishlist"
              >
                ♡
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const addToWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to save items to wishlist");
      return;
    }
    
    try {
      // Implement wishlist functionality here
      toast.success("Added to wishlist!");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Premium Store</h1>
          <p>Discover amazing products at unbeatable prices with fast delivery</p>
          
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{products.length}</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">{categories.length - 1}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-list">
              <button
                className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </button>
              {categories.filter(cat => cat !== 'all').map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <div className="range-inputs">
                <input
                  type="number"
                  min="0"
                  max={priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="range-input"
                />
                <span>to</span>
                <input
                  type="number"
                  min={priceRange.min}
                  max="10000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="range-input"
                />
              </div>
              <div className="range-slider">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="slider"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="slider"
                />
              </div>
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Sort By</h3>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Recommended</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSelectedCategory('all');
              setSortBy('default');
              setSearchTerm('');
              setPriceRange({ min: 0, max: 1000 });
            }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* Products Section */}
        <main className="products-section">
          <div className="products-header">
            <div className="results-info">
              <h2>
                {selectedCategory === 'all' ? 'All Products' : selectedCategory}
              </h2>
              <p>{filteredProducts.length} products found</p>
            </div>
            
            <div className="view-options">
              <button className="view-option active" title="Grid View">◼◼</button>
              <button className="view-option" title="List View">☰</button>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>Try changing your filters or search term</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(renderProductCard)}
            </div>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="load-more">
              <button className="load-more-btn">
                Load More Products
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Featured Categories */}
      <div className="featured-categories">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories
            .filter(cat => cat !== 'all')
            .slice(0, 6)
            .map(category => (
              <div 
                key={category}
                className="category-card"
                onClick={() => setSelectedCategory(category)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-image">
                  {/* You can add category-specific images here */}
                  <div className="category-icon">
                    {category === 'electronics' && '📱'}
                    {category === 'clothing' && '👕'}
                    {category === 'home' && '🏠'}
                    {category === 'kitchen' && '🍳'}
                    {category === 'fashion' && '👗'}
                    {category === 'sports' && '⚽'}
                  </div>
                </div>
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <p>
                  {products.filter(p => p.category === category).length} products
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;