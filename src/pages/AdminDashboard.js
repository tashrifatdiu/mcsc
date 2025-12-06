import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Calendar, Package, FileText, BookOpen, LogOut, Shield } from 'lucide-react';
import './AdminDashboard.css';

const LOCAL_TOKEN_KEY = 'mcsc_admin_token';
const LOCAL_ADMIN_KEY = 'mcsc_admin_info';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminInfo] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token] = useState(localStorage.getItem(LOCAL_TOKEN_KEY) || null);

  function handleLogout() {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    navigate('/admin/login');
  }

  if (!token || !adminInfo) {
    navigate('/admin/login');
    return null;
  }

  const isMainBuilding = adminInfo.building?.toLowerCase() === 'main building';

  const dashboardCards = [
    {
      title: 'Registration Verification',
      description: `Verify student registrations for ${adminInfo.building}`,
      icon: <Shield size={32} />,
      path: '/admin-verify',
      color: 'blue',
      available: true
    },
    {
      title: 'Manage Events',
      description: 'Create and manage club events',
      icon: <Calendar size={32} />,
      path: '/admin/events',
      color: 'purple',
      available: isMainBuilding,
      restricted: !isMainBuilding
    },
    {
      title: 'Core Members',
      description: 'Manage club core members',
      icon: <Users size={32} />,
      path: '/admin/core-members',
      color: 'green',
      available: isMainBuilding,
      restricted: !isMainBuilding
    },
    {
      title: 'Members Management',
      description: 'Manage admin members',
      icon: <Users size={32} />,
      path: '/admin/members',
      color: 'indigo',
      available: isMainBuilding,
      restricted: !isMainBuilding
    },
    {
      title: 'Journals',
      description: 'Manage journal entries',
      icon: <BookOpen size={32} />,
      path: '/admin/journals',
      color: 'pink',
      available: isMainBuilding,
      restricted: !isMainBuilding
    },
    {
      title: 'Courses',
      description: 'Manage courses and content',
      icon: <FileText size={32} />,
      path: '/admin/courses',
      color: 'cyan',
      available: isMainBuilding,
      restricted: !isMainBuilding
    },
    {
      title: 'Jacket Orders',
      description: 'View and manage jacket pre-orders (Password Required)',
      icon: <Package size={32} />,
      path: '/admin/jacket-orders',
      color: 'orange',
      available: isMainBuilding,
      restricted: !isMainBuilding,
      requiresPassword: true
    }
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="admin-info">
            <Building size={40} />
            <div>
              <h1>Admin Dashboard</h1>
              <p>
                <strong>{adminInfo.username}</strong> • {adminInfo.building}
              </p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="info-banner">
          <Shield size={20} />
          <p>
            {isMainBuilding ? (
              <>Welcome, Main Building Admin! You have full access to all admin features.</>
            ) : (
              <>You have access to registration verification for <strong>{adminInfo.building}</strong>. Additional features are available for Main Building admins only.</>
            )}
          </p>
        </div>

        <div className="dashboard-grid">
          {dashboardCards.filter(card => card.available).map((card, index) => (
            <div
              key={index}
              className={`dashboard-card ${card.color}`}
              onClick={() => navigate(card.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-icon">{card.icon}</div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                {card.requiresPassword && (
                  <span className="password-badge">🔒 Password Protected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
