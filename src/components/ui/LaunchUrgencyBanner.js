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
      className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white border-b border-emerald-700"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          {/* Left: Professional Label */}
          <div className="flex items-center space-x-3">
            <span className="text-emerald-300 text-xs uppercase tracking-wider font-semibold">Limited Offer</span>
            <div className="hidden md:block h-4 w-px bg-emerald-600"></div>
            <span className="text-sm font-medium">Launch pricing ends soon</span>
          </div>
          
          {/* Center: Pricing Info */}
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-emerald-200">40% off all models</span>
            <span className="text-emerald-400">•</span>
            <span className="hidden lg:inline text-emerald-100">
              PE: <span className="line-through opacity-60">$9,875</span> <span className="font-semibold">$5,925</span>
            </span>
            <span className="hidden lg:inline text-emerald-400">•</span>
            <span className="hidden lg:inline text-emerald-100">
              Public: <span className="line-through opacity-60">$14,750</span> <span className="font-semibold">$8,850</span>
            </span>
          </div>
          
          {/* Right: Countdown Timer */}
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center space-x-1 bg-emerald-950/50 rounded px-3 py-1">
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex space-x-1 font-mono">
                <span className="text-emerald-100">{String(timeLeft.days).padStart(2, '0')}d</span>
                <span className="text-emerald-400">:</span>
                <span className="text-emerald-100">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-emerald-400">:</span>
                <span className="text-emerald-100">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}