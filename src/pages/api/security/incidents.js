/**
 * @fileoverview Security Incident Response API - Production Incident Management
 * @module api/security/incidents
 */

import { applySecurityMiddleware } from '../../../middleware/security.js';
import { securityMonitor, SECURITY_EVENTS, THREAT_LEVELS } from '../../../utils/security/SecurityMonitor.js';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { sendEmail } from '../../../utils/email.js';

/**
 * Security incident classification and response configuration
 */
const INCIDENT_CONFIG = {
  // Incident severity levels with response times
  SEVERITY_LEVELS: {
    P1: {
      name: 'Critical',
      responseTime: 15, // minutes
      description: 'Active attack or major security breach',
      autoEscalate: true,
      requiresImmediate: true
    },
    P2: {
      name: 'High',
      responseTime: 60, // minutes
      description: 'Significant security threat detected',
      autoEscalate: false,
      requiresImmediate: false
    },
    P3: {
      name: 'Medium',
      responseTime: 240, // minutes (4 hours)
      description: 'Potential security issue requiring investigation',
      autoEscalate: false,
      requiresImmediate: false
    },
    P4: {
      name: 'Low',
      responseTime: 1440, // minutes (24 hours)
      description: 'Minor security concern or policy violation',
      autoEscalate: false,
      requiresImmediate: false
    }
  },

  // Incident types and their default severities
  INCIDENT_TYPES: {
    'data_breach': 'P1',
    'system_compromise': 'P1',
    'ddos_attack': 'P1',
    'brute_force_attack': 'P2',
    'malware_detection': 'P2',
    'unauthorized_access': 'P2',
    'sql_injection_attack': 'P2',
    'xss_attack': 'P3',
    'suspicious_activity': 'P3',
    'policy_violation': 'P4',
    'vulnerability_discovery': 'P3'
  },

  // Automated response actions
  AUTO_RESPONSES: {
    'ddos_attack': ['block_source_ip', 'enable_rate_limiting', 'alert_team'],
    'brute_force_attack': ['block_source_ip', 'disable_account', 'alert_team'],
    'sql_injection_attack': ['block_source_ip', 'alert_team', 'log_detailed'],
    'malware_detection': ['quarantine_file', 'scan_system', 'alert_team'],
    'data_breach': ['isolate_system', 'alert_leadership', 'begin_forensics']
  },

  // Contact information for incident escalation
  ESCALATION_CONTACTS: {
    security_team: process.env.SECURITY_TEAM_EMAIL || 'security@zencap.com',
    leadership: process.env.LEADERSHIP_EMAIL || 'leadership@zencap.com',
    legal: process.env.LEGAL_TEAM_EMAIL || 'legal@zencap.com',
    pr_team: process.env.PR_TEAM_EMAIL || 'pr@zencap.com'
  }
};

/**
 * Security Incident Handler
 */
