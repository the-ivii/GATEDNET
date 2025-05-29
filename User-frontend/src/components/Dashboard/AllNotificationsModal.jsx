import React from 'react';
import Modal from '../UI/Modal';
import useStore from '../../store/useStore';

const AllNotificationsModal = ({ isOpen, onClose }) => {
  const { notifications, isLoading, error } = useStore();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ALL NOTIFICATIONS" width="lg">
      <div className="space-y-6 bg-navy-900 rounded-3xl p-8">
        {isLoading ? (
          <div className="text-center py-4 text-white">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400 bg-navy-800 rounded">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-white">No notifications</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id || notification.id}
              className="bg-navy-800 p-6 rounded-2xl shadow border border-navy-700"
            >
              <div className="flex items-start">
                <div className="w-4 h-4 mt-2 mr-4 rounded-full bg-blue-400 flex-shrink-0 shadow-lg" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {notification.title}
                  </h3>
                  {notification.description && (
                    <p className="mt-1 text-blue-200">
                      {notification.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-blue-300">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default AllNotificationsModal;