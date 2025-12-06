import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, XCircle, Package, Clock, Truck, X, Eye, EyeOff, LogOut } from 'lucide-react';
import useAuth from '../lib/useAuth';
import { useNavigate } from 'react-router-dom';
import './AdminJacketOrders.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export default function AdminJacketOrders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'grouped'
  const [expandedUsers, setExpandedUsers] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [exportFileName, setExportFileName] = useState('');
  const [privacyMode, setPrivacyMode] = useState(true); // Hide sensitive info by default

  useEffect(() => {
    // Check admin authentication first
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Then check user authentication
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filter]);

  const handleAdminLogout = () => {
    if (window.confirm('Are you sure you want to logout from admin panel?')) {
      sessionStorage.removeItem('adminAuthenticated');
      navigate('/admin/login');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? `${API_BASE}/api/jacket-preorders`
        : `${API_BASE}/api/jacket-preorders?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.preOrders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ type: 'error', text: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getGroupedOrders = () => {
    const grouped = {};
    
    orders.forEach(order => {
      if (!grouped[order.userId]) {
        grouped[order.userId] = {
          userId: order.userId,
          userName: order.userName,
          userEmail: order.userEmail,
          userPhone: order.userPhone,
          studentProfile: order.studentProfile,
          orders: [],
          totalOrders: 0,
          totalAmount: 0,
          totalItems: 0,
          statusCounts: {
            pending: 0,
            confirmed: 0,
            rejected: 0,
            delivered: 0
          }
        };
      }
      
      grouped[order.userId].orders.push(order);
      grouped[order.userId].totalOrders++;
      grouped[order.userId].totalAmount += order.totalAmount || order.amount || 0;
      grouped[order.userId].statusCounts[order.status]++;
      
      // Count items
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          grouped[order.userId].totalItems += item.quantity || 1;
        });
      } else {
        grouped[order.userId].totalItems += 1;
      }
    });
    
    return Object.values(grouped);
  };

  const updateOrderStatus = async (orderId, newStatus, rejectionReason = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/jacket-preorders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, rejectionReason })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Order ${newStatus} successfully!` });
        fetchOrders();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: 'Failed to update order status' });
    }
  };

  const bulkUpdateStatus = async (newStatus) => {
    if (selectedOrders.length === 0) {
      setMessage({ type: 'error', text: 'Please select orders first' });
      return;
    }

    const confirmMsg = `Are you sure you want to ${newStatus} ${selectedOrders.length} order(s)?`;
    if (!window.confirm(confirmMsg)) return;

    let rejectionReason = '';
    if (newStatus === 'rejected') {
      rejectionReason = prompt('Rejection reason:');
      if (!rejectionReason) return;
    }

    try {
      await Promise.all(
        selectedOrders.map(orderId => 
          updateOrderStatus(orderId, newStatus, rejectionReason)
        )
      );
      setSelectedOrders([]);
      setMessage({ type: 'success', text: `${selectedOrders.length} orders updated successfully!` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update some orders' });
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o._id));
    }
  };

  const toggleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const openExportModal = (statusFilter = null) => {
    const ordersToExport = statusFilter 
      ? orders.filter(o => o.status === statusFilter)
      : orders;

    if (ordersToExport.length === 0) {
      setMessage({ type: 'error', text: `No ${statusFilter || 'orders'} to export` });
      return;
    }

    // Set default file name
    const statusLabel = statusFilter ? `-${statusFilter}` : '-all';
    const defaultName = `jacket-orders${statusLabel}-${new Date().toISOString().split('T')[0]}`;
    
    setExportFileName(defaultName);
    setExportStatus(statusFilter);
    setShowExportModal(true);
  };

  const exportToCSV = () => {
    const statusFilter = exportStatus;
    const ordersToExport = statusFilter 
      ? orders.filter(o => o.status === statusFilter)
      : orders;

    // CSV Headers
    const headers = [
      'Order Date',
      'Order ID',
      'Name',
      'Email',
      'Phone',
      'Class',
      'Section',
      'Department',
      'Version',
      'Items Details',
      'Total Quantity',
      'Total Amount',
      'Transaction ID',
      'bKash Number',
      'Status',
      'Delivery Address',
      'Notes',
      'Confirmed Date',
      'Delivered Date'
    ];

    // CSV Rows - each order is one row with items combined
    const rows = ordersToExport.map(order => {
      // Format items details
      let itemsDetails = '';
      let totalQuantity = 0;
      
      if (order.items && order.items.length > 0) {
        itemsDetails = order.items.map(item => 
          `${item.jacketType} (${item.size}) x${item.quantity}`
        ).join('; ');
        totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
      } else {
        // Legacy format
        itemsDetails = `${order.jacketType || 'N/A'} (${order.size || 'N/A'}) x1`;
        totalQuantity = 1;
      }

      return [
        new Date(order.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        order._id,
        order.userName,
        order.userEmail,
        order.userPhone,
        order.studentProfile?.class || '',
        order.studentProfile?.section || '',
        order.studentProfile?.department || '',
        order.studentProfile?.version || '',
        itemsDetails,
        totalQuantity,
        order.totalAmount || order.amount || 0,
        order.transactionId,
        order.bkashNumber,
        order.status.toUpperCase(),
        order.deliveryAddress || '',
        order.notes || '',
        order.confirmedAt ? new Date(order.confirmedAt).toLocaleDateString() : '',
        order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : ''
      ];
    });

    // Escape CSV values properly and prevent Excel auto-conversion
    const escapeCSV = (value, preventConversion = false) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      
      // For fields that should be treated as text (IDs, phone numbers), add = prefix
      // This tells Excel to treat it as a formula that returns text
      if (preventConversion && stringValue.length > 0) {
        // Use ="value" format to force text
        return `="${stringValue.replace(/"/g, '""')}"`;
      }
      
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Create CSV content with BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    
    // Define which columns should prevent auto-conversion (by index)
    const textOnlyColumns = [1, 4, 12, 13]; // Order ID, Phone, Transaction ID, bKash Number
    
    const csvContent = BOM + [
      headers.map(h => escapeCSV(h)).join(','),
      ...rows.map(row => 
        row.map((cell, index) => escapeCSV(cell, textOnlyColumns.includes(index))).join(',')
      )
    ].join('\r\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = exportFileName.endsWith('.csv') ? exportFileName : `${exportFileName}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: `${ordersToExport.length} orders exported successfully!` });
    setShowExportModal(false);
    setExportFileName('');
    setExportStatus(null);
  };

  const maskSensitiveData = (data, type) => {
    if (!privacyMode) return data;
    if (!data) return data;
    
    switch (type) {
      case 'email':
        const [username, domain] = data.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
      case 'phone':
        return data.replace(/\d(?=\d{4})/g, '*');
      case 'address':
        return data.substring(0, 10) + '***';
      case 'transaction':
        return data.substring(0, 4) + '***' + data.substring(data.length - 4);
      default:
        return data;
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
      <div className="admin-orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h1>Jacket Pre-Orders Management</h1>
          <p>Manage and track all jacket pre-orders</p>
        </div>
        <div className="header-actions">
          <div className="action-buttons-row">
            <button 
              className={`privacy-toggle-btn ${privacyMode ? 'active' : ''}`}
              onClick={() => setPrivacyMode(!privacyMode)}
              title={privacyMode ? 'Show sensitive information' : 'Hide sensitive information'}
            >
              {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
              {privacyMode ? 'Privacy On' : 'Privacy Off'}
            </button>
            <button 
              className="admin-logout-btn"
              onClick={handleAdminLogout}
              title="Logout from admin panel"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
          <div className="export-section">
          <div className="export-label">
            <Download size={20} />
            <span>Export Orders:</span>
          </div>
          <div className="export-buttons-group">
            <button className="export-btn all" onClick={() => openExportModal()}>
              All Orders
            </button>
            <button className="export-btn pending" onClick={() => openExportModal('pending')}>
              <Clock size={16} />
              Pending
            </button>
            <button className="export-btn confirmed" onClick={() => openExportModal('confirmed')}>
              <CheckCircle size={16} />
              Confirmed
            </button>
            <button className="export-btn delivered" onClick={() => openExportModal('delivered')}>
              <Truck size={16} />
              Delivered
            </button>
            <button className="export-btn rejected" onClick={() => openExportModal('rejected')}>
              <XCircle size={16} />
              Rejected
            </button>
          </div>
        </div>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="orders-controls">
        <div className="view-mode-toggle">
          <button 
            className={viewMode === 'individual' ? 'active' : ''}
            onClick={() => setViewMode('individual')}
          >
            Individual Orders
          </button>
          <button 
            className={viewMode === 'grouped' ? 'active' : ''}
            onClick={() => setViewMode('grouped')}
          >
            Grouped by User
          </button>
        </div>
        
        <div className="orders-filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({orders.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'confirmed' ? 'active' : ''}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
          </button>
          <button 
            className={filter === 'delivered' ? 'active' : ''}
            onClick={() => setFilter('delivered')}
          >
            Delivered
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>

        {selectedOrders.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedOrders.length} selected</span>
            
            {filter === 'pending' && (
              <>
                <button className="bulk-btn confirm-btn" onClick={() => bulkUpdateStatus('confirmed')}>
                  <CheckCircle size={16} /> Confirm
                </button>
                <button className="bulk-btn reject-btn" onClick={() => bulkUpdateStatus('rejected')}>
                  <XCircle size={16} /> Reject
                </button>
              </>
            )}
            
            {filter === 'confirmed' && (
              <button className="bulk-btn deliver-btn" onClick={() => bulkUpdateStatus('delivered')}>
                <Truck size={16} /> Mark as Delivered
              </button>
            )}
          </div>
        )}
      </div>

      <div className="orders-stats">
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'confirmed').length}</h3>
          <p>Confirmed</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'delivered').length}</h3>
          <p>Delivered</p>
        </div>
        <div className="stat-card">
          <h3>৳{orders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0)}</h3>
          <p>Total Amount</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <Package size={64} />
          <p>No orders found</p>
        </div>
      ) : viewMode === 'grouped' ? (
        <div className="grouped-orders-container">
          {getGroupedOrders().map(userGroup => (
            <div key={userGroup.userId} className="user-order-group">
              <div 
                className="user-group-header"
                onClick={() => toggleUserExpansion(userGroup.userId)}
              >
                <div className="user-info-section">
                  <h3>{userGroup.userName}</h3>
                  <p>{maskSensitiveData(userGroup.userEmail, 'email')} • {maskSensitiveData(userGroup.userPhone, 'phone')}</p>
                  {userGroup.studentProfile && (
                    <span className="student-badge">
                      Class {userGroup.studentProfile.class}-{userGroup.studentProfile.section} • {userGroup.studentProfile.version}
                    </span>
                  )}
                </div>
                <div className="user-stats">
                  <div className="stat-item">
                    <strong>{userGroup.totalOrders}</strong>
                    <span>Orders</span>
                  </div>
                  <div className="stat-item">
                    <strong>{userGroup.totalItems}</strong>
                    <span>Items</span>
                  </div>
                  <div className="stat-item">
                    <strong>৳{userGroup.totalAmount}</strong>
                    <span>Total</span>
                  </div>
                  <div className="status-summary">
                    {userGroup.statusCounts.pending > 0 && (
                      <span className="mini-badge pending">{userGroup.statusCounts.pending} Pending</span>
                    )}
                    {userGroup.statusCounts.confirmed > 0 && (
                      <span className="mini-badge confirmed">{userGroup.statusCounts.confirmed} Confirmed</span>
                    )}
                    {userGroup.statusCounts.delivered > 0 && (
                      <span className="mini-badge delivered">{userGroup.statusCounts.delivered} Delivered</span>
                    )}
                    {userGroup.statusCounts.rejected > 0 && (
                      <span className="mini-badge rejected">{userGroup.statusCounts.rejected} Rejected</span>
                    )}
                  </div>
                </div>
              </div>
              
              {expandedUsers[userGroup.userId] && (
                <div className="user-orders-list">
                  {userGroup.orders.map(order => (
                    <div key={order._id} className="order-item-card">
                      <div className="order-header-row">
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="order-items-section">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="jacket-item">
                              <span className="jacket-type">{item.jacketType} Jacket</span>
                              <span className="size-badge">{item.size}</span>
                              <span className="quantity">×{item.quantity}</span>
                              <span className="item-price">৳{item.pricePerUnit * item.quantity}</span>
                            </div>
                          ))
                        ) : (
                          <div className="jacket-item">
                            <span className="jacket-type">{order.jacketType} Jacket</span>
                            <span className="size-badge">{order.size}</span>
                            <span className="quantity">×1</span>
                            <span className="item-price">৳{order.amount}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="order-details-row">
                        <div className="detail-item">
                          <strong>TxID:</strong> {maskSensitiveData(order.transactionId, 'transaction')}
                        </div>
                        <div className="detail-item">
                          <strong>bKash:</strong> {maskSensitiveData(order.bkashNumber, 'phone')}
                        </div>
                        <div className="detail-item">
                          <strong>Total:</strong> ৳{order.totalAmount || order.amount}
                        </div>
                      </div>
                      
                      {order.deliveryAddress && (
                        <div className="delivery-address">
                          <strong>Address:</strong> {maskSensitiveData(order.deliveryAddress, 'address')}
                        </div>
                      )}
                      
                      {order.notes && (
                        <div className="order-notes">
                          <strong>Notes:</strong> {order.notes}
                        </div>
                      )}
                      
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              className="action-btn confirm-btn"
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            >
                              <CheckCircle size={16} /> Confirm
                            </button>
                            <button 
                              className="action-btn reject-btn"
                              onClick={() => {
                                const reason = prompt('Rejection reason:');
                                if (reason) updateOrderStatus(order._id, 'rejected', reason);
                              }}
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button 
                            className="action-btn deliver-btn"
                            onClick={() => updateOrderStatus(order._id, 'delivered')}
                          >
                            <Truck size={16} /> Mark as Delivered
                          </button>
                        )}
                        {order.status === 'rejected' && order.rejectionReason && (
                          <div className="rejection-reason">
                            <strong>Reason:</strong> {order.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                {filter !== 'all' && (
                  <th>
                    <input 
                      type="checkbox" 
                      checked={selectedOrders.length === orders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th>Date</th>
                <th>Name</th>
                <th>Items</th>
                <th>Amount</th>
                <th>TxID</th>
                <th>bKash</th>
                <th>Phone</th>
                <th>Student</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className={selectedOrders.includes(order._id) ? 'selected' : ''}>
                  {filter !== 'all' && (
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleSelectOrder(order._id)}
                      />
                    </td>
                  )}
                  <td className="date-cell">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="name-cell">
                    <div className="name-info">
                      <strong>{order.userName}</strong>
                      <small>{maskSensitiveData(order.userEmail, 'email')}</small>
                    </div>
                  </td>
                  <td className="items-cell">
                    {order.items && order.items.length > 0 ? (
                      <div className="items-summary">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="item-line">
                            {item.jacketType} ({item.size}) ×{item.quantity}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>{order.jacketType} ({order.size})</div>
                    )}
                  </td>
                  <td className="amount-cell">৳{order.totalAmount || order.amount}</td>
                  <td className="txid-cell">{maskSensitiveData(order.transactionId, 'transaction')}</td>
                  <td>{maskSensitiveData(order.bkashNumber, 'phone')}</td>
                  <td>{maskSensitiveData(order.userPhone, 'phone')}</td>
                  <td className="student-cell">
                    {order.studentProfile ? (
                      <div className="student-info">
                        <span>Class {order.studentProfile.class}-{order.studentProfile.section}</span>
                        <small>{order.studentProfile.version}</small>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {order.status === 'pending' && (
                      <div className="quick-actions">
                        <button 
                          className="quick-btn confirm"
                          onClick={() => updateOrderStatus(order._id, 'confirmed')}
                          title="Confirm"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="quick-btn reject"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) updateOrderStatus(order._id, 'rejected', reason);
                          }}
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                    {order.status === 'confirmed' && (
                      <button 
                        className="quick-btn deliver"
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        title="Mark as Delivered"
                      >
                        <Truck size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="export-modal-header">
              <h2>Export Orders</h2>
              <button className="modal-close-btn" onClick={() => setShowExportModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="export-modal-body">
              <div className="export-info">
                <Download size={48} />
                <p>
                  You are about to export <strong>
                    {exportStatus 
                      ? orders.filter(o => o.status === exportStatus).length 
                      : orders.length}
                  </strong> {exportStatus ? exportStatus : 'total'} order(s)
                </p>
              </div>

              <div className="export-form">
                <label htmlFor="fileName">File Name:</label>
                <div className="file-name-input-group">
                  <input
                    id="fileName"
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    placeholder="Enter file name"
                    autoFocus
                  />
                  <span className="file-extension">.csv</span>
                </div>
                <small className="input-hint">
                  The file will be saved as: <strong>{exportFileName || 'filename'}.csv</strong>
                </small>
              </div>
            </div>

            <div className="export-modal-footer">
              <button 
                className="modal-btn cancel-btn" 
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn export-confirm-btn" 
                onClick={exportToCSV}
                disabled={!exportFileName.trim()}
              >
                <Download size={20} />
                Export Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
