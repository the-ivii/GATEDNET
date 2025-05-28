import React, { useEffect, useState } from 'react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const Notifications = () => {
  const { notifications, fetchNotifications, isLoading, error } = useStore();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const renderNotificationsList = (notifs) => (
    <div className="space-y-4">
      {notifs.map(notification => (
        <div key={notification._id || notification.id} className="flex items-start">
          <div className="w-6 h-6 mt-1 mr-3 rounded-full bg-blue-400 flex-shrink-0"></div>
          <div>
            <div className="text-lg">{notification.title}</div>
            {notification.description && (
              <div className="text-sm text-blue-200 mt-1">{notification.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      <Card 
        title="RECENT NOTIFICATIONS"
        footer={<span>SEE ALL NOTIFICATIONS</span>}
        onFooterClick={() => setShowAllModal(true)}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600 bg-red-100 rounded">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">No notifications</div>
        ) : (
          renderNotificationsList(notifications.slice(0, 2))
        )}
      </Card>

      {/* All Notifications Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">All Notifications</h2>
            {renderNotificationsList(notifications)}
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;