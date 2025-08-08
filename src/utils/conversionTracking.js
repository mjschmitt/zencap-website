// src/utils/conversionTracking.js - Conversion Tracking for A/B Tests

import { trackConversion } from './abTesting';

/**
 * Conversion Goals for Zenith Capital Advisors
 * Focused on driving $50K/month revenue through optimized user journey
 */

export const CONVERSION_GOALS = {
  // Primary Revenue Goals
  MODEL_PURCHASE: {
    goal: 'model_purchase',
    category: 'revenue',
    priority: 'high',
    description: 'User completed model purchase'
  },
  CHECKOUT_INITIATED: {
    goal: 'checkout_initiated',
    category: 'revenue',
    priority: 'high',
    description: 'User started checkout process'
  },
  PRICING_PAGE_VIEW: {
    goal: 'pricing_page_view',
    category: 'revenue',
    priority: 'medium',
    description: 'User viewed model pricing'
  },

  // Lead Generation Goals
  EMAIL_SIGNUP: {
    goal: 'email_signup',
    category: 'lead',
    priority: 'high',
    description: 'User provided email address'
  },
  NEWSLETTER_SIGNUP: {
    goal: 'newsletter_signup',
    category: 'lead',
    priority: 'medium',
    description: 'User subscribed to newsletter'
  },
  LEAD_MAGNET_DOWNLOAD: {
    goal: 'lead_magnet_download',
    category: 'lead',
    priority: 'high',
    description: 'User downloaded free template/resource'
  },
  CONTACT_FORM_SUBMIT: {
    goal: 'contact_form_submit',
    category: 'lead',
    priority: 'high',
    description: 'User submitted contact form'
  },

  // Engagement Goals
  MODEL_DETAIL_VIEW: {
    goal: 'model_detail_view',
    category: 'engagement',
    priority: 'medium',
    description: 'User viewed detailed model page'
  },
  EXCEL_PREVIEW: {
    goal: 'excel_preview',
    category: 'engagement',
    priority: 'medium',
    description: 'User opened Excel model preview'
  },
  VIDEO_PLAY: {
    goal: 'video_play',
    category: 'engagement',
    priority: 'low',
    description: 'User played demo video'
  },
  FAQ_EXPAND: {
    goal: 'faq_expand',
    category: 'engagement',
    priority: 'low',
    description: 'User expanded FAQ section'
  },

  // Micro-conversions
  CTA_CLICK: {
    goal: 'cta_click',
    category: 'micro',
    priority: 'low',
    description: 'User clicked call-to-action button'
  },
  SOCIAL_SHARE: {
    goal: 'social_share',
    category: 'micro',
    priority: 'low',
    description: 'User shared content on social media'
  }
};

/**
 * Track purchase conversion with revenue data
 */
export async function trackPurchase(orderData) {
  const { amount, modelSlug, modelTitle, paymentMethod = 'stripe' } = orderData;
  
  await trackConversion(CONVERSION_GOALS.MODEL_PURCHASE.goal, amount, {
    modelSlug,
    modelTitle,
    paymentMethod,
    currency: 'USD',
    timestamp: new Date().toISOString()
  });

  // Also track checkout completion for funnel analysis
  await trackConversion(CONVERSION_GOALS.CHECKOUT_INITIATED.goal, amount, {
    modelSlug,
    completed: true
  });
}

/**
 * Track email signup with context
 */
export async function trackEmailSignup(email, context = {}) {
  const { source = 'unknown', incentive = null, page = null } = context;
  
  // Track general email signup
  await trackConversion(CONVERSION_GOALS.EMAIL_SIGNUP.goal, null, {
    email,
    source,
    incentive,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : null)
  });

  // Track specific signup type
  if (source === 'newsletter') {
    await trackConversion(CONVERSION_GOALS.NEWSLETTER_SIGNUP.goal, null, {
      email,
      page: page || (typeof window !== 'undefined' ? window.location.pathname : null)
    });
  } else if (incentive) {
    await trackConversion(CONVERSION_GOALS.LEAD_MAGNET_DOWNLOAD.goal, null, {
      email,
      incentive,
      page: page || (typeof window !== 'undefined' ? window.location.pathname : null)
    });
  }
}

/**
 * Track contact form submission
 */
