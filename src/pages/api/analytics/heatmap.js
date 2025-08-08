// API endpoint for heat map and user behavior data collection
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, session_id, page_info, data } = req.body;

    if (!type || !session_id || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, session_id, data' 
      });
    }

    let result;

    switch (type) {
      case 'click_data':
        result = await handleClickData(session_id, page_info, data);
        break;
      
      case 'behavior_data':
        result = await handleBehaviorData(session_id, page_info, data);
        break;
      
      case 'session_summary':
        result = await handleSessionSummary(data);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    res.status(200).json({
      success: true,
      recordsProcessed: Array.isArray(data) ? data.length : 1,
      result
    });

  } catch (error) {
    console.error('Heatmap API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process heatmap data'
    });
  }
}

// Handle click tracking data
async function handleClickData(sessionId, pageInfo, clickDataArray) {
  const results = [];
  
  for (const clickData of clickDataArray) {
    try {
      // Store click data
      const result = await sql`
        INSERT INTO heatmap_data (
          page_url,
          page_title,
          device_type,
          click_x,
          click_y,
          element_selector,
          element_type,
          session_id,
          user_segment,
          created_at
        ) VALUES (
          ${pageInfo.url},
          ${pageInfo.title},
          ${pageInfo.deviceType},
          ${clickData.x},
          ${clickData.y},
          ${clickData.element.selector},
          ${clickData.element.tagName},
          ${sessionId},
          ${determineUserSegment(sessionId)},
          ${new Date(clickData.timestamp).toISOString()}
        )
        RETURNING id
      `;

      // Store detailed element information
      await sql`
        INSERT INTO user_behavior (
          session_id,
          event_type,
          element_id,
          element_type,
          page_url,
          click_coordinates,
          time_on_page,
          user_segment,
          created_at
        ) VALUES (
          ${sessionId},
          'click',
          ${clickData.element.id || clickData.element.selector},
          ${clickData.element.tagName},
          ${pageInfo.url},
          ${JSON.stringify({ x: clickData.x, y: clickData.y })},
          ${Math.floor((clickData.timestamp - Date.now()) / 1000)},
          ${determineUserSegment(sessionId)},
          ${new Date(clickData.timestamp).toISOString()}
        )
      `;

      // Track high-importance element clicks separately
      if (clickData.element.importance === 'high') {
        await sql`
          INSERT INTO analytics_events (
            event_type,
            event_data,
            session_id,
            user_segment,
            page_url,
            created_at
          ) VALUES (
            'high_value_click',
            ${JSON.stringify({
              element: clickData.element,
              coordinates: { x: clickData.x, y: clickData.y },
              viewport: clickData.viewport
            })},
            ${sessionId},
            ${determineUserSegment(sessionId)},
            ${pageInfo.url},
            ${new Date(clickData.timestamp).toISOString()}
          )
        `;
      }

      results.push(result.rows[0]);
    } catch (error) {
      console.error('Error processing click data:', error);
    }
  }

  return results;
}

// Handle general behavior tracking data
async function handleBehaviorData(sessionId, pageInfo, behaviorData) {
  try {
    const result = await sql`
      INSERT INTO user_behavior (
        session_id,
        event_type,
        element_id,
        element_type,
        page_url,
        scroll_depth,
        time_on_page,
        form_interactions,
        video_engagement,
        user_segment,
        created_at
      ) VALUES (
        ${sessionId},
        ${behaviorData.event_type},
        ${behaviorData.element?.selector || behaviorData.element?.id || null},
        ${behaviorData.element?.tagName || null},
        ${pageInfo.url},
        ${behaviorData.scroll_depth || null},
        ${behaviorData.time_to_milestone || behaviorData.duration || null},
        ${behaviorData.event_type === 'form_focus' || behaviorData.event_type === 'form_input' ? 1 : 0},
        ${behaviorData.video_engagement || 0},
        ${determineUserSegment(sessionId)},
        ${new Date(behaviorData.timestamp).toISOString()}
      )
      RETURNING id
    `;

    // Store specific event data in analytics_events for important behaviors
    if (isImportantBehavior(behaviorData.event_type)) {
      await sql`
        INSERT INTO analytics_events (
          event_type,
          event_data,
          session_id,
          user_segment,
          page_url,
          created_at
        ) VALUES (
          ${behaviorData.event_type},
          ${JSON.stringify(behaviorData)},
          ${sessionId},
          ${determineUserSegment(sessionId)},
          ${pageInfo.url},
          ${new Date(behaviorData.timestamp).toISOString()}
        )
      `;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error processing behavior data:', error);
    throw error;
  }
}

// Handle session summary data
async function handleSessionSummary(summaryData) {
  try {
    const {
      session_id,
      page_info,
      session_duration,
      max_scroll_depth,
      total_clicks,
      form_interactions,
      scroll_milestones
    } = summaryData;

    // Update or insert session tracking record
    const result = await sql`
      INSERT INTO session_tracking (
        session_id,
        start_time,
        end_time,
        duration,
        page_count,
        interaction_count,
        device_category
      ) VALUES (
        ${session_id},
        ${new Date(Date.now() - session_duration).toISOString()},
        ${new Date().toISOString()},
        ${Math.floor(session_duration / 1000)},
        1,
        ${total_clicks + form_interactions},
        ${page_info.deviceType}
      )
      ON CONFLICT (session_id) DO UPDATE SET
        end_time = EXCLUDED.end_time,
        duration = EXCLUDED.duration,
        page_count = session_tracking.page_count + 1,
        interaction_count = session_tracking.interaction_count + EXCLUDED.interaction_count
      RETURNING id
    `;

    // Store scroll milestone achievements
    if (scroll_milestones && Object.keys(scroll_milestones).length > 0) {
      const milestonePromises = Object.entries(scroll_milestones).map(([milestone, achieved]) => {
        if (achieved) {
          return sql`
            INSERT INTO analytics_events (
              event_type,
              event_data,
              session_id,
              page_url,
              created_at
            ) VALUES (
              'scroll_milestone',
              ${JSON.stringify({ milestone: parseInt(milestone), max_depth: max_scroll_depth })},
              ${session_id},
              ${page_info.url},
              NOW()
            )
          `;
        }
      }).filter(Boolean);

      await Promise.all(milestonePromises);
    }

    // Calculate and store page-level engagement metrics
    await updatePageEngagementMetrics(page_info.url, {
      session_duration,
      max_scroll_depth,
      total_clicks,
      form_interactions,
      device_type: page_info.deviceType
    });

    return result.rows[0];
  } catch (error) {
    console.error('Error processing session summary:', error);
    throw error;
  }
}

// Helper function to determine user segment
async function determineUserSegment(sessionId) {
  try {
    // Check if we already have segment data for this session
    const existingSegment = await sql`
      SELECT user_segment 
      FROM session_tracking 
      WHERE session_id = ${sessionId} 
      AND user_segment IS NOT NULL
      LIMIT 1
    `;

    if (existingSegment.rows.length > 0) {
      return existingSegment.rows[0].user_segment;
    }

    // Analyze user behavior to determine segment
    const behaviorAnalysis = await sql`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE(created_at)) as days_active,
        MAX(created_at) as last_activity,
        SUM(CASE WHEN event_type LIKE '%purchase%' THEN 1 ELSE 0 END) as purchase_events,
        SUM(CASE WHEN event_type LIKE '%model%' THEN 1 ELSE 0 END) as model_interactions
      FROM analytics_events 
      WHERE session_id = ${sessionId}
    `;

    const analysis = behaviorAnalysis.rows[0];
    let segment = 'new_visitor';

    if (analysis.purchase_events > 0) {
      segment = 'customer';
    } else if (analysis.model_interactions > 5 || analysis.days_active > 3) {
      segment = 'high_value_prospect';
    } else if (analysis.total_events > 10 || analysis.days_active > 1) {
      segment = 'returning_engaged';
    }

    return segment;
  } catch (error) {
    console.error('Error determining user segment:', error);
    return 'unknown';
  }
}

// Helper function to identify important behaviors
function isImportantBehavior(eventType) {
  const importantEvents = [
    'scroll_milestone',
    'form_focus',
    'form_input',
    'element_hover',
    'high_value_click'
  ];
  return importantEvents.includes(eventType);
}

// Update page-level engagement metrics
async function updatePageEngagementMetrics(pageUrl, metrics) {
  try {
    await sql`
      INSERT INTO page_engagement_metrics (
        page_url,
        date,
        avg_session_duration,
        avg_scroll_depth,
        avg_clicks_per_session,
        avg_form_interactions,
        sessions_count,
        bounce_rate,
        device_breakdown
      ) VALUES (
        ${pageUrl},
        CURRENT_DATE,
        ${metrics.session_duration},
        ${metrics.max_scroll_depth},
        ${metrics.total_clicks},
        ${metrics.form_interactions},
        1,
        ${metrics.session_duration < 10000 ? 1 : 0}, -- Consider < 10 seconds as bounce
        ${JSON.stringify({ [metrics.device_type]: 1 })}
      )
      ON CONFLICT (page_url, date) DO UPDATE SET
        avg_session_duration = (page_engagement_metrics.avg_session_duration * page_engagement_metrics.sessions_count + EXCLUDED.avg_session_duration) / (page_engagement_metrics.sessions_count + 1),
        avg_scroll_depth = (page_engagement_metrics.avg_scroll_depth * page_engagement_metrics.sessions_count + EXCLUDED.avg_scroll_depth) / (page_engagement_metrics.sessions_count + 1),
        avg_clicks_per_session = (page_engagement_metrics.avg_clicks_per_session * page_engagement_metrics.sessions_count + EXCLUDED.avg_clicks_per_session) / (page_engagement_metrics.sessions_count + 1),
        avg_form_interactions = (page_engagement_metrics.avg_form_interactions * page_engagement_metrics.sessions_count + EXCLUDED.avg_form_interactions) / (page_engagement_metrics.sessions_count + 1),
        sessions_count = page_engagement_metrics.sessions_count + 1,
        bounce_rate = (page_engagement_metrics.bounce_rate * page_engagement_metrics.sessions_count + EXCLUDED.bounce_rate) / (page_engagement_metrics.sessions_count + 1),
        device_breakdown = page_engagement_metrics.device_breakdown || '{}'::jsonb || EXCLUDED.device_breakdown
    `;
  } catch (error) {
    // Table might not exist yet, create it
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS page_engagement_metrics (
          id SERIAL PRIMARY KEY,
          page_url TEXT NOT NULL,
          date DATE NOT NULL,
          avg_session_duration INTEGER DEFAULT 0,
          avg_scroll_depth DECIMAL(5,2) DEFAULT 0,
          avg_clicks_per_session DECIMAL(5,2) DEFAULT 0,
          avg_form_interactions DECIMAL(5,2) DEFAULT 0,
          sessions_count INTEGER DEFAULT 0,
          bounce_rate DECIMAL(5,4) DEFAULT 0,
          device_breakdown JSONB DEFAULT '{}'::jsonb,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(page_url, date)
        )
      `;
    } catch (createError) {
      console.error('Error creating page_engagement_metrics table:', createError);
    }
  }
}