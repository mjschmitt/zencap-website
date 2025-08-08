import { sql } from '@vercel/postgres';
import optimizedDb from '@/utils/optimizedDatabase';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Fetch all active models or by slug with performance optimization
    const { slug, category, limit = 50 } = req.query;
    
    try {
      if (slug) {
        // Use optimized single model lookup with performance metrics
        const result = await optimizedDb.getModelBySlug(slug);
        if (!result || result.rows.length === 0) {
          return res.status(404).json({ error: 'Model not found' });
        }
        
        // Set cache headers for individual models
        res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
        return res.status(200).json(result.rows[0]);
      } else {
        // Use optimized models listing with performance data
        const result = await optimizedDb.getActiveModels(category, parseInt(limit));
        
        // Set cache headers for model listings
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
        return res.status(200).json({
          models: result.rows,
          total: result.rows.length,
          category: category || 'all',
          cached: result._cached || false
        });
      }
    } catch (error) {
      console.error('Models API Error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch models',
        timestamp: new Date().toISOString()
      });
    }
  }

  if (method === 'POST') {
    // Create a new model
    const { slug, title, description, category, thumbnail_url, file_url, price, status, tags, excel_url } = req.body;
    try {
      const result = await sql`
        INSERT INTO models (slug, title, description, category, thumbnail_url, file_url, price, status, tags, excel_url)
        VALUES (${slug}, ${title}, ${description}, ${category}, ${thumbnail_url}, ${file_url}, ${price}, ${status || 'active'}, ${tags}, ${excel_url || null})
        RETURNING *;
      `;
      
      // Clear cache for model listings after creating new model
      optimizedDb.clearCache('SELECT_ACTIVE_MODELS');
      
      return res.status(201).json({
        model: result.rows[0],
        message: 'Model created successfully'
      });
    } catch (error) {
      console.error('Model creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create model',
        details: error.message 
      });
    }
  }

  if (method === 'PUT') {
    // Update a model by slug
    const { slug, ...fields } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    try {
      const result = await sql`
        UPDATE models SET 
          title = ${fields.title},
          description = ${fields.description},
          category = ${fields.category},
          thumbnail_url = ${fields.thumbnail_url},
          file_url = ${fields.file_url},
          price = ${fields.price},
          status = ${fields.status},
          tags = ${fields.tags},
          excel_url = ${fields.excel_url || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
        RETURNING *;
      `;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      // Clear relevant caches after update
      optimizedDb.clearCache('SELECT_ACTIVE_MODELS');
      optimizedDb.clearCache(`SELECT_MODEL_BY_SLUG_${slug}`);
      
      return res.status(200).json({
        model: result.rows[0],
        message: 'Model updated successfully'
      });
    } catch (error) {
      console.error('Model update error:', error);
      return res.status(500).json({ 
        error: 'Failed to update model',
        details: error.message 
      });
    }
  }

  if (method === 'DELETE') {
    // Delete a model by slug
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    try {
      const result = await sql`DELETE FROM models WHERE slug = ${slug} RETURNING id`;
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      // Clear all model-related caches
      optimizedDb.clearCache('SELECT_ACTIVE_MODELS');
      optimizedDb.clearCache(`SELECT_MODEL_BY_SLUG_${slug}`);
      
      return res.status(200).json({ 
        message: 'Model deleted successfully',
        deletedId: result.rows[0].id
      });
    } catch (error) {
      console.error('Model deletion error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete model',
        details: error.message 
      });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 