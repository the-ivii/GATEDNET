import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ActivePolls from '../components/Dashboard/ActivePolls';
import MaintenanceUpdates from '../components/Dashboard/MaintenanceUpdates';
import Notifications from '../components/Dashboard/Notifications';
import BookedAmenities from '../components/Dashboard/BookedAmenities';
import Announcements from '../components/Dashboard/Announcements';
import SettingsModal from '../components/Settings/SettingsModal';
import useStore from '../store/useStore';

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPollsModal, setShowPollsModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  const {
    fetchActivePolls,
    fetchMaintenanceUpdates,
    fetchNotifications,
    fetchAmenityBookings,
    fetchAnnouncements,
  } = useStore();

  useEffect(() => {
    fetchActivePolls();
    fetchMaintenanceUpdates();
    fetchNotifications();
    fetchAmenityBookings();
    fetchAnnouncements();
  }, [fetchActivePolls, fetchMaintenanceUpdates, fetchNotifications, fetchAmenityBookings, fetchAnnouncements]);

  const handleSidebarItemClick = (item) => {
    switch (item) {
      case 'voting':
        setShowPollsModal(true);
        break;
      case 'maintenance':
        setShowMaintenanceModal(true);
        break;
      case 'amenities':
        setShowAmenitiesModal(true);
        break;
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'bylaws':
        // Handle bylaws navigation
        break;
      default:
        setActiveItem(item);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeItem={activeItem} onItemClick={handleSidebarItemClick} />

      <main className="flex-1 overflow-y-auto p-8">
        {/* Main Content Grid - Matching Original Image Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

          {/* Left Column - 2/3 width on medium+ screens */}
          <div className="md:col-span-2 space-y-6 flex flex-col">
            {/* Active Polls (Top Left) */}
            <ActivePolls />

            {/* Bottom Left Row - Split into 2 columns on medium screens and above */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Booked Amenities (Bottom Left - 1) */}
              <BookedAmenities />

              {/* Announcements (Bottom Left - 2) */}
              <Announcements />
            </div>
          </div>

          {/* Right Column - 1/3 width on medium+ screens */}
          <div className="space-y-6 flex flex-col">
            {/* Maintenance Updates (Top Right) */}
            <MaintenanceUpdates />

            {/* Notifications (Bottom Right) */}
            <Notifications />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Polls Modal */}
      {showPollsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                All Live Polls
              </h2>
              <button
                onClick={() => setShowPollsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ActivePolls isModal={true} />
          </div>
        </div>
      )}

      {/* Maintenance Updates Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                All Maintenance Updates
              </h2>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MaintenanceUpdates isModal={true} />
          </div>
        </div>
      )}

      {/* Amenities Modal */}
      {showAmenitiesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                All Booked Amenities
              </h2>
              <button
                onClick={() => setShowAmenitiesModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <BookedAmenities isModal={true} />
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                All Notifications
              </h2>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Notifications isModal={true} />
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                All Announcements
              </h2>
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Announcements isModal={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;