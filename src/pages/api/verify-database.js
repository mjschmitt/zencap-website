// Verify database tables and data
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      tables: {},
      counts: {},
      errors: []
    };

    // List of tables to check
    const tablesToCheck = [
      'leads',
      'newsletter_subscribers',
      'form_submissions',
      'insights',
      'models',
      'performance_metrics',
      'error_logs',
      'user_analytics',
      'security_audit_logs'
    ];

    // Check if each table exists and get row count
    for (const table of tablesToCheck) {
      try {
        const result = await sql`
          SELECT COUNT(*) as count 
          FROM ${sql.identifier([table])}
        `;
        results.tables[table] = true;
        results.counts[table] = parseInt(result.rows[0].count);
      } catch (error) {
        results.tables[table] = false;
        results.counts[table] = 0;
        results.errors.push({
          table,
          error: error.message
        });
      }
    }

    // Check specific columns for insights table
    try {
      const insightsColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'insights'
        ORDER BY ordinal_position
      `;
      results.insightsColumns = insightsColumns.rows.map(col => col.column_name);
    } catch (error) {
      results.insightsColumns = [];
      results.errors.push({
        check: 'insights_columns',
        error: error.message
      });
    }

    // Check specific columns for models table
    try {
      const modelsColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'models'
        ORDER BY ordinal_position
      `;
      results.modelsColumns = modelsColumns.rows.map(col => col.column_name);
    } catch (error) {
      results.modelsColumns = [];
      results.errors.push({
        check: 'models_columns',
        error: error.message
      });
    }

    // Get sample data from insights
    try {
      const sampleInsights = await sql`
        SELECT slug, title, status, date_published 
        FROM insights 
        LIMIT 3
      `;
      results.sampleInsights = sampleInsights.rows;
    } catch (error) {
      results.sampleInsights = [];
    }

    // Get sample data from models
    try {
      const sampleModels = await sql`
        SELECT slug, title, category, price 
        FROM models 
        LIMIT 3
      `;
      results.sampleModels = sampleModels.rows;
    } catch (error) {
      results.sampleModels = [];
    }

    // Summary
    const missingTables = Object.entries(results.tables)
      .filter(([_, exists]) => !exists)
      .map(([table]) => table);

    const emptyTables = Object.entries(results.counts)
      .filter(([_, count]) => count === 0)
      .map(([table]) => table);

    results.summary = {
      allTablesExist: missingTables.length === 0,
      missingTables,
      emptyTables,
      totalErrors: results.errors.length,
      databaseHealthy: missingTables.length === 0 && results.errors.length === 0
    };

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Database verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify database',
      details: error.message
    });
  }
}