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
const enhancedContent = fs.readFileSync('commercial-real-estate-q1-2025.html', 'utf8');

// Insight data
const insightData = {
  title: "Commercial Real Estate Recovery: Selective Opportunities in 2025",
  slug: "commercial-real-estate-recovery-selective-opportunities-2025",
  summary: "Strategic Asset Class Analysis and Investment Framework. Commercial real estate presents a bifurcated opportunity in 2025, with industrial and data center assets commanding premium valuations while office properties face structural headwinds. Our selective approach targets logistics hubs, medical real estate, and build-to-rent residential for superior risk-adjusted returns in a transitioning market.",
  content: enhancedContent,
  author: "Zenith Capital Research Team",
  category: "Real Estate Investment", 
  tags: ["Commercial Real Estate", "Investment Strategy", "Real Estate Markets", "Asset Allocation", "Q1 2025"],
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
    console.error('Full error:', error);
  }
}

updateInsight(); 