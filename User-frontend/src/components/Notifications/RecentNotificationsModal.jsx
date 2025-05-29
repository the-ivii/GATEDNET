import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

const RecentNotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  const fetchRecentNotifications = async () => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
        >
          <X size={32} />
        </button>
        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">Recent Notifications</h2>

        {isLoading ? (
          <div className="text-center py-4 text-white">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400">Error loading notifications: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-white">No recent notifications available.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification._id}
                className="py-2 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{notification.title}</h3>
                  <p className="text-gray-400 mt-1 leading-tight">{notification.message}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-3 py-1 bg-blue-400 text-blue-900 font-medium rounded-xl text-xs mb-1">{notification.type.toUpperCase()}</span>
                  <span className="text-xs text-blue-300">{timeAgo(notification.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentNotificationsModal; 