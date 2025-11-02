import React, { useState, useEffect } from 'react';

const AdminVerify = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('https://mcsc-backend.onrender.com/api/register');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setRegistrations(result.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
      alert(`Error fetching: ${error.message}. Check backend.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) return alert('Enter unique code');
    setVerifyLoading(true);
    try {
      const response = await fetch(`https://mcsc-backend.onrender.com/api/register/${verifyCode.trim()}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      if (!result.data) {
        throw new Error('No data in response');
      }
      const reg = result.data;
      console.log('Verify success:', reg);

      // Paid email + QR handled in backend
      alert(`✅ Verified! Paid email with QR sent to ${reg.email}. ID: ${reg.uniqueId}`);
      setVerifyCode('');
      setRegistrations(prev => prev.map(r => r.uniqueCode === verifyCode.trim() ? { ...r, status: 'Paid' } : r));
      setTimeout(fetchRegistrations, 500);
    } catch (error) {
      console.error('Verify error:', error);
      alert(`❌ ${error.message}`);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Booth Verify</h1>
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <input 
          type="text" 
          placeholder="Enter Unique Code (e.g., 744000)" 
          value={verifyCode} 
          onChange={(e) => setVerifyCode(e.target.value)} 
          className="p-2 border rounded w-full max-w-xs mr-2" 
        />
        <button onClick={handleVerify} disabled={verifyLoading} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50">
          {verifyLoading ? 'Verifying...' : 'Mark Paid & Send QR'}
        </button>
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-3 text-left">Name</th>
            <th className="border p-3 text-left">Email</th>
            <th className="border p-3 text-left">Code</th>
            <th className="border p-3 text-left">Status</th>
            <th className="border p-3 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg._id} className={reg.status === 'Paid' ? 'bg-green-50' : 'bg-yellow-50'}>
              <td className="border p-3">{reg.name}</td>
              <td className="border p-3">{reg.email}</td>
              <td className="border p-3 font-bold">{reg.uniqueCode}</td>
              <td className="border p-3">{reg.status}</td>
              <td className="border p-3">{reg.totalCost} TK</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminVerify;