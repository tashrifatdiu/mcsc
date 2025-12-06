import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, X, LogIn, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuth from '../lib/useAuth';
import { useNavigate } from 'react-router-dom';
import JacketPreBookModal from '../components/JacketPreBookModal';

import './Merchandise.css';

// Import images
import jacketEnglishFront from './images/clubJacketEnglishVersionFront.jpg';
import jacketEnglishBack from './images/clubJacketEnglishVersionBack.jpg';
import jacketBanglaFront from './images/clubJacketBanglaVersionFront.jpg';
import jacketBanglaBack from './images/clubJacketBanglaVersionBack.jpg';
import nameplateEnglish from './images/clubNamePlateEnglishVersion.png';
import nameplateBangla from './images/clubNamePlateBanglaVersion.png';
import cortPin from './images/cort pin.png';

const ALL_PRODUCTS = {
  english: [
    {
      id: 'club-jacket-english',
      name: 'Club Jacket (English Version)',
      price: 999,
      originalPrice: 1299,
      image: jacketEnglishFront,
      imageBack: jacketEnglishBack,
      description: 'Premium quality club jacket with embroidered logo - English Version',
      gift: '🎁 FREE: 1 Nameplate + 1 Cort Pic included',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      version: 'english'
    },
    {
      id: 'club-nameplate-english',
      name: 'Club Nameplate (English Version)',
      price: 150,
      image: nameplateEnglish,
      description: 'Personalized club nameplate - English Version',
      sizes: ['One Size'],
      version: 'english',
      disabled: true,
      disabledMessage: 'Currently unavailable - FREE with Jacket Pre-Order'
    }
  ],
  bangla: [
    {
      id: 'club-jacket-bangla',
      name: 'ক্লাব জ্যাকেট (বাংলা ভার্সন)',
      price: 999,
      originalPrice: 1299,
      image: jacketBanglaFront,
      imageBack: jacketBanglaBack,
      description: 'প্রিমিয়াম মানের ক্লাব জ্যাকেট এমব্রয়ডারি লোগো সহ - বাংলা ভার্সন',
      gift: '🎁 ফ্রি: ১টি নেমপ্লেট + ১টি কর্ট পিক অন্তর্ভুক্ত',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      version: 'bangla'
    },
    {
      id: 'club-nameplate-bangla',
      name: 'ক্লাব নেমপ্লেট (বাংলা ভার্সন)',
      price: 150,
      image: nameplateBangla,
      description: 'ব্যক্তিগতকৃত ক্লাব নেমপ্লেট - বাংলা ভার্সন',
      sizes: ['One Size'],
      version: 'bangla',
      disabled: true,
      disabledMessage: 'বর্তমানে অনুপলব্ধ - জ্যাকেট প্রি-অর্ডারের সাথে ফ্রি'
    }
  ],
  universal: [
    {
      id: 'club-cort-pic',
      name: 'Club Cort Pic',
      nameBangla: 'ক্লাব কর্ট পিক',
      price: 100,
      image: cortPin,
      description: 'Official club cort pic badge - Universal for all versions',
      descriptionBangla: 'অফিশিয়াল ক্লাব কর্ট পিক ব্যাজ - সকল ভার্সনের জন্য',
      sizes: ['One Size'],
      version: 'universal',
      disabled: true,
      disabledMessage: 'Currently unavailable - FREE with Jacket Pre-Order',
      disabledMessageBangla: 'বর্তমানে অনুপলব্ধ - জ্যাকেট প্রি-অর্ডারের সাথে ফ্রি'
    }
  ]
};