export async function trackContactForm(formData) {
  const { name, email, company, interest, message } = formData;
  
  await trackConversion(CONVERSION_GOALS.CONTACT_FORM_SUBMIT.goal, null, {
    email,
    company,
    interest,
    hasMessage: !!message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Track model engagement events
 */
export async function trackModelEngagement(modelSlug, engagementType, additionalData = {}) {
  let goal;
  
  switch (engagementType) {
    case 'detail_view':
      goal = CONVERSION_GOALS.MODEL_DETAIL_VIEW.goal;
      break;
    case 'excel_preview':
      goal = CONVERSION_GOALS.EXCEL_PREVIEW.goal;
      break;
    case 'pricing_view':
      goal = CONVERSION_GOALS.PRICING_PAGE_VIEW.goal;
      break;
    default:
      goal = 'model_interaction';
  }

  await trackConversion(goal, null, {
    modelSlug,
    engagementType,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}

/**
 * Track CTA button clicks
 */
export async function trackCTAClick(ctaText, context = {}) {
  const { page = null, section = null, variant = null } = context;
  
  await trackConversion(CONVERSION_GOALS.CTA_CLICK.goal, null, {
    ctaText,
    page: page || (typeof window !== 'undefined' ? window.location.pathname : null),
    section,
    variant,
    timestamp: new Date().toISOString()
  });
}

/**
 * Enhanced page view tracking with conversion context
 */
export function trackPageViewConversion(page, metadata = {}) {
  // Track specific high-value page views as conversions
  if (page.includes('/models/') && page !== '/models') {
    const modelSlug = page.split('/models/')[1];
    trackModelEngagement(modelSlug, 'detail_view', metadata);
  }
  
  if (page.includes('/checkout') || page.includes('/buy')) {
    trackConversion(CONVERSION_GOALS.CHECKOUT_INITIATED.goal, null, {
      page,
      ...metadata
    });
  }
}

/**
 * Set up automatic conversion tracking
 */
export function initializeConversionTracking() {
  if (typeof window === 'undefined') return;

  // Track outbound link clicks
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link && link.href) {
      // Track external links
      if (link.hostname !== window.location.hostname) {
        trackConversion('outbound_link_click', null, {
          url: link.href,
          text: link.textContent?.trim(),
          page: window.location.pathname
        });
      }
      
      // Track specific internal links
      if (link.href.includes('mailto:')) {
        trackConversion('email_link_click', null, {
          email: link.href.replace('mailto:', ''),
          page: window.location.pathname
        });
      }
      
      if (link.href.includes('tel:')) {
        trackConversion('phone_link_click', null, {
          phone: link.href.replace('tel:', ''),
          page: window.location.pathname
        });
      }
    }
  });

  // Track form submissions
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.tagName === 'FORM') {
      const formType = form.id || form.className || 'unknown';
      
      // Extract form data for context
      const formData = new FormData(form);
      const data = {};
      for (let [key, value] of formData.entries()) {
        if (!key.includes('password') && !key.includes('token')) {
          data[key] = value;
        }
      }
      
      trackConversion('form_submit', null, {
        formType,
        formData: data,
        page: window.location.pathname
      });
    }
  });

  // Track scroll depth for engagement
  let maxScrollDepth = 0;
  const trackScrollDepth = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      
      // Track milestone scroll depths
      if (scrollPercent >= 25 && maxScrollDepth < 25) {
        trackConversion('scroll_25', null, { page: window.location.pathname });
      }
      if (scrollPercent >= 50 && maxScrollDepth < 50) {
        trackConversion('scroll_50', null, { page: window.location.pathname });
      }
      if (scrollPercent >= 75 && maxScrollDepth < 75) {
        trackConversion('scroll_75', null, { page: window.location.pathname });
      }
      if (scrollPercent >= 90 && maxScrollDepth < 90) {
        trackConversion('scroll_90', null, { page: window.location.pathname });
      }
    }
  };

  window.addEventListener('scroll', trackScrollDepth, { passive: true });

  // Track time on page
  const startTime = Date.now();
  
  // Track when user is about to leave
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    
    // Track significant time milestones
    if (timeOnPage >= 30) {
      trackConversion('time_on_page_30s', null, { 
        timeOnPage,
        page: window.location.pathname 
      });
    }
    if (timeOnPage >= 120) {
      trackConversion('time_on_page_2min', null, { 
        timeOnPage,
        page: window.location.pathname 
      });
    }
    if (timeOnPage >= 300) {
      trackConversion('time_on_page_5min', null, { 
        timeOnPage,
        page: window.location.pathname 
      });
    }
  });
}

/**
 * Revenue-focused conversion rate optimization utilities
 */
export const CROUtils = {
  // Calculate conversion rate between two events
  calculateConversionRate: (conversions, exposures) => {
    if (exposures === 0) return 0;
    return (conversions / exposures) * 100;
  },

  // Calculate revenue per visitor
  calculateRPV: (totalRevenue, totalVisitors) => {
    if (totalVisitors === 0) return 0;
    return totalRevenue / totalVisitors;
  },

  // Calculate average order value
  calculateAOV: (totalRevenue, totalOrders) => {
    if (totalOrders === 0) return 0;
    return totalRevenue / totalOrders;
  },

  // Calculate customer lifetime value (simple)
  calculateCLV: (aov, purchaseFrequency = 1.2, customerLifespan = 2) => {
    return aov * purchaseFrequency * customerLifespan;
  },

  // Monthly revenue projection
  projectMonthlyRevenue: (currentRPV, monthlyVisitors, conversionRate) => {
    const expectedOrders = (monthlyVisitors * conversionRate) / 100;
    return currentRPV * monthlyVisitors;
  }
};