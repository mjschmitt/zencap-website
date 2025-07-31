/**
 * @fileoverview Error tracking API endpoint
 * @module api/errors
 */

import { withRateLimit } from '../../middleware/rate-limit';
import { createAuditLog } from '../../utils/audit';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

/**
 * Error tracking endpoint handler
 */
async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Process each error event
    const processedEvents = [];
    
    for (const event of events) {
      try {
        // Validate event structure
        if (!event.timestamp || (!event.error && !event.message)) {
          continue;
        }

        // Log to audit system
        await createAuditLog({
          event: event.error ? 'CLIENT_ERROR' : 'CLIENT_MESSAGE',
          severity: event.level || (event.error ? 'error' : 'info'),
          metadata: {
            errorName: event.error?.name,
            errorMessage: event.error?.message || event.message,
            errorStack: event.error?.stack,
            context: event.context,
            timestamp: event.timestamp,
            userAgent: event.context?.userAgent,
            url: event.context?.url
          }
        });

        processedEvents.push({
          id: event.timestamp,
          status: 'logged'
        });

      } catch (eventError) {
        console.error('Failed to process error event:', eventError);
        processedEvents.push({
          id: event.timestamp,
          status: 'failed',
          error: eventError.message
        });
      }
    }

    // Log the error tracking request itself
    await createAuditLog({
      event: 'ERROR_TRACKING',
      metadata: {
        eventsReceived: events.length,
        eventsProcessed: processedEvents.filter(e => e.status === 'logged').length,
        eventsFailed: processedEvents.filter(e => e.status === 'failed').length
      }
    });

    return res.status(200).json({
      success: true,
      processed: processedEvents.length,
      results: processedEvents
    });

  } catch (error) {
    console.error('Error tracking endpoint error:', error);
    
    return res.status(500).json({
      error: 'Failed to process error events',
      message: error.message
    });
  }
}

// Apply rate limiting to prevent abuse
export default withRateLimit(handler, 'api');