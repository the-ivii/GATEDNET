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

  const renderBookingsList = (bookings) => (
    <div className="space-y-2">
      {bookings.map(booking => (
        <div key={booking._id} className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">{booking.amenity?.name || 'Unknown Amenity'}</div>
            <div className="text-xs text-blue-200">{booking.date}</div>
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${booking.status === 'booked' ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}>{booking.status}</div>
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
                  <div key={booking._id} className="bg-navy-800 text-white rounded-xl px-6 py-4 flex justify-between items-center text-lg font-semibold border border-navy-700">
                    <div>
                      <div className="font-bold">{booking.amenity?.name || 'Unknown Amenity'}</div>
                      <div className="text-xs text-blue-200">{booking.date}</div>
                    </div>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full ${booking.status === 'booked' ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}>{booking.status}</div>
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