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
                className="py-2"
              >
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{announcement.title}</h3>
                  <p className="text-gray-400 mt-1 leading-tight">{announcement.message}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">Date: {new Date(announcement.date).toLocaleDateString()}</p>
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