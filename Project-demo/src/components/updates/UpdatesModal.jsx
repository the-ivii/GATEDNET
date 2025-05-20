import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './UpdatesModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const UpdatesModal = ({ isOpen, onClose }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/updates`);
        setUpdates(response.data.data);
      } catch (error) {
        console.error('Error fetching updates:', error);
        setError('Failed to fetch updates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [isOpen]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Community Updates" 
      width="500px"
    >
      {loading ? (
        <div className="loading-spinner">Loading updates...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="updates-list">
          {updates.length === 0 ? (
            <div className="no-updates">No updates available at the moment</div>
          ) : (
            updates.map(update => (
              <div key={update._id} className="update-item">
                <div className="update-header">
                  <h3 className="update-title">{update.title}</h3>
                  <span className="update-date">
                    {new Date(update.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="update-description">{update.description}</p>
                {update.image && (
                  <img 
                    src={update.image} 
                    alt={update.title} 
                    className="update-image"
                  />
                )}
                {update.link && (
                  <a 
                    href={update.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="update-link"
                  >
                    Learn More
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
};

export default UpdatesModal;