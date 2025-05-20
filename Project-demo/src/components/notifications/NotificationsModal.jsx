import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './NotificationsModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications`);
        setNotifications(response.data.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to fetch notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  const markAsRead = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/${id}/read`);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. Please try again.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/read-all`);
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read. Please try again.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Notifications" 
      width="500px"
    >
      {loading ? (
        <div className="loading-spinner">Loading notifications...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">You have no notifications</div>
          ) : (
            <>
              <div className="notifications-header">
                <span>{notifications.filter(n => !n.read).length} unread notifications</span>
                {notifications.some(n => !n.read) && (
                  <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              {notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <div className="notification-content">
                    <h3 className="notification-title">{notification.title}</h3>
                    <p className="notification-description">{notification.message}</p>
                    <span className="notification-date">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default NotificationsModal;