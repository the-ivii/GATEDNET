import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import useStore from '../../store/useStore';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUserSettings, updatePassword, isLoading, error, fetchUserDetails } = useStore();
  const [formData, setFormData] = useState({
    societyName: user?.societyName || '',
    flatNumber: user?.apartmentNumber || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    if (isOpen && !user?.email) {
      fetchUserDetails();
    }
  }, [isOpen, user?.email, fetchUserDetails]);
  
  const handleChange = (e) => {
    console.log('Handling change for:', e.target.name, 'with value:', e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      // The store will handle logout and redirect
    } catch (error) {
      setPasswordError(error.response?.data?.message || error.message || 'Failed to update password');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800">
          <button
            onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">Settings</h2>

        <div className="space-y-8">
          {/* User Info Section */}
          <div className="bg-navy-800 p-6 rounded-2xl shadow border border-navy-700">
            <h3 className="text-lg font-bold text-white mb-4">User Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-blue-200">Email</label>
                <p className="mt-1 text-white font-semibold">{user?.email || 'Loading email...'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200">Flat No.</label>
                <p className="mt-1 text-white font-semibold">{user?.flat || user?.flatNumber || 'Loading flat number...'}</p>
              </div>
            </div>
          </div>

          {/* Password Update Section */}
          <div className="bg-navy-800 p-6 rounded-2xl shadow border border-navy-700">
            <h3 className="text-lg font-bold text-white mb-4">Update Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-blue-200">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-navy-700 bg-navy-900 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-blue-200">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-navy-700 bg-navy-900 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-xl border-navy-700 bg-navy-900 text-white placeholder-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {(passwordError || error) && (
                <div className="text-red-400 text-sm">
                  {passwordError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-bold text-lg tracking-wide"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;