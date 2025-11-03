import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Club from './pages/Club';
import Olympiad from './pages/Olympiad';
import Quiz from './pages/Quiz';
import RegistrationRequest from './pages/RegistrationRequest';
import AdminVerify from './components/AdminVerify';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './index.css';
import logo from './mcsclogo.png';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-8">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-primary">
        <nav className="news-nav">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center flex-1">
                <Link to="/" className="flex items-center space-x-2 text-white font-bold text-lg sm:text-xl tracking-tight">
                  <img 
                    src={logo}
                    alt="Milestone College Logo" 
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover" 
                  />
                  MCSC
                </Link>
              </div>
              <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
                <Link to="/" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Home
                </Link>
                <Link to="/club" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Club
                </Link>
                <Link to="/olympiad" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Olympiad
                </Link>
                <Link to="/registration-request" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Registration Request
                </Link>
                <Link to="/admin-verify" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                  Admin Verify
                </Link>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-200">Welcome, {user.email}!</span>
                    <button onClick={handleLogout} className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link to="/login" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300">
                      Login
                    </Link>
                    <Link to="/signup" className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-300">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
              <div className="sm:hidden flex items-center">
                <button onClick={toggleMenu} className="text-white p-2 text-2xl">
                  ☰
                </button>
              </div>
            </div>
            {isMenuOpen && (
              <div className="sm:hidden bg-gray-charcoal text-white absolute top-14 left-0 w-full shadow-lg z-50">
                <div className="p-4 space-y-2">
                  <Link to="/" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={() => setIsMenuOpen(false)}>
                    Home
                  </Link>
                  <Link to="/club" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={() => setIsMenuOpen(false)}>
                    Club
                  </Link>
                  <Link to="/olympiad" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={() => setIsMenuOpen(false)}>
                    Olympiad
                  </Link>
                  <Link to="/registration-request" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={() => setIsMenuOpen(false)}>
                    Registration Request
                  </Link>
                  <Link to="/admin-verify" className="block px-4 py-2 hover:bg-gray-700 rounded" onClick={() => setIsMenuOpen(false)}>
                    Admin Verify
                  </Link>
                  {user ? (
                    <div className="p-2">
                      <span className="text-sm block mb-2">Welcome, {user.email}!</span>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-700 rounded">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="p-2">
                      <Link to="/login" className="block px-4 py-2 hover:bg-gray-700 rounded mb-2">
                        Login
                      </Link>
                      <Link to="/signup" className="block px-4 py-2 hover:bg-gray-700 rounded">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/club/*" element={<Club />} />
          <Route path="/olympiad" element={<Olympiad />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/registration-request" element={
            <ProtectedRoute>
              <RegistrationRequest />
            </ProtectedRoute>
          } />
          <Route path="/admin-verify" element={<AdminVerify />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;