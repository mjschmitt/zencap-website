// Advanced Heat Mapping & User Behavior Tracking for ZenCap
// Implements click tracking, scroll depth, mouse movement, and element engagement

class HeatMapTracker {
  constructor() {
    this.isActive = false;
    this.sessionId = this.generateSessionId();
    this.currentPage = null;
    this.startTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.clickData = [];
    this.hoverData = [];
    this.formInteractions = [];
    this.debugMode = process.env.NODE_ENV === 'development';
    
    // Throttle tracking calls to prevent performance issues
    this.throttleDelay = 100; // milliseconds
    this.lastTrackTime = 0;
    
    this.init();
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  init() {
    if (typeof window === 'undefined') return;
    
    this.currentPage = {
      url: window.location.href,
      title: document.title,
      deviceType: this.getDeviceType(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    this.isActive = true;
    this.setupEventListeners();
    
    if (this.debugMode) {
      console.log('🔥 Heat Map Tracker initialized for:', this.currentPage.url);
    }
  }

  getDeviceType() {
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  setupEventListeners() {
    // Click tracking
    document.addEventListener('click', this.trackClick.bind(this), { passive: true });
    
    // Mouse movement tracking (throttled)
    document.addEventListener('mousemove', this.throttle(this.trackMouseMove.bind(this), 200), { passive: true });
    
    // Scroll tracking
    window.addEventListener('scroll', this.throttle(this.trackScroll.bind(this), 100), { passive: true });
    
    // Form interaction tracking
    document.addEventListener('focus', this.trackFormFocus.bind(this), { passive: true });
    document.addEventListener('input', this.trackFormInput.bind(this), { passive: true });
    
    // Element hover tracking for important elements
    this.setupElementHoverTracking();
    
    // Page unload - send remaining data
    window.addEventListener('beforeunload', this.sendPendingData.bind(this));
    
    // Visibility change - pause/resume tracking
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // CLICK TRACKING
  trackClick(event) {
    if (!this.isActive) return;

    const target = event.target;
    const clickData = {
      x: event.clientX,
      y: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      timestamp: Date.now(),
      element: {
        tagName: target.tagName.toLowerCase(),
        id: target.id || null,
        className: target.className || null,
        selector: this.getElementSelector(target),
        textContent: target.textContent ? target.textContent.substring(0, 100) : null,
        href: target.href || null
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };

    // Identify important elements
    clickData.element.importance = this.calculateElementImportance(target);
    
    this.clickData.push(clickData);

    // Send high-importance clicks immediately
    if (clickData.element.importance === 'high') {
      this.sendClickData([clickData]);
    }

    // Batch send click data when we have enough
    if (this.clickData.length >= 10) {
      this.sendClickData(this.clickData.splice(0, 10));
    }

    if (this.debugMode && clickData.element.importance !== 'low') {
      console.log('🖱️ Click tracked:', clickData.element.selector, clickData.element.importance);
    }
  }

  // SCROLL TRACKING
  trackScroll() {
    if (!this.isActive) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const viewportHeight = window.innerHeight;
    
    this.scrollDepth = Math.round((scrollTop / (documentHeight - viewportHeight)) * 100);
    this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);

    // Track scroll milestones
    const milestones = [25, 50, 75, 90];
    milestones.forEach(milestone => {
      if (this.scrollDepth >= milestone && !this.scrollMilestones?.[milestone]) {
        if (!this.scrollMilestones) this.scrollMilestones = {};
        this.scrollMilestones[milestone] = true;
        
        this.sendBehaviorData({
          event_type: 'scroll_milestone',
          scroll_depth: milestone,
          time_to_milestone: Date.now() - this.startTime,
          page_height: documentHeight
        });
      }
    });
  }

  // MOUSE MOVEMENT TRACKING
  trackMouseMove(event) {
    if (!this.isActive) return;

    const now = Date.now();
    if (now - this.lastTrackTime < this.throttleDelay) return;
    this.lastTrackTime = now;

    // Only track mouse movement over important elements
    const target = event.target;
    const importance = this.calculateElementImportance(target);
    
    if (importance !== 'low') {
      const moveData = {
        x: event.clientX,
        y: event.clientY,
        timestamp: now,
        element: {
          selector: this.getElementSelector(target),
          importance
        }
      };

      // Store recent mouse movements (keep last 50)
      if (!this.mouseMovements) this.mouseMovements = [];
      this.mouseMovements.push(moveData);
      if (this.mouseMovements.length > 50) {
        this.mouseMovements.shift();
      }
    }
  }

  // FORM INTERACTION TRACKING
  trackFormFocus(event) {
    if (!this.isActive) return;
    
    const target = event.target;
    if (!['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) return;

    const interactionData = {
      event_type: 'form_focus',
      element: {
        tagName: target.tagName.toLowerCase(),
        type: target.type || null,
        name: target.name || null,
        id: target.id || null,
        selector: this.getElementSelector(target),
        placeholder: target.placeholder || null
      },
      timestamp: Date.now(),
      form: {
        id: target.form?.id || null,
        name: target.form?.name || null,
        action: target.form?.action || null
      }
    };

    this.formInteractions.push(interactionData);
    this.sendBehaviorData(interactionData);
  }

  trackFormInput(event) {
    if (!this.isActive) return;

    const target = event.target;
    if (!['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) return;

    const interactionData = {
      event_type: 'form_input',
      element: {
        selector: this.getElementSelector(target),
        type: target.type || null,
        name: target.name || null
      },
      value_length: target.value ? target.value.length : 0,
      timestamp: Date.now()
    };

    this.sendBehaviorData(interactionData);
  }

  // ELEMENT HOVER TRACKING
  setupElementHoverTracking() {
    // Track hovers on important elements
    const importantSelectors = [
      'button',
      'a[href]',
      '.btn',
      '.cta',
      '.model-card',
      '.price',
      '.download-btn',
      '.purchase-btn',
      '.nav-link',
      '.insight-card'
    ];

    importantSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        let hoverStart = null;

        element.addEventListener('mouseenter', () => {
          hoverStart = Date.now();
        }, { passive: true });

        element.addEventListener('mouseleave', () => {
          if (hoverStart) {
            const hoverDuration = Date.now() - hoverStart;
            if (hoverDuration > 500) { // Only track hovers longer than 500ms
              this.trackElementHover(element, hoverDuration);
            }
          }
        }, { passive: true });
      });
    });
  }

  trackElementHover(element, duration) {
    const hoverData = {
      event_type: 'element_hover',
      element: {
        selector: this.getElementSelector(element),
        tagName: element.tagName.toLowerCase(),
        textContent: element.textContent ? element.textContent.substring(0, 50) : null,
        importance: this.calculateElementImportance(element)
      },
      duration,
      timestamp: Date.now()
    };

    this.sendBehaviorData(hoverData);

    if (this.debugMode) {
      console.log('👆 Hover tracked:', hoverData.element.selector, `${duration}ms`);
    }
  }

  // UTILITY METHODS

  calculateElementImportance(element) {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const id = element.id || '';
    const textContent = element.textContent || '';

    // High importance elements
    if (
      tagName === 'button' ||
      className.includes('btn') ||
      className.includes('cta') ||
      className.includes('purchase') ||
      className.includes('download') ||
      className.includes('signup') ||
      id.includes('purchase') ||
      id.includes('download') ||
      textContent.toLowerCase().includes('buy') ||
      textContent.toLowerCase().includes('purchase') ||
      textContent.toLowerCase().includes('download')
    ) {
      return 'high';
    }

    // Medium importance elements
    if (
      tagName === 'a' ||
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      className.includes('card') ||
      className.includes('model') ||
      className.includes('insight') ||
      className.includes('nav')
    ) {
      return 'medium';
    }

    return 'low';
  }

  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    // Add position if needed for uniqueness
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === element.tagName && child.className === element.className
      );
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    return selector;
  }

  // DATA TRANSMISSION

  async sendClickData(clickDataArray) {
    try {
      await fetch('/api/analytics/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'click_data',
          session_id: this.sessionId,
          page_info: this.currentPage,
          data: clickDataArray
        })
      });
    } catch (error) {
      console.error('Failed to send click data:', error);
    }
  }

