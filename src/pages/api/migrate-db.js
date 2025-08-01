// src/pages/api/migrate-db.js - Database migration endpoint
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action } = req.body;

  try {
    if (action === 'fix-date-format') {
      // Get all existing insights
      const result = await sql`SELECT id, title, slug FROM insights ORDER BY title;`;
      const insights = result.rows;

      // Define correct date strings for PostgreSQL DATE format
      const dateMapping = {
        'q4-2024': '2024-12-31',
        'q1-2025': '2025-03-31', 
        'q2-2025': '2025-06-30'
      };

      const updates = [];

      // Update each insight with the correct date format
      for (const insight of insights) {
        let publishedDate = null;
        const title = insight.title.toLowerCase();
        const slug = insight.slug.toLowerCase();

        // Determine the appropriate date based on content
        if (title.includes('q4 2024') || slug.includes('q4-2024')) {
          publishedDate = dateMapping['q4-2024'];
        } else if (title.includes('q1 2025') || slug.includes('q1-2025') || 
                   title.includes('march 2025') || slug.includes('march-2025')) {
          publishedDate = dateMapping['q1-2025'];
        } else if (title.includes('q2 2025') || slug.includes('q2-2025')) {
          publishedDate = dateMapping['q2-2025'];
        } else {
          // Default for articles without specific quarter mention - use Q1 2025
          publishedDate = dateMapping['q1-2025'];
        }

        // Update the insight with the correct date format
        await sql`
          UPDATE insights 
          SET date_published = ${publishedDate}
          WHERE id = ${insight.id};
        `;

        updates.push({
          id: insight.id,
          title: insight.title,
          date_published: publishedDate
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Date format fixed successfully',
        updates: updates
      });
    }

    if (action === 'add-date-published-field') {
      // Add the date_published field to the insights table
      await sql`
        ALTER TABLE insights 
        ADD COLUMN IF NOT EXISTS date_published DATE;
      `;

      // Get all existing insights
      const result = await sql`SELECT id, title, slug FROM insights ORDER BY title;`;
      const insights = result.rows;

      // Define date mappings based on article periods
      const dateMapping = {
        'q4-2024': '2024-12-31',
        'q1-2025': '2025-03-31', 
        'q2-2025': '2025-06-30'
      };

      const updates = [];

      // Update each insight with appropriate date
      for (const insight of insights) {
        let publishedDate = null;
        const title = insight.title.toLowerCase();
        const slug = insight.slug.toLowerCase();

        // Determine the appropriate date based on content
        if (title.includes('q4 2024') || slug.includes('q4-2024')) {
          publishedDate = dateMapping['q4-2024'];
        } else if (title.includes('q1 2025') || slug.includes('q1-2025') || 
                   title.includes('march 2025') || slug.includes('march-2025')) {
          publishedDate = dateMapping['q1-2025'];
        } else if (title.includes('q2 2025') || slug.includes('q2-2025')) {
          publishedDate = dateMapping['q2-2025'];
        } else {
          // Default for articles without specific quarter mention - use Q1 2025
          publishedDate = dateMapping['q1-2025'];
        }

        // Update the insight with the determined date
        await sql`
          UPDATE insights 
          SET date_published = ${publishedDate}
          WHERE id = ${insight.id};
        `;

        updates.push({
          id: insight.id,
          title: insight.title,
          date_published: publishedDate
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'date_published field added and populated successfully',
        updates: updates
      });
    }

    if (action === 'add-date-field') {
      // Add the date field to the insights table
      await sql`
        ALTER TABLE insights 
        ADD COLUMN IF NOT EXISTS article_date DATE;
      `;

      // Get all existing insights
      const result = await sql`SELECT id, title, slug FROM insights ORDER BY title;`;
      const insights = result.rows;

      // Define date mappings based on article periods
      const dateMapping = {
        'q4-2024': '2024-12-31',
        'q1-2025': '2025-03-31', 
        'q2-2025': '2025-06-30'
      };

      const updates = [];

      // Update each insight with appropriate date
      for (const insight of insights) {
        let articleDate = null;
        const title = insight.title.toLowerCase();
        const slug = insight.slug.toLowerCase();

        // Determine the appropriate date based on content
        if (title.includes('q4 2024') || slug.includes('q4-2024')) {
          articleDate = dateMapping['q4-2024'];
        } else if (title.includes('q1 2025') || slug.includes('q1-2025') || 
                   title.includes('march 2025') || slug.includes('march-2025')) {
          articleDate = dateMapping['q1-2025'];
        } else if (title.includes('q2 2025') || slug.includes('q2-2025')) {
          articleDate = dateMapping['q2-2025'];
        } else {
          // Default for articles without specific quarter mention - use Q1 2025
          articleDate = dateMapping['q1-2025'];
        }

        // Update the insight with the determined date
        await sql`
          UPDATE insights 
          SET article_date = ${articleDate}
          WHERE id = ${insight.id};
        `;

        updates.push({
          id: insight.id,
          title: insight.title,
          date: articleDate
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Date field added and populated successfully',
        updates: updates
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: 'Migration failed', details: error.message });
  }
} 