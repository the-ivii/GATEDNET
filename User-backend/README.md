# GatedNet User Backend

This is the backend service for the GatedNet user portal. It provides APIs for user authentication, polls, amenities booking, announcements, maintenance updates, and reminders.

## Features

- Firebase Authentication
- User Management
- Polls and Voting System
- Amenities Booking System
- Announcements
- Maintenance Updates
- Reminders

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase Project

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/gatednet
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- GET `/api/auth/profile` - Get user profile

### Polls
- GET `/api/polls` - Get all active polls
- POST `/api/polls/:pollId/vote` - Vote on a poll
- GET `/api/polls/:pollId/results` - Get poll results

### Amenities
- GET `/api/amenities` - Get all amenities
- GET `/api/amenities/:amenityId/bookings/:date` - Get bookings for a specific date
- POST `/api/amenities/:amenityId/book` - Book an amenity
- GET `/api/amenities/my-bookings` - Get user's bookings

### Announcements
- GET `/api/announcements` - Get all announcements
- GET `/api/announcements/:id` - Get a specific announcement

### Maintenance
- GET `/api/maintenance` - Get all maintenance updates
- GET `/api/maintenance/:id` - Get a specific maintenance update

### Reminders
- GET `/api/reminders` - Get all reminders
- GET `/api/reminders/:id` - Get a specific reminder

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Security

- All routes except registration require Firebase authentication
- User data is validated before processing
- MongoDB queries are sanitized to prevent injection attacks 