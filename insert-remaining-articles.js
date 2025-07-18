const fs = require('fs');

async function insertArticle(filename, articleData) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const data = {
      ...articleData,
      content: content
    };

    const response = await fetch('http://localhost:3001/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      console.log(`✓ Created: ${result.title}`);
    } else {
      console.log(`✗ Error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`✗ Error inserting ${filename}:`, error.message);
  }
}

// Remaining Q2 articles
const articles = [
  {
    filename: 'quantum-computing-q2-2025.html',
    data: {
      slug: 'quantum-computing-commercial-viability-investment-outlook-2025',
      title: 'Quantum Computing Commercial Viability: Investment Outlook 2025',
      summary: 'Analysis of quantum computing\'s transition to commercial viability, examining breakthrough technologies, market readiness across applications, and strategic investment opportunities in this transformational sector.',
      author: 'Quantum Technology Research',
      cover_image_url: '/images/insights/quantum-computing-commercial-viability-2025.jpg',
      status: 'published',
      tags: 'quantum computing, emerging technology, optimization, drug discovery, investment strategy, technology transformation'
    }
  },
  {
    filename: 'healthcare-technology-q2-2025.html',
    data: {
      slug: 'healthcare-technology-disruption-digital-health-investment-framework',
      title: 'Healthcare Technology Disruption: Digital Health Investment Framework',
      summary: 'Comprehensive analysis of healthcare technology transformation, examining telemedicine adoption, AI-powered diagnostics, and personalized medicine opportunities with strategic investment recommendations.',
      author: 'Healthcare Technology Research',
      cover_image_url: '/images/insights/healthcare-technology-disruption-2025.jpg',
      status: 'published',
      tags: 'healthcare technology, digital health, telemedicine, ai diagnostics, personalized medicine, medical devices'
    }
  },
  {
    filename: 'global-supply-chain-q2-2025.html',
    data: {
      slug: 'global-supply-chain-resilience-strategic-investment-framework',
      title: 'Global Supply Chain Resilience: Strategic Investment Framework',
      summary: 'Analysis of supply chain transformation trends, examining reshoring initiatives, automation technologies, and logistics infrastructure investments as companies prioritize resilience over cost optimization.',
      author: 'Supply Chain Strategy Research',
      cover_image_url: '/images/insights/global-supply-chain-resilience-2025.jpg',
      status: 'published',
      tags: 'supply chain, logistics, automation, reshoring, manufacturing, industrial technology, global trade'
    }
  }
];

// Insert all remaining articles
async function insertRemainingArticles() {
  console.log('Inserting remaining Q2 2025 articles...\n');
  
  for (const article of articles) {
    await insertArticle(article.filename, article.data);
  }
  
  console.log('\nAll remaining articles inserted successfully!');
  console.log('Total: 12 articles for Q1 and Q2 2025 are now in the database.');
}

insertRemainingArticles(); 