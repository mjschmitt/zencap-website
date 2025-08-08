// src/utils/testPrioritization.js - ICE-scored A/B Test Priority Queue

/**
 * A/B Test Prioritization using ICE Framework
 * Impact × Confidence × Ease scoring system
 * Optimized for $50K/month revenue goal
 */

export const TEST_PRIORITY_QUEUE = [
  {
    id: 'pricing_display_v1',
    name: 'Pricing Display Variations',
    status: 'active', // Currently running
    description: 'Test value emphasis vs standard pricing display with guarantees and social proof',
    ice: {
      impact: 9,    // Direct conversion impact on $4,985 models
      confidence: 8, // Based on proven pricing psychology principles  
      ease: 8,      // Simple component changes
      total: 8.3
    },
    estimatedLift: '15-25%',
    estimatedRevenue: '+$7,500-12,500/month',
    implementation: 'Currently live - pricing component with A/B variants',
    timeline: '2 weeks to statistical significance',
    hypothesis: 'Adding value props, guarantees, and strikethrough pricing will increase purchase intent by highlighting savings and reducing risk'
  },
  
  {
    id: 'email_capture_lead_magnets',
    name: 'Email Capture Lead Magnets',
    status: 'ready',
    description: 'Test free DCF template vs market insights vs simple newsletter signup',
    ice: {
      impact: 8,    // Email leads convert to purchases at ~12% rate
      confidence: 9, // Lead magnets consistently outperform simple signups
      ease: 7,      // Need to create downloadable template
      total: 8.0
    },
    estimatedLift: '200-400%',
    estimatedRevenue: '+$15,000-30,000/month',
    implementation: 'EmailCaptureABTest component with 3 variants',
    timeline: '1 week development + 2 weeks testing',
    hypothesis: 'Offering valuable free content will dramatically increase email signups, leading to higher-value nurture sequences and eventual purchases'
  },

  {
    id: 'model_page_value_proposition',
    name: 'Model Page Value Proposition',
    status: 'planned',
    description: 'Test ROI-focused vs feature-focused vs time-saving value propositions',
    ice: {
      impact: 9,    // High-intent users on model pages
      confidence: 7, // Good data on value prop messaging
      ease: 8,      // Content and component updates
      total: 8.0
    },
    estimatedLift: '20-35%',
    estimatedRevenue: '+$10,000-17,500/month',
    implementation: 'Hero section variants with different messaging angles',
    timeline: '1 week development + 3 weeks testing',
    hypothesis: 'Emphasizing time savings ("Save 40+ hours per deal") will resonate more with busy professionals than feature lists'
  },

  {
    id: 'homepage_hero_section',
    name: 'Homepage Hero Section',
    status: 'planned', 
    description: 'Test different primary value propositions and call-to-action buttons',
    ice: {
      impact: 8,    // High traffic entry point
      confidence: 8, // Clear best practices for hero optimization
      ease: 8,      // Template and content changes
      total: 8.0
    },
    estimatedLift: '25-40%',
    estimatedRevenue: '+$5,000-8,000/month',
    implementation: 'Hero component with variant messaging and CTA buttons',
    timeline: '1 week development + 2 weeks testing',
    hypothesis: 'Leading with concrete benefits ("Save 40+ hours per deal") will drive higher engagement than generic "Premium Financial Models"'
  },

  {
    id: 'purchase_flow_optimization',
    name: 'Purchase Flow Optimization', 
    status: 'planned',
    description: 'Test checkout process simplification and trust signals',
    ice: {
      impact: 10,   // Direct impact on final conversion step
      confidence: 8, // Strong data on checkout optimization
      ease: 6,      // Complex payment flow changes
      total: 8.0
    },
    estimatedLift: '30-50%',
    estimatedRevenue: '+$15,000-25,000/month',
    implementation: 'Checkout page variants with different form layouts and trust signals',
    timeline: '2 weeks development + 3 weeks testing',
    hypothesis: 'Reducing form fields, adding security badges, and showing money-back guarantee will reduce checkout abandonment'
  },

  {
    id: 'social_proof_testimonials',
    name: 'Social Proof & Testimonials',
    status: 'planned',
    description: 'Test placement and format of customer testimonials and usage stats',
    ice: {
      impact: 7,    // Builds trust, indirect conversion impact
      confidence: 8, // Strong evidence for social proof effectiveness
      ease: 7,      // Content creation and placement
      total: 7.3
    },
    estimatedLift: '15-25%',
    estimatedRevenue: '+$3,000-5,000/month',
    implementation: 'Social proof components on key pages',
    timeline: '1.5 weeks development + 2 weeks testing',
    hypothesis: 'Showing specific usage stats ("Used by 500+ investment professionals") will increase credibility and purchase intent'
  },

  {
    id: 'model_preview_optimization',
    name: 'Model Preview Optimization',
    status: 'planned',
    description: 'Test different Excel preview presentations and purchase CTAs',
    ice: {
      impact: 8,    // High conversion intent users viewing previews
      confidence: 6, // Less data on Excel preview optimization
      ease: 7,      // Excel component and layout changes
      total: 7.0
    },
    estimatedLift: '20-30%',
    estimatedRevenue: '+$8,000-12,000/month',
    implementation: 'Enhanced Excel preview with contextual purchase prompts',
    timeline: '1.5 weeks development + 2 weeks testing',
    hypothesis: 'Adding purchase CTAs within the Excel preview experience will capture users at peak interest'
  },

  {
    id: 'urgency_scarcity_elements',
    name: 'Urgency & Scarcity Elements',
    status: 'planned',
    description: 'Test limited-time offers vs stock counters vs deadline messaging',
    ice: {
      impact: 7,    // Psychological triggers for purchase decisions
      confidence: 7, // Mixed results in B2B context
      ease: 8,      // Simple UI additions
      total: 7.3
    },
    estimatedLift: '10-20%',
    estimatedRevenue: '+$2,000-4,000/month',
    implementation: 'Urgency messaging components on product and checkout pages',
    timeline: '1 week development + 2 weeks testing',
    hypothesis: 'Professional urgency messaging ("Used in live deals this week") will create appropriate pressure without seeming pushy'
  },

  {
    id: 'mobile_experience_optimization',
    name: 'Mobile Experience Optimization',
    status: 'planned',
    description: 'Test mobile-specific layouts and interaction patterns',
    ice: {
      impact: 6,    // ~30% mobile traffic, lower B2B conversion rates
      confidence: 7, // Clear mobile UX best practices
      ease: 6,      // Responsive design complexities
      total: 6.3
    },
    estimatedLift: '40-60%',
    estimatedRevenue: '+$3,000-5,000/month',
    implementation: 'Mobile-optimized layouts and touch interactions',
    timeline: '2 weeks development + 2 weeks testing',
    hypothesis: 'Better mobile experience will capture executive decision-makers reviewing models on mobile devices'
  },

  {
    id: 'personalization_by_segment',
    name: 'Personalization by User Segment',
    status: 'future',
    description: 'Test personalized messaging based on company size, role, and behavior',
    ice: {
      impact: 9,    // Highly relevant messaging increases conversion
      confidence: 6, // Limited personalization data for B2B finance
      ease: 4,      // Complex segmentation and content logic
      total: 6.3
    },
    estimatedLift: '50-100%',
    estimatedRevenue: '+$20,000-40,000/month',
    implementation: 'Advanced segmentation engine with dynamic content',
    timeline: '4 weeks development + 4 weeks testing',
    hypothesis: 'Tailoring value props by user type (PE vs RE vs Corp Dev) will significantly increase relevance and conversion'
  }
];

