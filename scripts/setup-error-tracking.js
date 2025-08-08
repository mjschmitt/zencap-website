#!/usr/bin/env node

/**
 * @fileoverview Error tracking setup script
 * @description Sets up comprehensive error tracking and monitoring for production
 */

const { sql } = require('@vercel/postgres');
const fs = require('fs').promises;
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

/**
 * Create monitoring database tables
 */
async function createMonitoringTables() {
  logStep('1/8', 'Creating monitoring database tables...');
  
  try {
    // Create monitoring_alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS monitoring_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(50) UNIQUE NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        severity_level INTEGER NOT NULL,
        message TEXT NOT NULL,
        metric_data JSONB,
        error_data JSONB,
        pattern_data JSONB,
        metadata JSONB DEFAULT '{}',
        source VARCHAR(100),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        acknowledged BOOLEAN DEFAULT FALSE,
        acknowledged_by VARCHAR(100),
        acknowledged_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create error_patterns table
    await sql`
      CREATE TABLE IF NOT EXISTS error_patterns (
        id SERIAL PRIMARY KEY,
        pattern_id VARCHAR(50) UNIQUE NOT NULL,
        pattern_type VARCHAR(100) NOT NULL,
        pattern_data JSONB NOT NULL,
        occurrence_count INTEGER DEFAULT 1,
        first_seen TIMESTAMP WITH TIME ZONE NOT NULL,
        last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
        severity_level INTEGER DEFAULT 1,
        is_resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create incidents table
    await sql`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        incident_id VARCHAR(50) UNIQUE NOT NULL,
        alert_id VARCHAR(50),
        title VARCHAR(200) NOT NULL,
        description TEXT,
        severity VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        assigned_to VARCHAR(100),
        tags TEXT[],
        impact_level VARCHAR(20) DEFAULT 'low',
        affected_components TEXT[],
        resolution_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        
        CONSTRAINT fk_incident_alert 
          FOREIGN KEY (alert_id) 
          REFERENCES monitoring_alerts(alert_id)
          ON DELETE SET NULL
      )
    `;

    // Create performance_alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        threshold_value NUMERIC,
        actual_value NUMERIC,
        endpoint VARCHAR(200),
        user_agent TEXT,
        location VARCHAR(100),
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT fk_performance_alert 
          FOREIGN KEY (alert_id) 
          REFERENCES monitoring_alerts(alert_id)
          ON DELETE CASCADE
      )
    `;

    // Create security_incidents table
    await sql`
      CREATE TABLE IF NOT EXISTS security_incidents (
        id SERIAL PRIMARY KEY,
        incident_id VARCHAR(50) UNIQUE NOT NULL,
        alert_id VARCHAR(50),
        incident_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        description TEXT,
        source_ip INET,
        user_agent TEXT,
        endpoint VARCHAR(200),
        payload_hash VARCHAR(64),
        metadata JSONB DEFAULT '{}',
        is_blocked BOOLEAN DEFAULT FALSE,
        investigation_status VARCHAR(20) DEFAULT 'pending',
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        CONSTRAINT fk_security_alert 
          FOREIGN KEY (alert_id) 
          REFERENCES monitoring_alerts(alert_id)
          ON DELETE SET NULL
      )
    `;

    // Create error_tracking_stats table for dashboards
    await sql`
      CREATE TABLE IF NOT EXISTS error_tracking_stats (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
        error_count INTEGER DEFAULT 0,
        warning_count INTEGER DEFAULT 0,
        critical_count INTEGER DEFAULT 0,
        unique_errors INTEGER DEFAULT 0,
        total_requests INTEGER DEFAULT 0,
        error_rate NUMERIC(5,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE(date, hour)
      )
    `;

    logSuccess('Monitoring database tables created successfully');

  } catch (error) {
    logError(`Failed to create monitoring tables: ${error.message}`);
    throw error;
  }
}

/**
 * Create database indexes for performance
 */
