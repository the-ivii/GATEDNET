import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';

const Announcements = () => {
  const { announcements, fetchAnnouncements, isLoading, error } = useStore();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const renderAnnouncementsList = (announcements) => (
    <div className="space-y-4">
      {announcements.map(announcement => (
        <div key={announcement._id || announcement.id}>
          <h4 className="text-lg font-medium">{announcement.title}</h4>
          <p className="text-blue-200 mt-1">{announcement.message || announcement.description}</p>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      <Card 
        title="ANNOUNCEMENTS"
        footer={<span onClick={() => setShowAllModal(true)}>SEE ALL ANNOUNCEMENTS</span>}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading announcements...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600 bg-red-100 rounded">{error}</div>
        ) : announcements.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Bell className="text-blue-300 mr-2" size={24} />
            <span>No New Announcements</span>
          </div>
        ) : (
          renderAnnouncementsList(announcements.slice(0, 2))
        )}
      </Card>

      {/* All Announcements Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">All Announcements</h2>
            {renderAnnouncementsList(announcements)}
          </div>
        </div>
      )}
    </>
  );
};

export default Announcements;