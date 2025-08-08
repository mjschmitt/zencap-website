// API endpoint for custom analytics events
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

    // Get IP address and user agent from request
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const userAgent = req.headers['user-agent'] || '';

    // Store the analytics event in database
    const result = await sql`
      INSERT INTO analytics_events (
        event_type,
        event_data,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        ${eventType},
        ${JSON.stringify(eventData)},
        ${clientIP},
        ${userAgent},
        ${timestamp}
      )
      RETURNING id, created_at
    `;

    // Handle different event types for additional processing
    switch (eventType) {
      case 'purchase_completed':
        await handlePurchaseEvent(eventData);
        break;
      case 'lead_generated':
        await handleLeadEvent(eventData);
        break;
      case 'model_view':
        await handleModelViewEvent(eventData);
        break;
      case 'funnel_step':
        await handleFunnelStepEvent(eventData);
        break;
    }

    res.status(200).json({
      success: true,
      eventId: result.rows[0].id,
      timestamp: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Analytics Events API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record analytics event'
    });
  }
}

// Handle purchase events for revenue tracking
async function handlePurchaseEvent(eventData) {
  try {
    const { transactionId, modelId, modelTitle, amount, customerEmail } = eventData;

    // Record in revenue tracking table
    await sql`
      INSERT INTO revenue_events (
        transaction_id,
        model_id,
        model_title,
        amount,
        currency,
        customer_email,
        created_at
      ) VALUES (
        ${transactionId},
        ${modelId},
        ${modelTitle},
        ${amount},
        'USD',
        ${customerEmail},
        NOW()
      )
      ON CONFLICT (transaction_id) DO NOTHING
    `;

    // Update daily revenue aggregates
    await sql`
      INSERT INTO daily_revenue (
        date,
        total_revenue,
        transaction_count,
        avg_order_value,
        updated_at
      ) VALUES (
        CURRENT_DATE,
        ${amount},
        1,
        ${amount},
        NOW()
      )
      ON CONFLICT (date) DO UPDATE SET
        total_revenue = daily_revenue.total_revenue + EXCLUDED.total_revenue,
        transaction_count = daily_revenue.transaction_count + 1,
        avg_order_value = (daily_revenue.total_revenue + EXCLUDED.total_revenue) / 
                         (daily_revenue.transaction_count + 1),
        updated_at = NOW()
    `;

  } catch (error) {
    console.error('Error handling purchase event:', error);
  }
}

// Handle lead generation events
async function handleLeadEvent(eventData) {
  try {
    const { name, email, company, interest, source, estimatedValue } = eventData;

    // Update lead source attribution
    await sql`
      UPDATE leads 
      SET source = ${source || 'website'},
          estimated_value = ${estimatedValue || 500}
      WHERE email = ${email} AND source IS NULL
    `;

    // Track lead sources performance
    await sql`
      INSERT INTO lead_sources (
        source,
        lead_count,
        total_estimated_value,
        date
      ) VALUES (
        ${source || 'website'},
        1,
        ${estimatedValue || 500},
        CURRENT_DATE
      )
      ON CONFLICT (source, date) DO UPDATE SET
        lead_count = lead_sources.lead_count + 1,
        total_estimated_value = lead_sources.total_estimated_value + EXCLUDED.total_estimated_value
    `;

  } catch (error) {
    console.error('Error handling lead event:', error);
  }
}

// Handle model view events for engagement tracking
async function handleModelViewEvent(eventData) {
  try {
    const { modelId, modelTitle, modelPrice, modelCategory } = eventData;

    // Track model popularity
    await sql`
      INSERT INTO model_analytics (
        model_id,
        model_title,
        view_count,
        total_potential_revenue,
        category,
        date
      ) VALUES (
        ${modelId},
        ${modelTitle},
        1,
        ${modelPrice || 0},
        ${modelCategory},
        CURRENT_DATE
      )
      ON CONFLICT (model_id, date) DO UPDATE SET
        view_count = model_analytics.view_count + 1,
        total_potential_revenue = model_analytics.total_potential_revenue + EXCLUDED.total_potential_revenue
    `;

  } catch (error) {
    console.error('Error handling model view event:', error);
  }
}

// Handle conversion funnel tracking
async function handleFunnelStepEvent(eventData) {
  try {
    const { step, stepNumber } = eventData;

    // Track funnel performance
    await sql`
      INSERT INTO conversion_funnel (
        step_name,
        step_number,
        completion_count,
        date
      ) VALUES (
        ${step},
        ${stepNumber},
        1,
        CURRENT_DATE
      )
      ON CONFLICT (step_name, date) DO UPDATE SET
        completion_count = conversion_funnel.completion_count + 1
    `;

  } catch (error) {
    console.error('Error handling funnel step event:', error);
  }
}