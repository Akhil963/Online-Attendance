import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { noticeAPI } from '../services/api';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotices, setRecentNotices] = useState([]);

  useEffect(() => {
    fetchUnreadNotices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadNotices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadNotices = async () => {
    try {
      const response = await noticeAPI.getNotices();
      const notices = response.data.notices || [];
      
      // Get notices from last 24 hours
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const recentNotifications = notices
        .filter(n => new Date(n.createdAt) >= today)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setUnreadCount(recentNotifications.length);
      setRecentNotices(recentNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800">Recent Notices</h3>
          </div>
          
          {recentNotices.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {recentNotices.map((notice) => (
                <div
                  key={notice._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    notice.isUrgent ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    {notice.isUrgent && (
                      <span className="text-red-600 font-bold text-lg">⚠️</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate text-sm">
                        {notice.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notice.createdAt).toLocaleTimeString()}
                      </p>
                      {notice.notificationChannels && notice.notificationChannels.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {notice.notificationChannels.includes('email') && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Email</span>
                          )}
                          {notice.notificationChannels.includes('whatsapp') && (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">WhatsApp</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No recent notifications</p>
            </div>
          )}
          
          <div className="p-3 border-t border-gray-200 text-center">
            <a
              href="/notices"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => setShowDropdown(false)}
            >
              View all notices →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;
