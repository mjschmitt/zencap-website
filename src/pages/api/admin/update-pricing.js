import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Simple auth check (you can improve this)
  const { adminKey } = req.body;
  if (adminKey !== 'update-pricing-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get current models to see what needs updating
    const currentModels = await sql`SELECT slug, title, price FROM models ORDER BY slug`;
    
    // Pricing structure based on MODEL_REFERENCE_DATA.md
    const pricingUpdates = [
      // Private Equity Models - $4,985
      { slug: 'multifamily-development-model', price: 4985 },
      { slug: 'multifamily-acquisition-model', price: 4985 },
      { slug: 'mixed-use-development-model', price: 4985 },
      { slug: 'mixed-use-acquisition-model', price: 4985 },
      { slug: 'commercial-development-model', price: 4985 },
      { slug: 'commercial-acquisition-model', price: 4985 },
      { slug: 'hospitality-development-model', price: 4985 },
      { slug: 'hospitality-acquisition-model', price: 4985 },
      
      // Public Equity Premium Models - $4,985
      { slug: 'applovin-3-statement-model', price: 4985 },
      { slug: 'nvidia-3-statement-model', price: 4985 },
      { slug: 'tesla-3-statement-model', price: 4985 },
      
      // Public Equity Standard Models - $2,985
      { slug: 'dcf-valuation-suite', price: 2985 },
      { slug: 'portfolio-attribution-model', price: 2985 },
    ];

    const results = [];
    
    for (const update of pricingUpdates) {
      try {
        const result = await sql`
          UPDATE models 
          SET price = ${update.price}, updated_at = CURRENT_TIMESTAMP
          WHERE slug = ${update.slug}
          RETURNING slug, title, price
        `;
        
        if (result.rows.length > 0) {
          results.push({
            slug: update.slug,
            status: 'updated',
            newPrice: update.price,
            ...result.rows[0]
          });
        } else {
          results.push({
            slug: update.slug,
            status: 'not_found',
            targetPrice: update.price
          });
        }
      } catch (error) {
        results.push({
          slug: update.slug,
          status: 'error',
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Pricing update completed',
      currentModels: currentModels.rows,
      updates: results,
      summary: {
        updated: results.filter(r => r.status === 'updated').length,
        notFound: results.filter(r => r.status === 'not_found').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    console.error('Pricing update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update pricing',
      details: error.message
    });
  }
}