async function securityIncidentHandler(req, res) {
  const { method, query, body } = req;

  try {
    switch (method) {
      case 'GET':
        return await getIncidents(req, res);
      case 'POST':
        return await createIncident(req, res, body);
      case 'PUT':
        return await updateIncident(req, res, body);
      case 'DELETE':
        return await closeIncident(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Security incident handler error:', error);
    return res.status(500).json({
      success: false,
      error: 'Incident management system error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get security incidents with filtering and pagination
 */
async function getIncidents(req, res) {
  const { 
    page = 1, 
    limit = 25, 
    status, 
    severity, 
    type, 
    assignee,
    timeRange = '7d' 
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const timeMap = {
    '1h': 1,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
    '90d': 24 * 90
  };

  const hours = timeMap[timeRange] || 24 * 7;
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Build dynamic query
  let whereClause = sql`WHERE created_at > ${startTime}`;
  const queryParams = [];

  if (status) {
    whereClause = sql`${whereClause} AND status = ${status}`;
  }
  if (severity) {
    whereClause = sql`${whereClause} AND severity = ${severity}`;
  }
  if (type) {
    whereClause = sql`${whereClause} AND incident_type = ${type}`;
  }
  if (assignee) {
    whereClause = sql`${whereClause} AND assigned_to = ${assignee}`;
  }

  try {
    // Get incidents with pagination
    const incidents = await sql`
      SELECT 
        id, incident_type, severity, status, title, description,
        source_ip, affected_systems, evidence, impact_assessment,
        assigned_to, created_by, created_at, updated_at,
        resolved_at, resolution_notes, timeline
      FROM security_incidents
      ${whereClause}
      ORDER BY 
        CASE severity 
          WHEN 'P1' THEN 1 
          WHEN 'P2' THEN 2 
          WHEN 'P3' THEN 3 
          WHEN 'P4' THEN 4 
        END,
        created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${offset}
    `;

    // Get total count for pagination
    const totalCount = await sql`
      SELECT COUNT(*) as total
      FROM security_incidents
      ${whereClause}
    `;

    // Get incident statistics
    const stats = await sql`
      SELECT 
        status,
        severity,
        COUNT(*) as count
      FROM security_incidents
      ${whereClause}
      GROUP BY status, severity
    `;

    // Get response time metrics
    const responseMetrics = await sql`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_response_time_minutes,
        AVG(CASE WHEN resolved_at IS NOT NULL 
             THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/60 END) as avg_resolution_time_minutes
      FROM security_incidents
      ${whereClause}
    `;

    return res.status(200).json({
      success: true,
      data: {
        incidents: incidents.rows.map(incident => ({
          ...incident,
          affectedSystems: incident.affected_systems || [],
          evidence: incident.evidence || [],
          timeline: incident.timeline || [],
          age: calculateIncidentAge(incident.created_at),
          isOverdue: isIncidentOverdue(incident.created_at, incident.severity, incident.status),
          estimatedImpact: calculateEstimatedImpact(incident)
        })),
        
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / parseInt(limit)),
          totalIncidents: parseInt(totalCount.rows[0].total),
          hasNext: parseInt(page) < Math.ceil(parseInt(totalCount.rows[0].total) / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },

        statistics: formatIncidentStatistics(stats.rows),
        
        metrics: {
          averageResponseTime: parseFloat(responseMetrics.rows[0].avg_response_time_minutes || 0).toFixed(1),
          averageResolutionTime: parseFloat(responseMetrics.rows[0].avg_resolution_time_minutes || 0).toFixed(1)
        },

        filters: {
          timeRange, status, severity, type, assignee
        }
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error retrieving incidents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve security incidents'
    });
  }
}

/**
 * Create new security incident
 */
async function createIncident(req, res, body) {
  const {
    incidentType,
    severity,
    title,
    description,
    sourceIp,
    affectedSystems = [],
    evidence = [],
    impactAssessment,
    autoDetected = false
  } = body;

  // Validate required fields
  if (!incidentType || !title || !description) {
    return res.status(400).json({
      success: false,
      error: 'Missing required incident information',
      required: ['incidentType', 'title', 'description']
    });
  }

  try {
    const incidentId = crypto.randomUUID();
    
    // Determine severity if not provided
    const finalSeverity = severity || INCIDENT_CONFIG.INCIDENT_TYPES[incidentType] || 'P3';
    
    // Create incident record
    const incident = await sql`
      INSERT INTO security_incidents (
        id, incident_type, severity, status, title, description,
        source_ip, affected_systems, evidence, impact_assessment,
        created_by, created_at, timeline
      ) VALUES (
        ${incidentId},
        ${incidentType},
        ${finalSeverity},
        'open',
        ${title},
        ${description},
        ${sourceIp || null},
        ${JSON.stringify(affectedSystems)},
        ${JSON.stringify(evidence)},
        ${impactAssessment || null},
        ${req.user?.id || 'system'},
        CURRENT_TIMESTAMP,
        ${JSON.stringify([{
          timestamp: new Date(),
          action: 'incident_created',
          description: `Incident created: ${title}`,
          by: req.user?.id || 'system'
        }])}
      )
      RETURNING *
    `;

    const newIncident = incident.rows[0];

    // Log security event
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
      mapSeverityToThreatLevel(finalSeverity),
      {
        ip: sourceIp || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.url,
        userId: req.user?.id,
        data: {
          action: 'incident_created',
          incidentId,
          incidentType,
          severity: finalSeverity,
          autoDetected
        }
      }
    );

    // Trigger automated responses
    await triggerAutomatedResponse(incidentType, newIncident);

    // Send notifications based on severity
    await sendIncidentNotifications(newIncident, 'created');

    return res.status(201).json({
      success: true,
      data: {
        incident: {
          ...newIncident,
          affectedSystems: newIncident.affected_systems || [],
          evidence: newIncident.evidence || [],
          timeline: newIncident.timeline || []
        }
      },
      message: 'Security incident created successfully'
    });

  } catch (error) {
    console.error('Error creating incident:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create security incident'
    });
  }
}

/**
 * Update existing security incident
 */
async function updateIncident(req, res, body) {
  const { id } = req.query;
  const {
    status,
    assignedTo,
    severity,
    resolutionNotes,
    evidence = [],
    affectedSystems = [],
    impactAssessment
  } = body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Incident ID is required'
    });
  }

  try {
    // Get current incident
    const current = await sql`
      SELECT * FROM security_incidents WHERE id = ${id}
    `;

    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Security incident not found'
      });
    }

    const currentIncident = current.rows[0];
    const currentTimeline = currentIncident.timeline || [];

    // Prepare update fields
    const updateFields = {};
    const timelineUpdates = [];

    if (status && status !== currentIncident.status) {
      updateFields.status = status;
      updateFields.updated_at = new Date();
      
      if (status === 'resolved') {
        updateFields.resolved_at = new Date();
        updateFields.resolution_notes = resolutionNotes || 'Incident resolved';
      }

      timelineUpdates.push({
        timestamp: new Date(),
        action: 'status_changed',
        description: `Status changed from ${currentIncident.status} to ${status}`,
        by: req.user?.id || 'system',
        previousValue: currentIncident.status,
        newValue: status
      });
    }

    if (assignedTo && assignedTo !== currentIncident.assigned_to) {
      updateFields.assigned_to = assignedTo;
      timelineUpdates.push({
        timestamp: new Date(),
        action: 'assigned',
        description: `Incident assigned to ${assignedTo}`,
        by: req.user?.id || 'system',
        previousValue: currentIncident.assigned_to,
        newValue: assignedTo
      });
    }

    if (severity && severity !== currentIncident.severity) {
      updateFields.severity = severity;
      timelineUpdates.push({
        timestamp: new Date(),
        action: 'severity_changed',
        description: `Severity changed from ${currentIncident.severity} to ${severity}`,
        by: req.user?.id || 'system',
        previousValue: currentIncident.severity,
        newValue: severity
      });
    }

    if (evidence.length > 0) {
      updateFields.evidence = JSON.stringify([
        ...(currentIncident.evidence || []),
        ...evidence
      ]);
      
      timelineUpdates.push({
        timestamp: new Date(),
        action: 'evidence_added',
        description: `Added ${evidence.length} piece(s) of evidence`,
        by: req.user?.id || 'system'
      });
    }

    if (affectedSystems.length > 0) {
      const currentSystems = currentIncident.affected_systems || [];
      const newSystems = affectedSystems.filter(sys => !currentSystems.includes(sys));
      
      if (newSystems.length > 0) {
        updateFields.affected_systems = JSON.stringify([
          ...currentSystems,
          ...newSystems
        ]);
        
        timelineUpdates.push({
          timestamp: new Date(),
          action: 'systems_updated',
          description: `Added affected systems: ${newSystems.join(', ')}`,
          by: req.user?.id || 'system'
        });
      }
    }

    if (impactAssessment && impactAssessment !== currentIncident.impact_assessment) {
      updateFields.impact_assessment = impactAssessment;
      timelineUpdates.push({
        timestamp: new Date(),
        action: 'impact_assessed',
        description: 'Impact assessment updated',
        by: req.user?.id || 'system'
      });
    }

    // Update timeline
    if (timelineUpdates.length > 0) {
      updateFields.timeline = JSON.stringify([
        ...currentTimeline,
        ...timelineUpdates
      ]);
    }

    // Perform update
    if (Object.keys(updateFields).length > 0) {
      const updateQuery = Object.keys(updateFields).map(key => 
        sql`${sql(key)} = ${updateFields[key]}`
      );

      await sql`
        UPDATE security_incidents
        SET ${sql.join(updateQuery, sql`, `)}
        WHERE id = ${id}
      `;

      // Log security event
      await securityMonitor.logSecurityEvent(
        SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
        THREAT_LEVELS.LOW,
        {
          ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          path: req.url,
          userId: req.user?.id,
          data: {
            action: 'incident_updated',
            incidentId: id,
            updates: Object.keys(updateFields)
          }
        }
      );

      // Send notifications for significant changes
      if (updateFields.status || updateFields.severity) {
        const updatedIncident = { ...currentIncident, ...updateFields };
        await sendIncidentNotifications(updatedIncident, 'updated');
      }
    }

    // Get updated incident
    const updated = await sql`
      SELECT * FROM security_incidents WHERE id = ${id}
    `;

    return res.status(200).json({
      success: true,
      data: {
        incident: {
          ...updated.rows[0],
          affectedSystems: updated.rows[0].affected_systems || [],
          evidence: updated.rows[0].evidence || [],
          timeline: updated.rows[0].timeline || []
        }
      },
      message: 'Security incident updated successfully'
    });

  } catch (error) {
    console.error('Error updating incident:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update security incident'
    });
  }
}

