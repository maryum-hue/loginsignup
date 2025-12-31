import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, increment ,collection, getDocs, query,setDoc,updateDoc, where, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './productDetail.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    fetchReviews();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        setProduct({
          id: productSnap.id,
          ...productData,
          createdAt: productData.createdAt?.toDate(),
          lastUpdated: productData.lastUpdated?.toDate()
        });
        setSelectedImage(productData.images?.[0] || productData.image || '/default-product.jpg');
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      if (!product) return;
      
      const productsRef = collection(db, "products");
      const q = query(
        productsRef,
        where("category", "==", product.category),
        where("isActive", "==", true),
        limit(4)
      );
      
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs
        .filter(doc => doc.id !== id)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
      setRelatedProducts(data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("productId", "==", id), limit(10));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    setAddingToCart(true);
    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);

      const cartItem = {
        productId: product.id,
        name: product.name || product.title,
        price: product.price,
        image: selectedImage,
        quantity: quantity,
        selectedSize,
        selectedColor,
        category: product.category,
        addedAt: serverTimestamp(),
        maxStock: product.stock || 99
      };

      if (!cartSnap.exists()) {
        await setDoc(cartRef, {
          userId: user.uid,
          items: [cartItem],
          totalItems: quantity,
          totalPrice: product.price * quantity,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      } else {
        const cartData = cartSnap.data();
        const existingItemIndex = cartData.items.findIndex(
          item => item.productId === product.id
        );

        await updateDoc(cartRef, {
          items: existingItemIndex >= 0 
            ? cartData.items.map((item, index) => 
                index === existingItemIndex 
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...cartData.items, cartItem],
          totalItems: increment(quantity),
          totalPrice: increment(product.price * quantity),
          lastUpdated: serverTimestamp()
        });
      }

      toast.success(`${quantity} ${product.name} added to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/cart');
  };

  const addToWishlist = async () => {
    if (!user) {
      toast.info('Please login to save items');
      return;
    }

    try {
      const wishlistRef = collection(db, "wishlists");
      await addDoc(wishlistRef, {
        userId: user.uid,
        productId: product.id,
        productName: product.name,
        productImage: selectedImage,
        productPrice: product.price,
        addedAt: serverTimestamp()
      });
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast.info('Please login to submit a review');
      return;
    }

    try {
      const reviewsRef = collection(db, "reviews");
      await addDoc(reviewsRef, {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || user.email,
        userPhoto: user.photoURL,
        rating: newReview.rating,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });
      
      toast.success('Review submitted!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'star filled' : 'star'}>
            {i < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
      </div>
    );
  }

  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="product-detail-page">
      <ToastContainer />
      
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate('/')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-separator">›</span>
        <button onClick={() => navigate('/products')} className="breadcrumb-link">Products</button>
        <span className="breadcrumb-separator">›</span>
        <button onClick={() => navigate(`/category/${product.category}`)} className="breadcrumb-link">
          {product.category}
        </button>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-container">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image-container">
            <img 
              src={selectedImage} 
              alt={product.name}
              className="main-image"
              onError={(e) => {
                e.target.src = '/default-product.jpg';
                e.target.classList.add('image-error');
              }}
            />
            {discount > 0 && (
              <div className="discount-badge">-{discount}% OFF</div>
            )}
            {product.isNew && <div className="new-badge">NEW</div>}
          </div>
          
          <div className="thumbnail-gallery">
            {product.images?.slice(0, 5).map((image, index) => (
              <div 
                key={index}
                className={`thumbnail ${selectedImage === image ? 'active' : ''}`}
                onClick={() => setSelectedImage(image)}
              >
                <img 
                  src={image} 
                  alt={`${product.name} ${index + 1}`}
                  onError={(e) => {
                    e.target.src = '/default-product.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-meta">
              <span className="product-sku">SKU: {product.sku || 'N/A'}</span>
              <span className="product-category">{product.category}</span>
              <span className="product-brand">{product.brand}</span>
            </div>
          </div>

          <div className="product-rating">
            {renderStars(product.rating || 0)}
            <span className="rating-value">{product.rating || 0}/5</span>
            <span className="review-count">({reviews.length} reviews)</span>
            <span className="sold-count">{product.soldCount || 0} sold</span>
          </div>

          <div className="product-price-section">
            <div className="price-container">
              <span className="current-price">${product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="price-savings">
              {discount > 0 && (
                <span className="savings">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
              )}
              {product.shipping && product.shipping.free && (
                <span className="free-shipping">+ FREE Shipping</span>
              )}
            </div>
          </div>

          <div className="product-description-short">
            {product.shortDescription || product.description?.substring(0, 200)}
          </div>

          {/* Variants */}
          {(product.sizes || product.colors) && (
            <div className="product-variants">
              {product.sizes && (
                <div className="variant-section">
                  <label className="variant-label">Size:</label>
                  <div className="variant-options">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        className={`variant-option ${selectedSize === size ? 'selected' : ''} ${size.stock === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => setSelectedSize(size)}
                        disabled={size.stock === 0}
                      >
                        {size.name}
                        {size.stock === 0 && <span className="stock-label">Out</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors && (
                <div className="variant-section">
                  <label className="variant-label">Color:</label>
                  <div className="variant-options colors">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock Info */}
          <div className="stock-info">
            <div className="stock-status">
              <span className={`stock-indicator ${product.stock > 10 ? 'in-stock' : 'low-stock'}`}></span>
              <span className="stock-text">
                {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`}
              </span>
            </div>
            {product.stock <= 10 && product.stock > 0 && (
              <div className="stock-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${(product.stock / 10) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="product-actions-section">
            <div className="quantity-control">
              <label className="quantity-label">Quantity:</label>
              <div className="quantity-selector">
                <button 
                  className="quantity-btn minus"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, value), product.stock));
                  }}
                  className="quantity-input"
                />
                <button 
                  className="quantity-btn plus"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="max-quantity">Max: {product.stock}</span>
            </div>

            <div className="action-buttons">
              <button 
                className="add-to-cart-btn"
                onClick={addToCart}
                disabled={addingToCart || product.stock <= 0}
              >
                {addingToCart ? (
                  <>
                    <span className="spinner-small"></span> Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button 
                className="buy-now-btn"
                onClick={buyNow}
                disabled={product.stock <= 0}
              >
                Buy Now
              </button>
              <button 
                className="wishlist-btn"
                onClick={addToWishlist}
                title="Add to Wishlist"
              >
                ♡
              </button>
            </div>
          </div>

          {/* Product Features */}
          <div className="product-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <div className="feature-text">
                <strong>Free Shipping</strong>
                <p>On orders over $50</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">↩️</span>
              <div className="feature-text">
                <strong>30-Day Returns</strong>
                <p>Easy returns policy</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <div className="feature-text">
                <strong>Secure Payment</strong>
                <p>100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-section">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button 
            className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({reviews.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-pane">
              <div className="description-content">
                <h3>Product Description</h3>
                <p>{product.description}</p>
                
                {product.features && (
                  <div className="features-list">
                    <h4>Key Features:</h4>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="tab-pane">
              <div className="specifications">
                <h3>Product Specifications</h3>
                <table className="specs-table">
                  <tbody>
                    {product.specifications?.map((spec, index) => (
                      <tr key={index}>
                        <td className="spec-label">{spec.label}</td>
                        <td className="spec-value">{spec.value}</td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan="2">No specifications available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-pane">
              <div className="reviews-section">
                <div className="reviews-header">
                  <div className="average-rating">
                    <h3>Customer Reviews</h3>
                    <div className="rating-summary">
                      <span className="average-score">
                        {reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0}
                      </span>
                      {renderStars(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0)}
                      <span className="total-reviews">{reviews.length} reviews</span>
                    </div>
                  </div>
                  
                  {user && (
                    <div className="add-review">
                      <h4>Add Your Review</h4>
                      <div className="review-form">
                        <div className="rating-input">
                          <label>Rating:</label>
                          <div className="star-rating">
                            {[1,2,3,4,5].map((star) => (
                              <span
                                key={star}
                                className={`star ${star <= newReview.rating ? 'selected' : ''}`}
                                onClick={() => setNewReview({...newReview, rating: star})}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <textarea
                          className="review-textarea"
                          placeholder="Share your thoughts about this product..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        />
                        <button 
                          className="submit-review-btn"
                          onClick={submitReview}
                          disabled={!newReview.comment.trim()}
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                          <div className="reviewer-info">
                            {review.userPhoto && (
                              <img src={review.userPhoto} alt={review.userName} className="reviewer-photo" />
                            )}
                            <div>
                              <strong>{review.userName}</strong>
                              <div className="review-rating">{renderStars(review.rating)}</div>
                            </div>
                          </div>
                          <span className="review-date">
                            {review.createdAt?.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="tab-pane">
              <div className="shipping-info">
                <h3>Shipping Information</h3>
                <div className="shipping-details">
                  <div className="shipping-item">
                    <h4>🕐 Delivery Time</h4>
                    <p>Standard: 3-5 business days</p>
                    <p>Express: 1-2 business days</p>
                  </div>
                  <div className="shipping-item">
                    <h4>💰 Shipping Cost</h4>
                    <p>Free shipping on orders over $50</p>
                    <p>Standard shipping: $5.99</p>
                  </div>
                  <div className="shipping-item">
                    <h4>↩️ Returns Policy</h4>
                    <p>30-day return policy</p>
                    <p>Free returns for defective items</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2 className="section-title">Related Products</h2>
          <div className="related-products-grid">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="related-product-card"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <img 
                  src={relatedProduct.image || relatedProduct.thumbnail} 
                  alt={relatedProduct.name}
                  className="related-product-image"
                />
                <div className="related-product-info">
                  <h4>{relatedProduct.name}</h4>
                  <div className="related-product-price">
                    ${relatedProduct.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;