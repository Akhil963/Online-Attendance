import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import realtimeService from '../services/realtimeService';
import { useAuth } from './useAuth';
import { playNotificationSound } from '../utils/notificationSound';

export const useLiveDataSync = ({
  onRefresh,
  events = [],
  soundEvents = [],
  pollMs = 0,  // Disabled by default - only rely on socket events
  enabled = true
}) => {
  const { token, user } = useAuth();
  const [isLive, setIsLive] = useState(realtimeService.isConnected());
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const eventsKey = useMemo(() => events.join('|'), [events]);
  const soundEventsKey = useMemo(() => soundEvents.join('|'), [soundEvents]);
  
  // Use refs to track state across renders
  const isMountedRef = useRef(true);
  const connectionHandledRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  const lastRefreshTimeRef = useRef(0);

  // Keep onRefresh ref updated
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Debounce helper - prevents rapid-fire refreshes
  const canRefresh = useCallback(() => {
    const now = Date.now();
    const DEBOUNCE_MS = 2000; // Minimum 2 seconds between refreshes
    if (now - lastRefreshTimeRef.current < DEBOUNCE_MS) {
      return false;
    }
    lastRefreshTimeRef.current = now;
    return true;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    connectionHandledRef.current = false;
    
    if (!enabled || !token || typeof onRefresh !== 'function') {
      setIsLive(false);
      return;
    }

    const activeEvents = eventsKey ? eventsKey.split('|').filter(Boolean) : [];
    const soundEventSet = new Set(soundEventsKey ? soundEventsKey.split('|').filter(Boolean) : []);

    // Handle refresh with debouncing
    const handleRefresh = () => {
      if (!isMountedRef.current) return;
      if (!canRefresh()) return;
      
      Promise.resolve(onRefreshRef.current())
        .then(() => {
          if (isMountedRef.current) {
            setLastSyncAt(new Date());
          }
        })
        .catch(() => {});
    };

    // Set up socket event handlers
    const handlers = activeEvents.map((eventName) => {
      const handler = () => {
        if (soundEventSet.has(eventName)) {
          playNotificationSound();
        }
        handleRefresh();
      };
      realtimeService.on(eventName, handler);
      return { eventName, handler };
    });

    // Connect to realtime service
    if (!connectionHandledRef.current) {
      connectionHandledRef.current = true;
      realtimeService.connect(token).then(() => {
        if (isMountedRef.current) {
          setIsLive(true);
          if (user?.role === 'admin') {
            realtimeService.emit('join:admin', {});
          }
        }
      }).catch(() => {
        if (isMountedRef.current) {
          setIsLive(false);
        }
      });
    }

    // Polling disabled by default - only use if pollMs > 0
    let intervalId;
    if (pollMs > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current && canRefresh()) {
          handleRefresh();
        }
      }, pollMs);
    }

    return () => {
      isMountedRef.current = false;
      handlers.forEach(({ eventName, handler }) => {
        realtimeService.off(eventName, handler);
      });
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token, user?.role, pollMs, eventsKey, soundEventsKey, canRefresh]);

  // Heartbeat to update connection status
  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const heartbeat = setInterval(() => {
      if (isMountedRef.current) {
        setIsLive(realtimeService.isConnected());
      }
    }, 5000); // Check every 5 seconds instead of 2

    return () => clearInterval(heartbeat);
  }, [enabled, token]);

  return { isLive, lastSyncAt };
};

export default useLiveDataSync;
