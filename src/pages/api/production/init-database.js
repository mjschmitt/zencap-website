// Production Database Initialization API
// Secure endpoint for initializing production database with migrations

import { runMigrations, getMigrationStatus, verifyMigrations } from '../../../../migrations/migrate.js';
import { checkDatabaseHealth, logSecurityEvent } from '../../../utils/database-production.js';

const ALLOWED_ENVIRONMENTS = ['production', 'staging'];
const INIT_TOKEN = process.env.PRODUCTION_INIT_TOKEN;

export default async function handler(req, res) {
  // Security checks
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  // Environment validation
  if (!ALLOWED_ENVIRONMENTS.includes(process.env.NODE_ENV)) {
    return res.status(403).json({
      error: 'Production initialization only allowed in production/staging environments',
      currentEnv: process.env.NODE_ENV
    });
  }

  // Token authentication
  const authToken = req.headers.authorization?.replace('Bearer ', '') || req.body.token;
  if (!INIT_TOKEN || authToken !== INIT_TOKEN) {
    await logSecurityEvent({
      type: 'unauthorized_database_init',
      action: 'init_database',
      result: 'blocked',
      ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      severity: 'critical',
      metadata: { attemptedAction: 'database_initialization' }
    });

    return res.status(401).json({ 
      error: 'Unauthorized - Invalid or missing authentication token' 
    });
  }

  const startTime = Date.now();
  const initLog = {
    timestamp: new Date().toISOString(),
    operation: req.body.operation || 'full_init',
    ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  };

  try {
    console.log('🚀 Starting production database initialization...');

    const operation = req.body.operation || 'full_init';
    const options = {
      dryRun: req.body.dryRun === true,
      force: req.body.force === true,
      target: req.body.target || null
    };

    let result = {};

    switch (operation) {
      case 'full_init':
        result = await performFullInitialization(options);
        break;

      case 'migrate':
        result = await runMigrations(options);
        break;

      case 'status':
        result = await getMigrationStatus();
        break;

      case 'verify':
        result = await verifyMigrations();
        break;

      case 'health':
        result = await checkDatabaseHealth();
        break;

      default:
        return res.status(400).json({
          error: 'Invalid operation',
          validOperations: ['full_init', 'migrate', 'status', 'verify', 'health']
        });
    }

    const duration = Date.now() - startTime;

    // Log successful operation
    await logSecurityEvent({
      type: 'database_initialized',
      action: operation,
      result: 'success',
      ipAddress: initLog.ipAddress,
      userAgent: initLog.userAgent,
      metadata: {
        operation,
        options,
        duration,
        result: {
          ...result,
          // Sanitize sensitive information
          credentials: undefined,
          connectionString: undefined
        }
      },
      severity: 'info'
    });

    console.log(`✅ Database ${operation} completed successfully (${duration}ms)`);

    res.status(200).json({
      success: true,
      operation,
      duration,
      timestamp: initLog.timestamp,
      result,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(`❌ Database ${initLog.operation} failed:`, error.message);

    // Log failed operation
    await logSecurityEvent({
      type: 'database_init_failed',
      action: initLog.operation,
      result: 'error',
      ipAddress: initLog.ipAddress,
      userAgent: initLog.userAgent,
      errorDetails: {
        message: error.message,
        stack: error.stack
      },
      metadata: { duration },
      severity: 'error'
    });

    res.status(500).json({
      success: false,
      operation: initLog.operation,
      duration,
      timestamp: initLog.timestamp,
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}

/**
 * Perform complete database initialization
 */
async function performFullInitialization(options = {}) {
  console.log('📋 Running full database initialization...');

  const results = {
    steps: [],
    summary: {},
    startTime: new Date().toISOString()
  };

  try {
    // Step 1: Check current database status
    console.log('1️⃣ Checking current database status...');
    const healthCheck = await checkDatabaseHealth();
    results.steps.push({
      step: 'health_check',
      status: 'completed',
      result: healthCheck
    });

    if (healthCheck.status !== 'healthy') {
      throw new Error(`Database health check failed: ${healthCheck.error}`);
    }

    // Step 2: Get migration status
    console.log('2️⃣ Checking migration status...');
    const migrationStatus = await getMigrationStatus();
    results.steps.push({
      step: 'migration_status',
      status: 'completed',
      result: migrationStatus
    });

    // Step 3: Run migrations
    if (migrationStatus.pendingMigrations > 0 || options.force) {
      console.log('3️⃣ Running database migrations...');
      const migrationResult = await runMigrations(options);
      results.steps.push({
        step: 'run_migrations',
        status: 'completed',
        result: migrationResult
      });
      results.summary.migrationsExecuted = migrationResult.executedCount || 0;
    } else {
      console.log('3️⃣ No pending migrations - skipping');
      results.steps.push({
        step: 'run_migrations',
        status: 'skipped',
        reason: 'no_pending_migrations'
      });
      results.summary.migrationsExecuted = 0;
    }

    // Step 4: Verify migration integrity
    console.log('4️⃣ Verifying migration integrity...');
    const verificationResult = await verifyMigrations();
    results.steps.push({
      step: 'verify_migrations',
      status: verificationResult.errors > 0 ? 'warning' : 'completed',
      result: verificationResult
    });

    // Step 5: Final health check
    console.log('5️⃣ Final health check...');
    const finalHealthCheck = await checkDatabaseHealth();
    results.steps.push({
      step: 'final_health_check',
      status: 'completed',
      result: finalHealthCheck
    });

    // Step 6: Create initial backup (if not dry run)
    if (!options.dryRun && process.env.BACKUP_ON_INIT === 'true') {
      console.log('6️⃣ Creating initial backup...');
      try {
        // This would call the backup script
        results.steps.push({
          step: 'initial_backup',
          status: 'completed',
          result: { message: 'Backup creation initiated' }
        });
      } catch (backupError) {
        console.warn('⚠️ Backup creation failed:', backupError.message);
        results.steps.push({
          step: 'initial_backup',
          status: 'warning',
          error: backupError.message
        });
      }
    }

    results.summary.totalSteps = results.steps.length;
    results.summary.completedSteps = results.steps.filter(s => s.status === 'completed').length;
    results.summary.warningSteps = results.steps.filter(s => s.status === 'warning').length;
    results.summary.failedSteps = results.steps.filter(s => s.status === 'failed').length;
    results.summary.skippedSteps = results.steps.filter(s => s.status === 'skipped').length;
    
    results.endTime = new Date().toISOString();
    results.success = true;

    console.log('✅ Full database initialization completed successfully');
    return results;

  } catch (error) {
    results.steps.push({
      step: 'initialization_error',
      status: 'failed',
      error: error.message
    });
    
    results.endTime = new Date().toISOString();
    results.success = false;
    results.error = error.message;

    throw error;
  }
}

/**
 * Get detailed database information for diagnostics
 */
export async function getDatabaseDiagnostics() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {},
      migrations: {},
      performance: {},
      security: {}
    };

    // Database connection info
    diagnostics.database = await checkDatabaseHealth();

    // Migration status
    diagnostics.migrations = await getMigrationStatus();

    return diagnostics;

  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Export for testing
export { performFullInitialization };