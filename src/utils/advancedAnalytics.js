// Advanced Analytics & Conversion Tracking for Zenith Capital Advisors
// Implements GA4 Enhanced Ecommerce, Custom Events, and Attribution Tracking

class AdvancedAnalytics {
  constructor() {
    this.isInitialized = false;
    this.debugMode = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.init();
  }

  // Initialize analytics tracking
  init() {
    if (typeof window !== 'undefined' && window.gtag) {
      this.isInitialized = true;
      
      // Set up enhanced ecommerce
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        custom_map: {
          'custom_parameter_1': 'model_category',
          'custom_parameter_2': 'model_price_tier', 
          'custom_parameter_3': 'user_segment'
        },
        // Enhanced attribution settings
        attribution_timeout: 604800, // 7 days
        conversion_timeout: 86400,   // 1 day
        session_timeout: 1800,      // 30 minutes
        allow_enhanced_conversions: true
      });

      // Set user properties for segmentation
      this.setUserSegment();
      
      if (this.debugMode) {
        console.log('🔥 Advanced Analytics initialized');
      }
    }
  }

  // Generate unique session ID for attribution tracking
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Set user segment based on behavior patterns
  setUserSegment() {
    if (!this.isInitialized) return;

    // Determine user segment based on behavior
    const visitCount = parseInt(localStorage.getItem('zc_visit_count') || '0') + 1;
    localStorage.setItem('zc_visit_count', visitCount.toString());

    let segment = 'new_visitor';
    if (visitCount > 5) segment = 'returning_engaged';
    if (visitCount > 10) segment = 'high_value_prospect';

    window.gtag('set', {
      'custom_parameter_3': segment,
      'user_id': this.userId
    });

    this.userSegment = segment;
  }

  // CONVERSION GOALS SETUP
  
  // Track financial model purchase (Primary Conversion)
  trackModelPurchase(transactionData) {
    if (!this.isInitialized) return;

    const {
      transactionId,
      modelId,
      modelTitle,
      modelCategory,
      amount,
      currency = 'USD',
      customerEmail,
      paymentMethod = 'stripe'
    } = transactionData;

    // GA4 Enhanced Ecommerce Purchase Event
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: amount,
      currency: currency,
      items: [{
        item_id: modelId,
        item_name: modelTitle,
        item_category: modelCategory,
        item_category2: this.getPriceTier(amount),
        price: amount,
        quantity: 1
      }],
      // Custom parameters
      custom_parameter_1: modelCategory,
      custom_parameter_2: this.getPriceTier(amount),
      payment_method: paymentMethod,
      customer_lifetime_value: this.predictCLV(amount)
    });

    // Track as conversion goal
    window.gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_ID,
      transaction_id: transactionId,
      value: amount,
      currency: currency
    });

    // Custom analytics event for internal tracking
    this.trackCustomEvent('purchase_completed', {
      transactionId,
      modelId,
      modelTitle,
      amount,
      customerEmail,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });

    if (this.debugMode) {
      console.log('🛒 Purchase tracked:', { transactionId, amount, modelTitle });
    }
  }

  // Track lead generation (Secondary Conversion)
  trackLeadGeneration(leadData) {
    if (!this.isInitialized) return;

    const {
      name,
      email,
      company,
      interest,
      source = 'website',
      estimatedValue = 500
    } = leadData;

    // GA4 Lead Generation Event
    window.gtag('event', 'generate_lead', {
      value: estimatedValue,
      currency: 'USD',
      lead_source: source,
      interest_category: interest,
      has_company: !!company,
      custom_parameter_3: this.userSegment
    });

    // Track as conversion goal
    window.gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_ID,
      value: estimatedValue,
      currency: 'USD'
    });

    // Custom analytics event
    this.trackCustomEvent('lead_generated', {
      name,
      email,
      company,
      interest,
      source,
      estimatedValue,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });

    if (this.debugMode) {
      console.log('📧 Lead tracked:', { email, source, estimatedValue });
    }
  }

  // CUSTOM EVENTS FOR ENGAGEMENT TRACKING

  // Track model page views with detailed engagement
  trackModelView(modelData) {
    if (!this.isInitialized) return;

    const {
      modelId,
      modelTitle,
      modelCategory,
      modelPrice,
      timeOnPage = 0,
      scrollDepth = 0
    } = modelData;

    // GA4 View Item Event
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: modelPrice,
      items: [{
        item_id: modelId,
        item_name: modelTitle,
        item_category: modelCategory,
        item_category2: this.getPriceTier(modelPrice),
        price: modelPrice
      }],
      custom_parameter_1: modelCategory,
      custom_parameter_2: this.getPriceTier(modelPrice),
      engagement_time: timeOnPage,
      scroll_depth: scrollDepth
    });

    // Custom analytics event
    this.trackCustomEvent('model_view', {
      modelId,
      modelTitle,
      modelPrice,
      modelCategory,
      timeOnPage,
      scrollDepth,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });
  }

  // Track Excel model downloads/interactions
  trackModelInteraction(interactionData) {
    if (!this.isInitialized) return;

    const {
      modelId,
      modelTitle,
      interactionType, // 'download', 'preview', 'share'
      modelPrice,
      modelCategory
    } = interactionData;

    window.gtag('event', interactionType, {
      item_id: modelId,
      item_name: modelTitle,
      item_category: modelCategory,
      value: modelPrice,
      currency: 'USD',
      custom_parameter_1: modelCategory,
      custom_parameter_2: this.getPriceTier(modelPrice)
    });

    // Track high-intent interactions separately
    if (['download', 'preview'].includes(interactionType)) {
      window.gtag('event', 'high_intent_interaction', {
        interaction_type: interactionType,
        value: modelPrice * 0.1, // 10% of model value as engagement value
        currency: 'USD'
      });
    }

    this.trackCustomEvent('model_interaction', {
      modelId,
      modelTitle,
      interactionType,
      modelPrice,
      modelCategory,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });
  }

  // FUNNEL VISUALIZATION TRACKING

  // Track conversion funnel steps
  trackFunnelStep(stepData) {
    if (!this.isInitialized) return;

    const {
      step, // 'awareness', 'interest', 'consideration', 'purchase', 'retention'
      stepNumber,
      modelId = null,
      value = 0
    } = stepData;

    window.gtag('event', 'funnel_step', {
      funnel_step: step,
      step_number: stepNumber,
      item_id: modelId,
      value: value,
      currency: 'USD',
      custom_parameter_3: this.userSegment
    });

    this.trackCustomEvent('funnel_step', {
      step,
      stepNumber,
      modelId,
      value,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });
  }

  // Track checkout process steps
  trackCheckoutStep(checkoutData) {
    if (!this.isInitialized) return;

    const {
      step, // 'begin_checkout', 'add_payment_info', 'add_shipping_info'
      modelId,
      modelTitle,
      modelPrice,
      paymentMethod = null
    } = checkoutData;

    window.gtag('event', step, {
      currency: 'USD',
      value: modelPrice,
      items: [{
        item_id: modelId,
        item_name: modelTitle,
        price: modelPrice
      }],
      payment_type: paymentMethod
    });

    this.trackCustomEvent('checkout_step', {
      step,
      modelId,
      modelTitle,
      modelPrice,
      paymentMethod,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });
  }

  // ABANDONED CART TRACKING

  // Track cart abandonment
  trackCartAbandonment(cartData) {
    if (!this.isInitialized) return;

    const {
      modelId,
      modelTitle,
      modelPrice,
      abandonmentStage, // 'cart', 'checkout', 'payment'
      timeSpent
    } = cartData;

    window.gtag('event', 'abandon_cart', {
      currency: 'USD',
      value: modelPrice,
      items: [{
        item_id: modelId,
        item_name: modelTitle,
        price: modelPrice
      }],
      abandonment_stage: abandonmentStage,
      time_spent: timeSpent,
      custom_parameter_2: this.getPriceTier(modelPrice)
    });

    this.trackCustomEvent('cart_abandoned', {
      modelId,
      modelTitle,
      modelPrice,
      abandonmentStage,
      timeSpent,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });

    if (this.debugMode) {
      console.log('🛒❌ Cart abandonment tracked:', { modelTitle, abandonmentStage });
    }
  }

  // UTILITY METHODS

  // Get price tier for segmentation
  getPriceTier(price) {
    if (price >= 4000) return 'premium'; // $4,985 models
    if (price >= 2500) return 'standard'; // $2,985 models
    return 'entry';
  }

  // Predict Customer Lifetime Value
  predictCLV(purchaseAmount) {
    // Simple CLV prediction based on purchase amount and user segment
    const baseCLV = purchaseAmount * 1.5; // Assume 1.5x multiplier
    const segmentMultiplier = {
      'new_visitor': 1.0,
      'returning_engaged': 1.3,
      'high_value_prospect': 1.8
    };
    
    return baseCLV * (segmentMultiplier[this.userSegment] || 1.0);
  }

  // Send custom event to internal analytics API
  async trackCustomEvent(eventType, eventData) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          eventData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to track custom event:', error);
    }
  }

  // Page view tracking with enhanced data
  trackPageView(pageData) {
    if (!this.isInitialized) return;

    const {
      page_path,
      page_title,
      content_group1 = 'main_site', // website, admin, models
      content_group2 = null, // model_category if applicable
      custom_parameter_3 = this.userSegment
    } = pageData;

    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path,
      page_title,
      content_group1,
      content_group2,
      custom_parameter_3
    });

    window.gtag('event', 'page_view', {
      page_path,
      page_title,
      content_group1,
      content_group2,
      custom_parameter_3
    });
  }

  // Track search queries (for insights and models)
  trackSiteSearch(searchData) {
    if (!this.isInitialized) return;

    const {
      search_term,
      search_category = 'general',
      results_count = 0
    } = searchData;

    window.gtag('event', 'search', {
      search_term,
      search_category,
      results_count,
      custom_parameter_3: this.userSegment
    });
  }

  // Track email signups
  trackEmailSignup(signupData) {
    if (!this.isInitialized) return;

    const {
      email,
      signup_source, // 'newsletter', 'insights', 'model_download'
      user_type = 'prospect'
    } = signupData;

    window.gtag('event', 'sign_up', {
      method: signup_source,
      user_type,
      custom_parameter_3: this.userSegment
    });

    this.trackCustomEvent('email_signup', {
      email,
      signup_source,
      user_type,
      userSegment: this.userSegment,
      sessionId: this.sessionId
    });
  }

  // Track social sharing
  trackSocialShare(shareData) {
    if (!this.isInitialized) return;

    const {
      platform, // 'linkedin', 'twitter', 'facebook'
      content_type, // 'model', 'insight', 'page'
      content_id,
      content_title
    } = shareData;

    window.gtag('event', 'share', {
      method: platform,
      content_type,
      item_id: content_id,
      custom_parameter_3: this.userSegment
    });
  }

  // Set user ID for cross-device tracking
  setUserId(userId) {
    this.userId = userId;
    if (this.isInitialized) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        user_id: userId
      });
    }
  }

  // Enable debug mode
  enableDebug() {
    if (typeof window !== 'undefined') {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        debug_mode: true
      });
    }
  }
}

// Create global instance
let analyticsInstance = null;

export const getAnalytics = () => {
  if (!analyticsInstance) {
    analyticsInstance = new AdvancedAnalytics();
  }
  return analyticsInstance;
};

// Convenience methods for easy import
export const trackModelPurchase = (data) => getAnalytics().trackModelPurchase(data);
export const trackLeadGeneration = (data) => getAnalytics().trackLeadGeneration(data);
export const trackModelView = (data) => getAnalytics().trackModelView(data);
export const trackModelInteraction = (data) => getAnalytics().trackModelInteraction(data);
export const trackFunnelStep = (data) => getAnalytics().trackFunnelStep(data);
export const trackCheckoutStep = (data) => getAnalytics().trackCheckoutStep(data);
export const trackCartAbandonment = (data) => getAnalytics().trackCartAbandonment(data);
export const trackPageView = (data) => getAnalytics().trackPageView(data);
export const trackSiteSearch = (data) => getAnalytics().trackSiteSearch(data);
export const trackEmailSignup = (data) => getAnalytics().trackEmailSignup(data);
export const trackSocialShare = (data) => getAnalytics().trackSocialShare(data);

export default AdvancedAnalytics;