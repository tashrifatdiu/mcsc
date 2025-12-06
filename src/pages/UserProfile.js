import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import useAuth from '../lib/useAuth';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function UserProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfileAndOrders();
    }
  }, [user]);

  const loadProfileAndOrders = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profileRes = await fetch(`${API_BASE}/api/auth/profile?supabaseId=${encodeURIComponent(user.id)}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.profile);
      }

      // Load orders
      const ordersRes = await fetch(`${API_BASE}/api/jacket-preorders/user/${user.id}`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.preOrders || []);
        setOrderSummary(ordersData.summary);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={18} />;
      case 'confirmed': return <CheckCircle size={18} />;
      case 'rejected': return <XCircle size={18} />;
      case 'delivered': return <Truck size={18} />;
      default: return <Package size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'rejected': return 'status-rejected';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-title">
          <h1>{profile?.name || user?.user_metadata?.full_name || 'User Profile'}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} />
          Profile Info
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={18} />
          Order History
          {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
        </button>
      </div>

      {activeTab === 'profile' && profile && (
        <div className="profile-content">
          <div className="info-card">
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <User size={20} />
                <div>
                  <label>Full Name</label>
                  <p>{profile.name}</p>
                </div>
              </div>
              <div className="info-item">
                <Mail size={20} />
                <div>
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone size={20} />
                <div>
                  <label>WhatsApp Number</label>
                  <p>{profile.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h2>Academic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <BookOpen size={20} />
                <div>
                  <label>Class & Section</label>
                  <p>Class {profile.class} - Section {profile.section}</p>
                </div>
              </div>
              <div className="info-item">
                <BookOpen size={20} />
                <div>
                  <label>Department</label>
                  <p>{profile.department.charAt(0).toUpperCase() + profile.department.slice(1)}</p>
                </div>
              </div>
              <div className="info-item">
                <BookOpen size={20} />
                <div>
                  <label>Version</label>
                  <p>{profile.version.charAt(0).toUpperCase() + profile.version.slice(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-content">
          {orderSummary && (
            <div className="order-summary-cards">
              <div className="summary-card">
                <div className="summary-icon">
                  <Package size={24} />
                </div>
                <div className="summary-info">
                  <h3>{orderSummary.totalOrders}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <Package size={24} />
                </div>
                <div className="summary-info">
                  <h3>{orderSummary.totalItems}</h3>
                  <p>Total Items</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon accent">
                  <span>৳</span>
                </div>
                <div className="summary-info">
                  <h3>৳{orderSummary.totalAmount}</h3>
                  <p>Total Amount</p>
                </div>
              </div>
            </div>
          )}

          {orderSummary && orderSummary.statusCounts && (
            <div className="status-overview">
              <h3>Order Status Overview</h3>
              <div className="status-grid">
                <div className="status-item pending">
                  <Clock size={20} />
                  <span>{orderSummary.statusCounts.pending} Pending</span>
                </div>
                <div className="status-item confirmed">
                  <CheckCircle size={20} />
                  <span>{orderSummary.statusCounts.confirmed} Confirmed</span>
                </div>
                <div className="status-item delivered">
                  <Truck size={20} />
                  <span>{orderSummary.statusCounts.delivered} Delivered</span>
                </div>
                <div className="status-item rejected">
                  <XCircle size={20} />
                  <span>{orderSummary.statusCounts.rejected} Rejected</span>
                </div>
              </div>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="no-orders">
              <Package size={64} />
              <h3>No Orders Yet</h3>
              <p>You haven't placed any jacket pre-orders yet.</p>
              <button onClick={() => navigate('/merchandise')}>
                Browse Merchandise
              </button>
            </div>
          ) : (
            <div className="orders-list">
              <h3>Order History</h3>
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-date">
                      <strong>Order Date:</strong>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="item-details">
                            <h4>{item.jacketType.charAt(0).toUpperCase() + item.jacketType.slice(1)} Jacket</h4>
                            <p>Size: {item.size} • Quantity: {item.quantity}</p>
                          </div>
                          <div className="item-price">
                            ৳{item.pricePerUnit * item.quantity}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="order-item">
                        <div className="item-details">
                          <h4>{order.jacketType?.charAt(0).toUpperCase() + order.jacketType?.slice(1)} Jacket</h4>
                          <p>Size: {order.size}</p>
                        </div>
                        <div className="item-price">
                          ৳{order.amount}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-details">
                    <div className="detail-row">
                      <strong>Transaction ID:</strong>
                      <span>{order.transactionId}</span>
                    </div>
                    <div className="detail-row">
                      <strong>bKash Number:</strong>
                      <span>{order.bkashNumber}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Total Amount:</strong>
                      <span className="total-amount">৳{order.totalAmount || order.amount}</span>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="delivery-info">
                      <strong>Delivery Address:</strong>
                      <p>{order.deliveryAddress}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="order-notes-section">
                      <strong>Notes:</strong>
                      <p>{order.notes}</p>
                    </div>
                  )}

                  {order.status === 'rejected' && order.rejectionReason && (
                    <div className="rejection-info">
                      <strong>Rejection Reason:</strong>
                      <p>{order.rejectionReason}</p>
                    </div>
                  )}

                  {order.status === 'delivered' && order.deliveredAt && (
                    <div className="delivered-info">
                      <Truck size={16} />
                      <span>
                        Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
