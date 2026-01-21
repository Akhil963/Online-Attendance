import { useEffect, useState } from 'react';
import realtimeService from '../services/realtimeService';
import { useAuth } from './useAuth';

export const useRealtime = () => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (token && realtimeService) {
      realtimeService.connect(token)
        .then(() => {
          setIsConnected(true);
        })
        .catch((error) => {
          console.error('Failed to connect to real-time service:', error);
          setIsConnected(false);
        });
    }

    return () => {
      // Don't disconnect on unmount to persist connection
    };
  }, [token]);

  return { isConnected };
};

// Hook for real-time attendance updates
export const useRealtimeAttendance = () => {
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    const handleAttendanceUpdate = (data) => {
      setAttendance(data);
    };

    realtimeService.subscribeToAttendanceUpdates(handleAttendanceUpdate);

    return () => {
      realtimeService.off('attendance:updated', handleAttendanceUpdate);
    };
  }, []);

  return attendance;
};

// Hook for real-time leave updates
export const useRealtimeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleLeaveUpdate = (data) => {
      setLeaves(data.leaves || []);
      setPendingCount(data.pendingCount || 0);
    };

    realtimeService.subscribeToLeaveUpdates(handleLeaveUpdate);

    return () => {
      realtimeService.off('leave:updated', handleLeaveUpdate);
    };
  }, []);

  return { leaves, pendingCount };
};

// Hook for real-time statistics
export const useRealtimeStats = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeaveToday: 0,
    pendingLeaves: 0
  });

  useEffect(() => {
    const handleStatsUpdate = (data) => {
      setStats(data);
    };

    realtimeService.subscribeToStatisticsUpdates(handleStatsUpdate);
    
    // Request initial stats
    realtimeService.requestLiveStats();

    return () => {
      realtimeService.off('stats:updated', handleStatsUpdate);
    };
  }, []);

  return stats;
};

// Hook for real-time notifications
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50));
    };

    realtimeService.subscribeToNotifications(handleNewNotification);

    return () => {
      realtimeService.off('notification:new', handleNewNotification);
    };
  }, []);

  return notifications;
};

// Hook for real-time presence (who's online)
export const useRealtimePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const handlePresenceUpdate = (data) => {
      setOnlineUsers(data.onlineUsers || []);
    };

    realtimeService.subscribeToPresence(handlePresenceUpdate);
    realtimeService.requestPresenceList();

    return () => {
      realtimeService.off('presence:updated', handlePresenceUpdate);
    };
  }, []);

  return onlineUsers;
};

export default useRealtime;
