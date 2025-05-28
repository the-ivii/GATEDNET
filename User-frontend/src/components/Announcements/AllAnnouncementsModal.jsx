import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';

const AllAnnouncementsModal = ({ isOpen, onClose }) => {
  const { announcements, fetchAnnouncements, isLoading, error } = useStore();

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements(); // Ensure all announcements are fetched when modal opens
    }
  }, [isOpen, fetchAnnouncements]);

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
        <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide w-full">All Announcements</h2>

        {isLoading ? (
          <div className="text-center py-4 text-white">Loading announcements...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-400">Error loading announcements: {error}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-4 text-white">No announcements available.</div>
        ) : (
          <div className="space-y-6">
            {announcements.map(announcement => (
              <div 
                key={announcement.id}
                className="bg-navy-800 rounded-2xl p-6 flex flex-col gap-2 shadow border border-navy-700"
              >
                <div className="flex items-start">
                  <div className="w-4 h-4 mt-2 mr-4 rounded-full bg-blue-400 flex-shrink-0 shadow-lg" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{announcement.title}</h3>
                    <p className="text-blue-200 mb-1">{announcement.message}</p>
                    <p className="text-xs text-blue-300 mb-2">Date: {new Date(announcement.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAnnouncementsModal; 