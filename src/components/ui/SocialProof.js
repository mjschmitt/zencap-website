import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Social Proof Widget with Real-time Purchase Notifications
export default function SocialProof() {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    // Fetch initial social proof data
    fetchRecentPurchases();

    // Set up interval to refresh notifications every 30 seconds
    const interval = setInterval(() => {
      fetchRecentPurchases();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      showNextNotification();
    }
  }, [notifications]);

  const fetchRecentPurchases = async () => {
    try {
      const response = await fetch('/api/analytics/social-proof');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch social proof data:', error);
    }
  };

  const showNextNotification = () => {
    if (notifications.length === 0) return;

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    setCurrentNotification(randomNotification);

    // Hide notification after 4 seconds
    setTimeout(() => {
      setCurrentNotification(null);
    }, 4000);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const purchaseTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - purchaseTime) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (!currentNotification) return null;

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-start space-x-3">
            {/* Purchase Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {currentNotification.type === 'purchase' ? (
                      <>Someone from <span className="font-semibold">{currentNotification.location}</span> just purchased:</>
                    ) : (
                      <>Someone from <span className="font-semibold">{currentNotification.location}</span> is viewing:</>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {currentNotification.modelTitle}
                  </p>
                  {currentNotification.amount && (
                    <p className="text-sm font-bold text-green-600 mt-1">
                      ${currentNotification.amount.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(currentNotification.timestamp)}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setCurrentNotification(null)}
                  className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.3 }}
            className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">Live Activity</span>
              </div>
              <span className="text-blue-600">
                {notifications.filter(n => n.type === 'purchase').length} sales this week
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Statistics Bar Component for conversion optimization
export function SocialProofStats() {
  const [stats, setStats] = useState({
    totalSales: 0,
    activeUsers: 0,
    recentPurchases: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/social-stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch social proof stats:', error);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-t border-blue-100 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">
              <span className="font-semibold text-blue-700">{stats.activeUsers}</span> professionals online
            </span>
          </div>
          
          <div className="hidden sm:flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">
              <span className="font-semibold text-green-700">{stats.totalSales}</span> models sold
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span className="text-gray-700">
              <span className="font-semibold text-teal-700">${(stats.totalRevenue / 1000).toFixed(0)}K+</span> in sales
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <span className="text-gray-700">
              <span className="font-semibold text-orange-700">{stats.recentPurchases}</span> bought today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Urgency Timer Component
export function UrgencyTimer({ targetDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('EXPIRED');
        onExpire && onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft === 'EXPIRED') return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-red-800">Limited Time Offer Ends In:</span>
        </div>
        <span className="text-lg font-bold text-red-700 tabular-nums">{timeLeft}</span>
      </div>
    </div>
  );
}