/**
 * Get tests prioritized by ICE score
 */
export function getPrioritizedTests() {
  return TEST_PRIORITY_QUEUE.sort((a, b) => b.ice.total - a.ice.total);
}

/**
 * Get next 5 tests to implement
 */
export function getNext5Tests() {
  return TEST_PRIORITY_QUEUE
    .filter(test => ['ready', 'planned'].includes(test.status))
    .sort((a, b) => b.ice.total - a.ice.total)
    .slice(0, 5);
}

/**
 * Calculate total potential revenue impact
 */
export function calculateTotalRevenuePotential() {
  const activeAndPlanned = TEST_PRIORITY_QUEUE.filter(test => 
    ['active', 'ready', 'planned'].includes(test.status)
  );
  
  // Conservative estimate: take lower bound of estimated revenue
  const totalPotential = activeAndPlanned.reduce((sum, test) => {
    const revenueMatch = test.estimatedRevenue.match(/\+\$([0-9,]+)/);
    if (revenueMatch) {
      const revenue = parseInt(revenueMatch[1].replace(/,/g, ''));
      return sum + revenue;
    }
    return sum;
  }, 0);

  return totalPotential;
}

/**
 * Get recommended test sequence for maximum impact
 */
export function getRecommendedSequence() {
  return [
    {
      phase: 1,
      duration: '4 weeks',
      tests: [
        'pricing_display_v1', // Currently running
        'email_capture_lead_magnets'
      ],
      expectedRevenue: '+$22,500-42,500/month',
      focus: 'Foundation & Lead Generation'
    },
    {
      phase: 2, 
      duration: '6 weeks',
      tests: [
        'model_page_value_proposition',
        'homepage_hero_section',
        'purchase_flow_optimization'
      ],
      expectedRevenue: '+$30,000-50,500/month',
      focus: 'Conversion Optimization'
    },
    {
      phase: 3,
      duration: '4 weeks', 
      tests: [
        'social_proof_testimonials',
        'model_preview_optimization'
      ],
      expectedRevenue: '+$11,000-17,000/month',
      focus: 'Trust & Engagement'
    }
  ];
}

