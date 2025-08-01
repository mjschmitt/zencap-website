const fs = require('fs');

// Read and prepare the enhanced insights
const insights = [
  {
    slug: 'federal-reserve-policy-shifts-march-2025-analysis',
    title: 'Federal Reserve Policy Shifts: March 2025 Analysis',
    summary: 'Strategic Investment Framework for Transitioning Monetary Policy. The Federal Reserve\'s March 2025 policy shift represents a critical inflection point for multi-asset portfolio construction. Our analysis indicates a 180bp cumulative easing cycle through Q4 2025, creating significant opportunities in duration-sensitive assets while necessitating tactical adjustments in credit allocation strategies.',
    content: fs.readFileSync('fed-policy-q1-2025.html', 'utf8'),
    author: 'Zenith Capital Research Team',
    cover_image_url: '/images/insights/q4-2024-tech-earnings-analysis.jpg',
    status: 'published',
    tags: 'Federal Reserve,Monetary Policy,Interest Rates,Investment Strategy,Q1 2025'
  },
  {
    slug: 'geopolitical-risk-global-markets-2025-strategic-framework',
    title: 'Geopolitical Risk in Global Markets: 2025 Strategic Framework',
    summary: 'Navigating Trade Tensions, Currency Volatility, and Regional Conflicts. Geopolitical tensions have evolved from episodic market disruptions to structural forces reshaping global trade, supply chains, and capital flows. Our framework identifies key flashpoints and provides tactical allocation strategies for navigating an increasingly multipolar investment landscape with heightened volatility and correlation risks.',
    content: fs.readFileSync('geopolitical-risks-q1-2025.html', 'utf8'),
    author: 'Zenith Capital Research Team',
    cover_image_url: '/images/insights/q4-2024-tech-earnings-analysis.jpg',
    status: 'published',
    tags: 'Geopolitical Risk,Global Markets,Investment Strategy,Risk Management,Q1 2025'
  },
  {
    slug: 'commercial-real-estate-recovery-selective-opportunities-2025',
    title: 'Commercial Real Estate Recovery: Selective Opportunities in 2025',
    summary: 'Strategic Asset Class Analysis and Investment Framework. Commercial real estate presents a bifurcated opportunity in 2025, with industrial and data center assets commanding premium valuations while office properties face structural headwinds. Our selective approach targets logistics hubs, medical real estate, and build-to-rent residential for superior risk-adjusted returns in a transitioning market.',
    content: fs.readFileSync('commercial-real-estate-q1-2025.html', 'utf8'),
    author: 'Zenith Capital Research Team',
    cover_image_url: '/images/insights/q4-2024-tech-earnings-analysis.jpg',
    status: 'published',
    tags: 'Commercial Real Estate,Investment Strategy,Real Estate Markets,Asset Allocation,Q1 2025'
  }
];

async function updateInsights() {
  console.log('🚀 Starting database updates for enhanced Q1 2025 insights...\n');
  
  for (const insight of insights) {
    try {
      console.log(`📝 Updating: ${insight.title}`);
      
      const response = await fetch('http://localhost:3000/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insight)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Successfully updated: ${insight.title}`);
        console.log(`   Slug: ${insight.slug}`);
        console.log(`   ID: ${data.id || 'New Entry'}\n`);
      } else {
        console.error(`❌ Error updating ${insight.title}:`, data.error || 'Unknown error');
        console.log(`   Slug: ${insight.slug}\n`);
      }
    } catch (error) {
      console.error(`❌ Network error updating ${insight.title}:`, error.message);
      console.log(`   Slug: ${insight.slug}\n`);
    }
  }
  
  console.log('🎉 Database update process completed!');
}

// Wait a moment for the server to start, then run updates
setTimeout(updateInsights, 5000); 