import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './SettingsModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      showProfile: true,
      showContact: false
    },
    theme: 'light'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/settings`);
        setSettings(response.data.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to fetch settings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isOpen]);

  const handleNotificationChange = async (type) => {
    try {
      const updatedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [type]: !settings.notifications[type]
        }
      };

      await axios.put(`${API_BASE_URL}/settings/notifications`, {
        type,
        enabled: !settings.notifications[type]
      });

      setSettings(updatedSettings);
      setSuccess('Notification settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setError('Failed to update notification settings. Please try again.');
    }
  };

  const handlePrivacyChange = async (type) => {
    try {
      const updatedSettings = {
        ...settings,
        privacy: {
          ...settings.privacy,
          [type]: !settings.privacy[type]
        }
      };

      await axios.put(`${API_BASE_URL}/settings/privacy`, {
        type,
        enabled: !settings.privacy[type]
      });

      setSettings(updatedSettings);
      setSuccess('Privacy settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setError('Failed to update privacy settings. Please try again.');
    }
  };

  const handleThemeChange = async (theme) => {
    try {
      await axios.put(`${API_BASE_URL}/settings/theme`, { theme });

      setSettings({
        ...settings,
        theme
      });
      setSuccess('Theme updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating theme:', error);
      setError('Failed to update theme. Please try again.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Settings" 
      width="500px"
    >
      {loading ? (
        <div className="loading-spinner">Loading settings...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="settings-container">
          {success && <div className="success-message">{success}</div>}
          
          <section className="settings-section">
            <h3>Notification Preferences</h3>
            <div className="settings-options">
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                Email Notifications
              </label>
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                Push Notifications
              </label>
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                />
                SMS Notifications
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h3>Privacy Settings</h3>
            <div className="settings-options">
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.privacy.showProfile}
                  onChange={() => handlePrivacyChange('showProfile')}
                />
                Show Profile to Other Residents
              </label>
              <label className="setting-option">
                <input
                  type="checkbox"
                  checked={settings.privacy.showContact}
                  onChange={() => handlePrivacyChange('showContact')}
                />
                Show Contact Information
              </label>
            </div>
          </section>

          <section className="settings-section">
            <h3>Theme</h3>
            <div className="settings-options">
              <label className="setting-option">
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === 'light'}
                  onChange={() => handleThemeChange('light')}
                />
                Light
              </label>
              <label className="setting-option">
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                />
                Dark
              </label>
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
};

export default SettingsModal;