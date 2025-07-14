import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'GET') {
    // Fetch all insights for admin, or only published for public
    const { slug, admin } = req.query;
    try {
      if (slug) {
        const result = await sql`SELECT * FROM insights WHERE slug = ${slug} AND status = 'published'`;
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(result.rows[0]);
      } else if (admin === 'true') {
        // Admin: return all insights
        const result = await sql`SELECT * FROM insights ORDER BY published_at DESC, created_at DESC`;
        return res.status(200).json(result.rows);
      } else {
        // Public: only published
        const result = await sql`SELECT * FROM insights WHERE status = 'published' ORDER BY published_at DESC`;
        return res.status(200).json(result.rows);
      }
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch insights' });
    }
  }

  if (method === 'POST') {
    // Create a new insight
    let { slug, title, summary, content, author, cover_image_url, status, tags } = req.body;
    // Provide default values for optional fields
    summary = summary || '';
    content = content || '';
    author = author || '';
    cover_image_url = cover_image_url || '';
    status = status || 'draft';
    tags = tags || '';
    try {
      const result = await sql`
        INSERT INTO insights (slug, title, summary, content, author, cover_image_url, status, tags)
        VALUES (${slug}, ${title}, ${summary}, ${content}, ${author}, ${cover_image_url}, ${status}, ${tags})
        RETURNING *;
      `;
      return res.status(201).json(result.rows[0]);
    } catch (e) {
      console.error('Failed to create insight:', e);
      return res.status(500).json({ error: 'Failed to create insight' });
    }
  }

  if (method === 'PUT') {
    // Update an insight by slug
    const { slug, ...fields } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    // Provide default values for optional fields
    fields.summary = fields.summary || '';
    fields.content = fields.content || '';
    fields.author = fields.author || '';
    fields.cover_image_url = fields.cover_image_url || '';
    fields.status = fields.status || 'draft';
    fields.tags = fields.tags || '';
    try {
      const result = await sql`
        UPDATE insights SET 
          title = ${fields.title},
          summary = ${fields.summary},
          content = ${fields.content},
          author = ${fields.author},
          cover_image_url = ${fields.cover_image_url},
          status = ${fields.status},
          tags = ${fields.tags},
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = ${slug}
        RETURNING *;
      `;
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(result.rows[0]);
    } catch (e) {
      console.error('Failed to update insight:', e);
      return res.status(500).json({ error: 'Failed to update insight' });
    }
  }

  if (method === 'DELETE') {
    // Delete an insight by slug
    const { slug } = req.body;
    if (!slug) return res.status(400).json({ error: 'Slug required' });
    try {
      await sql`DELETE FROM insights WHERE slug = ${slug}`;
      return res.status(204).end();
    } catch (e) {
      return res.status(500).json({ error: 'Failed to delete insight' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 