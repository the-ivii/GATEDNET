# GatedNet Backend

This is the backend service for GatedNet, a hyperlocal MERN application for gated communities.

## Features

- User Authentication & Authorization
- Geofencing-based Access Control
- Real-time Polling & Voting System
- Maintenance Issue Tracking
- Amenity Booking Management
- Notification System
- Admin Dashboard
- File Upload & Management

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication
- Firebase (for geofencing)
- Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd GATENET/backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/gatednet
   JWT_SECRET=your_jwt_secret_key_here
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_specific_password
   SMTP_FROM=GatedNet <your_email@gmail.com>
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   CLIENT_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-address` - Verify user's address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/society` - Get society details
- `GET /api/users/notifications` - Get user notifications

### Poll Endpoints

- `POST /api/polls` - Create a new poll
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get poll details
- `POST /api/polls/:id/vote` - Vote on a poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll

### Maintenance Endpoints

- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance` - Get all maintenance requests
- `GET /api/maintenance/:id` - Get maintenance details
- `PUT /api/maintenance/:id` - Update maintenance status
- `POST /api/maintenance/:id/comments` - Add comment

### Amenity Booking Endpoints

- `POST /api/amenities/book` - Book an amenity
- `GET /api/amenities` - Get all amenities
- `GET /api/amenities/bookings` - Get user's bookings
- `PUT /api/amenities/bookings/:id` - Update booking
- `DELETE /api/amenities/bookings/:id` - Cancel booking

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 