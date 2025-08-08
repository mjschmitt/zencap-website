// Revenue Attribution Tracking with UTM Parameters
// Track all revenue sources and attribution paths

export class AttributionTracker {
  constructor() {
    this.sessionData = this.initializeSessionData();
  }

  // Initialize session data and capture UTM parameters
  initializeSessionData() {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    // Capture UTM parameters
    const utmData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content')
    };

    // Determine traffic source if no UTM parameters
    const trafficSource = this.determineTrafficSource(utmData, referrer);

    // Get or create session ID
    let sessionId = sessionStorage.getItem('zc_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('zc_session_id', sessionId);
    }

    // Store attribution data in session storage
    const attributionData = {
      sessionId,
      firstTouch: {
        timestamp: new Date().toISOString(),
        source: trafficSource.source,
        medium: trafficSource.medium,
        campaign: utmData.utm_campaign || 'direct',
        referrer: referrer || 'direct',
        landingPage: window.location.href,
        ...utmData
      },
      touchpoints: []
    };

    // Get existing attribution data or use new data
    const existingAttribution = JSON.parse(sessionStorage.getItem('zc_attribution') || 'null');
    
    if (existingAttribution) {
      // Add new touchpoint
      existingAttribution.touchpoints.push({
        timestamp: new Date().toISOString(),
        source: trafficSource.source,
        medium: trafficSource.medium,
        page: window.location.href,
        ...utmData
      });
      sessionStorage.setItem('zc_attribution', JSON.stringify(existingAttribution));
      return existingAttribution;
    } else {
      sessionStorage.setItem('zc_attribution', JSON.stringify(attributionData));
      return attributionData;
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return 'zc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Determine traffic source from referrer and UTM data
  determineTrafficSource(utmData, referrer) {
    // If UTM source exists, use it
    if (utmData.utm_source) {
      return {
        source: utmData.utm_source,
        medium: utmData.utm_medium || 'unknown'
      };
    }

    // Determine from referrer
    if (!referrer) {
      return { source: 'direct', medium: 'none' };
    }

    const referrerDomain = new URL(referrer).hostname.toLowerCase();

    // Search engines
    if (referrerDomain.includes('google.')) {
      return { source: 'google', medium: 'organic' };
    }
    if (referrerDomain.includes('bing.')) {
      return { source: 'bing', medium: 'organic' };
    }
    if (referrerDomain.includes('yahoo.')) {
      return { source: 'yahoo', medium: 'organic' };
    }

    // Social media
    if (referrerDomain.includes('linkedin.')) {
      return { source: 'linkedin', medium: 'social' };
    }
    if (referrerDomain.includes('twitter.') || referrerDomain.includes('t.co')) {
      return { source: 'twitter', medium: 'social' };
    }
    if (referrerDomain.includes('facebook.')) {
      return { source: 'facebook', medium: 'social' };
    }
    if (referrerDomain.includes('instagram.')) {
      return { source: 'instagram', medium: 'social' };
    }

    // Email
    if (referrerDomain.includes('mail.') || referrerDomain.includes('gmail.') || referrerDomain.includes('outlook.')) {
      return { source: 'email', medium: 'email' };
    }

    // Default referral
    return { source: referrerDomain, medium: 'referral' };
  }

  // Track page view with attribution
  trackPageView(pageData = {}) {
    const attribution = JSON.parse(sessionStorage.getItem('zc_attribution') || '{}');
    
    // Send page view with attribution context
    this.sendAttributionEvent('page_view', {
      ...pageData,
      page: window.location.href,
      sessionId: attribution.sessionId,
      firstTouchSource: attribution.firstTouch?.source,
      firstTouchMedium: attribution.firstTouch?.medium,
      firstTouchCampaign: attribution.firstTouch?.campaign
    });

    // Update Google Analytics with attribution
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view_attributed', {
        event_category: 'Attribution',
        custom_parameters: {
          first_touch_source: attribution.firstTouch?.source,
          first_touch_medium: attribution.firstTouch?.medium,
          session_touchpoints: attribution.touchpoints?.length || 0
        }
      });
    }
  }

  // Track conversion with full attribution path
  trackConversion(conversionData) {
    const attribution = JSON.parse(sessionStorage.getItem('zc_attribution') || '{}');
    const { type, value, transactionId, modelData } = conversionData;

    // Calculate attribution weights (first-touch: 40%, last-touch: 40%, middle: 20%)
    const touchpoints = attribution.touchpoints || [];
    const totalTouchpoints = touchpoints.length + 1; // +1 for first touch
    
    const attributionWeights = this.calculateAttributionWeights(totalTouchpoints);

    // Create comprehensive attribution record
    const attributionRecord = {
      conversionId: transactionId || this.generateConversionId(),
      conversionType: type,
      conversionValue: value,
      sessionId: attribution.sessionId,
      
      // First touch attribution
      firstTouch: {
        ...attribution.firstTouch,
        attributionWeight: attributionWeights.firstTouch,
        attributedValue: value * attributionWeights.firstTouch
      },

      // Last touch (current page/source)
      lastTouch: {
        timestamp: new Date().toISOString(),
        source: this.getCurrentSource(),
        medium: this.getCurrentMedium(),
        page: window.location.href,
        attributionWeight: attributionWeights.lastTouch,
        attributedValue: value * attributionWeights.lastTouch
      },

      // All touchpoints
      touchpoints: touchpoints.map((touchpoint, index) => ({
        ...touchpoint,
        order: index + 2, // +2 because first touch is order 1
        attributionWeight: attributionWeights.middle / touchpoints.length,
        attributedValue: value * (attributionWeights.middle / touchpoints.length)
      })),

      // Model information
      model: modelData,
      
      // Conversion timing
      timeToConversion: new Date() - new Date(attribution.firstTouch?.timestamp || new Date()),
      totalTouchpoints: totalTouchpoints,
      
      timestamp: new Date().toISOString()
    };

    // Send to attribution API
    this.sendAttributionEvent('conversion', attributionRecord);

    // Update Google Analytics with attribution
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase_attributed', {
        transaction_id: transactionId,
        value: value,
        currency: 'USD',
        event_category: 'Attribution',
        custom_parameters: {
          first_touch_source: attribution.firstTouch?.source,
          last_touch_source: this.getCurrentSource(),
          touchpoint_count: totalTouchpoints,
          time_to_conversion_hours: Math.round(attributionRecord.timeToConversion / (1000 * 60 * 60))
        }
      });
    }

    return attributionRecord;
  }

  // Calculate attribution weights using linear model
  calculateAttributionWeights(totalTouchpoints) {
    if (totalTouchpoints === 1) {
      return { firstTouch: 1, lastTouch: 0, middle: 0 };
    }
    
    if (totalTouchpoints === 2) {
      return { firstTouch: 0.5, lastTouch: 0.5, middle: 0 };
    }

    // Multi-touch attribution
    return {
      firstTouch: 0.4,
      lastTouch: 0.4,
      middle: 0.2
    };
  }

  // Generate unique conversion ID
  generateConversionId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get current source (for last touch)
  getCurrentSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    
    if (utmSource) return utmSource;
    
    // If no UTM, consider it direct (user typed URL or used bookmark)
    return 'direct';
  }

  // Get current medium
  getCurrentMedium() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmMedium = urlParams.get('utm_medium');
    
    if (utmMedium) return utmMedium;
    
    return 'none';
  }

  // Send attribution event to API
  async sendAttributionEvent(eventType, eventData) {
    try {
      await fetch('/api/analytics/attribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.warn('Failed to send attribution event:', error);
    }
  }

  // Track campaign performance
  trackCampaignEvent(eventName, campaignData = {}) {
    const attribution = JSON.parse(sessionStorage.getItem('zc_attribution') || '{}');
    
    this.sendAttributionEvent('campaign_event', {
      eventName,
      campaignData,
      sessionId: attribution.sessionId,
      firstTouchCampaign: attribution.firstTouch?.campaign,
      currentPage: window.location.href,
      ...campaignData
    });
  }

  // Get attribution report for current session
  getAttributionReport() {
    return JSON.parse(sessionStorage.getItem('zc_attribution') || '{}');
  }

  // Clear attribution data (for new sessions)
  clearAttribution() {
    sessionStorage.removeItem('zc_attribution');
    sessionStorage.removeItem('zc_session_id');
  }
}

