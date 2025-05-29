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
        <div key={notification._id || notification.id} className="py-2">
          <div>
            <div className="text-lg font-bold text-white leading-tight">{notification.title}</div>
            {notification.description && (
              <div className="text-sm text-gray-400 mt-1 leading-tight">{notification.description}</div>
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
          <div className="text-center py-4 text-white">Loading notifications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400 bg-navy-800 rounded">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4 text-white">No notifications</div>
        ) : (
          renderNotificationsList(notifications.slice(0, 2))
        )}
      </Card>

      {/* All Notifications Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
            >
              <X size={32} />
            </button>
            <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">All Notifications</h2>
            <div className="space-y-6">
              {renderNotificationsList(notifications)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;