export default function Merchandise() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [profile, setProfile] = useState(null);
  const [preBookJacket, setPreBookJacket] = useState(null);
  const [preBookSize, setPreBookSize] = useState(null);
  // Initialize with all products so guests can see them immediately
  const [products, setProducts] = useState([...ALL_PRODUCTS.english, ...ALL_PRODUCTS.bangla, ...ALL_PRODUCTS.universal]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      // Don't show loading since products are already visible
      
      if (user && user.id) {
        try {
          const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
          const res = await fetch(`${API_BASE}/api/auth/profile?supabaseId=${encodeURIComponent(user.id)}`);
          if (res.ok && mounted) {
            const data = await res.json();
            setProfile(data.profile);
            
            // Filter products based on version
            const userVersion = data.profile?.version || 'english';
            const filteredProducts = [
              ...ALL_PRODUCTS[userVersion],
              ...ALL_PRODUCTS.universal
            ];
            setProducts(filteredProducts);
            
            // Pre-fill form with profile data
            setOrderForm(prev => ({
              ...prev,
              name: data.profile?.name || user.user_metadata?.full_name || '',
              email: user.email || '',
              phone: data.profile?.whatsapp || ''
            }));
          }

          // Load order history
          const ordersRes = await fetch(`${API_BASE}/api/jacket-preorders/user/${user.id}`);
          if (ordersRes.ok && mounted) {
            const ordersData = await ordersRes.json();
            setOrderHistory(ordersData.preOrders || []);
          }
        } catch (err) {
          console.warn('Failed to load profile', err);
          // Default to all products if profile fetch fails
          setProducts([...ALL_PRODUCTS.english, ...ALL_PRODUCTS.universal]);
        }
      } else if (user) {
        // User logged in but no profile - show all products
        setProducts([...ALL_PRODUCTS.english, ...ALL_PRODUCTS.bangla, ...ALL_PRODUCTS.universal]);
        setOrderForm(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }));
      }
      // Guest users already have products from initial state
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  const addToCart = (product, size) => {
    const existingItem = cart.find(item => item.id === product.id && item.size === size);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, size, quantity: 1 }]);
    }
    
    setMessage({ type: 'success', text: 'Added to cart!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const updateQuantity = (productId, size, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId && item.size === size) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId, size) => {
    setCart(cart.filter(item => !(item.id === productId && item.size === size)));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Require login
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to place an order!' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    if (cart.length === 0) {
      setMessage({ type: 'error', text: 'Your cart is empty!' });
      return;
    }

    if (!orderForm.address) {
      setMessage({ type: 'error', text: 'Please enter your delivery address!' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const orderData = {
        customerName: profile?.name || orderForm.name,
        customerEmail: user?.email || orderForm.email,
        customerPhone: profile?.whatsapp || orderForm.phone,
        deliveryAddress: orderForm.address,
        notes: orderForm.notes,
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalPrice(),
        userId: user?.id || null,
        studentProfile: profile ? {
          class: profile.class,
          section: profile.section,
          department: profile.department,
          version: profile.version
        } : null,
        status: 'pending'
      };

      const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setMessage({ type: 'success', text: 'Order placed successfully! We will contact you soon.' });
      setCart([]);
      setShowCart(false);
      setOrderForm({
        name: profile?.name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        phone: profile?.whatsapp || '',
        address: '',
        notes: ''
      });
    } catch (error) {
      console.error('Order error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="merchandise-page">
        <div className="merchandise-loading">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="merchandise-page">
      <div className="merchandise-header">
        <h1>Club Merchandise</h1>
        <p>Get your official Milestone College Science Club gear</p>
        
        <button 
          className="cart-toggle-btn"
          onClick={() => setShowCart(!showCart)}
        >
          <ShoppingCart size={24} />
          {getTotalItems() > 0 && (
            <span className="cart-badge">{getTotalItems()}</span>
          )}
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="merchandise-container">
        {/* Important Notice about Free Gifts */}
        <div className="gift-policy-notice">
          <div className="notice-icon">🎁</div>
          <div className="notice-content">
            <h3>🔥 Pre-Order Special Offer!</h3>
            <p className="notice-english">
              <strong>Original Price: ৳1299 → Pre-Order Price: ৳999 (Save ৳300!)</strong><br/>
              Each student will receive <strong>ONE nameplate</strong> and <strong>ONE cort pic</strong> with their jacket pre-order, 
              regardless of how many jackets they order. To ensure everyone gets their free gifts, 
              <strong> please pre-order your jacket using your own account</strong>.
            </p>
            <p className="notice-bangla">
              <strong>মূল মূল্য: ৳১২৯৯ → প্রি-অর্ডার মূল্য: ৳৯৯৯ (সাশ্রয় ৳৩০০!)</strong><br/>
              প্রতিটি শিক্ষার্থী তাদের জ্যাকেট প্রি-অর্ডারের সাথে <strong>একটি নেমপ্লেট</strong> এবং <strong>একটি কর্ট পিক</strong> পাবেন, 
              তারা যতগুলি জ্যাকেট অর্ডার করুক না কেন। সবাই যাতে তাদের ফ্রি উপহার পায় তা নিশ্চিত করতে, 
              <strong> অনুগ্রহ করে আপনার নিজের অ্যাকাউন্ট ব্যবহার করে আপনার জ্যাকেট প্রি-অর্ডার করুন</strong>।
            </p>
          </div>
        </div>

        {profile && (
          <div className="version-badge">
            <span>Showing products for: </span>
            <strong>{profile.version === 'bangla' ? 'বাংলা ভার্সন' : 'English Version'}</strong>
          </div>
        )}
        
        <div className="products-grid">
          {products.length === 0 ? (
            <div className="loading-products">Loading products...</div>
          ) : (
            products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onPreBook={(jacket, size) => {
                  setPreBookJacket(jacket);
                  setPreBookSize(size);
                }}
                onShowCart={() => {
                  warning('Please login to pre-book jackets');
                }}
                user={user}
                userVersion={profile?.version}
              />
            ))
          )}
        </div>

        {showCart && (
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>
                <ShoppingCart size={20} />
                {showOrderHistory ? 'Order History' : 'Shopping Cart'}
              </h2>
              <button onClick={() => setShowCart(false)} className="close-cart-btn">
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="cart-tabs">
                <button 
                  className={!showOrderHistory ? 'active' : ''}
                  onClick={() => setShowOrderHistory(false)}
                >
                  <ShoppingCart size={16} />
                  Cart ({getTotalItems()})
                </button>
                <button 
                  className={showOrderHistory ? 'active' : ''}
                  onClick={() => setShowOrderHistory(true)}
                >
                  <Package size={16} />
                  Orders ({orderHistory.length})
                </button>
              </div>
            )}

            {showOrderHistory ? (
              <div className="order-history-section">
                {orderHistory.length === 0 ? (
                  <div className="empty-cart">
                    <Package size={48} />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="order-history-list">
                    {orderHistory.map(order => (
                      <div key={order._id} className="history-order-card">
                        <div className="history-order-header">
                          <span className="order-date-small">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className={`status-badge-small status-${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="history-order-items">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={idx} className="history-item">
                                <span>{item.jacketType} ({item.size}) ×{item.quantity}</span>
                                <span>৳{item.pricePerUnit * item.quantity}</span>
                              </div>
                            ))
                          ) : (
                            <div className="history-item">
                              <span>{order.jacketType} ({order.size})</span>
                              <span>৳{order.amount}</span>
                            </div>
                          )}
                        </div>
                        <div className="history-order-total">
                          <strong>Total:</strong>
                          <strong>৳{order.totalAmount || order.amount}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : !showOrderHistory && cart.length === 0 ? (
              <div className="empty-cart">
                <Package size={48} />
                <p>Your cart is empty</p>
              </div>
            ) : !showOrderHistory ? (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>Size: {item.size}</p>
                        <p className="cart-item-price">৳{item.price}</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.size, -1)}>
                            <Minus size={16} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.size, 1)}>
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id, item.size)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <h3>Total: ৳{getTotalPrice()}</h3>
                </div>

                {!user ? (
                  <div className="login-required">
                    <LogIn size={48} />
                    <h3>Login Required</h3>
                    <p>Please login to place your order</p>
                    <button 
                      className="login-btn"
                      onClick={() => navigate('/login')}
                    >
                      Go to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="order-form">
                    <h3>Student Information</h3>
                    
                    {profile && (
                    <div className="profile-info-section">
                      <div className="profile-field">
                        <label>Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          readOnly
                          className="readonly-field"
                        />
                      </div>
                      
                      <div className="profile-field">
                        <label>Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="readonly-field"
                        />
                      </div>
                      
                      <div className="profile-row">
                        <div className="profile-field">
                          <label>Class</label>
                          <input
                            type="text"
                            value={profile.class}
                            readOnly
                            className="readonly-field"
                          />
                        </div>
                        
                        <div className="profile-field">
                          <label>Section</label>
                          <input
                            type="text"
                            value={profile.section}
                            readOnly
                            className="readonly-field"
                          />
                        </div>
                      </div>
                      
                      <div className="profile-row">
                        <div className="profile-field">
                          <label>Department</label>
                          <input
                            type="text"
                            value={profile.department.charAt(0).toUpperCase() + profile.department.slice(1)}
                            readOnly
                            className="readonly-field"
                          />
                        </div>
                        
                        <div className="profile-field">
                          <label>Version</label>
                          <input
                            type="text"
                            value={profile.version.charAt(0).toUpperCase() + profile.version.slice(1)}
                            readOnly
                            className="readonly-field"
                          />
                        </div>
                      </div>
                      
                      <div className="profile-field">
                        <label>WhatsApp Number</label>
                        <input
                          type="tel"
                          value={profile.whatsapp}
                          readOnly
                          className="readonly-field"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!profile && user && (
                    <>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={orderForm.name}
                        onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                        required
                      />
                      
                      <input
                        type="email"
                        placeholder="Email *"
                        value={orderForm.email}
                        onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                        required
                      />
                      
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={orderForm.phone}
                        onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                        required
                      />
                    </>
                  )}
                  
                  <h3 style={{ marginTop: '1.5rem' }}>Delivery Information</h3>
                  
                  <textarea
                    placeholder="Delivery Address *"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    rows="3"
                    required
                  />
                  
                  <textarea
                    placeholder="Additional Notes (Optional)"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows="2"
                  />
                  
                  <button 
                    type="submit" 
                    className="place-order-btn"
                    disabled={submitting}
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
                )}
              </>
            ) : null}
          </div>
        )}
        {preBookJacket && (
          <JacketPreBookModal
            jacket={preBookJacket}
            preselectedSize={preBookSize}
            user={user}
            profile={profile}
            onClose={() => {
              setPreBookJacket(null);
              setPreBookSize(null);
            }}
            onSuccess={() => {
              setMessage({ type: 'success', text: 'Pre-order submitted successfully!' });
              setPreBookJacket(null);
              setPreBookSize(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, onPreBook, onShowCart, user, userVersion }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showBackImage, setShowBackImage] = useState(false);
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  
  const displayName = userVersion === 'bangla' && product.nameBangla 
    ? product.nameBangla 
    : product.name;
    
  const displayDescription = userVersion === 'bangla' && product.descriptionBangla 
    ? product.descriptionBangla 
    : product.description;
    
  const displayDisabledMessage = userVersion === 'bangla' && product.disabledMessageBangla 
    ? product.disabledMessageBangla 
    : product.disabledMessage;

  // Import gift images for display
  const nameplateEnglish = require('./images/clubNamePlateEnglishVersion.png');
  const nameplateBangla = require('./images/clubNamePlateBanglaVersion.png');
  const cortPin = require('./images/cort pin.png');

  return (
    <div className={`product-card ${product.disabled ? 'disabled-product' : ''}`}>
      <div 
        className="product-image"
        onMouseEnter={() => product.imageBack && setShowBackImage(true)}
        onMouseLeave={() => setShowBackImage(false)}
      >
        <img 
          src={showBackImage && product.imageBack ? product.imageBack : product.image} 
          alt={displayName} 
        />
        {product.imageBack && (
          <span className="image-hint">
            {showBackImage ? 'Front' : 'Hover for back view'}
          </span>
        )}
        
        {/* Gift badges for jacket */}
        {product.gift && (
          <div className="gift-badges">
            <div className="gift-badge gift-badge-1">
              <img src={userVersion === 'bangla' ? nameplateBangla : nameplateEnglish} alt="Free Nameplate" />
              <span className="gift-label">FREE</span>
            </div>
            <div className="gift-badge gift-badge-2">
              <img src={cortPin} alt="Free Pin" />
              <span className="gift-label">FREE</span>
            </div>
          </div>
        )}
        
        {/* Disabled overlay */}
        {product.disabled && (
          <div className="disabled-overlay">
            <span className="disabled-badge">
              {userVersion === 'bangla' ? 'অনুপলব্ধ' : 'Unavailable'}
            </span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{displayName}</h3>
        <p className="product-description">{displayDescription}</p>
        {product.gift && (
          <p className="product-gift">{product.gift}</p>
        )}
        <div className="product-pricing">
          {product.originalPrice && (
            <span className="original-price">৳{product.originalPrice}</span>
          )}
          <p className="product-price">৳{product.price}</p>
          {product.originalPrice && (
            <span className="discount-badge">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>
        
        {product.version && (
          <span className={`version-tag ${product.version}`}>
            {product.version === 'bangla' ? 'বাংলা' : product.version === 'english' ? 'English' : 'Universal'}
          </span>
        )}
        
        {/* Show disabled message or size selector */}
        {product.disabled ? (
          <div className="disabled-message">
            <p>{displayDisabledMessage}</p>
          </div>
        ) : (
          <div className="product-size">
            <label>{userVersion === 'bangla' ? 'সাইজ:' : 'Size:'}</label>
            <select 
              value={selectedSize} 
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {product.sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Show Pre-Book button for jackets, Add to Cart for others, or disabled state */}
        {product.disabled ? (
          <button className="disabled-btn" disabled>
            {userVersion === 'bangla' ? 'অনুপলব্ধ' : 'Unavailable'}
          </button>
        ) : product.id.includes('jacket') ? (
          <button 
            className={`prebook-btn ${showLoginNotice ? 'login-notice' : ''}`}
            onClick={() => {
              if (user) {
                onPreBook(product, selectedSize);
              } else {
                setShowLoginNotice(true);
                setTimeout(() => setShowLoginNotice(false), 2000);
              }
            }}
            disabled={showLoginNotice}
          >
            {showLoginNotice 
              ? (userVersion === 'bangla' ? '⚠️ প্রথমে লগইন করুন' : '⚠️ Please Login First')
              : (userVersion === 'bangla' ? 'প্রি-বুক করুন' : 'Pre-Book Now')
            }
          </button>
        ) : (
          <button 
            className={`add-to-cart-btn ${showLoginNotice ? 'login-notice' : ''}`}
            onClick={() => {
              if (user) {
                onAddToCart(product, selectedSize);
              } else {
                setShowLoginNotice(true);
                setTimeout(() => setShowLoginNotice(false), 2000);
              }
            }}
            disabled={showLoginNotice}
          >
            {showLoginNotice ? (
              userVersion === 'bangla' ? '⚠️ প্রথমে লগইন করুন' : '⚠️ Please Login First'
            ) : (
              <>
                <Plus size={18} />
                {userVersion === 'bangla' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
