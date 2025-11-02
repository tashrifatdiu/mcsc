import React, { useState, useEffect, useCallback } from 'react';

const AdminDashboard = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('adminLoggedIn') === 'true');
  const [campus, setCampus] = useState(() => localStorage.getItem('adminCampus') || '');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvalLoading, setApprovalLoading] = useState({}); // Per-request loading

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/request?campus=${campus}`);
      const result = await response.json();
      setRequests(result.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Error fetching requests. Check backend.');
    }
  }, [campus]);

  useEffect(() => {
    if (loggedIn && campus) {
      fetchRequests();
    }
  }, [loggedIn, campus, fetchRequests]);

  // Persist login
  useEffect(() => {
    localStorage.setItem('adminLoggedIn', loggedIn.toString());
  }, [loggedIn]);

  useEffect(() => {
    localStorage.setItem('adminCampus', campus);
  }, [campus]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/request/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const result = await response.json();
      if (response.ok) {
        setCampus(result.campus);
        setLoggedIn(true);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Login error. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    /* eslint-disable-next-line no-restricted-globals */
    if (!confirm('Collect photos/money, then approve?')) return;
    setApprovalLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`http://localhost:5000/api/request/${id}/approve`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert('Approved! PDF emailed.');
        fetchRequests(); // Refresh
      } else {
        const result = await response.json();
        alert(`Approval error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('Approve error:', error);
      alert('Server error. Check backend logs.');
    } finally {
      setApprovalLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminCampus');
    setLoggedIn(false);
    setCampus('');
    setRequests([]);
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" name="username" placeholder="Username (campus: main, b22, b27, b7)" value={loginData.username} onChange={handleLoginChange} required className="w-full p-3 border rounded-lg" />
          <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required className="w-full p-3 border rounded-lg" />
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard - {campus.toUpperCase()}</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-bold">Pending Requests</h3>
          <p className="text-sm">{requests.filter(r => r.status === 'Pending').length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-bold">Approved</h3>
          <p className="text-sm">{requests.filter(r => r.status === 'Approved').length}</p>
        </div>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3">Name</th>
            <th className="border p-3">Email</th>
            <th className="border p-3">Campus</th>
            <th className="border p-3">Status</th>
            <th className="border p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td className="border p-3">{request.english_name}</td>
              <td className="border p-3">{request.email}</td>
              <td className="border p-3">{request.campus}</td>
              <td className="border p-3">{request.status}</td>
              <td className="border p-3">
                {request.status === 'Pending' && (
                  <button onClick={() => handleApprove(request._id)} disabled={approvalLoading[request._id]} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50">
                    {approvalLoading[request._id] ? 'Approving...' : 'Approve & Email PDF'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;