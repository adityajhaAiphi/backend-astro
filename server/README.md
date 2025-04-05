# AstroAlert Server Application

This directory contains the back-end server application for the AstroAlert platform.

## Overview

The server application provides API endpoints, real-time communication, authentication, and data management functionality for the AstroAlert application.

## Technology Stack

- Node.js
- Express.js
- MongoDB
- Socket.IO for real-time chat
- WebSockets for video calls
- JWT for authentication

## Directory Structure

- `server.js` - Main entry point that initializes the Express app, connects to MongoDB, and sets up WebSockets
- `src/` - Core application code
  - `models/` - MongoDB schema definitions 
  - `routes/` - API route definitions
  - `middleware/` - Custom middleware functions
  - `services/` - Business logic services
  - `lib/` - Utility libraries and helpers
- `socket/` - WebSocket implementation for real-time chat
- `middleware/` - Root-level middleware (authentication)
- `.env` - Environment variables configuration

## Models

The application uses the following data models:

- `user.js` - User accounts and profiles
- `astrologer.js` - Astrologer profiles and availability
- `chat.js` - Chat conversation data
- `message.js` - Individual chat messages
- `order.js` - Order information for shop items
- `consultationOrder.js` - Consultation booking records
- `shop.js` - Shop items and products

## API Routes

- **Authentication**
  - `/api/auth` - User authentication (login, register, etc.)

- **Users**
  - `/api/users` - User management endpoints

- **Admin**
  - `/api/admin` - Admin management features
  - `/api/superadmin` - Super admin privileged operations

- **Astrologers**
  - `/api/astrologers` - Astrologer profile and availability management

- **Chat & Consultations**
  - `/api/chat` - Chat functionality
  - `/api/consultations` - Consultation bookings and management

- **Shop**
  - `/api/shop` - E-commerce functionality

## Real-time Communication

The server implements two different WebSocket systems:

1. **Socket.IO** (`/socket/socket.js`)
   - Handles real-time chat functionality
   - Connected via `/socket.io` endpoint

2. **WebSocket** (`/src/routes/CallRoutes.js`)
   - Handles video call functionality
   - Connected via `/calls` endpoint

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn
- MongoDB installed and running

### Installation

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the server directory with the following variables:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/astroalert
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `CORS_ORIGIN` - Allowed origins for CORS
- `JWT_SECRET` - Secret key for JWT token generation/validation

### Development

```bash
# Start the development server
npm run dev
```

The server will be available at `http://localhost:3001` (or your configured port).

### Production

```bash
# Start the server in production mode
npm start
```

### Creating a Super Admin

The application includes a utility script to create a super admin user:

```bash
node create-superadmin.js
```

## CORS Configuration

The server is configured to accept connections from the following origins:
- https://astroalert-one.vercel.app
- https://astroalert.vercel.app
- https://astroalert-local.vercel.app
- https://astroalert-backend-m1hn.onrender.com
- http://localhost:3000
- http://localhost:3001

## Deployment Notes

When deploying this application:

1. Ensure MongoDB is properly configured and accessible
2. Set all required environment variables in your hosting platform
3. Configure WebSocket support in your hosting environment
4. Ensure proper CORS settings for your production domain
5. Set up proper error logging and monitoring

## Health Check

The server provides a health check endpoint at `/health` that returns a status message.

## API Documentation

### Authentication Routes (/api/auth)
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login a user
- `GET /api/auth/verify` - Verify user token
- `GET /api/auth/astrologers` - Get all verified astrologers
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/verify-astrologer/:id` - Verify an astrologer (admin's only)

### User Routes (/api/users)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/balance` - Get user's balance
- `POST /api/users/add-money` - Add money to user's balance

### Admin Routes (/api/admin)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/shop` - Get all shop items (admin only)
- `GET /api/admin/stats` - Get admin dashboard statistics
- `PUT /api/admin/users/:userId/role` - Update user role
- `GET /api/admin/users/:userId` - Get user details
- `GET /api/admin/astrologers/unverified` - Get unverified astrologers
- `PUT /api/admin/users/:userId` - Update user profile
- `POST /api/admin/astrologers/verify/:id` - Verify an astrologer

### Superadmin Routes (/api/superadmin)
- `GET /api/superadmin/stats` - Get superadmin dashboard statistics
- `GET /api/superadmin/users` - Get all users
- `DELETE /api/superadmin/users/:userId` - Delete a user
- `GET /api/superadmin/admins` - Get all admins and superadmins
- `POST /api/superadmin/admins` - Create a new admin
- `DELETE /api/superadmin/admins/:adminId` - Delete an admin
- `PUT /api/superadmin/admins/:adminId/status` - Update admin status
- `GET /api/superadmin/astrologers` - Get all astrologers
- `GET /api/superadmin/shop` - Get all shop items

### Astrologer Routes (/api/astrologers)
- `GET /api/astrologers` - Get all verified astrologers
- `GET /api/astrologers/users` - Get all regular users (astrologer only)
- `GET /api/astrologers/chats` - Get astrologer's chat history
- `GET /api/astrologers/chats/history` - Get complete chat history with messages
- `GET /api/astrologers/chats/:chatId/messages` - Get chat messages
- `PUT /api/astrologers/chats/:chatId/status` - Update chat status
- `GET /api/astrologers/earnings` - Get astrologer's earnings

### Chat Routes (/api/chat)
- `POST /api/chat/save-message` - Save a new chat message
- `GET /api/chat/get-messages/:chatId` - Get messages for a chat session
- `DELETE /api/chat/messages/:messageId` - Delete a message
- `POST /api/chat/messages/:messageId/react` - Add reaction to a message

### Consultation Routes (/api/consultations)
- `POST /api/consultations/start` - Start a consultation (chat or call)
- `POST /api/consultations/extend/:consultationId` - Extend consultation duration
- `POST /api/consultations/end/:consultationId` - End a consultation
- `POST /api/consultations/validate-balance` - Validate user balance for consultation

### Shop Routes (/api/shop)
- `POST /api/shop` - Create a shop item (admin only)
- `GET /api/shop` - Get all shop items
- `GET /api/shop/:id` - Get shop item by ID
- `PUT /api/shop/:id` - Update a shop item (admin only)
- `DELETE /api/shop/:id` - Delete a shop item (admin only)

### WebSocket Endpoints
- `/socket.io` - Socket.IO for real-time chat
- WebSocket for video calls (handled in CallRoutes.js)

## Database

This application uses MongoDB as its database. Make sure you have MongoDB installed and running before starting the server.

To seed the database with initial data:

```bash
npm run seed
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Error Handling

The server implements a centralized error handling mechanism. Custom errors can be found in the `utils/errors` directory.

## Logging

Logs are managed using Winston and are stored in the `logs/` directory.

## Contributing

Please follow the project's coding standards and commit message conventions. Write tests for new features and ensure all tests pass before submitting a pull request.

## License

