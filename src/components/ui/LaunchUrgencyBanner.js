import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function LaunchUrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set launch deadline to 7 days from now
    const launchDeadline = new Date();
    launchDeadline.setDate(launchDeadline.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDeadline.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-red-600 to-orange-600 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">
              <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="font-bold text-lg">LAUNCH SPECIAL</span>
            <div className="animate-pulse">
              <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium">
              Save 40% on All Models - Limited Time Only!
            </p>
            <p className="text-sm opacity-90">
              Original price $4,985 → <span className="font-bold text-yellow-300">Launch price $2,985</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span>Ends in:</span>
            <div className="flex space-x-2">
              <div className="bg-white/20 rounded px-2 py-1">
                <span className="font-bold">{timeLeft.days}d</span>
              </div>
              <div className="bg-white/20 rounded px-2 py-1">
                <span className="font-bold">{timeLeft.hours}h</span>
              </div>
              <div className="bg-white/20 rounded px-2 py-1">
                <span className="font-bold">{timeLeft.minutes}m</span>
              </div>
              <div className="bg-white/20 rounded px-2 py-1">
                <span className="font-bold">{timeLeft.seconds}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}