async function createIndexes() {
  logStep('2/8', 'Creating database indexes for optimal performance...');
  
  try {
    const indexes = [
      // Monitoring alerts indexes
      'CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_timestamp ON monitoring_alerts(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_severity ON monitoring_alerts(severity_level DESC)',
      'CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_type ON monitoring_alerts(alert_type)',
      'CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_source ON monitoring_alerts(source)',
      
      // Error patterns indexes
      'CREATE INDEX IF NOT EXISTS idx_error_patterns_type ON error_patterns(pattern_type)',
      'CREATE INDEX IF NOT EXISTS idx_error_patterns_last_seen ON error_patterns(last_seen DESC)',
      'CREATE INDEX IF NOT EXISTS idx_error_patterns_count ON error_patterns(occurrence_count DESC)',
      'CREATE INDEX IF NOT EXISTS idx_error_patterns_resolved ON error_patterns(is_resolved, last_seen DESC)',
      
      // Incidents indexes
      'CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status)',
      'CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity)',
      'CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_incidents_assigned ON incidents(assigned_to)',
      
      // Performance alerts indexes
      'CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_performance_alerts_metric ON performance_alerts(metric_name)',
      'CREATE INDEX IF NOT EXISTS idx_performance_alerts_endpoint ON performance_alerts(endpoint)',
      
      // Security incidents indexes
      'CREATE INDEX IF NOT EXISTS idx_security_incidents_timestamp ON security_incidents(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(incident_type)',
      'CREATE INDEX IF NOT EXISTS idx_security_incidents_ip ON security_incidents(source_ip)',
      'CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(investigation_status)',
      
      // Stats indexes
      'CREATE INDEX IF NOT EXISTS idx_error_tracking_stats_date_hour ON error_tracking_stats(date DESC, hour DESC)',
      'CREATE INDEX IF NOT EXISTS idx_error_tracking_stats_error_rate ON error_tracking_stats(error_rate DESC)'
    ];

    for (const indexSQL of indexes) {
      await sql.query(indexSQL);
    }

    logSuccess('Database indexes created successfully');

  } catch (error) {
    logError(`Failed to create indexes: ${error.message}`);
    throw error;
  }
}

/**
 * Set up log directory structure
 */
async function setupLogDirectories() {
  logStep('3/8', 'Setting up log directory structure...');
  
  try {
    const logDirs = [
      'logs',
      'logs/errors',
      'logs/performance',
      'logs/security',
      'logs/archived'
    ];

    for (const dir of logDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logSuccess(`Created log directory: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        logWarning(`Log directory already exists: ${dir}`);
      }
    }

    // Create .gitkeep files to preserve empty directories
    for (const dir of logDirs) {
      const gitkeepPath = path.join(dir, '.gitkeep');
      try {
        await fs.writeFile(gitkeepPath, '', { flag: 'wx' });
      } catch (error) {
        // File already exists, that's fine
      }
    }

    logSuccess('Log directory structure setup complete');

  } catch (error) {
    logError(`Failed to setup log directories: ${error.message}`);
    throw error;
  }
}

/**
 * Create monitoring configuration files
 */
async function createConfigFiles() {
  logStep('4/8', 'Creating monitoring configuration files...');
  
  try {
    // Create Winston logger configuration
    const winstonConfig = `/**
 * Winston logger configuration for production
 * Generated by setup-error-tracking.js
 */

const winston = require('winston');
require('winston-daily-rotate-file');

const createLogger = () => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { 
      service: 'zenith-capital-api',
      version: process.env.npm_package_version || 'unknown'
    },
    transports: [
      // Error logs
      new winston.transports.DailyRotateFile({
        filename: 'logs/errors/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: process.env.LOG_RETENTION_DAYS || '14d',
        zippedArchive: true
      }),
      
      // Combined logs
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: '7d',
        zippedArchive: true
      }),
      
      // Performance logs
      new winston.transports.DailyRotateFile({
        filename: 'logs/performance/perf-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        maxSize: '10m',
        maxFiles: '3d',
        zippedArchive: true
      })
    ]
  });
};

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
  createLogger().add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = { createLogger };
`;

    await fs.writeFile('src/config/winston.js', winstonConfig);
    logSuccess('Created Winston logger configuration');

    // Create monitoring dashboard config
    const dashboardConfig = `/**
 * Error monitoring dashboard configuration
 * Generated by setup-error-tracking.js
 */

