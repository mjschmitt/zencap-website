// src/utils/abTesting.js - A/B Testing Framework for Zenith Capital Advisors

/**
 * A/B Testing Framework
 * 
 * Core infrastructure for running experiments to optimize conversion rates
 * and drive toward $50K/month revenue goal.
 */

import { v4 as uuidv4 } from 'uuid';

// Test configurations - easily manageable experiments
const ACTIVE_TESTS = {
  pricing_display_v1: {
    id: 'pricing_display_v1',
    name: 'Pricing Display Variations',
    description: 'Test different pricing display formats for model pages',
    status: 'active',
    variants: {
      control: {
        name: 'Standard Pricing',
        weight: 50,
        config: {
          showStrikethrough: false,
          emphasizeValue: false,
          showMoneyBackGuarantee: false,
          priceFormat: 'standard'
        }
      },
      variant_a: {
        name: 'Value Emphasis',
        weight: 50,
        config: {
          showStrikethrough: true,
          originalPrice: 6985,
          emphasizeValue: true,
          showMoneyBackGuarantee: true,
          priceFormat: 'value_emphasis',
          valueProps: [
            'Save $2,000 vs hiring consultant',
            '30-day money-back guarantee',
            'Lifetime updates included'
          ]
        }
      }
    },
    targeting: {
      includeNewVisitors: true,
      includeReturningVisitors: true,
      geotargeting: null,
      deviceTypes: ['desktop', 'mobile', 'tablet']
    },
    startDate: new Date().toISOString(),
    endDate: null,
    goals: {
      primary: 'model_purchase_conversion',
      secondary: ['pricing_page_engagement', 'email_signup']
    }
  },

  homepage_hero_v1: {
    id: 'homepage_hero_v1',
    name: 'Homepage Hero Section',
    description: 'Test different value propositions in hero section',
    status: 'draft',
    variants: {
      control: {
        name: 'Current Hero',
        weight: 50,
        config: {
          headline: 'Premium Financial Models',
          subheadline: 'Built by Wall Street professionals',
          ctaText: 'Explore Models'
        }
      },
      variant_a: {
        name: 'ROI-Focused Hero',
        weight: 50,
        config: {
          headline: 'Save 40+ Hours Per Deal',
          subheadline: 'Pre-built models trusted by 500+ investment professionals',
          ctaText: 'See ROI Calculator'
        }
      }
    }
  },

  email_capture_v1: {
    id: 'email_capture_v1',
    name: 'Email Capture Strategy',
    description: 'Test different lead magnets and capture strategies',
    status: 'draft',
    variants: {
      control: {
        name: 'Newsletter Signup',
        weight: 33,
        config: {
          type: 'newsletter',
          incentive: null
        }
      },
      variant_a: {
        name: 'Free Sample Model',
        weight: 33,
        config: {
          type: 'lead_magnet',
          incentive: 'Free DCF Template',
          incentiveValue: '$297 value'
        }
      },
      variant_b: {
        name: 'Market Insights',
        weight: 34,
        config: {
          type: 'content',
          incentive: 'Weekly Market Analysis',
          incentiveValue: 'Exclusive insights'
        }
      }
    }
  }
};

/**
 * User Segmentation for Targeting
 */
export const USER_SEGMENTS = {
  NEW_VISITOR: 'new_visitor',
  RETURNING_VISITOR: 'returning_visitor',
  ENGAGED_USER: 'engaged_user', // 2+ page views
  PRICE_SENSITIVE: 'price_sensitive', // viewed pricing multiple times
  HIGH_INTENT: 'high_intent', // viewed model details
  ENTERPRISE: 'enterprise', // large company domain
  INDIVIDUAL: 'individual' // gmail, yahoo, etc.
};

/**
 * Generate or retrieve user session ID for consistent experience
 */
export function getUserSessionId() {
  if (typeof window === 'undefined') return null;
  
  let sessionId = localStorage.getItem('ab_session_id');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('ab_session_id', sessionId);
    localStorage.setItem('session_start', new Date().toISOString());
  }
  return sessionId;
}

/**
 * Determine user segment based on behavior
 */
export function getUserSegment() {
  if (typeof window === 'undefined') return USER_SEGMENTS.NEW_VISITOR;
  
  const sessionData = {
    isNewVisitor: !localStorage.getItem('returning_visitor'),
    pageViews: parseInt(localStorage.getItem('page_views') || '0'),
    pricingViews: parseInt(localStorage.getItem('pricing_views') || '0'),
    modelDetailViews: parseInt(localStorage.getItem('model_detail_views') || '0'),
    email: localStorage.getItem('user_email'),
    domain: localStorage.getItem('user_email')?.split('@')[1]
  };

  // Mark as returning visitor
  if (!sessionData.isNewVisitor) {
    localStorage.setItem('returning_visitor', 'true');
  }

  // Determine segment based on behavior
  if (sessionData.modelDetailViews >= 2) return USER_SEGMENTS.HIGH_INTENT;
  if (sessionData.pricingViews >= 3) return USER_SEGMENTS.PRICE_SENSITIVE;
  if (sessionData.pageViews >= 3) return USER_SEGMENTS.ENGAGED_USER;
  if (sessionData.domain && isEnterpriseDomain(sessionData.domain)) return USER_SEGMENTS.ENTERPRISE;
  if (sessionData.domain && isPersonalDomain(sessionData.domain)) return USER_SEGMENTS.INDIVIDUAL;
  if (sessionData.isNewVisitor) return USER_SEGMENTS.NEW_VISITOR;
  
  return USER_SEGMENTS.RETURNING_VISITOR;
}

