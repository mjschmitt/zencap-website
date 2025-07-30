// Initialize sample data for models and insights
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sample models data
    const models = [
      {
        slug: 'multifamily-development-model',
        title: 'Multifamily Development Model',
        description: 'Comprehensive ground-up development model for multifamily projects with detailed construction budgeting and lease-up scenarios.',
        category: 'Private Equity',
        thumbnail_url: '/images/models/multifamily-dev-thumb.jpg',
        file_url: '#',
        price: 4985,
        status: 'active',
        tags: 'real-estate,development,multifamily',
        excel_url: null
      },
      {
        slug: 'multifamily-acquisition-model',
        title: 'Multifamily Acquisition Model',
        description: 'Comprehensive underwriting model for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
        category: 'Private Equity',
        thumbnail_url: '/images/models/multifamily-acq-thumb.jpg',
        file_url: '#',
        price: 4985,
        status: 'active',
        tags: 'real-estate,acquisition,multifamily',
        excel_url: null
      },
      {
        slug: 'nvidia-3-statement-model',
        title: 'NVIDIA (NVDA) 3-Statement Model',
        description: 'Integrated financial model for NVIDIA Corporation with segment analysis, AI/GPU growth projections, and valuation framework.',
        category: 'Public Equity',
        thumbnail_url: '/images/models/nvidia-thumb.jpg',
        file_url: '#',
        price: 4985,
        status: 'active',
        tags: 'public-equity,technology,valuation',
        excel_url: null
      },
      {
        slug: 'dcf-valuation-suite',
        title: 'DCF Valuation Suite',
        description: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
        category: 'Public Equity',
        thumbnail_url: '/images/models/dcf-thumb.jpg',
        file_url: '#',
        price: 2985,
        status: 'active',
        tags: 'valuation,dcf,financial-modeling',
        excel_url: null
      }
    ];

    // Sample insights data
    const insights = [
      {
        slug: 'fed-rate-cuts-real-estate-q1-2025',
        title: 'Fed Rate Cuts and Real Estate Investment Opportunities',
        summary: 'Analysis of how anticipated Federal Reserve rate cuts will create compelling opportunities in real estate markets.',
        content: '<p>As we enter 2025, the Federal Reserve\'s anticipated rate cuts present a paradigm shift for real estate investors...</p>',
        author: 'Marcus Chen',
        cover_image_url: '/images/insights/fed-rates-cover.jpg',
        status: 'published',
        tags: 'real-estate,interest-rates,market-analysis',
        date_published: '2025-01-15'
      },
      {
        slug: 'ai-revolution-investment-thesis-2025',
        title: 'The AI Revolution: Investment Thesis for 2025',
        summary: 'Deep dive into artificial intelligence investment opportunities across public and private markets.',
        content: '<p>The artificial intelligence revolution continues to accelerate, creating unprecedented investment opportunities...</p>',
        author: 'Dr. Sarah Mitchell',
        cover_image_url: '/images/insights/ai-investment-cover.jpg',
        status: 'published',
        tags: 'artificial-intelligence,technology,growth-investing',
        date_published: '2025-01-10'
      },
      {
        slug: 'private-equity-secondaries-q4-2024',
        title: 'Private Equity Secondaries Market Update Q4 2024',
        summary: 'Comprehensive analysis of the secondary market for private equity investments and emerging opportunities.',
        content: '<p>The private equity secondaries market experienced significant evolution in Q4 2024...</p>',
        author: 'David Armstrong',
        cover_image_url: '/images/insights/pe-secondaries-cover.jpg',
        status: 'published',
        tags: 'private-equity,secondaries,market-update',
        date_published: '2024-12-20'
      }
    ];

    // Clear existing data first (optional - remove in production)
    await sql`DELETE FROM models WHERE 1=1`;
    await sql`DELETE FROM insights WHERE 1=1`;

    // Insert models
    for (const model of models) {
      await sql`
        INSERT INTO models (
          slug, title, description, category, thumbnail_url, 
          file_url, price, status, tags, excel_url
        ) VALUES (
          ${model.slug}, ${model.title}, ${model.description}, 
          ${model.category}, ${model.thumbnail_url}, ${model.file_url}, 
          ${model.price}, ${model.status}, ${model.tags}, ${model.excel_url}
        )
      `;
    }

    // Insert insights
    for (const insight of insights) {
      await sql`
        INSERT INTO insights (
          slug, title, summary, content, author, 
          cover_image_url, status, tags, date_published
        ) VALUES (
          ${insight.slug}, ${insight.title}, ${insight.summary}, 
          ${insight.content}, ${insight.author}, ${insight.cover_image_url}, 
          ${insight.status}, ${insight.tags}, ${insight.date_published}
        )
      `;
    }

    res.status(200).json({
      success: true,
      message: 'Sample data initialized successfully',
      data: {
        models: models.length,
        insights: insights.length
      }
    });
  } catch (error) {
    console.error('Sample data initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize sample data',
      details: error.message
    });
  }
}