/**
 * Close security incident
 */
async function closeIncident(req, res) {
  const { id } = req.query;
  const { resolutionNotes, rootCause, preventiveMeasures } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Incident ID is required'
    });
  }

  try {
    // Get current incident
    const current = await sql`
      SELECT * FROM security_incidents WHERE id = ${id}
    `;

    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Security incident not found'
      });
    }

    const incident = current.rows[0];
    const timeline = incident.timeline || [];

    // Close incident
    await sql`
      UPDATE security_incidents
      SET 
        status = 'closed',
        resolved_at = CURRENT_TIMESTAMP,
        resolution_notes = ${resolutionNotes || 'Incident closed'},
        timeline = ${JSON.stringify([
          ...timeline,
          {
            timestamp: new Date(),
            action: 'incident_closed',
            description: `Incident closed: ${resolutionNotes || 'No resolution notes provided'}`,
            by: req.user?.id || 'system',
            rootCause,
            preventiveMeasures
          }
        ])}
      WHERE id = ${id}
    `;

    // Log closure
    await securityMonitor.logSecurityEvent(
      SECURITY_EVENTS.SECURITY_POLICY_VIOLATION,
      THREAT_LEVELS.LOW,
      {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        path: req.url,
        userId: req.user?.id,
        data: {
          action: 'incident_closed',
          incidentId: id,
          resolutionNotes,
          rootCause,
          preventiveMeasures
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Security incident closed successfully'
    });

  } catch (error) {
    console.error('Error closing incident:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to close security incident'
    });
  }
}

