import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.connected = false;
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        if (!token) {
          reject(new Error('No token provided'));
          return;
        }

        this.socket = io(SOCKET_URL, {
          auth: {
            token: token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          this.connected = true;
          console.log('✓ Real-time connection established');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.connected = false;
          console.error('✗ Connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          this.connected = false;
          console.log('✗ Real-time connection disconnected');
        });
      } catch (error) {
        this.connected = false;
        console.error('✗ Failed to initialize socket:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  subscribeToAttendanceUpdates(callback) {
    this.on('attendance:updated', callback);
  }

  subscribeToCheckInCheckOut(callback) {
    this.on('attendance:checkInOut', callback);
  }

  subscribeToLeaveUpdates(callback) {
    this.on('leave:updated', callback);
  }

  subscribeToLeaveStatusChange(callback) {
    this.on('leave:statusChanged', callback);
  }

  subscribeToStatisticsUpdates(callback) {
    this.on('stats:updated', callback);
  }

  subscribeToNotifications(callback) {
    this.on('notification:new', callback);
  }

  subscribeToPresence(callback) {
    this.on('presence:updated', callback);
  }

  subscribeToSessionInvalidation(callback) {
    this.on('auth:sessionInvalidated', callback);
  }

  subscribeToPasswordChange(callback) {
    this.on('user:passwordChanged', callback);
  }

  subscribeToApprovalStatus(callback) {
    this.on('employee:approved', callback);
  }

  emitCheckIn(data) {
    this.emit('attendance:checkIn', data);
  }

  emitCheckOut(data) {
    this.emit('attendance:checkOut', data);
  }

  requestLiveStats() {
    this.emit('stats:request', {});
  }

  requestPresenceList() {
    this.emit('presence:request', {});
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }
}

const realtimeService = new RealtimeService();
export default realtimeService;