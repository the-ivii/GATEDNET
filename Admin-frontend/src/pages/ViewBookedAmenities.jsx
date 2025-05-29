// import React, { useState, useEffect } from 'react';
// import './ViewBookedAmenities.css';  // your CSS file with above styles

// const ViewBookedAmenities = () => {
//   const [bookedAmenities, setBookedAmenities] = useState([]);

//   useEffect(() => {
//     const storedBookings = JSON.parse(localStorage.getItem('bookedAmenities')) || [];
//     setBookedAmenities(storedBookings);
//   }, []);

//   // Helper function to return class based on status
//   const getStatusClass = (status) => {
//     switch (status.toLowerCase()) {
//       case 'confirmed':
//         return 'status-confirmed';
//       case 'pending':
//         return 'status-pending';
//       case 'cancelled':
//         return 'status-cancelled';
//       default:
//         return '';
//     }
//   };

//   return (
//     <div className="view-booked-amenities-container">
//       <h2>Booked Amenities</h2>
//       {bookedAmenities.length > 0 ? (
//         <ul className="booking-list">
//           {bookedAmenities.map((booking, index) => (
//             <li key={index} className="booking-item">
//               <div className="booking-detail">
//                 <strong>Amenity:</strong> {booking.amenityName}
//               </div>
//               <div className="booking-detail">
//                 <strong>Booked By:</strong> {booking.userName}
//               </div>
//               <div className="booking-detail">
//                 <strong>Booking Time:</strong> {booking.bookingTime}
//               </div>
//               <div className="booking-detail">
//                 <strong>Status:</strong>{' '}
//                 <span className={`booking-status ${getStatusClass(booking.status)}`}>
//                   {booking.status}
//                 </span>
//               </div>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="empty-message">No bookings found.</p>
//       )}
//     </div>
//   );
// };

// export default ViewBookedAmenities;

// import React, { useState, useEffect } from 'react';

// const ViewBookedAmenities = () => {
//   const [bookedAmenities, setBookedAmenities] = useState([]);

//   useEffect(() => {
//     // Insert demo data if not already present
//     if (!localStorage.getItem('bookedAmenities')) {
//       const demoBookings = [
//         {
//           amenityName: 'Tennis Court',
//           userName: 'Alice Johnson',
//           bookingTime: '2025-05-15 10:00 AM',
//           status: 'Confirmed',
//         },
//         {
//           amenityName: 'Swimming Pool',
//           userName: 'Bob Smith',
//           bookingTime: '2025-05-16 3:00 PM',
//           status: 'Pending',
//         },
//         {
//           amenityName: 'Conference Room',
//           userName: 'Carol Lee',
//           bookingTime: '2025-05-17 1:00 PM',
//           status: 'Cancelled',
//         },
//       ];
//       localStorage.setItem('bookedAmenities', JSON.stringify(demoBookings));
//     }

//     // Load bookings from localStorage
//     const storedBookings = JSON.parse(localStorage.getItem('bookedAmenities')) || [];
//     setBookedAmenities(storedBookings);
//   }, []);

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Booked Amenities</h2>
//       {bookedAmenities.length > 0 ? (
//         <ul>
//           {bookedAmenities.map((booking, index) => (
//             <li key={index}>
//               <strong>Amenity:</strong> {booking.amenityName}
//               <br />
//               <strong>Booked By:</strong> {booking.userName}
//               <br />
//               <strong>Booking Time:</strong> {booking.bookingTime}
//               <br />
//               <strong>Booking Status:</strong> {booking.status}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No bookings found.</p>
//       )}
//     </div>
//   );
// };

// export default ViewBookedAmenities;

import React, { useState, useEffect } from 'react';
import './ViewBookedAmenities.css';

const ViewBookedAmenities = () => {
  const [bookedAmenities, setBookedAmenities] = useState([]);

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookedAmenities')) || [];
    setBookedAmenities(storedBookings);
  }, []);

  return (
    <div className="bookings-container">
      <h2>Booked Amenities</h2>
      {bookedAmenities.length > 0 ? (
        <ul className="bookings-list">
          {bookedAmenities.map((booking, index) => (
            <li key={index}>
              <span className="booking-label">Amenity:</span> <span className="booking-value">{booking.amenityName}</span><br />
              <span className="booking-label">Booked By:</span> <span className="booking-value">{booking.userName}</span><br />
              <span className="booking-label">Booking Time:</span> <span className="booking-value">{booking.bookingTime}</span><br />
              <span className="booking-label">Booking Status:</span> <span className="booking-value">{booking.status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-bookings">No bookings found.</p>
      )}
    </div>
  );
};

export default ViewBookedAmenities;