/**
 * Check if domain indicates enterprise user
 */
function isEnterpriseDomain(domain) {
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  return !personalDomains.includes(domain.toLowerCase());
}

/**
 * Check if domain indicates personal user
 */
function isPersonalDomain(domain) {
  const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  return personalDomains.includes(domain.toLowerCase());
}

/**
 * Hash function for consistent variant assignment
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Assign user to test variant based on session ID
 */
export function getTestVariant(testId, userId = null) {
  const test = ACTIVE_TESTS[testId];
  if (!test || test.status !== 'active') {
    return null;
  }

  const sessionId = userId || getUserSessionId();
  if (!sessionId) return null;

  // Check if user is in target segment
  const userSegment = getUserSegment();
  if (!shouldIncludeInTest(test, userSegment)) {
    return null;
  }

  // Generate consistent hash for this user + test combination
  const hash = hashString(`${sessionId}_${testId}`);
  const bucket = hash % 100;

  // Assign variant based on weights
  let cumulativeWeight = 0;
  for (const [variantId, variant] of Object.entries(test.variants)) {
    cumulativeWeight += variant.weight;
    if (bucket < cumulativeWeight) {
      // Store assignment for consistency
      if (typeof window !== 'undefined') {
        const assignments = JSON.parse(localStorage.getItem('ab_assignments') || '{}');
        assignments[testId] = {
          variant: variantId,
          assignedAt: new Date().toISOString(),
          sessionId
        };
        localStorage.setItem('ab_assignments', JSON.stringify(assignments));
      }
      
      return {
        testId,
        variant: variantId,
        config: variant.config,
        name: variant.name
      };
    }
  }

  // Fallback to control
  return {
    testId,
    variant: 'control',
    config: test.variants.control.config,
    name: test.variants.control.name
  };
}

/**
 * Check if user should be included in test based on targeting rules
 */
function shouldIncludeInTest(test, userSegment) {
  const { targeting } = test;
  
  // Check visitor type targeting
  if (!targeting.includeNewVisitors && userSegment === USER_SEGMENTS.NEW_VISITOR) {
    return false;
  }
  if (!targeting.includeReturningVisitors && userSegment === USER_SEGMENTS.RETURNING_VISITOR) {
    return false;
  }

  // Add more targeting logic as needed (geo, device, etc.)
  
  return true;
}

/**
 * Track test exposure (user saw the test)
 */
export async function trackTestExposure(testId, variant, additionalData = {}) {
  const sessionId = getUserSessionId();
  if (!sessionId) return;

  const exposureData = {
    eventType: 'ab_test_exposure',
    testId,
    variant,
    sessionId,
    userSegment: getUserSegment(),
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : null,
    ...additionalData
  };

  // Send to analytics API
  try {
    await fetch('/api/ab-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exposureData)
    });
  } catch (error) {
    console.error('Failed to track test exposure:', error);
  }

  // Store locally as backup
  if (typeof window !== 'undefined') {
    const exposures = JSON.parse(localStorage.getItem('ab_exposures') || '[]');
    exposures.push(exposureData);
    localStorage.setItem('ab_exposures', JSON.stringify(exposures.slice(-50))); // Keep last 50
  }
}

/**
 * Track conversion event
 */
export async function trackConversion(goal, value = null, additionalData = {}) {
  const sessionId = getUserSessionId();
  if (!sessionId) return;

  // Get all active test assignments
  const assignments = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('ab_assignments') || '{}')
    : {};

  const conversionData = {
    eventType: 'ab_conversion',
    goal,
    value,
    sessionId,
    userSegment: getUserSegment(),
    timestamp: new Date().toISOString(),
    page: typeof window !== 'undefined' ? window.location.pathname : null,
    testAssignments: assignments,
    ...additionalData
  };

  // Send to analytics API
  try {
    await fetch('/api/ab-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionData)
    });
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }

  // Store locally as backup
  if (typeof window !== 'undefined') {
    const conversions = JSON.parse(localStorage.getItem('ab_conversions') || '[]');
    conversions.push(conversionData);
    localStorage.setItem('ab_conversions', JSON.stringify(conversions.slice(-20))); // Keep last 20
  }
}

/**
 * Track user behavior for segmentation
 */
export function trackPageView(page) {
  if (typeof window === 'undefined') return;
  
  const pageViews = parseInt(localStorage.getItem('page_views') || '0') + 1;
  localStorage.setItem('page_views', pageViews.toString());
  
  // Track specific page types
  if (page.includes('/models/')) {
    const modelDetailViews = parseInt(localStorage.getItem('model_detail_views') || '0') + 1;
    localStorage.setItem('model_detail_views', modelDetailViews.toString());
  }
  
  if (page.includes('pricing') || page.includes('buy')) {
    const pricingViews = parseInt(localStorage.getItem('pricing_views') || '0') + 1;
    localStorage.setItem('pricing_views', pricingViews.toString());
  }
}

/**
 * Get active tests for admin dashboard
 */
export function getActiveTests() {
  return Object.values(ACTIVE_TESTS).filter(test => test.status === 'active');
}

/**
 * Get all tests (including drafts) for admin dashboard
 */
export function getAllTests() {
  return ACTIVE_TESTS;
}

/**
 * Helper hook for React components
 */
export function useABTest(testId) {
  if (typeof window === 'undefined') return null;
  
  const variant = getTestVariant(testId);
  
  // Track exposure when component mounts
  React.useEffect(() => {
    if (variant) {
      trackTestExposure(testId, variant.variant);
    }
  }, [testId, variant]);

  return variant;
}

// Export test configurations for admin dashboard
export { ACTIVE_TESTS };