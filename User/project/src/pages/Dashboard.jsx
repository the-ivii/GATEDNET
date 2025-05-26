import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import ActivePolls from '../components/Dashboard/ActivePolls';
import MaintenanceUpdates from '../components/Dashboard/MaintenanceUpdates';
import Notifications from '../components/Dashboard/Notifications';
import BookedAmenities from '../components/Dashboard/BookedAmenities';
import Announcements from '../components/Dashboard/Announcements';
import PollModal from '../components/Poll/PollModal';
import AmenityModal from '../components/Amenity/AmenityModal';
import SettingsModal from '../components/Settings/SettingsModal';
import AllPollsModal from '../components/Poll/AllPollsModal';
import AllMaintenanceModal from '../components/Maintenance/AllMaintenanceModal';
import AllNotificationsModal from '../components/Dashboard/AllNotificationsModal';
import AllAnnouncementsModal from '../components/Dashboard/AllAnnouncementsModal';

const Dashboard = () => {
  const [activePollId, setActivePollId] = useState(null);
  const [showAmenityModal, setShowAmenityModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAllPollsModal, setShowAllPollsModal] = useState(false);
  const [showAllMaintenanceModal, setShowAllMaintenanceModal] = useState(false);
  const [showAllNotificationsModal, setShowAllNotificationsModal] = useState(false);
  const [showAllAnnouncementsModal, setShowAllAnnouncementsModal] = useState(false);
  
  const handleViewPoll = (pollId) => {
    setActivePollId(pollId);
  };
  
  const handleClosePollModal = () => {
    setActivePollId(null);
  };
  
  const handleBookAmenity = () => {
    setShowAmenityModal(true);
  };
  
  const handleSidebarItemClick = (item) => {
    switch (item) {
      case 'settings':
        setShowSettingsModal(true);
        break;
      case 'voting':
        setShowAllPollsModal(true);
        break;
      case 'maintenance':
        setShowAllMaintenanceModal(true);
        break;
      case 'amenity':
        setShowAmenityModal(true);
        break;
      default:
        break;
    }
  };
  
  return (
    <Layout onSidebarItemClick={handleSidebarItemClick}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <ActivePolls 
              onViewPoll={handleViewPoll}
              onSeeAll={() => setShowAllPollsModal(true)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BookedAmenities onBookAmenity={handleBookAmenity} />
            <Announcements onSeeAll={() => setShowAllAnnouncementsModal(true)} />
          </div>
        </div>
        <div className="space-y-6">
          <MaintenanceUpdates onSeeAll={() => setShowAllMaintenanceModal(true)} />
          <Notifications onSeeAll={() => setShowAllNotificationsModal(true)} />
        </div>
      </div>
      
      {/* Modals */}
      <PollModal pollId={activePollId} onClose={handleClosePollModal} />
      <AmenityModal isOpen={showAmenityModal} onClose={() => setShowAmenityModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      <AllPollsModal 
        isOpen={showAllPollsModal} 
        onClose={() => setShowAllPollsModal(false)}
        onViewPoll={handleViewPoll}
      />
      <AllMaintenanceModal 
        isOpen={showAllMaintenanceModal} 
        onClose={() => setShowAllMaintenanceModal(false)} 
      />
      <AllNotificationsModal 
        isOpen={showAllNotificationsModal}
        onClose={() => setShowAllNotificationsModal(false)}
      />
      <AllAnnouncementsModal 
        isOpen={showAllAnnouncementsModal}
        onClose={() => setShowAllAnnouncementsModal(false)}
      />
    </Layout>
  );
};

export default Dashboard;