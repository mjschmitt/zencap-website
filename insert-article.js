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

// Article data
const articles = [
  {
    filename: 'fed-policy-q1-2025.html',
    data: {
      slug: 'federal-reserve-policy-shifts-march-2025-implications',
      title: 'Federal Reserve Policy Shifts: March 2025 Implications for Fixed Income and Equity Allocations',
      summary: 'Comprehensive analysis of the Fed\'s March 2025 policy pivot, examining implications for duration risk, credit spreads, and sector rotation strategies in a transitioning rate environment.',
      author: 'Research Team',
      cover_image_url: '/images/insights/federal-reserve-policy-march-2025.jpg',
      status: 'published',
      tags: 'monetary policy, federal reserve, fixed income, duration risk, interest rates, market analysis'
    }
  },
  {
    filename: 'nvidia-earnings-q1-2025.html',
    data: {
      slug: 'nvidia-q1-2025-earnings-deep-dive-ai-infrastructure',
      title: 'NVIDIA Q1 2025 Earnings Deep Dive: AI Infrastructure Investment Thesis and Competitive Moat Analysis',
      summary: 'Detailed analysis of NVIDIA\'s Q1 2025 results, examining Data Center revenue growth, Blackwell architecture advantages, and competitive positioning in the evolving AI infrastructure market.',
      author: 'Technology Research Team',
      cover_image_url: '/images/insights/nvidia-q1-2025-earnings-analysis.jpg',
      status: 'published',
      tags: 'nvidia, earnings analysis, ai infrastructure, semiconductors, technology, data center'
    }
  },
  {
    filename: 'commercial-real-estate-q1-2025.html',
    data: {
      slug: 'commercial-real-estate-recovery-selective-opportunities-2025',
      title: 'Commercial Real Estate Recovery: Selective Opportunities in 2025',
      summary: 'Strategic analysis of the bifurcated CRE market, identifying opportunities in industrial, data centers, and medical real estate while navigating office sector headwinds and regional market dynamics.',
      author: 'Real Estate Investment Committee',
      cover_image_url: '/images/insights/commercial-real-estate-recovery-2025.jpg',
      status: 'published',
      tags: 'commercial real estate, industrial, data centers, office, real estate investment, market analysis'
    }
  },
  {
    filename: 'cloud-ai-infrastructure-q1-2025.html',
    data: {
      slug: 'cloud-ai-infrastructure-wars-competitive-dynamics-2025',
      title: 'Cloud AI Infrastructure Wars: Competitive Dynamics in 2025',
      summary: 'Analysis of hyperscaler competition in AI infrastructure, examining Microsoft\'s OpenAI advantage, AWS market leadership, and emerging opportunities in the evolving cloud computing landscape.',
      author: 'Cloud Infrastructure Research Lead',
      cover_image_url: '/images/insights/cloud-ai-infrastructure-wars-2025.jpg',
      status: 'published',
      tags: 'cloud computing, ai infrastructure, microsoft, amazon, google, technology, market share'
    }
  },
  {
    filename: 'biotech-investment-q1-2025.html',
    data: {
      slug: 'biotech-investment-renaissance-opportunities-2025',
      title: 'Biotech Investment Renaissance: Opportunities in 2025',
      summary: 'Comprehensive analysis of the biotech sector transformation driven by AI-accelerated drug discovery, gene therapy commercialization, and precision medicine platforms with exceptional clinical success rates.',
      author: 'Biotechnology Research Director',
      cover_image_url: '/images/insights/biotech-investment-opportunities-2025.jpg',
      status: 'published',
      tags: 'biotechnology, gene therapy, ai drug discovery, precision medicine, healthcare, clinical trials'
    }
  },
  {
    filename: 'geopolitical-risks-q1-2025.html',
    data: {
      slug: 'geopolitical-risk-global-markets-2025-strategic-framework',
      title: 'Geopolitical Risk in Global Markets: 2025 Strategic Framework',
      summary: 'Strategic framework for navigating geopolitical tensions, supply chain vulnerabilities, and currency volatility, with tactical allocation strategies for managing correlation risks in a multipolar world.',
      author: 'Global Macro Strategy Team',
      cover_image_url: '/images/insights/geopolitical-risk-global-markets-2025.jpg',
      status: 'published',
      tags: 'geopolitical risk, global markets, currency, supply chain, hedging strategies, market volatility'
    }
  },
  {
    filename: 'energy-transition-q2-2025.html',
    data: {
      slug: 'energy-transition-investment-thesis-q2-2025-opportunities',
      title: 'Energy Transition Investment Thesis: Q2 2025 Opportunities',
      summary: 'Comprehensive analysis of clean energy infrastructure opportunities, examining renewable generation, grid modernization, and energy storage technologies with $2.8 trillion addressable market through 2030.',
      author: 'Clean Energy Research Director',
      cover_image_url: '/images/insights/energy-transition-opportunities-q2-2025.jpg',
      status: 'published',
      tags: 'energy transition, renewable energy, clean technology, solar, wind, energy storage, grid modernization'
    }
  },
  {
    filename: 'apple-intelligence-q2-2025.html',
    data: {
      slug: 'apple-intelligence-platform-strategic-analysis-investment-implications',
      title: 'Apple Intelligence Platform: Strategic Analysis and Investment Implications',
      summary: 'Strategic analysis of Apple\'s AI platform evolution, examining ecosystem integration, monetization pathways, and competitive positioning in the evolving artificial intelligence landscape.',
      author: 'Technology Platform Research',
      cover_image_url: '/images/insights/apple-intelligence-platform-analysis-2025.jpg',
      status: 'published',
      tags: 'apple, artificial intelligence, platform strategy, ecosystem, mobile technology, ai integration'
    }
  },
  {
    filename: 'industrial-real-estate-q2-2025.html',
    data: {
      slug: 'industrial-real-estate-development-q2-2025-market-dynamics',
      title: 'Industrial Real Estate Development: Q2 2025 Market Dynamics',
      summary: 'Analysis of industrial real estate development opportunities driven by e-commerce fulfillment, manufacturing reshoring, and last-mile logistics with exceptional rent growth and low vacancy rates.',
      author: 'Industrial Development Research',
      cover_image_url: '/images/insights/industrial-real-estate-development-q2-2025.jpg',
      status: 'published',
      tags: 'industrial real estate, logistics, e-commerce, manufacturing, reshoring, development, warehouses'
    }
  }
];

// Insert all articles
async function insertAllArticles() {
  console.log('Starting article insertion...\n');
  
  for (const article of articles) {
    await insertArticle(article.filename, article.data);
  }
  
  console.log('\nArticle insertion completed!');
}

insertAllArticles(); 