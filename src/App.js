import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Club from './pages/Club';
import Olympiad from './pages/Olympiad';
import Quiz from './pages/Quiz';
import RegistrationRequest from './pages/RegistrationRequest';
import AdminVerify from './components/AdminVerify';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
                    src="https://www.tbsnews.net/sites/default/files/styles/author/public/organization/logo/milestone_college.jpg" 
                    alt="Milestone College Logo" 
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover" 
                  />
                  Milestone Science Club
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
              </div>
              <div className="sm:hidden flex items-center">
                <button onClick={toggleMenu} className="text-white p-2 text-2xl">
                  ☰
                </button>
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
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
              </div>
            </div>
          )}
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/club/*" element={<Club />} />
          <Route path="/olympiad" element={<Olympiad />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/registration-request" element={<RegistrationRequest />} />
          <Route path="/admin-verify" element={<AdminVerify />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;