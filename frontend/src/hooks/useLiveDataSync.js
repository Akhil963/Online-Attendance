import { useEffect, useMemo, useState } from 'react';
import realtimeService from '../services/realtimeService';
import { useAuth } from './useAuth';
import { playNotificationSound } from '../utils/notificationSound';

export const useLiveDataSync = ({
  onRefresh,
  events = [],
  soundEvents = [],
  pollMs = 30000,
  enabled = true
}) => {
  const { token, user } = useAuth();
  const [isLive, setIsLive] = useState(realtimeService.isConnected());
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const eventsKey = useMemo(() => events.join('|'), [events]);
  const soundEventsKey = useMemo(() => soundEvents.join('|'), [soundEvents]);

  useEffect(() => {
    if (!enabled || !token || typeof onRefresh !== 'function') {
      setIsLive(false);
      return;
    }

    let intervalId;
    let active = true;
    const activeEvents = eventsKey ? eventsKey.split('|').filter(Boolean) : [];
    const soundEventSet = new Set(soundEventsKey ? soundEventsKey.split('|').filter(Boolean) : []);

    const refresh = () => {
      if (!active) {
        return;
      }
      Promise.resolve(onRefresh())
        .then(() => {
          setLastSyncAt(new Date());
        })
        .catch(() => {});
    };

    const handlers = activeEvents.map((eventName) => {
      const handler = () => {
        if (soundEventSet.has(eventName)) {
          playNotificationSound();
        }
        refresh();
      };
      realtimeService.on(eventName, handler);
      return { eventName, handler };
    });

    realtimeService.connect(token).then(() => {
      setIsLive(true);
      if (user?.role === 'admin') {
        realtimeService.emit('join:admin', {});
      }
    }).catch(() => {
      setIsLive(false);
    });

    if (pollMs > 0) {
      intervalId = setInterval(refresh, pollMs);
    }

    return () => {
      active = false;
      handlers.forEach(({ eventName, handler }) => {
        realtimeService.off(eventName, handler);
      });
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled, token, user?.role, onRefresh, pollMs, eventsKey, soundEventsKey]);

  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const heartbeat = setInterval(() => {
      setIsLive(realtimeService.isConnected());
    }, 2000);

    return () => clearInterval(heartbeat);
  }, [enabled, token]);

  return { isLive, lastSyncAt };
};

export default useLiveDataSync;