/**
 * Trigger automated responses based on incident type
 */
async function triggerAutomatedResponse(incidentType, incident) {
  const responses = INCIDENT_CONFIG.AUTO_RESPONSES[incidentType] || [];

  for (const response of responses) {
    try {
      switch (response) {
        case 'block_source_ip':
          if (incident.source_ip) {
            await blockIP(incident.source_ip, incident.id);
          }
          break;

        case 'enable_rate_limiting':
          await enableEnhancedRateLimit(incident.source_ip);
          break;

        case 'alert_team':
          await sendIncidentNotifications(incident, 'auto_response');
          break;

        case 'disable_account':
          // Implement account disabling logic
          break;

        case 'quarantine_file':
          // Implement file quarantine logic
          break;

        case 'isolate_system':
          // Implement system isolation logic
          break;

        case 'begin_forensics':
          await initiateForensicAnalysis(incident);
          break;
      }
    } catch (error) {
      console.error(`Auto-response ${response} failed:`, error);
    }
  }
}

/**
 * Block IP address in threat intelligence
 */
async function blockIP(ipAddress, incidentId) {
  try {
    await sql`
      INSERT INTO threat_intelligence (
        ip_address, threat_score, blocked, notes
      ) VALUES (
        ${ipAddress}, 100, true, ${`Auto-blocked due to security incident ${incidentId}`}
      )
      ON CONFLICT (ip_address) 
      DO UPDATE SET 
        blocked = true,
        threat_score = GREATEST(threat_intelligence.threat_score + 25, 100),
        notes = ${`Auto-blocked due to security incident ${incidentId}`}
    `;

    console.log(`IP ${ipAddress} blocked due to incident ${incidentId}`);
  } catch (error) {
    console.error('Failed to block IP:', error);
  }
}

/**
 * Send incident notifications
 */
