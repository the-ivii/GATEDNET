import React, { useEffect, useState } from 'react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const BookedAmenities = ({ onBookAmenity }) => {
  const { amenityBookings, fetchAmenityBookings, isLoading } = useStore();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    fetchAmenityBookings();
  }, [fetchAmenityBookings]);
  
  // Get amenity name by ID (in a real app, you would have a more robust data structure)
  const getAmenityName = (amenityId) => {
    const amenityNames = {
      '1': 'Clubhouse',
      '2': 'Swimming Pool',
      '3': 'Amphitheatre',
      '4': 'Garden',
      '5': 'Kids Pool',
    };
    
    return amenityNames[amenityId] || 'Unknown';
  };

  const renderBookingsList = (bookings) => (
    <div className="space-y-2">
      {bookings.map(booking => (
        <div key={booking.id} className="flex justify-between">
          <div className="text-lg">{booking.date.split('-')[1] + ' ' + booking.date.split('-')[2]}</div>
          <div className="text-lg text-right">{getAmenityName(booking.amenityId)}</div>
        </div>
      ))}
    </div>
  );
  
  return (
    <>
      <Card 
        title="BOOKED AMENITIES"
        footer={<span onClick={() => setShowAllModal(true)}>SEE ALL BOOKINGS</span>}
      >
        {isLoading ? (
          <div className="text-center py-4">Loading bookings...</div>
        ) : amenityBookings.length === 0 ? (
          <div className="text-center py-4">No booked amenities</div>
        ) : (
          renderBookingsList(amenityBookings.slice(0, 2))
        )}
      </Card>

      {/* All Bookings Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">All Booked Amenities</h2>
            {renderBookingsList(amenityBookings)}
            <div className="mt-6">
              <button
                onClick={onBookAmenity}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Book New Amenity
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookedAmenities;