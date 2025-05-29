import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';

const Announcements = ({ isModal = false, onFooterClick }) => {
  const { announcements, fetchAnnouncements, isLoading, error } = useStore();
  
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const renderAnnouncementsList = (announcements) => (
    <div className="space-y-4">
      {announcements.map(announcement => (
        <div key={announcement._id || announcement.id} className={isModal ? "py-2" : ""}>
          <h4 className={`text-lg font-medium ${isModal ? 'text-white leading-tight' : ''}`}>{announcement.title}</h4>
          <p className={`mt-1 ${isModal ? 'text-gray-400 leading-tight text-sm' : 'text-blue-200'}`}>{announcement.message || announcement.description}</p>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      {!isModal && (
        <Card 
          title="ANNOUNCEMENTS"
          footer={<span>SEE ALL ANNOUNCEMENTS</span>}
          onFooterClick={onFooterClick}
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
      )}

      {isModal && (
        <div className="w-full">
          {isLoading ? (
            <div className="text-center py-4 text-white">Loading announcements...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-400">Error loading announcements: {error}</div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-4 text-white">No announcements available.</div>
          ) : (
            renderAnnouncementsList(announcements)
          )}
        </div>
      )}
    </>
  );
};

export default Announcements;