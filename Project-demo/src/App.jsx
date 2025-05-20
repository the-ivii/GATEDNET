import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SettingsModal from './components/settings/SettingsModal';
import PollsModal from './components/polls/PollsModal';
import AnnouncementsModal from './components/announcements/AnnouncementsModal';
import UpdatesModal from './components/updates/UpdatesModal';
import NotificationsModal from './components/notifications/NotificationsModal';
import BookingsModal from './components/bookings/BookingsModal';
import useModals from './hooks/useModals';
import './App.css';

const API_BASE_URL = 'http://localhost:3000/api';

const App = () => {
  const { modals, openModal, closeModal } = useModals();
  const [activeVotes, setActiveVotes] = useState([]);
  const [maintenanceUpdates, setMaintenanceUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all data in parallel
        const [votesRes, maintenanceRes, notificationsRes, bookingsRes, announcementsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/polls/active`),
          axios.get(`${API_BASE_URL}/issues`),
          axios.get(`${API_BASE_URL}/notifications`),
          axios.get(`${API_BASE_URL}/amenities/bookings`),
          axios.get(`${API_BASE_URL}/announcements`)
        ]);

        setActiveVotes(votesRes.data.data);
        setMaintenanceUpdates(maintenanceRes.data.data);
        setNotifications(notificationsRes.data.data);
        setBookings(bookingsRes.data.data);
        setAnnouncements(announcementsRes.data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <img src="/shield-icon.png" alt="Shield" className="shield-icon" />
          GREENLANDS SOCIETY
        </div>
        <div className="user-menu">
          <div className="dropdown">
            <button className="dropdown-button">
              <img src="/profile-icon.png" alt="Profile" className="profile-icon" />
            </button>
            <div className="dropdown-content">
              <button onClick={() => openModal('settings')}>Account Settings</button>
              <button>Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button className="nav-item">Dashboard</button>
            <button 
              className="nav-item"
              onClick={() => openModal('polls')}
            >
              Voting & Polling
            </button>
            <button className="nav-item">
              Maintenance Requests
            </button>
            <button 
              className="nav-item"
              onClick={() => openModal('bookings')}
            >
              Amenity Booking
            </button>
            <button className="nav-item">
              Society By Laws
            </button>
            <button 
              className="nav-item"
              onClick={() => openModal('settings')}
            >
              Settings
            </button>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-grid">
            <div className="dashboard-card active-votes">
              <h2>ACTIVE VOTES</h2>
              <div className="votes-content">
                {activeVotes.map(vote => (
                  <div key={vote._id} className="vote-item">
                    <div className="vote-progress" style={{ width: `${(vote.votesFor / vote.totalVotes) * 100}%` }} />
                    <span>{vote.title}</span>
                  </div>
                ))}
              </div>
              <button 
                className="card-action"
                onClick={() => openModal('polls')}
              >
                SEE ALL LIVE POLLS
              </button>
            </div>
            
            <div className="dashboard-card maintenance">
              <h2>MAINTENANCE UPDATES</h2>
              <div className="maintenance-items">
                {maintenanceUpdates.map(issue => (
                  <div key={issue._id} className="maintenance-item">
                    <span>{issue.title}</span>
                    <span className={`status ${issue.status.toLowerCase()}`}>{issue.status}</span>
                  </div>
                ))}
              </div>
              <button 
                className="card-action"
                onClick={() => openModal('updates')}
              >
                SEE ALL UPDATES
              </button>
            </div>
            
            <div className="dashboard-card notifications">
              <h2>RECENT NOTIFICATIONS</h2>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div key={notification._id} className="notification-item">
                    <span className="notification-dot" />
                    <p>{notification.message}</p>
                  </div>
                ))}
              </div>
              <button 
                className="card-action"
                onClick={() => openModal('notifications')}
              >
                SEE ALL NOTIFICATIONS
              </button>
            </div>
            
            <div className="dashboard-card bookings">
              <h2>BOOKED AMENITIES</h2>
              <div className="booking-info">
                {bookings.map(booking => (
                  <div key={booking._id}>
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                    <span>{booking.amenityName}</span>
                  </div>
                ))}
              </div>
              <button 
                className="card-action"
                onClick={() => openModal('bookings')}
              >
                SEE ALL BOOKINGS
              </button>
            </div>
            
            <div className="dashboard-card announcements">
              <h2>ANNOUNCEMENTS</h2>
              <div className="announcements-content">
                {announcements.length > 0 ? (
                  announcements.map(announcement => (
                    <div key={announcement._id} className="announcement-item">
                      <span className="bell-icon">🔔</span>
                      <p>{announcement.title}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <span className="bell-icon">🔔</span>
                    <p>No New Announcements</p>
                  </>
                )}
              </div>
              <button 
                className="card-action"
                onClick={() => openModal('announcements')}
              >
                SEE ALL ANNOUNCEMENTS
              </button>
            </div>
          </div>
        </main>
      </div>

      <SettingsModal 
        isOpen={modals.settings} 
        onClose={() => closeModal('settings')} 
      />
      
      <PollsModal 
        isOpen={modals.polls} 
        onClose={() => closeModal('polls')} 
      />
      
      <AnnouncementsModal 
        isOpen={modals.announcements} 
        onClose={() => closeModal('announcements')} 
      />
      
      <UpdatesModal 
        isOpen={modals.updates} 
        onClose={() => closeModal('updates')} 
      />
      
      <NotificationsModal 
        isOpen={modals.notifications} 
        onClose={() => closeModal('notifications')} 
      />
      
      <BookingsModal 
        isOpen={modals.bookings} 
        onClose={() => closeModal('bookings')} 
      />
    </div>
  );
};

export default App;