/**
 * Test impact categories for strategic planning
 */
export const TEST_CATEGORIES = {
  DIRECT_CONVERSION: {
    name: 'Direct Conversion',
    description: 'Tests that directly impact purchase decisions',
    tests: ['pricing_display_v1', 'purchase_flow_optimization', 'model_page_value_proposition'],
    priority: 'high'
  },
  LEAD_GENERATION: {
    name: 'Lead Generation', 
    description: 'Tests that increase email capture and nurture pipeline',
    tests: ['email_capture_lead_magnets', 'homepage_hero_section'],
    priority: 'high'
  },
  TRUST_BUILDING: {
    name: 'Trust Building',
    description: 'Tests that increase credibility and reduce purchase anxiety',
    tests: ['social_proof_testimonials', 'urgency_scarcity_elements'],
    priority: 'medium'
  },
  ENGAGEMENT: {
    name: 'Engagement',
    description: 'Tests that improve user experience and time on site', 
    tests: ['model_preview_optimization', 'mobile_experience_optimization'],
    priority: 'medium'
  },
  PERSONALIZATION: {
    name: 'Personalization',
    description: 'Advanced targeting based on user characteristics',
    tests: ['personalization_by_segment'],
    priority: 'future'
  }
};

/**
 * Success metrics for tracking test performance
 */
export const SUCCESS_METRICS = {
  PRIMARY: {
    'model_purchase': {
      target: 'Increase by 150% (2% → 5%)',
      value: 4200, // Average model price
      description: 'Direct revenue from model sales'
    }
  },
  SECONDARY: {
    'email_signup': {
      target: 'Increase by 300% (1% → 4%)',
      value: 500, // Estimated lifetime value of email lead
      description: 'Email leads for nurture campaigns'
    },
    'contact_form_submit': {
      target: 'Increase by 200% (0.5% → 1.5%)',
      value: 2500, // Estimated value of sales inquiry
      description: 'High-intent sales inquiries'
    }
  },
  ENGAGEMENT: {
    'model_detail_view': {
      target: 'Increase time on page by 50%',
      value: 0,
      description: 'User engagement with product pages'
    },
    'excel_preview': {
      target: 'Increase preview completion by 40%',
      value: 0,
      description: 'Product demonstration effectiveness'
    }
  }
};

/**
 * Revenue projection based on test success
 */
export function projectMonthlyRevenue(testResults = {}) {
  const baseConversionRate = 0.02; // 2% baseline
  const monthlyVisitors = 5000; // Estimated monthly unique visitors
  const avgOrderValue = 4200; // Average model price
  
  let projectedRevenue = baseConversionRate * monthlyVisitors * avgOrderValue;
  
  // Apply test improvements
  const completedTests = Object.keys(testResults);
  completedTests.forEach(testId => {
    const test = TEST_PRIORITY_QUEUE.find(t => t.id === testId);
    if (test && testResults[testId].winner) {
      // Apply conservative lift estimate (lower bound)
      const liftMatch = test.estimatedLift.match(/([0-9]+)-/);
      if (liftMatch) {
        const lift = parseInt(liftMatch[1]) / 100;
        projectedRevenue *= (1 + lift);
      }
    }
  });
  
  return {
    monthly: Math.round(projectedRevenue),
    progressToGoal: Math.round((projectedRevenue / 50000) * 100),
    testsRemaining: TEST_PRIORITY_QUEUE.filter(t => !completedTests.includes(t.id)).length
  };
}