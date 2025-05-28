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
      <div className="bg-navy-900 rounded-3xl p-0 w-full max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl border border-navy-800 flex flex-col justify-center items-center min-h-[600px]">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
        >
          <X size={32} />
        </button>
        <div className="flex flex-col justify-center items-center w-full h-full px-10 py-10">
          <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide">BOOK AMENITIES</h2>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center w-full">
              {error}
            </div>
          )}

          <div className="mb-6 w-full flex flex-col items-center">
            <label className="block text-lg font-semibold text-blue-100 mb-2 self-start">Select Amenity:</label>
            {isLoadingAmenities ? (
              <p className="text-blue-200 self-start">Loading amenities...</p>
            ) : ( amenities.length > 0 ? (
              <select
                className="w-full p-4 rounded-xl bg-navy-800 text-white border border-navy-700 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedAmenityId || ''}
                onChange={e => setSelectedAmenityId(e.target.value)}
              >
                <option value="" disabled>Select an amenity</option>
                {amenities.map(amenity => (
                  <option key={amenity._id} value={amenity._id}>{amenity.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-blue-200 self-start">No amenities available.</p>
            ))}
          </div>

          <div className="mb-6 w-full flex flex-col items-center">
            <label className="block text-lg font-semibold text-blue-100 mb-2 self-start">Select Date:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="mt-1 block w-full border border-navy-700 rounded-xl shadow-sm p-4 bg-navy-800 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              minDate={new Date()}
              disabled={isLoading}
            />
          </div>

          <div className="mb-8 text-center text-xl font-bold flex items-center justify-center text-white w-full">
            Status:
            <span className={`ml-3 px-4 py-2 rounded-full text-base font-semibold bg-navy-800 text-blue-200 border border-navy-700`}>
              {isLoading ? '...' : availabilityStatus}
            </span>
          </div>

          <div className="flex flex-col w-full gap-4 items-center justify-center mt-6">
            <button
              onClick={handleBookAmenity}
              className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
              disabled={
                isLoading ||
                !selectedAmenityId ||
                !selectedDate ||
                availabilityStatus !== 'Available'
              }
            >
              BOOK NOW
            </button>
            {selectedAmenityId && selectedDate && availabilityStatus === 'Already Booked by You' && (
              <button
                onClick={handleCancelBooking}
                className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-red-500 to-red-600 shadow-lg hover:from-red-600 hover:to-red-700 transition-all ml-2"
                disabled={isLoading}
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenityBookingModal; 