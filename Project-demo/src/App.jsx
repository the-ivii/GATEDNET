import React, { useState, useEffect } from 'react';
import SettingsModal from './components/settings/SettingsModal';
import PollsModal from './components/polls/PollsModal';
import AnnouncementsModal from './components/announcements/AnnouncementsModal';
import UpdatesModal from './components/updates/UpdatesModal';
import NotificationsModal from './components/notifications/NotificationsModal';
import BookingsModal from './components/bookings/BookingsModal';
import useModals from './hooks/useModals';
import { 
  pollService, 
  notificationService, 
  taskService, 
  announcementService,
  amenityService 
} from './services/api';
import './App.css';

const App = () => {
  const { modals, openModal, closeModal } = useModals();
  const [activePolls, setActivePolls] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          pollsResponse, 
          notificationsResponse, 
          tasksResponse,
          announcementsResponse,
          bookingsResponse
        ] = await Promise.all([
          pollService.getActive(),
          notificationService.getAll(),
          taskService.getMyTasks(),
          announcementService.getAll(),
          amenityService.getBookings()
        ]);

        setActivePolls(pollsResponse.data);
        setNotifications(notificationsResponse.data);
        setTasks(tasksResponse.data);
        setAnnouncements(announcementsResponse.data);
        setBookings(bookingsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : activePolls.length === 0 ? (
                  <div className="no-data">No active polls</div>
                ) : (
                  activePolls.slice(0, 2).map(poll => (
                    <div key={poll._id} className="vote-item">
                      <div className="vote-progress" />
                      <span>{poll.title}</span>
                    </div>
                  ))
                )}
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
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : tasks.length === 0 ? (
                  <div className="no-data">No maintenance tasks</div>
                ) : (
                  tasks.slice(0, 2).map(task => (
                    <div key={task._id} className="maintenance-item">
                      <span>{task.title}</span>
                      <span className={`status ${task.status}`}>{task.status.toUpperCase()}</span>
                    </div>
                  ))
                )}
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
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="no-data">No notifications</div>
                ) : (
                  notifications.slice(0, 3).map(notification => (
                    <div key={notification._id} className="notification-item">
                      <span className="notification-dot" />
                      <p>{notification.message}</p>
                    </div>
                  ))
                )}
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
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : bookings.length === 0 ? (
                  <div className="no-data">No bookings</div>
                ) : (
                  bookings.slice(0, 1).map(booking => (
                    <div key={booking._id} className="booking-item">
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                      <span>{booking.amenityName}</span>
                    </div>
                  ))
                )}
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
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : announcements.length === 0 ? (
                  <div className="no-announcements">
                    <span className="bell-icon">🔔</span>
                    <p>No New Announcements</p>
                  </div>
                ) : (
                  announcements.slice(0, 1).map(announcement => (
                    <div key={announcement._id} className="announcement-item">
                      <span className="bell-icon">🔔</span>
                      <p>{announcement.title}</p>
                    </div>
                  ))
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