  async sendBehaviorData(behaviorData) {
    try {
      await fetch('/api/analytics/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'behavior_data',
          session_id: this.sessionId,
          page_info: this.currentPage,
          data: behaviorData
        })
      });
    } catch (error) {
      console.error('Failed to send behavior data:', error);
    }
  }

  async sendPendingData() {
    if (this.clickData.length > 0) {
      await this.sendClickData(this.clickData);
    }

    // Send session summary
    const sessionSummary = {
      session_id: this.sessionId,
      page_info: this.currentPage,
      session_duration: Date.now() - this.startTime,
      max_scroll_depth: this.maxScrollDepth,
      total_clicks: this.clickData.length,
      form_interactions: this.formInteractions.length,
      scroll_milestones: this.scrollMilestones || {}
    };

    try {
      await fetch('/api/analytics/heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'session_summary',
          data: sessionSummary
        })
      });
    } catch (error) {
      console.error('Failed to send session summary:', error);
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.isActive = false;
      this.sendPendingData();
    } else {
      this.isActive = true;
    }
  }

  // UTILITY: Throttle function
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  // PUBLIC METHODS

  // Manually track specific element interactions
  trackElementInteraction(elementSelector, interactionType, additionalData = {}) {
    const element = document.querySelector(elementSelector);
    if (!element) return;

    const interactionData = {
      event_type: 'manual_interaction',
      interaction_type: interactionType,
      element: {
        selector: elementSelector,
        tagName: element.tagName.toLowerCase(),
        importance: this.calculateElementImportance(element)
      },
      timestamp: Date.now(),
      ...additionalData
    };

    this.sendBehaviorData(interactionData);
  }

  // Get current session data
  getSessionData() {
    return {
      sessionId: this.sessionId,
      currentPage: this.currentPage,
      startTime: this.startTime,
      maxScrollDepth: this.maxScrollDepth,
      totalClicks: this.clickData.length,
      formInteractions: this.formInteractions.length
    };
  }

  // Manually flush all pending data
  flushData() {
    this.sendPendingData();
  }

  // Stop tracking
  stop() {
    this.isActive = false;
    this.sendPendingData();
  }
}

// Singleton instance
let heatMapInstance = null;

export const getHeatMapTracker = () => {
  if (!heatMapInstance && typeof window !== 'undefined') {
    heatMapInstance = new HeatMapTracker();
  }
  return heatMapInstance;
};

// Convenience functions
export const trackElementInteraction = (selector, type, data) => {
  const tracker = getHeatMapTracker();
  if (tracker) tracker.trackElementInteraction(selector, type, data);
};

export const getHeatMapData = () => {
  const tracker = getHeatMapTracker();
  return tracker ? tracker.getSessionData() : null;
};

export const flushHeatMapData = () => {
  const tracker = getHeatMapTracker();
  if (tracker) tracker.flushData();
};

export default HeatMapTracker;