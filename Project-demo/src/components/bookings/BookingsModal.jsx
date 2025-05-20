import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../common/Modal';
import './BookingsModal.css';

const API_BASE_URL = 'http://localhost:3000/api';

const BookingsModal = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'pending'

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/amenities/bookings`);
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to fetch bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isOpen]);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const cancelBooking = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/amenities/bookings/${id}/cancel`);
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === id 
          ? { ...booking, status: 'cancelled' } 
          : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Amenity Bookings" 
      width="650px"
    >
      {loading ? (
        <div className="loading-spinner">Loading bookings...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="bookings-filter">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
          </div>
          
          <div className="bookings-list">
            {filteredBookings.length === 0 ? (
              <div className="no-bookings">No bookings found</div>
            ) : (
              filteredBookings.map(booking => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <h3>{booking.amenityName}</h3>
                    <span className={`booking-status ${booking.status}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-info">
                      <div className="booking-date">
                        <span className="info-label">Date:</span>
                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                      </div>
                      {booking.time && (
                        <div className="booking-time">
                          <span className="info-label">Time:</span>
                          <span>{booking.time}</span>
                        </div>
                      )}
                    </div>
                    
                    {booking.status !== 'cancelled' && (
                      <button 
                        className="cancel-booking-btn"
                        onClick={() => cancelBooking(booking._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="new-booking-section">
            <button className="new-booking-btn">Book an Amenity</button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default BookingsModal;