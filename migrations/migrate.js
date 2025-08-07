// ZenCap Production Database Migration System
// Automated migration execution with error handling and rollback capabilities

import fs from 'fs';
import path from 'path';
import { sql } from '@vercel/postgres';

/**
 * Run all pending database migrations
 * @param {Object} options - Migration options
 * @param {boolean} options.dryRun - Preview migrations without executing
 * @param {boolean} options.force - Force re-run of migrations
 * @param {string} options.target - Target specific migration version
 */
export async function runMigrations(options = {}) {
  const { dryRun = false, force = false, target = null } = options;
  
  try {
    console.log('🚀 Starting ZenCap database migration...');
    
    // Create migrations tracking table
    await initializeMigrationTracking();
    
    // Get migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📁 Found ${migrationFiles.length} migration files`);
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`✅ ${executedMigrations.length} migrations already executed`);
    
    // Determine pending migrations
    const pendingMigrations = getPendingMigrations(migrationFiles, executedMigrations, force, target);
    
    if (pendingMigrations.length === 0) {
      console.log('✨ No pending migrations. Database is up to date!');
      return { success: true, executedCount: 0 };
    }
    
    console.log(`📝 ${pendingMigrations.length} migrations to execute:`);
    pendingMigrations.forEach(file => console.log(`   - ${file}`));
    
    if (dryRun) {
      console.log('🔍 Dry run mode - migrations preview completed');
      return { success: true, dryRun: true, pendingCount: pendingMigrations.length };
    }
    
    // Execute migrations
    let executedCount = 0;
    for (const migrationFile of pendingMigrations) {
      await executeMigration(migrationFile);
      executedCount++;
    }
    
    console.log(`✅ Successfully executed ${executedCount} migrations`);
    
    // Run seed data if this is initial setup
    if (executedMigrations.length === 0) {
      await runSeedData();
    }
    
    return { success: true, executedCount };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Initialize migration tracking table
 */
async function initializeMigrationTracking() {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) NOT NULL UNIQUE,
      filename VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER,
      checksum VARCHAR(64)
    );
  `;
  
  // Add index for performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_version 
    ON schema_migrations(version);
  `;
}

/**
 * Get all migration files sorted by version
 */
function getMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && file.match(/^\\d{3}_/))
    .sort();
}

/**
 * Get list of executed migrations from database
 */