// Revenue Attribution Utilities
export const revenueAttribution = {
  
  // Track model purchase with full attribution
  trackModelPurchase: (purchaseData) => {
    const tracker = new AttributionTracker();
    
    return tracker.trackConversion({
      type: 'model_purchase',
      value: purchaseData.amount,
      transactionId: purchaseData.transactionId,
      modelData: {
        modelId: purchaseData.model.slug,
        modelTitle: purchaseData.model.title,
        modelCategory: purchaseData.model.category,
        modelPrice: purchaseData.amount
      }
    });
  },

  // Track lead generation with attribution
  trackLeadAttribution: (leadData) => {
    const tracker = new AttributionTracker();
    
    return tracker.trackConversion({
      type: 'lead_generation',
      value: estimateLeadValue(leadData.interest),
      transactionId: `lead_${Date.now()}`,
      modelData: {
        interest: leadData.interest,
        company: leadData.company,
        estimatedValue: estimateLeadValue(leadData.interest)
      }
    });
  },

  // Generate UTM campaign URLs
  generateUTMUrl: (baseUrl, utmParams) => {
    const url = new URL(baseUrl);
    
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  },

  // Analyze attribution performance
  analyzeAttributionPaths: (attributionData) => {
    const paths = {};
    
    attributionData.forEach(record => {
      const pathKey = `${record.firstTouch.source} -> ${record.lastTouch.source}`;
      
      if (!paths[pathKey]) {
        paths[pathKey] = {
          conversions: 0,
          totalValue: 0,
          avgValue: 0,
          sources: {
            first: record.firstTouch.source,
            last: record.lastTouch.source
          }
        };
      }
      
      paths[pathKey].conversions += 1;
      paths[pathKey].totalValue += record.conversionValue;
      paths[pathKey].avgValue = paths[pathKey].totalValue / paths[pathKey].conversions;
    });
    
    return Object.entries(paths)
      .sort((a, b) => b[1].totalValue - a[1].totalValue)
      .slice(0, 10); // Top 10 paths
  }
};

// Campaign tracking utilities
export const campaignTracking = {
  
  // Pre-built UTM templates for common campaigns
  campaigns: {
    email_newsletter: {
      utm_source: 'newsletter',
      utm_medium: 'email',
      utm_campaign: 'weekly_insights'
    },
    linkedin_organic: {
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'organic_post'
    },
    linkedin_ads: {
      utm_source: 'linkedin',
      utm_medium: 'paid_social',
      utm_campaign: 'lead_generation'
    },
    google_ads: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'financial_models'
    },
    content_marketing: {
      utm_source: 'blog',
      utm_medium: 'content',
      utm_campaign: 'thought_leadership'
    }
  },

  // Generate campaign URLs
  getUrl: (page, campaignType, customParams = {}) => {
    const baseUrl = `https://zencap.co${page}`;
    const campaignDefaults = campaignTracking.campaigns[campaignType] || {};
    
    return revenueAttribution.generateUTMUrl(baseUrl, {
      ...campaignDefaults,
      ...customParams
    });
  }
};

function estimateLeadValue(interest) {
  const valueMap = {
    'private-equity': 2000,
    'public-equity': 1500,
    'financial-modeling': 1000,
    'general': 500
  };
  return valueMap[interest] || 500;
}