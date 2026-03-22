import React, { useState, useEffect, useCallback } from 'react';
import { noticeAPI } from '../services/api';
import moment from 'moment';
import { AlertCircle } from 'lucide-react';
import useLiveDataSync from '../hooks/useLiveDataSync';

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticeAPI.getNotices();
      setNotices(response.data.notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const { isLive, lastSyncAt } = useLiveDataSync({
    onRefresh: fetchNotices,
    events: ['notification:new'],
    soundEvents: ['notification:new'],
    pollMs: 30000,
    enabled: true
  });

  const filteredNotices = selectedCategory === 'all'
    ? notices
    : notices.filter(notice => notice.category === selectedCategory);

  const categories = ['all', 'announcement', 'meeting', 'policy', 'event', 'urgent'];

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Notices Board</h1>
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 bg-white">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{isLive ? 'Live' : 'Syncing'}</span>
          {lastSyncAt && (
            <span className="text-[10px] text-gray-400 font-semibold">{new Date(lastSyncAt).toLocaleTimeString()}</span>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? 'All Notices' : category}
            </button>
          ))}
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.length > 0 ? (
            filteredNotices.map(notice => (
              <div
                key={notice._id}
                className={`rounded-lg shadow hover:shadow-lg transition p-6 border-l-4 ${
                  notice.isUrgent 
                    ? 'bg-red-50 border-red-600' 
                    : 'bg-white border-blue-600'
                }`}
              >
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notice.isUrgent && (
                        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                      )}
                      <h3 className="text-2xl font-bold text-gray-800">{notice.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Posted by {notice.postedBy?.name} • {moment(notice.createdAt).format('(dddd) MMMM DD, YYYY hh:mm A')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize flex-shrink-0">
                    {notice.category}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{notice.content}</p>

                {notice.expiryDate && (
                  <p className="text-sm text-red-600">
                    Expires: {moment(notice.expiryDate).format('MMMM DD YYYY')}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-lg">
              <p className="text-gray-600">No notices found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesPage;
