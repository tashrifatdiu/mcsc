import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, X, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuth from '../lib/useAuth';
import { useNavigate } from 'react-router-dom';
import './Merchandise.css';

// Import images
import jacketEnglishFront from './images/clubJacketEnglishVersionFront.jpg';
import jacketEnglishBack from './images/clubJacketEnglishVersionBack.jpg';
import jacketBanglaFront from './images/clubJacketBanglaVersionFront.jpg';
import jacketBanglaBack from './images/clubJacketBanglaVersionBack.jpg';
import mufflerEnglish from './images/MufflerEnglishVersion.png';
import mufflerBangla from './images/MufflerBanglaVersion.png';
import nameplateEnglish from './images/clubNamePlateEnglishVersion.png';
import nameplateBangla from './images/clubNamePlateBanglaVersion.png';
import cortPin from './images/cort pin.png';

const ALL_PRODUCTS = {
  english: [
    {
      id: 'club-jacket-english',
      name: 'Club Jacket (English Version)',
      price: 1500,
      image: jacketEnglishFront,
      imageBack: jacketEnglishBack,
      description: 'Premium quality club jacket with embroidered logo - English Version',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      version: 'english'
    },
    {
      id: 'club-muffler-english',
      name: 'Club Muffler (English Version)',
      price: 300,
      image: mufflerEnglish,
      description: 'Warm and comfortable club muffler - English Version',
      sizes: ['One Size'],
      version: 'english'
    },
    {
      id: 'club-nameplate-english',
      name: 'Club Nameplate (English Version)',
      price: 200,
      image: nameplateEnglish,
      description: 'Personalized club nameplate - English Version',
      sizes: ['One Size'],
      version: 'english'
    }
  ],
  bangla: [
    {
      id: 'club-jacket-bangla',
      name: 'ক্লাব জ্যাকেট (বাংলা ভার্সন)',
      price: 1500,
      image: jacketBanglaFront,
      imageBack: jacketBanglaBack,
      description: 'প্রিমিয়াম মানের ক্লাব জ্যাকেট এমব্রয়ডারি লোগো সহ - বাংলা ভার্সন',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      version: 'bangla'
    },
    {
      id: 'club-muffler-bangla',
      name: 'ক্লাব মাফলার (বাংলা ভার্সন)',
      price: 300,
      image: mufflerBangla,
      description: 'উষ্ণ এবং আরামদায়ক ক্লাব মাফলার - বাংলা ভার্সন',
      sizes: ['One Size'],
      version: 'bangla'
    },
    {
      id: 'club-nameplate-bangla',
      name: 'ক্লাব নেমপ্লেট (বাংলা ভার্সন)',
      price: 200,
      image: nameplateBangla,
      description: 'ব্যক্তিগতকৃত ক্লাব নেমপ্লেট - বাংলা ভার্সন',
      sizes: ['One Size'],
      version: 'bangla'
    }
  ],
  universal: [
    {
      id: 'club-cort-pic',
      name: 'Club Cort Pic',
      nameBangla: 'ক্লাব কর্ট পিক',
      price: 150,
      image: cortPin,
      description: 'Official club cort pic badge - Universal for all versions',
      descriptionBangla: 'অফিশিয়াল ক্লাব কর্ট পিক ব্যাজ - সকল ভার্সনের জন্য',
      sizes: ['One Size'],
      version: 'universal'
    }
  ]
};

export default function Merchandise() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
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
      } else {
        // Guest user - show all products
        setProducts([...ALL_PRODUCTS.english, ...ALL_PRODUCTS.bangla, ...ALL_PRODUCTS.universal]);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

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
                Shopping Cart
              </h2>
              <button onClick={() => setShowCart(false)} className="close-cart-btn">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <Package size={48} />
                <p>Your cart is empty</p>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, onAddToCart, userVersion }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showBackImage, setShowBackImage] = useState(false);
  
  const displayName = userVersion === 'bangla' && product.nameBangla 
    ? product.nameBangla 
    : product.name;
    
  const displayDescription = userVersion === 'bangla' && product.descriptionBangla 
    ? product.descriptionBangla 
    : product.description;

  return (
    <div className="product-card">
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
      </div>
      <div className="product-info">
        <h3>{displayName}</h3>
        <p className="product-description">{displayDescription}</p>
        <p className="product-price">৳{product.price}</p>
        
        {product.version && (
          <span className={`version-tag ${product.version}`}>
            {product.version === 'bangla' ? 'বাংলা' : product.version === 'english' ? 'English' : 'Universal'}
          </span>
        )}
        
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
        
        <button 
          className="add-to-cart-btn"
          onClick={() => onAddToCart(product, selectedSize)}
        >
          <Plus size={18} />
          {userVersion === 'bangla' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
