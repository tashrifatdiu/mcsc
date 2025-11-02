import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegistrationRequest = () => {
  const [step, setStep] = useState('confirm');
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    form: '',
    version: '',
    group: '',
    mothers_name: '',
    fathers_name: '',
    present_address: '',
    permanent_address: '',
    dob: '',
    citizenship_no: '',
    mobile_no: '',
    hobby: '',
    campus: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'name') {
      newValue = value.toUpperCase(); // Auto-uppercase
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleConfirm = () => {
    /* eslint-disable-next-line no-restricted-globals */
    if (confirm('Do you have 2 passport size photos and 220 TK ready?')) {
      setStep('form');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(formData).every(field => field.trim())) {
      alert('Fill all fields');
      return;
    }
    setLoading(true);
    try {
      console.log('Submitting data:', formData);
      const response = await fetch('https://mcsc-backend.onrender.com/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      console.log('Response:', result);
      if (response.ok) {
        alert('Request submitted! Admin will contact you.');
        setStep('confirm');
        setFormData({
          name: '',
          class: '',
          form: '',
          version: '',
          group: '',
          mothers_name: '',
          fathers_name: '',
          present_address: '',
          permanent_address: '',
          dob: '',
          citizenship_no: '',
          mobile_no: '',
          hobby: '',
          campus: '',
          email: ''
        });
      } else {
        alert(`Error: ${result.message || 'Try again'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registration Request</h1>
          <p className="mb-8 text-center text-gray-600">For club membership, ensure you have 2 passport size photos and 220 TK ready.</p>
          <button onClick={handleConfirm} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
            Yes, I Have Everything Ready
          </button>
          <p className="text-center mt-6 text-sm text-gray-500">Not ready? <Link to="/club" className="text-blue-600 hover:text-blue-800 font-medium">Back to Club</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Membership Form</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Name will be auto-converted to UPPERCASE.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center text-sm font-medium text-gray-500 mb-6">SL No: 701</div>
          <input type="text" name="name" placeholder="Name (UPPERCASE Block Letters)" value={formData.name} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <div className="grid grid-cols-2 gap-4">
            <select name="class" value={formData.class} onChange={handleChange} required className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Class</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
              <option value="XI">XI</option>
              <option value="XII">XII</option>
            </select>
            <select name="form" value={formData.form} onChange={handleChange} required className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Form</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <select name="version" value={formData.version} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Version</option>
            <option value="Bangla">Bangla</option>
            <option value="English">English</option>
          </select>
          <select name="group" value={formData.group} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Group</option>
            <option value="Sc">Sc.</option>
            <option value="B.St">B.St</option>
            <option value="Hum">Hum.</option>
          </select>
          <input type="text" name="mothers_name" placeholder="Mother's Name" value={formData.mothers_name} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="fathers_name" placeholder="Father's Name" value={formData.fathers_name} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="present_address" placeholder="Present Address" value={formData.present_address} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="permanent_address" placeholder="Permanent Address" value={formData.permanent_address} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="dob" placeholder="Date of Birth (DD/MM/YYYY)" value={formData.dob} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="citizenship_no" placeholder="Citizenship No" value={formData.citizenship_no} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="tel" name="mobile_no" placeholder="Telephone/Mobile No" value={formData.mobile_no} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <input type="text" name="hobby" placeholder="Hobby" value={formData.hobby} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <select name="campus" value={formData.campus} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Campus</option>
            <option value="main">Main</option>
            <option value="b22">B22</option>
            <option value="b27">B27</option>
            <option value="b7">B7</option>
          </select>
          <input type="email" name="email" placeholder="Email (for PDF delivery)" value={formData.email} onChange={handleChange} required className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          <div className="text-center text-sm text-gray-500 mb-6">Membership valid for the year-20__ Code No: ___</div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
        <Link to="/club" className="block text-center mt-6 text-blue-600 hover:text-blue-800 font-medium">Back to Club</Link>
      </div>
    </div>
  );
};

export default RegistrationRequest;