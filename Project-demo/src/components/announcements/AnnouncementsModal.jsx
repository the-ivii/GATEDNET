import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './AnnouncementsModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const AnnouncementsModal = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/announcements`);
        setAnnouncements(response.data.data);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to fetch announcements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Announcements" 
      width="500px"
    >
      {loading ? (
        <div className="loading-spinner">Loading announcements...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : announcements.length === 0 ? (
        <div className="no-announcements">
          <div className="empty-icon">📢</div>
          <h3>No New Announcements</h3>
          <p>There are no announcements at this time. Check back later!</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map(announcement => (
            <div key={announcement._id} className="announcement-item">
              <div className="announcement-header">
                <span className="announcement-icon">📢</span>
                <h3>{announcement.title}</h3>
              </div>
              {announcement.description && (
                <p className="announcement-description">{announcement.description}</p>
              )}
              <div className="announcement-meta">
                <span className="announcement-date">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AnnouncementsModal;