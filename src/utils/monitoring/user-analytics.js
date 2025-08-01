/**
 * User Analytics Tracking
 * Tracks user interactions with Excel viewer and file systems
 */

import { sql } from '@vercel/postgres';

// Event types for tracking
export const EventType = {
  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  FILE_VIEW: 'file_view',
  FILE_DELETE: 'file_delete',
  
  // Excel viewer interactions
  EXCEL_OPEN: 'excel_open',
  EXCEL_CLOSE: 'excel_close',
  SHEET_SWITCH: 'sheet_switch',
  CELL_SELECT: 'cell_select',
  FORMULA_VIEW: 'formula_view',
  SEARCH_PERFORM: 'search_perform',
  EXPORT_DATA: 'export_data',
  PRINT_PREVIEW: 'print_preview',
  FULLSCREEN_TOGGLE: 'fullscreen_toggle',
  ZOOM_CHANGE: 'zoom_change',
  
  // Feature usage
  FEATURE_USED: 'feature_used',
  ERROR_ENCOUNTERED: 'error_encountered',
  
  // User journey
  PAGE_VIEW: 'page_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end'
};

export class UserAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.eventQueue = [];
    this.isProcessing = false;
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.inactivityTimeout = null;
    
    // Initialize session
    if (typeof window !== 'undefined') {
      this.initializeSession();
    }
  }

  initializeSession() {
    // Track session start
    this.trackEvent(EventType.SESSION_START, {
      referrer: document.referrer,
      entryPage: window.location.pathname
    });

    // Set up activity tracking
    this.setupActivityTracking();

    // Set up page visibility tracking
    this.setupVisibilityTracking();

    // Set up beforeunload handler
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  setupActivityTracking() {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, () => {
        this.updateLastActivity();
      }, { passive: true });
    });

    // Check for inactivity every minute
    setInterval(() => {
      const inactivityDuration = Date.now() - this.lastActivityTime;
      if (inactivityDuration > 30 * 60 * 1000) { // 30 minutes
        this.endSession();
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = Date.now();
      }
    }, 60000);
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('tab_hidden', {});
      } else {
        this.trackEvent('tab_visible', {});
      }
    });
  }

  updateLastActivity() {
    this.lastActivityTime = Date.now();
    
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
    
    this.inactivityTimeout = setTimeout(() => {
      this.trackEvent('user_inactive', {
        duration: 5 * 60 * 1000 // 5 minutes
      });
    }, 5 * 60 * 1000);
  }

  // Track an event
  async trackEvent(eventType, eventData = {}) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType,
      eventData: this.enrichEventData(eventData),
      timestamp: new Date().toISOString(),
      pageUrl: typeof window !== 'undefined' ? window.location.href : null,
      ...this.getDeviceInfo()
    };

    // Add to queue
    this.eventQueue.push(event);

    // Process queue
    if (!this.isProcessing && this.eventQueue.length >= 10) {
      await this.processEventQueue();
    }

    return event;
  }

  // Track Excel viewer specific events
  async trackExcelEvent(action, data = {}) {
    const enrichedData = {
      ...data,
      viewerVersion: '2.0',
      renderMode: data.renderMode || 'standard'
    };

    return this.trackEvent(action, enrichedData);
  }

  // Track file operation
  async trackFileOperation(operation, fileData) {
    const eventData = {
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type,
      operation,
      success: fileData.success || true,
      duration: fileData.duration || null
    };

    return this.trackEvent(`file_${operation}`, eventData);
  }

  // Enrich event data with additional context
  enrichEventData(data) {
    return {
      ...data,
      sessionDuration: Date.now() - this.sessionStartTime,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  // Get device information
  getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      devicePixelRatio: window.devicePixelRatio,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  }

  // Process event queue
  async processEventQueue() {
    if (this.eventQueue.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Batch insert events
      await this.batchLogEvents(events);
      
      // Update user journey
      await this.updateUserJourney(events);
      
    } catch (error) {
      console.error('Failed to process event queue:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
    } finally {
      this.isProcessing = false;
    }
  }

  // Batch log events to database
  async batchLogEvents(events) {
    if (process.env.NODE_ENV !== 'production') {
      // In development, just log to console
      console.log('Analytics events:', events);
      return;
    }

    try {
      const values = events.map(event => [
        event.id,
        event.sessionId,
        event.userId,
        event.eventType,
        JSON.stringify(event.eventData),
        event.pageUrl,
        JSON.stringify(event),
        event.timestamp
      ]);

      await sql`
        INSERT INTO user_analytics (
          event_id,
          session_id,
          user_id,
          event_type,
          event_data,
          page_url,
          context,
          timestamp
        ) 
        SELECT * FROM UNNEST(
          ${values}::record[]
        ) AS t(
          event_id text,
          session_id text,
          user_id text,
          event_type text,
          event_data jsonb,
          page_url text,
          context jsonb,
          timestamp timestamp
        )
      `;
    } catch (error) {
      console.error('Failed to log analytics events:', error);
    }
  }

  // Update user journey
  async updateUserJourney(events) {
    // Group events by type for journey analysis
    const journey = {
      sessionId: this.sessionId,
      userId: this.userId,
      events: events.map(e => ({
        type: e.eventType,
        timestamp: e.timestamp,
        page: e.pageUrl
      })),
      features: this.extractFeatureUsage(events),
      errors: events.filter(e => e.eventType === EventType.ERROR_ENCOUNTERED)
    };

    // Store journey summary
    if (process.env.NODE_ENV === 'production') {
      try {
        await sql`
          INSERT INTO user_journeys (
            session_id,
            user_id,
            journey_data,
            feature_usage,
            error_count,
            timestamp
          ) VALUES (
            ${journey.sessionId},
            ${journey.userId},
            ${JSON.stringify(journey.events)},
            ${JSON.stringify(journey.features)},
            ${journey.errors.length},
            ${new Date().toISOString()}
          )
          ON CONFLICT (session_id) DO UPDATE SET
            journey_data = ${JSON.stringify(journey.events)},
            feature_usage = ${JSON.stringify(journey.features)},
            error_count = ${journey.errors.length},
            updated_at = ${new Date().toISOString()}
        `;
      } catch (error) {
        console.error('Failed to update user journey:', error);
      }
    }
  }

  // Extract feature usage from events
  extractFeatureUsage(events) {
    const features = {};
    
    events.forEach(event => {
      if (event.eventType.startsWith('excel_') || event.eventType === EventType.FEATURE_USED) {
        const feature = event.eventData.feature || event.eventType;
        features[feature] = (features[feature] || 0) + 1;
      }
    });
    
    return features;
  }

  // End session
  async endSession() {
    this.trackEvent(EventType.SESSION_END, {
      duration: Date.now() - this.sessionStartTime,
      eventCount: this.eventQueue.length
    });
    
    // Force process remaining events
    await this.processEventQueue();
  }

  // Generate session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate event ID
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create user ID
  getUserId() {
    if (typeof window === 'undefined') return 'anonymous';
    
    let userId = localStorage.getItem('zencap_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('zencap_user_id', userId);
    }
    return userId;
  }

  // Get analytics summary
  async getAnalyticsSummary(timeRange = '24h') {
    try {
      const result = await sql`
        SELECT 
          event_type,
          COUNT(*) as count,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          AVG((event_data->>'duration')::numeric) as avg_duration
        FROM user_analytics
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
        GROUP BY event_type
        ORDER BY count DESC
      `;

      return result.rows;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return [];
    }
  }

  // Get feature usage stats
  async getFeatureUsageStats(timeRange = '7d') {
    try {
      const result = await sql`
        SELECT 
          jsonb_object_keys(feature_usage) as feature,
          SUM((feature_usage->>jsonb_object_keys(feature_usage))::int) as usage_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM user_journeys
        WHERE timestamp > NOW() - INTERVAL ${timeRange}
        GROUP BY feature
        ORDER BY usage_count DESC
      `;

      return result.rows;
    } catch (error) {
      console.error('Failed to get feature usage stats:', error);
      return [];
    }
  }

  // Get user flow analysis
  async getUserFlowAnalysis(timeRange = '24h') {
    try {
      const result = await sql`
        WITH event_sequences AS (
          SELECT 
            session_id,
            user_id,
            event_type,
            LAG(event_type) OVER (PARTITION BY session_id ORDER BY timestamp) as prev_event,
            timestamp
          FROM user_analytics
          WHERE timestamp > NOW() - INTERVAL ${timeRange}
        )
        SELECT 
          prev_event || ' -> ' || event_type as flow,
          COUNT(*) as count
        FROM event_sequences
        WHERE prev_event IS NOT NULL
        GROUP BY flow
        ORDER BY count DESC
        LIMIT 20
      `;

      return result.rows;
    } catch (error) {
      console.error('Failed to get user flow analysis:', error);
      return [];
    }
  }
}

// Create singleton instance
export const userAnalytics = new UserAnalytics();

// React hook for analytics tracking
export const useAnalytics = () => {
  const trackEvent = useCallback((eventType, eventData) => {
    return userAnalytics.trackEvent(eventType, eventData);
  }, []);

  const trackExcelEvent = useCallback((action, data) => {
    return userAnalytics.trackExcelEvent(action, data);
  }, []);

  const trackFileOperation = useCallback((operation, fileData) => {
    return userAnalytics.trackFileOperation(operation, fileData);
  }, []);

  return {
    trackEvent,
    trackExcelEvent,
    trackFileOperation
  };
};