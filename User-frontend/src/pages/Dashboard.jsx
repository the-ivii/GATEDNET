import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import ActivePolls from '../components/Dashboard/ActivePolls';
import MaintenanceUpdates from '../components/Dashboard/MaintenanceUpdates';
import Notifications from '../components/Dashboard/Notifications';
import BookedAmenities from '../components/Dashboard/BookedAmenities';
import Announcements from '../components/Dashboard/Announcements';
import SettingsModal from '../components/Settings/SettingsModal';
import PollVotingModal from '../components/Poll/PollVotingModal';
import PollModal from '../components/Poll/PollModal';
import AmenityBookingModal from '../components/Amenities/AmenityBookingModal';
import AllPollsModal from '../components/Poll/AllPollsModal';
import AllMaintenanceModal from '../components/Maintenance/AllMaintenanceModal';
import AllNotificationsModal from '../components/Notifications/AllNotificationsModal';
import AllAnnouncementsModal from '../components/Announcements/AllAnnouncementsModal';
import useStore from '../store/useStore';

const Dashboard = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPollsModal, setShowPollsModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
  const [selectedPollForVoting, setSelectedPollForVoting] = useState(null);

  const [isAmenityBookingModalOpen, setIsAmenityBookingModalOpen] = useState(false);
  
  const [isAllPollsModalOpen, setIsAllPollsModalOpen] = useState(false);
  const [isAllMaintenanceModalOpen, setIsAllMaintenanceModalOpen] = useState(false);
  const [isAllNotificationsModalOpen, setIsAllNotificationsModalOpen] = useState(false);
  const [isAllAnnouncementsModalOpen, setIsAllAnnouncementsModalOpen] = useState(false);

  const [showPollResults, setShowPollResults] = useState(false);
  const [resultsPollId, setResultsPollId] = useState(null);

  const {
    fetchActivePolls,
    fetchMaintenanceUpdates,
    fetchNotifications,
    fetchAmenities,
    fetchAnnouncements,
  } = useStore();

  useEffect(() => {
    fetchActivePolls();
    fetchMaintenanceUpdates();
    fetchNotifications();
    fetchAmenities();
    fetchAnnouncements();
  }, [fetchActivePolls, fetchMaintenanceUpdates, fetchNotifications, fetchAmenities, fetchAnnouncements]);

  const handleSidebarItemClick = (item) => {
    switch (item) {
      case 'voting':
        setShowPollsModal(true);
        break;
      case 'maintenance':
        setIsAllMaintenanceModalOpen(true);
        setShowMaintenanceModal(false);
        break;
      case 'amenities':
        setIsAmenityBookingModalOpen(true);
        break;
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'bylaws':
        window.open('https://drive.google.com/file/d/1D3CGW-mc2SGMJM8LnoDz-HSmLxFWnBYw/view?usp=sharing', '_blank');
        break;
      case 'notifications':
        setIsAllNotificationsModalOpen(true);
        setShowNotificationsModal(false);
        break;
      case 'announcements':
        setIsAllAnnouncementsModalOpen(true);
        setShowAnnouncementsModal(false);
        break;
      default:
        setActiveItem(item);
    }
  };

  const handlePollSelectForVoting = (poll) => {
    setSelectedPollForVoting(poll);
    setIsVotingModalOpen(true);
  };

  const handleCloseVotingModal = (voted) => {
    setIsVotingModalOpen(false);
    if (voted && selectedPollForVoting) {
      setResultsPollId(selectedPollForVoting._id);
      setShowPollResults(true);
    }
    setSelectedPollForVoting(null);
  };

  const handleClosePollResults = () => {
    setShowPollResults(false);
    setResultsPollId(null);
  };

  const handleBookNewAmenityClick = () => {
    setIsAmenityBookingModalOpen(true);
    setShowAmenitiesModal(false);
  };

  const handleCloseAmenityBookingModal = () => {
    setIsAmenityBookingModalOpen(false);
    fetchAmenities();
  };

  const handleCloseAllMaintenanceModal = () => {
    setIsAllMaintenanceModalOpen(false);
    fetchMaintenanceUpdates();
  };

  const handleCloseAllNotificationsModal = () => {
    setIsAllNotificationsModalOpen(false);
    fetchNotifications();
  };

  const handleCloseAllAnnouncementsModal = () => {
    setIsAllAnnouncementsModalOpen(false);
    fetchAnnouncements();
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
            <ActivePolls onPollSelect={handlePollSelectForVoting} />

            {/* Bottom Left Row - Split into 2 columns on medium screens and above */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Booked Amenities (Bottom Left - 1) */}
              <BookedAmenities onBookAmenity={handleBookNewAmenityClick} />

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

      {/* Original Modals (triggered by card footers and now sidebar for Polls) */}
      {showPollsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-navy-900 rounded-3xl p-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800 flex flex-col items-center justify-center">
            <button
              onClick={() => setShowPollsModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full flex flex-col items-center justify-center px-8 py-8">
              <h2 className="text-3xl font-extrabold text-blue-400 mb-8 tracking-wide w-full text-left">All Live Polls</h2>
              <div className="w-full">
                <ActivePolls isModal={true} onPollSelect={handlePollSelectForVoting} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Poll Voting Modal */}
      {selectedPollForVoting && (
        <PollVotingModal
          isOpen={isVotingModalOpen}
          onClose={(voted) => handleCloseVotingModal(voted)}
          poll={selectedPollForVoting}
        />
      )}

      {/* Poll Results Modal */}
      {showPollResults && resultsPollId && (
        <PollModal pollId={resultsPollId} onClose={handleClosePollResults} />
      )}

      {/* Amenity Booking Calendar Modal (New) */}
      <AmenityBookingModal
        isOpen={isAmenityBookingModalOpen}
        onClose={handleCloseAmenityBookingModal}
      />

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

      {/* Amenities Modal (for listing all booked amenities, triggered by footer) */}
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
            <BookedAmenities isModal={true} onBookAmenity={handleBookNewAmenityClick} />
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

      {/* New List Modals (triggered by sidebar clicks) */}
      <AllMaintenanceModal
        isOpen={isAllMaintenanceModalOpen}
        onClose={handleCloseAllMaintenanceModal}
      />

      <AllNotificationsModal
        isOpen={isAllNotificationsModalOpen}
        onClose={handleCloseAllNotificationsModal}
      />

      <AllAnnouncementsModal
        isOpen={isAllAnnouncementsModalOpen}
        onClose={handleCloseAllAnnouncementsModal}
      />
    </div>
  );
};

export default Dashboard;