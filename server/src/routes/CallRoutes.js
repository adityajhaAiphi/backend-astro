"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { WebSocketServer } = require('ws');

function setupCallWebSocket(server) {
  const wss = new WebSocketServer({ 
    noServer: true,
    clientTracking: true,
    handleProtocols: () => 'websocket'
  });

  const rooms = new Map();
  const astrologers = new Map();
  const users = new Map();

  function broadcastToRoom(roomId, message, excludeUserId = null) {
    const room = rooms.get(roomId);
    if (room) {
      room.forEach((peer, peerId) => {
        if (peerId !== excludeUserId && peer.ws.readyState === 1) {
          try {
            peer.ws.send(JSON.stringify(message));
          } catch (error) {
            console.error(`Failed to send message to peer ${peerId}:`, error);
          }
        }
      });
    }
  }

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    let userId = null;
    let userRole = null;
    let currentRoomId = null;

    // Set up ping-pong for connection keep-alive
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);

        if (!message.type) {
          throw new Error('Invalid message format: missing type');
        }

        switch (message.type) {
          case 'join':
            // For astrologer dashboard view, roomId might be undefined
            if (!message.userId || !message.role) {
              throw new Error('Missing required join parameters: userId and role are required');
            }

            userId = message.userId;
            userRole = message.role;
            currentRoomId = message.roomId || `room_${userId}`; // Generate room ID if not provided
            
            console.log(`User ${userId} (${userRole}) joining room ${currentRoomId}`);
            
            // Handle astrologer connection
            if (userRole === 'astrologer') {
              astrologers.set(userId, { ws, roomId: currentRoomId });
              console.log('Astrologer connected:', userId);
              
              // Send active calls to newly connected astrologer
              const activeRooms = Array.from(rooms.entries())
                .filter(([_, room]) => Array.from(room.values()).some(peer => peer.role === 'user'))
                .map(([roomId, room]) => {
                  const userPeer = Array.from(room.entries())
                    .find(([_, peer]) => peer.role === 'user');
                  return {
                    roomId,
                    userId: userPeer ? userPeer[0] : null,
                    timestamp: new Date().toISOString()
                  };
                });
              
              if (activeRooms.length > 0) {
                ws.send(JSON.stringify({
                  type: 'active_calls',
                  calls: activeRooms
                }));
              }
            } else {
              users.set(userId, { ws, roomId: currentRoomId });
            }

            // Create or join room
            if (!rooms.has(currentRoomId)) {
              rooms.set(currentRoomId, new Map());
            }
            const room = rooms.get(currentRoomId);
            room.set(userId, { ws, role: userRole });

            // Notify room participants
            broadcastToRoom(currentRoomId, {
              type: 'user_joined',
              userId,
              role: userRole,
              timestamp: new Date().toISOString()
            }, userId);

            // Send connection confirmation
            ws.send(JSON.stringify({
              type: 'connected',
              userId,
              role: userRole,
              roomId: currentRoomId,
              timestamp: new Date().toISOString()
            }));

            break;

          case 'offer':
          case 'answer':
          case 'candidate':
            if (!currentRoomId) {
              throw new Error('Not properly connected to a room');
            }

            if (!message.roomId) {
              message.roomId = currentRoomId;
            }

            broadcastToRoom(message.roomId, message, userId);
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error handling message:', error);
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message || 'Failed to process message',
            timestamp: new Date().toISOString()
          }));
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      try {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'WebSocket error occurred',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Failed to send error message:', e);
      }
    });

    ws.on('close', () => {
      console.log('Connection closed for user:', userId);
      
      // Clean up user connections
      if (userRole === 'astrologer') {
        astrologers.delete(userId);
      } else {
        users.delete(userId);
      }

      // Clean up room
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId);
        room.delete(userId);

        // Notify others in the room
        broadcastToRoom(currentRoomId, {
          type: 'user_left',
          userId,
          role: userRole,
          timestamp: new Date().toISOString()
        });

        // Remove empty room
        if (room.size === 0) {
          rooms.delete(currentRoomId);
        }
      }
    });
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        console.log('Terminating inactive connection');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

module.exports = setupCallWebSocket;
