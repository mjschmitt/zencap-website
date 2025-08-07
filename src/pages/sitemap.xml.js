import { sql } from '@vercel/postgres';

const SITE_URL = 'https://zencap-website.vercel.app';

async function fetchModels() {
  try {
    if (process.env.POSTGRES_URL) {
      const result = await sql`SELECT slug, updated_at FROM models WHERE status = 'active'`;
      return result.rows || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching models for sitemap:', error);
    return [];
  }
}

async function fetchInsights() {
  try {
    if (process.env.POSTGRES_URL) {
      const result = await sql`SELECT slug, updated_at FROM insights WHERE status = 'published'`;
      return result.rows || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching insights for sitemap:', error);
    return [];
  }
}

async function generateSiteMap() {
  const models = await fetchModels();
  const insights = await fetchInsights();
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      
      <!-- Homepage -->
      <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
        <image:image>
          <image:loc>${SITE_URL}/images/home/home-hero.jpg</image:loc>
          <image:title>Zenith Capital Advisors - Financial Modeling Services</image:title>
        </image:image>
      </url>

      <!-- About Page -->
      <url>
        <loc>${SITE_URL}/about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>

      <!-- Contact Page -->
      <url>
        <loc>${SITE_URL}/contact</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>

      <!-- Models Pages -->
      <url>
        <loc>${SITE_URL}/models</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
        <image:image>
          <image:loc>${SITE_URL}/images/models/models-hero.jpg</image:loc>
          <image:title>Financial Models Catalog</image:title>
        </image:image>
      </url>

      <!-- Model Categories -->
      <url>
        <loc>${SITE_URL}/models/private-equity</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${SITE_URL}/models/public-equity</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>

      <!-- Individual Models -->
      ${models.map(model => `
      <url>
        <loc>${SITE_URL}/models/${model.slug}</loc>
        <lastmod>${model.updated_at ? new Date(model.updated_at).toISOString() : currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>`).join('')}

      <!-- Solutions Pages -->
      <url>
        <loc>${SITE_URL}/solutions</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${SITE_URL}/solutions/financial-modeling</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${SITE_URL}/solutions/infrastructure</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>
      <url>
        <loc>${SITE_URL}/solutions/research</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>

      <!-- Insights Pages -->
      <url>
        <loc>${SITE_URL}/insights</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>

      <!-- Individual Insights -->
      ${insights.map(insight => `
      <url>
        <loc>${SITE_URL}/insights/${insight.slug}</loc>
        <lastmod>${insight.updated_at ? new Date(insight.updated_at).toISOString() : currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>`).join('')}

      <!-- Legal Pages -->
      <url>
        <loc>${SITE_URL}/terms</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>
      <url>
        <loc>${SITE_URL}/privacy</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>

    </urlset>`;
}

export default function SiteMap() {
  // getServerSideProps will handle the XML generation
}

export async function getServerSideProps({ res }) {
  try {
    const sitemap = await generateSiteMap();

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.end();
  }

  return {
    props: {},
  };
} 