async function getExecutedMigrations() {
  try {
    const result = await sql`
      SELECT version, filename, executed_at 
      FROM schema_migrations 
      ORDER BY version;
    `;
    return result.rows.map(row => row.filename);
  } catch (error) {
    // If table doesn't exist, return empty array
    if (error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

/**
 * Determine which migrations need to be executed
 */
function getPendingMigrations(migrationFiles, executedMigrations, force, target) {
  let pending = migrationFiles.filter(file => {
    if (force) return true;
    return !executedMigrations.includes(file);
  });
  
  // Filter by target if specified
  if (target) {
    const targetIndex = pending.findIndex(file => file.startsWith(target));
    if (targetIndex === -1) {
      throw new Error(`Target migration not found: ${target}`);
    }
    pending = pending.slice(0, targetIndex + 1);
  }
  
  return pending;
}

/**
 * Execute a single migration file
 */
async function executeMigration(migrationFile) {
  const startTime = Date.now();
  const version = migrationFile.replace('.sql', '');
  
  console.log(`📄 Executing migration: ${migrationFile}`);
  
  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Calculate checksum for verification
    const checksum = generateChecksum(migrationSQL);
    
    // Execute migration in transaction
    await sql.begin(async (sql) => {
      // Execute the migration SQL
      await sql.unsafe(migrationSQL);
      
      // Record migration execution
      await sql`
        INSERT INTO schema_migrations (version, filename, execution_time_ms, checksum)
        VALUES (
          ${version}, 
          ${migrationFile}, 
          ${Date.now() - startTime},
          ${checksum}
        )
        ON CONFLICT (version) DO UPDATE SET
          executed_at = CURRENT_TIMESTAMP,
          execution_time_ms = EXCLUDED.execution_time_ms,
          checksum = EXCLUDED.checksum;
      `;
    });
    
    console.log(`✅ Completed migration: ${migrationFile} (${Date.now() - startTime}ms)`);
    
  } catch (error) {
    console.error(`❌ Failed to execute migration ${migrationFile}:`, error.message);
    throw new Error(`Migration ${migrationFile} failed: ${error.message}`);
  }
}

/**
 * Generate checksum for migration verification
 */
function generateChecksum(content) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Run seed data after initial migration
 */
async function runSeedData() {
  console.log('🌱 Running seed data...');
  
  const seedDir = path.join(process.cwd(), 'migrations', 'seed');
  
  if (!fs.existsSync(seedDir)) {
    console.log('⚠️  No seed directory found, skipping seed data');
    return;
  }
  
  const seedFiles = fs.readdirSync(seedDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const seedFile of seedFiles) {
    console.log(`🌱 Loading seed data: ${seedFile}`);
    
    try {
      const seedPath = path.join(seedDir, seedFile);
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      await sql.begin(async (sql) => {
        await sql.unsafe(seedSQL);
      });
      
      console.log(`✅ Completed seed data: ${seedFile}`);
    } catch (error) {
      console.error(`❌ Failed to load seed data ${seedFile}:`, error.message);
      // Continue with other seed files on error
    }
  }
}

/**
 * Rollback to specific migration version
 */
export async function rollbackMigration(targetVersion) {
  console.log(`🔄 Rolling back to migration: ${targetVersion}`);
  
  try {
    // Get migrations to rollback (newer than target)
    const result = await sql`
      SELECT version, filename 
      FROM schema_migrations 
      WHERE version > ${targetVersion}
      ORDER BY version DESC;
    `;
    
    if (result.rows.length === 0) {
      console.log('✨ No migrations to rollback');
      return;
    }
    
    console.log(`📝 Rolling back ${result.rows.length} migrations`);
    
    // Remove migration records (manual rollback of schema changes required)
    await sql`
      DELETE FROM schema_migrations 
      WHERE version > ${targetVersion};
    `;
    
    console.log('⚠️  Migration records removed. Manual schema rollback may be required.');
    console.log('⚠️  Consider restoring from backup for complete rollback.');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Verify migration integrity
 */
export async function verifyMigrations() {
  console.log('🔍 Verifying migration integrity...');
  
  try {
    const migrationFiles = getMigrationFiles();
    const result = await sql`
      SELECT version, filename, checksum 
      FROM schema_migrations 
      ORDER BY version;
    `;
    
    let verified = 0;
    let errors = 0;
    
    for (const migration of result.rows) {
      const migrationPath = path.join(process.cwd(), 'migrations', migration.filename);
      
      if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Migration file missing: ${migration.filename}`);
        errors++;
        continue;
      }
      
      const content = fs.readFileSync(migrationPath, 'utf8');
      const expectedChecksum = generateChecksum(content);
      
      if (migration.checksum !== expectedChecksum) {
        console.error(`❌ Checksum mismatch for ${migration.filename}`);
        console.error(`   Expected: ${expectedChecksum}`);
        console.error(`   Actual:   ${migration.checksum}`);
        errors++;
      } else {
        verified++;
      }
    }
    
    console.log(`✅ Verified ${verified} migrations`);
    
    if (errors > 0) {
      console.error(`❌ ${errors} migration integrity errors found`);
      throw new Error(`Migration verification failed: ${errors} errors`);
    }
    
    return { verified, errors };
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    throw error;
  }
}

/**
 * Get migration status
 */
export async function getMigrationStatus() {
  try {
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    const result = await sql`
      SELECT 
        version, 
        filename, 
        executed_at, 
        execution_time_ms 
      FROM schema_migrations 
      ORDER BY version DESC 
      LIMIT 10;
    `;
    
    return {
      totalMigrations: migrationFiles.length,
      executedMigrations: executedMigrations.length,
      pendingMigrations: migrationFiles.length - executedMigrations.length,
      lastExecuted: result.rows[0] || null,
      recentMigrations: result.rows
    };
    
  } catch (error) {
    console.error('❌ Failed to get migration status:', error);
    throw error;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    force: process.argv.includes('--force'),
    target: process.argv.find(arg => arg.startsWith('--target='))?.split('=')[1]
  };
  
  switch (command) {
    case 'up':
      runMigrations(options).catch(process.exit);
      break;
    case 'rollback':
      const version = process.argv[3];
      if (!version) {
        console.error('❌ Please specify version to rollback to');
        process.exit(1);
      }
      rollbackMigration(version).catch(process.exit);
      break;
    case 'verify':
      verifyMigrations().catch(process.exit);
      break;
    case 'status':
      getMigrationStatus().then(status => {
        console.log('📊 Migration Status:');
        console.log(`   Total migrations: ${status.totalMigrations}`);
        console.log(`   Executed: ${status.executedMigrations}`);
        console.log(`   Pending: ${status.pendingMigrations}`);
        if (status.lastExecuted) {
          console.log(`   Last executed: ${status.lastExecuted.filename} at ${status.lastExecuted.executed_at}`);
        }
      }).catch(process.exit);
      break;
    default:
      console.log('Usage: node migrate.js [up|rollback|verify|status] [options]');
      console.log('Options:');
      console.log('  --dry-run    Preview migrations without executing');
      console.log('  --force      Re-run all migrations');
      console.log('  --target=X   Run up to specific migration version');
  }
}