const { Server } = require('socket.io');
const debug = require('debug')('astro:socket');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user');

function setupSocket(server) {
  const allowedOrigins = [
    'https://astroalert-one.vercel.app',
    'https://astroalert.vercel.app',
    'https://astroalert-local.vercel.app',
    'https://astroalert-backend-m1hn.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    maxHttpBufferSize: 5e6, // 5MB max
    pingTimeout: 30000,
    pingInterval: 10000
  });

  // Track active channels for video calls
  const channels = new Map();

  // Add error event handler for the server
  io.engine.on('connection_error', (err) => {
    debug('Connection error:', err);
  });

  // Add better error handling and user management
  const activeUsers = new Map(); // Track active users
  const userSockets = new Map(); // Track user's sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.auth.userId;

      debug('Socket auth attempt:', { hasToken: !!token, userId });

      if (!token && !userId) {
        debug('Missing authentication: No token and no userId provided');
        return next(new Error('Authentication required'));
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          debug('Token decoded successfully:', { id: decoded.id });
          
          const user = await User.findOne({
            _id: decoded.id
          }).select('-password');

          if (!user) {
            debug('User not found with decoded token ID:', decoded.id);
            socket.userId = userId || decoded.id; // Fall back to userId if user not found but still allow connection
          } else {
            socket.user = user;
            socket.userId = user._id.toString();
            debug('User authenticated successfully:', { id: user._id, name: user.name });
          }
        } catch (tokenError) {
          debug('Token verification failed:', tokenError.message);
          // Still allow connection with userId if token is invalid
          if (userId) {
            socket.userId = userId;
            debug('Falling back to userId for auth:', userId);
          } else {
            return next(new Error('Invalid authentication token'));
          }
        }
      } else if (userId) {
        socket.userId = userId;
        debug('Using userId for auth (no token):', userId);
      }

      // Track user's socket
      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId).add(socket);
      debug('User socket tracked:', { userId: socket.userId, socketId: socket.id });

      next();
    } catch (error) {
      debug('Auth error:', error);
      next(new Error('Authentication failed: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    debug('New client connected:', socket.id);
    activeUsers.set(socket.userId, true);
    io.emit('user_status_change', { userId: socket.userId, isOnline: true });

    // Room handling
    socket.on('join_room', (data) => {
      try {
        const { roomId } = data;
        socket.join(roomId);
        debug(`Client ${socket.id} joined room ${roomId}`);
        
        // Notify room members
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          name: socket.user?.name
        });

        socket.emit('room_joined', { 
          status: 'success',
          roomId,
          activeUsers: Array.from(socket.rooms)
        });
      } catch (error) {
        debug('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Enhanced message handling with typing indicators
    let typingTimeout;
    socket.on('typing', ({ roomId }) => {
      socket.to(roomId).emit('typing', { userId: socket.userId });
      
      // Clear previous timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Set new timeout
      typingTimeout = setTimeout(() => {
        socket.to(roomId).emit('stop_typing', { userId: socket.userId });
      }, 3000);
    });

    // Video call handling
    socket.on('join_call', (data) => {
      const { channelId, userId } = data;
      if (!channels.has(channelId)) {
        channels.set(channelId, new Map());
      }
      channels.get(channelId).set(userId, socket);
      
      const participants = Array.from(channels.get(channelId).keys());
      socket.emit('channel_joined', { participants });
      socket.to(channelId).emit('user_joined', { userId });
    });

    socket.on('call_signal', (data) => {
      const { channelId, targetId, type, payload } = data;
      const targetSocket = channels.get(channelId)?.get(targetId);
      if (targetSocket) {
        targetSocket.emit('call_signal', {
          type,
          payload,
          senderId: socket.userId
        });
      }
    });

    // Message handling with acknowledgment
    socket.on('send_message', (message, callback) => {
      try {
        debug('Broadcasting message to room:', message.roomId);
        socket.to(message.roomId).emit('receive_message', {
          ...message,
          timestamp: new Date().toISOString()
        });
        
        if (typeof callback === 'function') {
          callback({ status: 'success' });
        }
      } catch (error) {
        debug('Error sending message:', error);
        if (typeof callback === 'function') {
          callback({ error: 'Failed to send message' });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      debug(`Client ${socket.id} disconnected`);
      
      // Remove socket from user's sockets
      const userSocketSet = userSockets.get(socket.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket);
        if (userSocketSet.size === 0) {
          userSockets.delete(socket.userId);
          activeUsers.delete(socket.userId);
          io.emit('user_status_change', { userId: socket.userId, isOnline: false });
        }
      }

      // Clear typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Clean up channels
      channels.forEach((participants, channelId) => {
        participants.forEach((sock, userId) => {
          if (sock === socket) {
            participants.delete(userId);
            io.to(channelId).emit('user_left', { userId });
          }
        });
        if (participants.size === 0) {
          channels.delete(channelId);
        }
      });
    });

    // Add heartbeat mechanism
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Handle errors
    socket.on('error', (error) => {
      debug('Socket error:', error);
      socket.emit('error', { message: 'Internal server error' });
    });
  });

  return io;
}

module.exports = setupSocket;
