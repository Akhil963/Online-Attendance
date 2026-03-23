import io from 'socket.io-client';

const isLocalhostUrl = (url = '') => /\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);

const getSocketUrl = () => {
  const configuredSocketUrl = (process.env.REACT_APP_SOCKET_URL || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const browserHost = isBrowser ? window.location.hostname : '';
  const isLocalBrowser = ['localhost', '127.0.0.1'].includes(browserHost);

  if (configuredSocketUrl) {
    const shouldIgnoreLocalhostConfig = isBrowser && !isLocalBrowser && isLocalhostUrl(configuredSocketUrl);
    if (!shouldIgnoreLocalhostConfig) {
      return configuredSocketUrl.replace(/\/+$/, '');
    }
  }

  if (isBrowser && !isLocalBrowser) {
    return window.location.origin;
  }

  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

class RealtimeService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.connected = false;
    this.connectPromise = null;
    this.connectionId = 0; // Track connection attempts to prevent stale callbacks
  }

  connect(token) {
    if (!token) {
      return Promise.reject(new Error('No token provided'));
    }

    // If already connected with a valid socket, return resolved promise
    if (this.socket && this.connected) {
      return Promise.resolve();
    }

    // If a connection is in progress, return the existing promise
    if (this.connectPromise) {
      return this.connectPromise;
    }

    const currentConnectionId = ++this.connectionId;

    this.connectPromise = new Promise((resolve, reject) => {
      try {
        // Clean up any existing socket completely
        if (this.socket) {
          this.socket.removeAllListeners();
          this.socket.disconnect();
          this.socket = null;
        }
        this.connected = false;

        this.socket = io(SOCKET_URL, {
          auth: {
            token: token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling'],
          timeout: 20000
        });

        const connectionTimeout = setTimeout(() => {
          if (!this.connected && currentConnectionId === this.connectionId) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.connectPromise = null;
            reject(new Error('Connection timeout'));
          }
        }, 20000);

        this.socket.on('connect', () => {
          clearTimeout(connectionTimeout);
          if (currentConnectionId !== this.connectionId) {
            // Stale connection attempt, ignore
            return;
          }
          this.connected = true;
          console.log('✓ Real-time connection established');
          this.connectPromise = null;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectionTimeout);
          if (currentConnectionId !== this.connectionId) {
            // Stale connection attempt, ignore
            return;
          }
          this.connected = false;
          console.error('✗ Connection error:', error.message);
          this.connectPromise = null;
          reject(error);
        });

        this.socket.on('disconnect', () => {
          this.connected = false;
          console.log('✗ Real-time connection disconnected');
        });

        // Handle errors gracefully
        this.socket.on('error', (error) => {
          console.error('✗ Socket error:', error);
        });
      } catch (error) {
        clearTimeout(connectionTimeout);
        this.connected = false;
        console.error('✗ Failed to initialize socket:', error);
        this.connectPromise = null;
        reject(error);
      }
    });

    return this.connectPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
    this.connectPromise = null;
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