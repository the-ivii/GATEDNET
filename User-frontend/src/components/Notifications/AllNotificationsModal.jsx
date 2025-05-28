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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">All Notifications</h2>

        {isLoading ? (
          <div className="text-center py-4">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error loading notifications: {error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">No notifications available.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} // Assuming notifications have an id
                className="p-3 rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-semibold">{notification.title}</h3> {/* Assuming title field */}
                <p className="text-gray-700">{notification.message}</p> {/* Assuming message field */}
                <p className="text-sm text-gray-500">Date: {new Date(notification.date).toLocaleDateString()}</p> {/* Assuming date field */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotificationsModal; 