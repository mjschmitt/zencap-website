const fs = require('fs');

// Database configuration
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DATABASE || 'zencap_db',
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password'
};

// Read the enhanced HTML content
const enhancedContent = fs.readFileSync('fed-policy-q1-2025.html', 'utf8');

// Insight data
const insightData = {
  title: "Federal Reserve Policy Shifts: March 2025 Analysis",
  slug: "federal-reserve-policy-shifts-march-2025-analysis", 
  summary: "Strategic Investment Framework for Transitioning Monetary Policy. The Federal Reserve's March 2025 policy shift represents a critical inflection point for multi-asset portfolio construction. Our analysis indicates a 180bp cumulative easing cycle through Q4 2025, creating significant opportunities in duration-sensitive assets while necessitating tactical adjustments in credit allocation strategies.",
  content: enhancedContent,
  author: "Zenith Capital Research Team",
  category: "Economic Policy",
  tags: ["Federal Reserve", "Monetary Policy", "Interest Rates", "Investment Strategy", "Q1 2025"],
  featured: true,
  status: "published",
  cover_image: "/images/insights/q4-2024-tech-earnings-analysis.jpg",
  created_at: new Date('2025-01-15'),
  updated_at: new Date()
};

async function updateInsight() {
  try {
    const { Client } = require('pg');
    const client = new Client(DB_CONFIG);
    
    await client.connect();
    console.log('✅ Connected to database');

    // Check if insight exists
    const existingInsight = await client.query(
      'SELECT id FROM insights WHERE slug = $1',
      [insightData.slug]
    );

    let result;
    if (existingInsight.rows.length > 0) {
      // Update existing insight
      result = await client.query(`
        UPDATE insights 
        SET title = $1, summary = $2, content = $3, author = $4, category = $5, 
            tags = $6, featured = $7, status = $8, cover_image = $9, updated_at = $10
        WHERE slug = $11
        RETURNING id, title`,
        [
          insightData.title, insightData.summary, insightData.content, 
          insightData.author, insightData.category, insightData.tags, 
          insightData.featured, insightData.status, insightData.cover_image, 
          insightData.updated_at, insightData.slug
        ]
      );
      console.log(`✅ Updated insight: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    } else {
      // Insert new insight
      result = await client.query(`
        INSERT INTO insights (title, slug, summary, content, author, category, tags, featured, status, cover_image, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, title`,
        [
          insightData.title, insightData.slug, insightData.summary, insightData.content,
          insightData.author, insightData.category, insightData.tags, insightData.featured,
          insightData.status, insightData.cover_image, insightData.created_at, insightData.updated_at
        ]
      );
      console.log(`✅ Created new insight: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
    }

    await client.end();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating insight:', error.message);
  }
}

updateInsight(); 