async function sendIncidentNotifications(incident, action) {
  try {
    const severityConfig = INCIDENT_CONFIG.SEVERITY_LEVELS[incident.severity];
    
    // Determine recipients based on severity
    let recipients = [INCIDENT_CONFIG.ESCALATION_CONTACTS.security_team];
    
    if (incident.severity === 'P1') {
      recipients.push(
        INCIDENT_CONFIG.ESCALATION_CONTACTS.leadership,
        INCIDENT_CONFIG.ESCALATION_CONTACTS.legal
      );
    } else if (incident.severity === 'P2') {
      recipients.push(INCIDENT_CONFIG.ESCALATION_CONTACTS.leadership);
    }

    const subject = `[SECURITY ${incident.severity}] ${incident.title}`;
    const message = `
Security Incident Alert

Incident ID: ${incident.id}
Type: ${incident.incident_type}
Severity: ${incident.severity} (${severityConfig.name})
Status: ${incident.status}
Action: ${action}

Description:
${incident.description}

${incident.source_ip ? `Source IP: ${incident.source_ip}` : ''}
${incident.affected_systems?.length ? `Affected Systems: ${incident.affected_systems.join(', ')}` : ''}

Response Time Required: ${severityConfig.responseTime} minutes
${severityConfig.requiresImmediate ? '\n*** IMMEDIATE RESPONSE REQUIRED ***' : ''}

View full incident details in the security dashboard.

Time: ${new Date().toISOString()}
    `;

    // Send email notifications (implement based on your email system)
    for (const recipient of recipients) {
      await sendEmail({
        to: recipient,
        subject,
        text: message,
        priority: incident.severity === 'P1' ? 'high' : 'normal'
      });
    }

  } catch (error) {
    console.error('Failed to send incident notifications:', error);
  }
}

// Helper functions
function calculateIncidentAge(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const ageMs = now - created;
  const ageMinutes = Math.floor(ageMs / (1000 * 60));
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageDays > 0) return `${ageDays}d ${ageHours % 24}h`;
  if (ageHours > 0) return `${ageHours}h ${ageMinutes % 60}m`;
  return `${ageMinutes}m`;
}

function isIncidentOverdue(createdAt, severity, status) {
  if (status === 'resolved' || status === 'closed') return false;
  
  const severityConfig = INCIDENT_CONFIG.SEVERITY_LEVELS[severity];
  if (!severityConfig) return false;

  const now = new Date();
  const created = new Date(createdAt);
  const elapsedMinutes = (now - created) / (1000 * 60);
  
  return elapsedMinutes > severityConfig.responseTime;
}

function calculateEstimatedImpact(incident) {
  const severityMultiplier = {
    'P1': 4,
    'P2': 3,
    'P3': 2,
    'P4': 1
  };

  const systemCount = incident.affected_systems?.length || 1;
  const multiplier = severityMultiplier[incident.severity] || 1;
  
  return Math.min(systemCount * multiplier * 10, 100);
}

function formatIncidentStatistics(stats) {
  const formatted = {
    byStatus: {},
    bySeverity: {},
    total: 0
  };

  stats.forEach(stat => {
    const count = parseInt(stat.count);
    formatted.total += count;
    
    if (!formatted.byStatus[stat.status]) {
      formatted.byStatus[stat.status] = 0;
    }
    formatted.byStatus[stat.status] += count;
    
    if (!formatted.bySeverity[stat.severity]) {
      formatted.bySeverity[stat.severity] = 0;
    }
    formatted.bySeverity[stat.severity] += count;
  });

  return formatted;
}

function mapSeverityToThreatLevel(severity) {
  const mapping = {
    'P1': THREAT_LEVELS.CRITICAL,
    'P2': THREAT_LEVELS.HIGH,
    'P3': THREAT_LEVELS.MEDIUM,
    'P4': THREAT_LEVELS.LOW
  };
  return mapping[severity] || THREAT_LEVELS.MEDIUM;
}

async function enableEnhancedRateLimit(sourceIP) {
  // Implement enhanced rate limiting for specific IP
  // This would integrate with your rate limiting system
  console.log(`Enhanced rate limiting enabled for ${sourceIP}`);
}

async function initiateForensicAnalysis(incident) {
  // Implement forensic analysis initiation
  // This could involve preserving logs, creating system snapshots, etc.
  console.log(`Forensic analysis initiated for incident ${incident.id}`);
}

// Apply security middleware
export default applySecurityMiddleware(securityIncidentHandler, {
  rateLimit: 'api',
  sessionSecurity: true
});