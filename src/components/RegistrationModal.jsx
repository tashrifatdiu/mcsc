import React, { useState, useEffect } from 'react';

const RegistrationModal = ({ isOpen, onClose, onSuccess, eventData }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    parentsContact: '',
    whatsapp: '',
    email: '',
    class: '',
    group: '',
    version: '',
    section: '',
    idNo: '',
    formTeacher: '',
    paymentMethod: 'offline'
  });
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');

  useEffect(() => {
    if (eventData && eventData.selectedSubs) {
      const selectedSubs = eventData.selectedSubs;
      const subEvents = eventData.subEvents || [];
      const selectedItems = subEvents.filter(sub => selectedSubs.includes(sub.id));
      setTotalCost(selectedItems.reduce((sum, sub) => sum + sub.cost, 0));
    }
  }, [eventData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSubs = eventData.selectedSubs || [];
    const subEvents = eventData.subEvents || [];
    const selectedNames = subEvents
      .filter(sub => selectedSubs.includes(sub.id))
      .map(sub => sub.name)
      .join(', ');

    const submission = {
      ...formData,
      eventTitle: eventData.title,
      selectedActivities: selectedNames,
      totalCost,
      paymentMethod: 'offline'
    };

    setLoading(true);
    try {
      const response = await fetch('https://mcsc-backend.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      });

      if (response.ok) {
        const result = await response.json();
        const { uniqueCode: code } = result.data;
        setUniqueCode(code);
        alert(`✅ Registered (Due)! Code: ${code}\nDue email sent from server.`);
        onSuccess();
      } else {
        alert('Error.');
      }
    } catch (error) {
      alert('Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    onClose();
    setFormData({
      name: '',
      contactNumber: '',
      parentsContact: '',
      whatsapp: '',
      email: '',
      class: '',
      group: '',
      version: '',
      section: '',
      idNo: '',
      formTeacher: '',
      paymentMethod: 'offline'
    });
    setUniqueCode('');
  };

  if (!isOpen || !eventData) return null;

  const selectedSubs = eventData.selectedSubs || [];
  const subEvents = eventData.subEvents || [];
  const selectedNames = subEvents
    .filter(sub => selectedSubs.includes(sub.id))
    .map(sub => sub.name)
    .join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="news-headline mb-3 sm:mb-4 text-lg sm:text-xl">Event Registration (Due)</h2>
        <p className="text-gray-600 mb-1 sm:mb-2 text-sm">Date: {eventData.date}</p>
        <p className="text-gray-600 mb-2 sm:mb-4 text-sm">Activities: {selectedNames}</p>
        <p className="text-xl sm:text-2xl font-bold text-green-600 mb-4 sm:mb-6">Total: {totalCost} TK (Pay at Booth)</p>
        {uniqueCode && <p className="bg-yellow-100 p-2 rounded text-center font-bold text-sm">Code: {uniqueCode}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <input type="text" name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
            <input type="tel" name="contactNumber" placeholder="Contact *" value={formData.contactNumber} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <input type="tel" name="parentsContact" placeholder="Parents Contact *" value={formData.parentsContact} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
            <input type="tel" name="whatsapp" placeholder="WhatsApp" value={formData.whatsapp} onChange={handleChange} className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
          </div>
          <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <select name="class" value={formData.class} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600">
              <option value="">Class</option>
              <option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option>
            </select>
            <select name="group" value={formData.group} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600">
              <option value="">Group</option>
              <option value="science">Science</option><option value="commerce">Commerce</option><option value="arts">Arts</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <select name="version" value={formData.version} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600">
              <option value="">Version</option>
              <option value="EV">EV</option><option value="BV">BV</option>
            </select>
            <input type="text" name="section" placeholder="Section *" value={formData.section} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <input type="text" name="idNo" placeholder="ID No *" value={formData.idNo} onChange={handleChange} required className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
            <input type="text" name="formTeacher" placeholder="Form Teacher" value={formData.formTeacher} onChange={handleChange} className="w-full p-2 sm:p-3 border border-gray-border rounded-lg focus:ring-2 focus:ring-blue-600" />
          </div>
          <div className="border-t pt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment: Offline (Due)</label>
            <p className="text-sm text-gray-500">Pay at booth, get QR.</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button type="submit" disabled={loading} className="news-button flex-1 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Register (Due)'}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading} className="bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;