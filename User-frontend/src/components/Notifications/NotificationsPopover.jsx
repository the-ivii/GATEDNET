import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';
import RecentNotificationsModal from './RecentNotificationsModal';

const NotificationsPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRecentModal, setShowRecentModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://gatednett.onrender.com/api/notifications/recent');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-navy-900 rounded-2xl shadow-lg border border-navy-800 z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <button
                onClick={() => setShowRecentModal(true)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                See All
              </button>
            </div>
            {isLoading ? (
              <div className="text-center py-4 text-white">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-400">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-4 text-white">No notifications</div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 5).map(notification => (
                  <div key={notification._id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="text-xs text-gray-400">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <RecentNotificationsModal
        isOpen={showRecentModal}
        onClose={() => setShowRecentModal(false)}
      />
    </div>
  );
};

export default NotificationsPopover; 