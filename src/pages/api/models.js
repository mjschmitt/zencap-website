import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Fetch all active models or by slug
    const { slug } = req.query;
    try {
      if (slug) {
        const result = await sql`SELECT * FROM models WHERE slug = ${slug} AND status = 'active'`;
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(result.rows[0]);
      } else {
        const result = await sql`SELECT * FROM models WHERE status = 'active' ORDER BY published_at DESC`;
        return res.status(200).json(result.rows);
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch models' });
    }
  }

  if (method === 'POST') {
    // Create a new model
    const { slug, title, description, category, thumbnail_url, file_url, price, status, tags } = req.body;
    try {
      const result = await sql`
        INSERT INTO models (slug, title, description, category, thumbnail_url, file_url, price, status, tags)
        VALUES (${slug}, ${title}, ${description}, ${category}, ${thumbnail_url}, ${file_url}, ${price}, ${status || 'active'}, ${tags})
        RETURNING *;
      `;
      return res.status(201).json(result.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to create model' });
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
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
        RETURNING *;
      `;
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to update model' });
    }
  }

  if (method === 'DELETE') {
    // Delete a model by slug
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    try {
      await sql`DELETE FROM models WHERE slug = ${slug}`;
      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete model' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 