export const MONITORING_CONFIG = {
  // Dashboard refresh intervals
  refreshIntervals: {
    metrics: 30000, // 30 seconds
    errors: 60000,  // 1 minute
    patterns: 120000, // 2 minutes
    alerts: 15000   // 15 seconds
  },
  
  // Alert severity colors
  severityColors: {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  
  // Chart configurations
  charts: {
    errorRate: {
      type: 'line',
      height: 200,
      showGrid: true,
      strokeWidth: 2
    },
    errorDistribution: {
      type: 'doughnut',
      height: 250,
      showLegend: true
    }
  },
  
  // Performance thresholds
  thresholds: {
    errorRate: {
      warning: 1.0,  // 1%
      critical: 5.0  // 5%
    },
    responseTime: {
      warning: 1000,   // 1 second
      critical: 3000   // 3 seconds
    },
    memoryUsage: {
      warning: 512 * 1024 * 1024,  // 512MB
      critical: 1024 * 1024 * 1024  // 1GB
    }
  }
};

export default MONITORING_CONFIG;
`;

    await fs.writeFile('src/config/monitoring.js', dashboardConfig);
    logSuccess('Created monitoring dashboard configuration');

  } catch (error) {
    logError(`Failed to create configuration files: ${error.message}`);
    throw error;
  }
}

/**
 * Validate environment configuration
 */
async function validateEnvironment() {
  logStep('5/8', 'Validating environment configuration...');
  
  try {
    const requiredEnvVars = [
      'POSTGRES_URL',
      'SENDGRID_API_KEY'
    ];

    const optionalEnvVars = [
      'SENTRY_DSN',
      'NEXT_PUBLIC_SENTRY_DSN',
      'ALERT_EMAIL_RECIPIENTS',
      'SLACK_WEBHOOK_URL',
      'LOG_LEVEL'
    ];

    let missingRequired = [];
    let missingOptional = [];

    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingRequired.push(envVar);
      } else {
        logSuccess(`✓ ${envVar} is configured`);
      }
    }

    // Check optional variables
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        missingOptional.push(envVar);
      } else {
        logSuccess(`✓ ${envVar} is configured`);
      }
    }

    // Report missing variables
    if (missingRequired.length > 0) {
      logError(`Missing required environment variables: ${missingRequired.join(', ')}`);
      logError('Please check your .env.local file and env.monitoring.example');
      throw new Error('Required environment variables missing');
    }

    if (missingOptional.length > 0) {
      logWarning(`Missing optional environment variables: ${missingOptional.join(', ')}`);
      logWarning('Some monitoring features may not be available');
    }

    logSuccess('Environment configuration validation complete');

  } catch (error) {
    logError(`Environment validation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test database connectivity
 */
async function testDatabaseConnection() {
  logStep('6/8', 'Testing database connectivity...');
  
  try {
    const result = await sql`SELECT NOW() as current_time, version() as db_version`;
    
    if (result.rows && result.rows.length > 0) {
      logSuccess(`Database connection successful`);
      logSuccess(`Database time: ${result.rows[0].current_time}`);
      log(`Database version: ${result.rows[0].db_version}`, 'cyan');
    } else {
      throw new Error('Database query returned no results');
    }

  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Initialize error tracking data
 */
async function initializeTrackingData() {
  logStep('7/8', 'Initializing error tracking data...');
  
  try {
    // Insert initial stats record for today
    const today = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    await sql`
      INSERT INTO error_tracking_stats (date, hour, error_count, warning_count, critical_count)
      VALUES (${today}, ${currentHour}, 0, 0, 0)
      ON CONFLICT (date, hour) DO NOTHING
    `;

    // Test error pattern insertion
    const testPatternId = `pattern_test_${Date.now()}`;
    await sql`
      INSERT INTO error_patterns (
        pattern_id, 
        pattern_type, 
        pattern_data, 
        first_seen, 
        last_seen
      ) VALUES (
        ${testPatternId},
        'setup_test',
        '{"message": "Error tracking setup test", "component": "setup-script"}',
        NOW(),
        NOW()
      )
    `;

    // Clean up test data
    await sql`DELETE FROM error_patterns WHERE pattern_id = ${testPatternId}`;

    logSuccess('Error tracking data initialization complete');

  } catch (error) {
    logError(`Failed to initialize tracking data: ${error.message}`);
    throw error;
  }
}

/**
 * Generate setup report
 */
async function generateSetupReport() {
  logStep('8/8', 'Generating setup report...');
  
  try {
    const report = `# Error Tracking Setup Report
Generated: ${new Date().toISOString()}

## Setup Status: ✅ COMPLETE

### Database Tables Created:
- ✅ monitoring_alerts
- ✅ error_patterns  
- ✅ incidents
- ✅ performance_alerts
- ✅ security_incidents
- ✅ error_tracking_stats

### Indexes Created:
- ✅ Performance indexes for all tables
- ✅ Query optimization indexes

### Configuration Files:
- ✅ Winston logger configuration (src/config/winston.js)
- ✅ Monitoring dashboard config (src/config/monitoring.js)

### Log Directories:
- ✅ logs/
- ✅ logs/errors/
- ✅ logs/performance/
- ✅ logs/security/
- ✅ logs/archived/

### Next Steps:

1. **Configure Environment Variables**:
   - Copy values from env.monitoring.example to your .env.local
   - Set up Sentry DSN for production error tracking
   - Configure alert email recipients

2. **Set Up Notifications**:
   - Configure Slack webhook for real-time alerts
   - Set up PagerDuty or similar for critical incidents
   - Test email alerting system

3. **Deploy Error Dashboard**:
   - Access error dashboard at /admin/error-dashboard
   - Configure monitoring thresholds
   - Set up automated reports

4. **Production Deployment**:
   - Deploy with environment variables configured
   - Test error tracking in staging environment
   - Monitor initial deployment for issues

### Monitoring Endpoints:
- Error Dashboard: /admin/error-dashboard
- API Metrics: /api/monitoring/error-metrics
- Error Patterns: /api/monitoring/error-patterns
- Health Check: /api/health
- Alerts: /api/monitoring/alert

### Support:
For issues or questions, contact: devops@zenithcapitaladvisors.com
`;

    await fs.writeFile('ERROR_TRACKING_SETUP_REPORT.md', report);
    logSuccess('Setup report generated: ERROR_TRACKING_SETUP_REPORT.md');

    // Also log to console
    log('\n' + '='.repeat(60), 'green');
    log('🎉 ERROR TRACKING SETUP COMPLETE! 🎉', 'green');
    log('='.repeat(60), 'green');
    
    log('\nNext Steps:', 'yellow');
    log('1. Configure environment variables from env.monitoring.example', 'white');
    log('2. Set up Sentry DSN for production error tracking', 'white');
    log('3. Configure alert notifications (Slack, email)', 'white');
    log('4. Access error dashboard at /admin/error-dashboard', 'white');
    log('5. Deploy and test in staging environment', 'white');
    
    log('\nMonitoring is now ready for production! 🚀', 'cyan');

  } catch (error) {
    logError(`Failed to generate setup report: ${error.message}`);
    throw error;
  }
}

/**
 * Main setup function
 */
async function main() {
  log('\n🔧 Zenith Capital Advisors - Error Tracking Setup', 'cyan');
  log('='.repeat(50), 'cyan');
  
  try {
    await createMonitoringTables();
    await createIndexes();
    await setupLogDirectories();
    await createConfigFiles();
    await validateEnvironment();
    await testDatabaseConnection();
    await initializeTrackingData();
    await generateSetupReport();

    log('\n✅ Error tracking setup completed successfully!', 'green');
    process.exit(0);

  } catch (error) {
    log('\n❌ Error tracking setup failed!', 'red');
    logError(error.message);
    
    if (error.stack) {
      log('\nStack trace:', 'yellow');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createMonitoringTables,
  createIndexes,
  setupLogDirectories,
  createConfigFiles,
  validateEnvironment,
  testDatabaseConnection,
  initializeTrackingData,
  main
};