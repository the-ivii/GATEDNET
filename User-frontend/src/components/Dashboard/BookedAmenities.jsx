import React, { useEffect, useState } from 'react';
import Card from '../UI/Card';
import useStore from '../../store/useStore';
import { X } from 'lucide-react';

const BookedAmenities = ({ onBookAmenity }) => {
  const { amenityBookings, fetchAmenities, isLoading } = useStore();
  const [showAllModal, setShowAllModal] = useState(false);
  
  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);
  
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
          <div className="bg-navy-900 rounded-3xl p-10 w-full max-w-xl max-h-[80vh] overflow-y-auto relative shadow-2xl border border-navy-800">
            <button
              onClick={() => setShowAllModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white text-3xl font-light focus:outline-none"
            >
              <X size={32} />
            </button>
            <h2 className="text-3xl font-extrabold text-white text-center mb-10 tracking-wide">All Booked Amenities</h2>
            <div className="space-y-4 mb-8">
              {amenityBookings.length === 0 ? (
                <div className="text-center text-lg text-blue-100">No booked amenities.</div>
              ) : (
                amenityBookings.map(booking => (
                  <div key={booking.id} className="bg-navy-800 text-white rounded-xl px-6 py-4 flex justify-between items-center text-lg font-semibold border border-navy-700">
                    <span>{booking.date.split('-')[1] + ' ' + booking.date.split('-')[2]}</span>
                    <span>{getAmenityName(booking.amenityId)}</span>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={onBookAmenity}
              className="w-full py-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              Book New Amenity
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookedAmenities;