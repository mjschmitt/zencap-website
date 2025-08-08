// API endpoint for revenue attribution tracking
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventType, eventData, timestamp } = req.body;

    // Validate required fields
    if (!eventType || !eventData || !timestamp) {
      return res.status(400).json({ 
        error: 'Missing required fields: eventType, eventData, timestamp' 
      });
    }

    // Get client information
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const userAgent = req.headers['user-agent'] || '';

    // Store attribution event
    const result = await sql`
      INSERT INTO attribution_events (
        event_type,
        event_data,
        session_id,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        ${eventType},
        ${JSON.stringify(eventData)},
        ${eventData.sessionId || null},
        ${clientIP},
        ${userAgent},
        ${timestamp}
      )
      RETURNING id, created_at
    `;

    // Handle specific event types
    switch (eventType) {
      case 'conversion':
        await handleConversionAttribution(eventData);
        break;
      case 'page_view':
        await handlePageViewAttribution(eventData);
        break;
      case 'campaign_event':
        await handleCampaignAttribution(eventData);
        break;
    }

    res.status(200).json({
      success: true,
      eventId: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Attribution API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record attribution event'
    });
  }
}

// Handle conversion attribution
async function handleConversionAttribution(eventData) {
  try {
    const {
      conversionId,
      conversionType,
      conversionValue,
      sessionId,
      firstTouch,
      lastTouch,
      touchpoints,
      timeToConversion,
      totalTouchpoints
    } = eventData;

    // Store main conversion record
    await sql`
      INSERT INTO conversions_attributed (
        conversion_id,
        conversion_type,
        conversion_value,
        session_id,
        time_to_conversion_ms,
        total_touchpoints,
        first_touch_source,
        first_touch_medium,
        first_touch_campaign,
        last_touch_source,
        last_touch_medium,
        created_at
      ) VALUES (
        ${conversionId},
        ${conversionType},
        ${conversionValue},
        ${sessionId},
        ${timeToConversion || 0},
        ${totalTouchpoints || 1},
        ${firstTouch?.source || 'unknown'},
        ${firstTouch?.medium || 'unknown'},
        ${firstTouch?.campaign || 'unknown'},
        ${lastTouch?.source || 'unknown'},
        ${lastTouch?.medium || 'unknown'},
        NOW()
      )
      ON CONFLICT (conversion_id) DO NOTHING
    `;

    // Store touchpoint attributions
    if (touchpoints && touchpoints.length > 0) {
      for (const touchpoint of touchpoints) {
        await sql`
          INSERT INTO touchpoint_attributions (
            conversion_id,
            touchpoint_order,
            source,
            medium,
            campaign,
            attribution_weight,
            attributed_value,
            touchpoint_timestamp,
            created_at
          ) VALUES (
            ${conversionId},
            ${touchpoint.order || 0},
            ${touchpoint.source || 'unknown'},
            ${touchpoint.medium || 'unknown'},
            ${touchpoint.campaign || 'unknown'},
            ${touchpoint.attributionWeight || 0},
            ${touchpoint.attributedValue || 0},
            ${touchpoint.timestamp},
            NOW()
          )
        `;
      }
    }

    // Update source performance aggregates
    await updateSourcePerformance(firstTouch, lastTouch, conversionValue);

  } catch (error) {
    console.error('Error handling conversion attribution:', error);
  }
}

// Handle page view attribution
async function handlePageViewAttribution(eventData) {
  try {
    const { sessionId, page, firstTouchSource, firstTouchMedium } = eventData;

    // Update session tracking
    await sql`
      INSERT INTO session_tracking (
        session_id,
        first_touch_source,
        first_touch_medium,
        page_views,
        last_page_view,
        created_at
      ) VALUES (
        ${sessionId},
        ${firstTouchSource || 'unknown'},
        ${firstTouchMedium || 'unknown'},
        1,
        ${page},
        NOW()
      )
      ON CONFLICT (session_id) DO UPDATE SET
        page_views = session_tracking.page_views + 1,
        last_page_view = EXCLUDED.last_page_view,
        updated_at = NOW()
    `;

  } catch (error) {
    console.error('Error handling page view attribution:', error);
  }
}

// Handle campaign attribution
async function handleCampaignAttribution(eventData) {
  try {
    const { eventName, campaignData, sessionId, firstTouchCampaign } = eventData;

    // Store campaign interaction
    await sql`
      INSERT INTO campaign_interactions (
        session_id,
        event_name,
        campaign_name,
        interaction_data,
        first_touch_campaign,
        created_at
      ) VALUES (
        ${sessionId},
        ${eventName},
        ${campaignData?.campaign || 'unknown'},
        ${JSON.stringify(campaignData)},
        ${firstTouchCampaign || 'unknown'},
        NOW()
      )
    `;

  } catch (error) {
    console.error('Error handling campaign attribution:', error);
  }
}

// Update source performance metrics
async function updateSourcePerformance(firstTouch, lastTouch, conversionValue) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Update first-touch source performance
    if (firstTouch) {
      await sql`
        INSERT INTO source_performance (
          source,
          medium,
          campaign,
          date,
          first_touch_conversions,
          first_touch_revenue,
          created_at
        ) VALUES (
          ${firstTouch.source},
          ${firstTouch.medium || 'unknown'},
          ${firstTouch.campaign || 'unknown'},
          ${today},
          1,
          ${firstTouch.attributedValue || conversionValue * 0.4},
          NOW()
        )
        ON CONFLICT (source, medium, campaign, date) DO UPDATE SET
          first_touch_conversions = source_performance.first_touch_conversions + 1,
          first_touch_revenue = source_performance.first_touch_revenue + EXCLUDED.first_touch_revenue,
          updated_at = NOW()
      `;
    }

    // Update last-touch source performance
    if (lastTouch) {
      await sql`
        INSERT INTO source_performance (
          source,
          medium,
          campaign,
          date,
          last_touch_conversions,
          last_touch_revenue,
          created_at
        ) VALUES (
          ${lastTouch.source},
          ${lastTouch.medium || 'unknown'},
          ${lastTouch.campaign || 'unknown'},
          ${today},
          1,
          ${lastTouch.attributedValue || conversionValue * 0.4},
          NOW()
        )
        ON CONFLICT (source, medium, campaign, date) DO UPDATE SET
          last_touch_conversions = source_performance.last_touch_conversions + 1,
          last_touch_revenue = source_performance.last_touch_revenue + EXCLUDED.last_touch_revenue,
          updated_at = NOW()
      `;
    }

  } catch (error) {
    console.error('Error updating source performance:', error);
  }
}