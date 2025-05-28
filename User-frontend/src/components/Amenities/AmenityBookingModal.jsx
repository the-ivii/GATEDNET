import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useStore from '../../store/useStore';

const AmenityBookingModal = ({ isOpen, onClose }) => {
  const [selectedAmenityId, setSelectedAmenityId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availabilityStatus, setAvailabilityStatus] = useState('Select amenity and date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { 
    amenities,
    fetchAmenities,
    checkAmenityAvailability,
    bookAmenity,
    cancelAmenityBooking,
    amenityBookings,
    isLoadingAmenities
  } = useStore();

  // Fetch amenities when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen, fetchAmenities]);

  // Check availability when amenity or date changes
  useEffect(() => {
    if (selectedAmenityId && selectedDate) {
      handleCheckAvailability();
    } else {
      setAvailabilityStatus('Select amenity and date');
    }
  }, [selectedAmenityId, selectedDate]);

  const handleCheckAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAvailabilityStatus('Checking availability...');
      
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Check if already booked by the current user
      const alreadyBooked = amenityBookings.some(booking => 
        booking.amenityId === selectedAmenityId && booking.date === formattedDate
      );

      if (alreadyBooked) {
        setAvailabilityStatus('Already Booked by You');
      } else {
        const isAvailable = await checkAmenityAvailability(selectedAmenityId, formattedDate);
        setAvailabilityStatus(isAvailable ? 'Available' : 'Not Available');
      }
    } catch (error) {
      setError(error.message || 'Failed to check availability');
      setAvailabilityStatus('Error checking availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookAmenity = async () => {
    if (!selectedAmenityId || !selectedDate || availabilityStatus !== 'Available') return;

    try {
      setIsLoading(true);
      setError(null);
      setAvailabilityStatus('Booking...');
      
      const formattedDate = selectedDate.toISOString().split('T')[0];
      await bookAmenity(selectedAmenityId, formattedDate);
      
      setAvailabilityStatus('Booking Confirmed');
      // Close modal after successful booking
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Failed to book amenity');
      setAvailabilityStatus('Booking Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedAmenityId || !selectedDate || availabilityStatus !== 'Already Booked by You') return;

    try {
      setIsLoading(true);
      setError(null);
      setAvailabilityStatus('Cancelling...');
      
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const bookingToCancel = amenityBookings.find(booking => 
        booking.amenityId === selectedAmenityId && booking.date === formattedDate
      );

      if (!bookingToCancel) {
        throw new Error('Booking not found');
      }

      await cancelAmenityBooking(bookingToCancel.id);
      setAvailabilityStatus('Cancellation Confirmed');
      
      // Close modal after successful cancellation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error.message || 'Failed to cancel booking');
      setAvailabilityStatus('Cancellation Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClasses = () => {
    switch (availabilityStatus) {
      case 'Available':
        return 'bg-blue-200 text-blue-800';
      case 'Not Available':
        return 'bg-red-200 text-red-800';
      case 'Already Booked by You':
        return 'bg-yellow-200 text-yellow-800';
      case 'Checking availability...':
      case 'Booking...':
      case 'Cancelling...':
        return 'bg-blue-200 text-blue-800';
      case 'Booking Confirmed':
      case 'Cancellation Confirmed':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const selectedAmenity = amenities.find(amenity => amenity.id === selectedAmenityId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">BOOK AMENITIES</h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Amenity:</label>
          {isLoadingAmenities ? (
            <p className="text-gray-500">Loading amenities...</p>
          ) : ( amenities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {amenities.map(amenity => (
                <span
                  key={amenity.id}
                  className={`px-3 py-1 rounded-full cursor-pointer text-sm font-semibold ${
                    selectedAmenityId === amenity.id
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => setSelectedAmenityId(amenity.id)}
                >
                  {amenity.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No amenities available.</p>
          ))}
        </div>

        {selectedAmenity && (
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Book Amenity:</label>
            <span className="px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-sm font-semibold">
              {selectedAmenity.name}
            </span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            minDate={new Date()}
            disabled={isLoading}
          />
        </div>

        <div className="mb-4 text-center text-lg font-semibold flex items-center justify-center">
          Status: 
          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClasses()}`}>
            {isLoading ? '...' : availabilityStatus}
          </span>
        </div>

        <div className="flex justify-around mt-6">
          {selectedAmenityId && selectedDate && availabilityStatus === 'Available' && (
            <button
              onClick={handleBookAmenity}
              className="bg-gray-800 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-bold"
              disabled={isLoading}
            >
              BOOK NOW
            </button>
          )}
          {selectedAmenityId && selectedDate && availabilityStatus === 'Already Booked by You' && (
            <button
              onClick={handleCancelBooking}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmenityBookingModal; 