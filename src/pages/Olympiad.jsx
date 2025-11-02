import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Olympiad = () => {
  const [step, setStep] = useState('login'); // 'login', 'otp', 'reg', 'profile'
  const [loginData, setLoginData] = useState({ email: '' });
  const [otpData, setOtpData] = useState({ otp: '' });
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    school: '',
    class: '',
    group: '',
    version: '',
    section: '',
    district: '',
    division: '',
    upazila: ''
  });
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  // Check session on load
  useEffect(() => {
    const sessionEmail = localStorage.getItem('olympiadSession');
    if (sessionEmail) {
      setRegData(prev => ({ ...prev, email: sessionEmail }));
      fetchProfile(sessionEmail);
    }
  }, []);

  const fetchProfile = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/olympiad/profile?email=${email}`);
      const result = await response.json();
      if (response.ok && result.data) {
        setProfile(result.data);
        if (result.data.isRegistered) {
          setStep('profile');
        } else {
          setStep('reg');
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('Error loading profile.');
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email) return alert('Enter email');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/olympiad/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('olympiadTempEmail', loginData.email);
        setStep('otp');
        alert('OTP sent to email! Check inbox.');
      } else {
        alert(`Login error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpData.otp) return alert('Enter OTP');
    setLoading(true);
    try {
      const tempEmail = localStorage.getItem('olympiadTempEmail');
      const response = await fetch('http://localhost:5000/api/olympiad/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail, otp: otpData.otp })
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('olympiadSession', tempEmail);
        setRegData(prev => ({ ...prev, email: tempEmail }));
        setStep('reg');
        alert('OTP verified! Fill reg form.');
      } else {
        alert(`OTP error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    const required = ['name', 'contactNumber', 'school', 'class', 'group', 'version', 'section', 'district', 'division', 'upazila'];
    const missing = required.filter(field => !regData[field].trim());
    if (missing.length) {
      alert(`Missing: ${missing.join(', ')}`);
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting reg data:', regData);
      const response = await fetch('http://localhost:5000/api/olympiad/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const result = await response.json();
      console.log('Reg response:', result);
      if (response.ok) {
        setRegistered(true);
        localStorage.setItem('olympiadSession', regData.email);
        alert('Registered! Quiz on Nov 17.');
        navigate('/quiz');
      } else {
        alert(`Reg error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('Reg submit error:', error);
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/olympiad/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regData.email, ...regData })
      });
      const result = await response.json();
      if (response.ok) {
        setProfile({ ...profile, profile: regData });
        setEditMode(false);
        alert('Profile updated!');
      } else {
        alert(`Edit error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('olympiadSession');
    localStorage.removeItem('olympiadTempEmail');
    setStep('login');
    setRegData({
      name: '',
      email: '',
      contactNumber: '',
      school: '',
      class: '',
      group: '',
      version: '',
      section: '',
      district: '',
      division: '',
      upazila: ''
    });
    setProfile(null);
    setEditMode(false);
    alert('Logged out.');
  };

  if (registered) {
    return (
      <div className="max-w-md mx-auto p-6 bg-green-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Registered!</h2>
        <p className="mb-4">Quiz live on November 17, 2025.</p>
        <Link to="/quiz" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Start Quiz</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Online Olympiad Registration (Free)</h1>
      <p className="mb-6 text-center text-sm text-gray-600">Nationwide with Prothom Alo Kishor Alo & MCSC. Live: Nov 17, 2025. Login to reg.</p>
      {step === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" name="email" placeholder="Email *" value={loginData.email} onChange={handleLoginChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {loading ? 'Logging In...' : 'Login to Register'}
          </button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleOtpVerify} className="space-y-4">
          <p className="text-sm text-gray-600">OTP sent to {loginData.email}</p>
          <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otpData.otp} onChange={handleOtpChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}
      {step === 'reg' && (
        <div>
          <button onClick={handleLogout} className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
          <form onSubmit={handleRegSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Full Name *" value={regData.name} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="school" placeholder="School Name *" value={regData.school} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select name="class" value={regData.class} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Class</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <select name="group" value={regData.group} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Group</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts</option>
            </select>
            <select name="version" value={regData.version} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Version</option>
              <option value="EV">EV</option>
              <option value="BV">BV</option>
            </select>
            <input type="text" name="section" placeholder="Section *" value={regData.section} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="tel" name="contactNumber" placeholder="Contact *" value={regData.contactNumber} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="text" name="district" placeholder="District *" value={regData.district} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select name="division" value={regData.division} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Division</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Barisal">Barisal</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rangpur">Rangpur</option>
            </select>
            <input type="text" name="upazila" placeholder="Upazila *" value={regData.upazila} onChange={handleRegChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold">
              {loading ? 'Registering...' : 'Register for Olympiad'}
            </button>
          </form>
        </div>
      )}
      {step === 'profile' && (
        <div>
          <button onClick={handleLogout} className="mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Profile</h2>
            <p><strong>Name:</strong> {profile.profile.name}</p>
            <p><strong>School:</strong> {profile.profile.school}</p>
            <p><strong>Class:</strong> {profile.profile.class}</p>
            <p><strong>Group:</strong> {profile.profile.group}</p>
            <p><strong>District:</strong> {profile.profile.district}</p>
            <p><strong>Quiz Score:</strong> {profile.profile.quizScore || 0}</p>
            <button onClick={() => setEditMode(!editMode)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editMode ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {editMode && (
              <form onSubmit={handleEditProfile} className="space-y-4">
                <input type="text" name="name" placeholder="Name" value={regData.name || profile.profile.name} onChange={handleRegChange} className="w-full p-3 border rounded-lg" />
                <input type="text" name="school" placeholder="School" value={regData.school || profile.profile.school} onChange={handleRegChange} className="w-full p-3 border rounded-lg" />
                <input type="text" name="class" placeholder="Class" value={regData.class || profile.profile.class} onChange={handleRegChange} className="w-full p-3 border rounded-lg" />
                <input type="text" name="group" placeholder="Group" value={regData.group || profile.profile.group} onChange={handleRegChange} className="w-full p-3 border rounded-lg" />
                <input type="text" name="district" placeholder="District" value={regData.district || profile.profile.district} onChange={handleRegChange} className="w-full p-3 border rounded-lg" />
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:opacity-50">
                  {loading ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>
          <Link to="/quiz" className="block text-center mt-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">Take Quiz</Link>
        </div>
      )}
      <Link to="/quiz" className="block text-center mt-4 text-blue-600 hover:underline">Go to Quiz (Live Nov 17)</Link>
    </div>
  );
};

export default Olympiad;