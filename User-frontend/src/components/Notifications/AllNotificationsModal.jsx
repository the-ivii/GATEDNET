import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';

const AllNotificationsModal = ({ isOpen, onClose }) => {
  const { notifications, fetchNotifications, isLoading, error } = useStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(); // Ensure all notifications are fetched when modal opens
    }
  }, [isOpen, fetchNotifications]);

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
        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">All Notifications</h2>

        {isLoading ? (
          <div className="text-center py-4 text-white">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400">Error loading notifications: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-white">No notifications available.</div>
        ) : (
          <div className="space-y-6">
            {notifications.map(notification => (
              <div 
                key={notification.id}
                className="bg-navy-800 rounded-2xl p-6 flex flex-col gap-2 shadow border border-navy-700"
              >
                <h3 className="text-lg font-bold text-white mb-1">{notification.title}</h3>
                <p className="text-navy-200 mb-1">{notification.message}</p>
                <p className="text-xs text-blue-300 mb-2">Date: {new Date(notification.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotificationsModal; 