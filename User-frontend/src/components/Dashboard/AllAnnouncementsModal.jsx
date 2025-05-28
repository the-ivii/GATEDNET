import React from 'react';
import Modal from '../UI/Modal';
import { Bell } from 'lucide-react';
import useStore from '../../store/useStore';

const AllAnnouncementsModal = ({ isOpen, onClose }) => {
  const { announcements, isLoading } = useStore();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ALL ANNOUNCEMENTS" width="lg">
      <div className="space-y-6 bg-navy-900 rounded-3xl p-8">
        {isLoading ? (
          <div className="text-center py-4 text-white">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <Bell className="text-blue-300 mr-2" size={24} />
            <span className="text-white">No New Announcements</span>
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <div 
              key={`${announcement.id || index}-${index}`}
              className="bg-navy-800 p-6 rounded-2xl shadow border border-navy-700"
            >
              <div className="flex items-start">
                <div className="w-4 h-4 mt-2 mr-4 rounded-full bg-blue-400 flex-shrink-0 shadow-lg" />
                <div>
                  <h3 className="text-lg font-bold text-white">{announcement.title}</h3>
                  <p className="mt-2 text-blue-200">{announcement.message}</p>
                  <div className="mt-2 text-xs text-blue-300">{new Date(announcement.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default AllAnnouncementsModal;