// Enhanced E-commerce Tracking for Zenith Capital Advisors
// Track $2,985-$4,985 financial model sales and conversions

export const ecommerceEvents = {
  // Track model page views with enhanced data
  trackModelView: (model) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: model.price || 0,
        items: [{
          item_id: model.slug || model.id,
          item_name: model.title,
          item_category: model.category,
          item_brand: 'Zenith Capital',
          price: model.price || 0,
          quantity: 1
        }]
      });

      // Custom model engagement tracking
      window.gtag('event', 'model_engagement', {
        event_category: 'Product',
        event_label: model.title,
        value: model.price || 0,
        custom_parameters: {
          model_type: model.category,
          model_complexity: model.complexity || 'standard',
          target_audience: model.targetAudience || 'professional'
        }
      });
    }

    // Send to custom analytics API
    sendCustomEvent('model_view', {
      modelId: model.slug || model.id,
      modelTitle: model.title,
      modelPrice: model.price || 0,
      modelCategory: model.category,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    });
  },

  // Track when user starts purchase process
  trackPurchaseIntent: (model) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: model.price || 0,
        items: [{
          item_id: model.slug || model.id,
          item_name: model.title,
          item_category: model.category,
          price: model.price || 0,
          quantity: 1
        }]
      });

      // High-value purchase intent (for $2,985+ models)
      if (model.price >= 2985) {
        window.gtag('event', 'high_value_purchase_intent', {
          event_category: 'Conversion',
          event_label: 'Premium Model',
          value: model.price
        });
      }
    }

    sendCustomEvent('purchase_intent', {
      modelId: model.slug || model.id,
      modelTitle: model.title,
      modelPrice: model.price || 0,
      purchaseMethod: 'stripe_checkout',
      timestamp: new Date().toISOString()
    });
  },

  // Track successful purchases
  trackPurchase: (purchaseData) => {
    const { transactionId, model, customerEmail, amount } = purchaseData;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: amount,
        currency: 'USD',
        items: [{
          item_id: model.slug || model.id,
          item_name: model.title,
          item_category: model.category,
          price: amount,
          quantity: 1
        }]
      });

      // Track revenue milestone
      window.gtag('event', 'revenue_generated', {
        event_category: 'Revenue',
        event_label: `${model.category}_model`,
        value: amount
      });
    }

    // Send to revenue tracking API
    sendCustomEvent('purchase_completed', {
      transactionId,
      modelId: model.slug || model.id,
      modelTitle: model.title,
      amount,
      currency: 'USD',
      customerEmail,
      timestamp: new Date().toISOString()
    });
  },

  // Track lead generation (contact form submissions)
  trackLeadGeneration: (leadData) => {
    const { name, email, company, interest, source } = leadData;

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_category: 'Lead Generation',
        event_label: interest || 'general_inquiry',
        value: estimateLeadValue(interest)
      });

      // Track qualified leads (with company info)
      if (company) {
        window.gtag('event', 'qualified_lead', {
          event_category: 'Lead Quality',
          event_label: 'corporate_inquiry',
          value: 500 // Estimated value of qualified lead
        });
      }
    }

    sendCustomEvent('lead_generated', {
      name,
      email,
      company,
      interest,
      source: source || getTrafficSource(),
      timestamp: new Date().toISOString(),
      estimatedValue: estimateLeadValue(interest)
    });
  },

  // Track newsletter subscriptions
  trackNewsletterSignup: (email, source = 'website') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: 'email',
        event_category: 'Engagement',
        event_label: 'newsletter_subscription'
      });
    }

    sendCustomEvent('newsletter_signup', {
      email,
      source,
      timestamp: new Date().toISOString()
    });
  },

  // Track model downloads/previews
  trackModelDownload: (model, downloadType = 'preview') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'file_download', {
        file_name: `${model.slug}_${downloadType}`,
        file_extension: downloadType === 'preview' ? 'pdf' : 'xlsx',
        link_url: window.location.href
      });
    }

    sendCustomEvent('model_download', {
      modelId: model.slug || model.id,
      modelTitle: model.title,
      downloadType,
      timestamp: new Date().toISOString()
    });
  },

  // Track user engagement milestones
  trackEngagementMilestone: (milestone, data = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'engagement_milestone', {
        event_category: 'User Engagement',
        event_label: milestone,
        value: data.value || 0
      });
    }

    sendCustomEvent('engagement_milestone', {
      milestone,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Utility functions
function estimateLeadValue(interest) {
  const valueMap = {
    'private-equity': 2000,
    'public-equity': 1500,
    'financial-modeling': 1000,
    'general': 500
  };
  return valueMap[interest] || 500;
}

function getTrafficSource() {
  if (typeof document === 'undefined') return 'unknown';
  
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  
  if (referrer.includes('google.com')) return 'google';
  if (referrer.includes('linkedin.com')) return 'linkedin';
  if (referrer.includes('twitter.com')) return 'twitter';
  if (referrer.includes('facebook.com')) return 'facebook';
  
  return 'referral';
}

async function sendCustomEvent(eventType, eventData) {
  try {
    await fetch('/api/analytics/events', {
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
    console.warn('Failed to send custom analytics event:', error);
  }
}

// Revenue tracking utilities
export const revenueTracking = {
  // Calculate monthly recurring revenue potential
  calculateMRR: (purchases) => {
    return purchases.reduce((total, purchase) => total + purchase.amount, 0);
  },

  // Track customer lifetime value
  calculateCLV: (customerPurchases) => {
    const totalRevenue = customerPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const avgOrderValue = totalRevenue / customerPurchases.length;
    const estimatedLifetimeOrders = 1.5; // Most customers buy 1-2 models
    
    return avgOrderValue * estimatedLifetimeOrders;
  },

  // Track conversion funnel
  trackFunnelStep: (step, data = {}) => {
    const funnelSteps = {
      'landing': 1,
      'model_view': 2,
      'purchase_intent': 3,
      'checkout_start': 4,
      'payment_info': 5,
      'purchase_complete': 6
    };

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'funnel_step', {
        event_category: 'Conversion Funnel',
        event_label: step,
        value: funnelSteps[step] || 0,
        custom_parameters: data
      });
    }

    sendCustomEvent('funnel_step', {
      step,
      stepNumber: funnelSteps[step] || 0,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// A/B testing utilities
export const abTesting = {
  // Track A/B test variants
  trackVariant: (testName, variant, outcome = null) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_view', {
        event_category: 'A/B Testing',
        event_label: `${testName}_${variant}`,
        custom_parameters: {
          test_name: testName,
          variant: variant,
          outcome: outcome
        }
      });
    }

    sendCustomEvent('ab_test_interaction', {
      testName,
      variant,
      outcome,
      timestamp: new Date().toISOString()
    });
  },

  // Track conversion by variant
  trackConversion: (testName, variant, conversionValue = 0) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        event_category: 'A/B Testing',
        event_label: `${testName}_${variant}_conversion`,
        value: conversionValue
      });
    }

    sendCustomEvent('ab_test_conversion', {
      testName,
      variant,
      conversionValue,
      timestamp: new Date().toISOString()
    });
  }
};