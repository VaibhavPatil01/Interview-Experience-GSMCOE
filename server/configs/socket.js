import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisConnection } from './redis.js';
import decodeToken from '../utils/token/decodeToken.js';
import logger from '../utils/logger.js';

let io;

const pubClient = redisConnection.duplicate();
const subClient = redisConnection.duplicate();

pubClient.on('error', (err) => logger.error('[Socket.io Redis Pub] Error', { event: 'WEBSOCKET_ERROR', errorCategory: 'WEBSOCKET_ERROR', error: err.message }));
subClient.on('error', (err) => logger.error('[Socket.io Redis Sub] Error', { event: 'WEBSOCKET_ERROR', errorCategory: 'WEBSOCKET_ERROR', error: err.message }));

export const initSocket = (server) => {
  io = new Server(server, {
    adapter: createAdapter(pubClient, subClient),
    cors: {
      origin: "*", // Or specify exact frontend domain for prod
      methods: ["GET", "POST"]
    },
    pingInterval: 25000,
    pingTimeout: 20000
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      // Clients can send token via auth object
      const token = socket.handshake.auth?.token || socket.handshake.headers['token'];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = decodeToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Associate socket with user ID
      socket.userId = decoded.id;
      next();
    } catch (error) {
      logger.warn('[Socket.io] Authentication failed', { 
        event: 'AUTH_ERROR', 
        errorCategory: 'AUTH_ERROR',
        error: error.message 
      });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRoom = `user:${userId}`;

    logger.info(`[Socket.io] Client connected`, { 
      event: 'WEBSOCKET_CONNECTED',
      socketId: socket.id, 
      userId 
    });

    // Join user-specific channel to receive private notifications
    socket.join(userRoom);

    // Initial sync could happen here, or client can explicitly fetch.
    // For now, we wait for the client to ask for sync or just let HTTP handle it.
    
    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Client disconnected`, { 
        event: 'WEBSOCKET_DISCONNECTED',
        socketId: socket.id, 
        userId 
      });
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

/**
 * Deliver a real-time notification to a specific user across all their connected devices.
 */
export const emitNotificationToUser = (userId, notificationObj) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notificationObj);
  }
};

export const emitNotificationRead = (userId, notificationId) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:read', { notificationId });
  }
};

export const emitNotificationReadAll = (userId) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:read_all');
  }
};

export const emitNotificationRemove = (userId, eventId) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:remove', { eventId });
  }
};
