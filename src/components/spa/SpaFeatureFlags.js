// src/components/spa/SpaFeatureFlags.js - Feature Flag System for Progressive SPA Rollout
import { createContext, useContext, useState, useEffect } from 'react';

const FeatureFlagContext = createContext({
  flags: {},
  isEnabled: () => false,
  setFlag: () => {},
  userId: null,
  segment: 'default'
});

export const useFeatureFlags = () => useContext(FeatureFlagContext);

// Default feature flag configuration
const DEFAULT_FLAGS = {
  spa_hybrid_routing: {
    enabled: true,
    rollout: 100,
    segments: ['all'],
    description: 'Enable hybrid SPA routing system'
  },
  
  optimized_motion: {
    enabled: true,
    rollout: 100,
    segments: ['all'],
    description: 'Device-adaptive motion system'
  },
  
  lazy_load_manager: {
    enabled: true,
    rollout: 90,
    segments: ['all'],
    description: 'Intelligent component lazy loading'
  },
  
  performance_monitoring: {
    enabled: true,
    rollout: 100,
    segments: ['all'],
    description: 'Real-time performance monitoring'
  }
};

// User segmentation logic
const getUserSegment = (userId) => {
  if (!userId) return 'anonymous';
  const segments = ['default', 'beta', 'power_users'];
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return segments[hash % segments.length];
};

// Rollout percentage check
const isInRollout = (userId, percentage) => {
  if (percentage >= 100) return true;
  if (percentage <= 0) return false;
  
  const hash = (userId || 'anonymous').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 100) < percentage;
};

export default function SpaFeatureFlags({ children, userId = null, customFlags = {} }) {
  const [flags, setFlags] = useState({ ...DEFAULT_FLAGS, ...customFlags });
  const [userSegment, setUserSegment] = useState('default');
  const [performanceGate, setPerformanceGate] = useState(true);

  // Initialize user segment
  useEffect(() => {
    const segment = getUserSegment(userId);
    setUserSegment(segment);
  }, [userId]);

  // Feature flag evaluation
  const isEnabled = (flagName, overrides = {}) => {
    const flag = flags[flagName];
    if (!flag) return false;
    
    if (overrides[flagName] !== undefined) {
      return overrides[flagName];
    }
    
    if (!flag.enabled) return false;
    
    if (flag.segments && flag.segments.length > 0) {
      if (!flag.segments.includes('all') && !flag.segments.includes(userSegment)) {
        return false;
      }
    }
    
    if (!isInRollout(userId, flag.rollout)) {
      return false;
    }
    
    return true;
  };

  // Update flag configuration
  const setFlag = (flagName, config) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: {
        ...prev[flagName],
        ...config
      }
    }));
  };

  const contextValue = {
    flags,
    isEnabled,
    setFlag,
    userId,
    segment: userSegment,
    performanceGate
  };

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Component wrapper for feature-flagged components
export function FeatureGate({ flag, children, fallback = null }) {
  const { isEnabled } = useFeatureFlags();
  const enabled = isEnabled(flag);
  
  return enabled ? children : fallback;
}