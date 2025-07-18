const fs = require('fs');

const ENHANCED_INSIGHTS = [
  {
    htmlFile: 'fed-policy-q1-2025.html',
    slug: 'federal-reserve-policy-shifts-q1-2025-investment-implications',
    title: "Federal Reserve Policy Shifts: Q1 2025 Investment Implications",
    summary: "Comprehensive analysis of Federal Reserve monetary policy transitions and their impact on investment strategies, covering interest rate dynamics, duration risk management, and sector rotation opportunities in Q1 2025.",
    cover_image_url: "/images/insights/federal-reserve-policy-investment-implications-2025.jpg",
    tags: "Federal Reserve,Monetary Policy,Interest Rates,Investment Strategy,Q1 2025"
  },
  {
    htmlFile: 'geopolitical-risks-q1-2025.html',
    slug: 'geopolitical-risk-assessment-q1-2025-investment-framework',
    title: "Geopolitical Risk Assessment: Q1 2025 Investment Framework",
    summary: "Strategic framework for navigating geopolitical uncertainties in Q1 2025, including regional tension analysis, supply chain vulnerabilities, currency impacts, and portfolio hedging strategies.",
    cover_image_url: "/images/insights/geopolitical-risk-investment-framework-2025.jpg",
    tags: "Geopolitical Risk,Global Markets,Risk Management,Investment Strategy,Q1 2025"
  },
  {
    htmlFile: 'commercial-real-estate-q1-2025.html',
    slug: 'commercial-real-estate-investment-outlook-q1-2025',
    title: "Commercial Real Estate Investment Outlook: Q1 2025",
    summary: "Comprehensive analysis of commercial real estate investment opportunities in Q1 2025, covering market fundamentals, regional dynamics, industrial trends, and data center growth drivers.",
    cover_image_url: "/images/insights/commercial-real-estate-investment-outlook-2025.jpg",
    tags: "Commercial Real Estate,Investment Outlook,Market Analysis,Industrial Properties,Q1 2025"
  },
  {
    htmlFile: 'biotech-investment-q1-2025.html',
    slug: 'biotech-investment-renaissance-q1-2025-opportunity-analysis',
    title: "Biotech Investment Renaissance: Q1 2025 Opportunity Analysis",
    summary: "Deep dive into biotech investment opportunities in Q1 2025, analyzing technology platforms, pipeline metrics, regulatory environment, and market dynamics driving the sector renaissance.",
    cover_image_url: "/images/insights/biotech-investment-renaissance-opportunities-2025.jpg",
    tags: "Biotech,Healthcare Investment,Technology Platforms,Pipeline Analysis,Q1 2025"
  },
  {
    htmlFile: 'cloud-ai-infrastructure-q1-2025.html',
    slug: 'cloud-ai-infrastructure-evolution-investment-implications',
    title: "Cloud AI Infrastructure Evolution: Investment Implications",
    summary: "Analysis of cloud AI infrastructure evolution and investment opportunities, covering hyperscaler strategies, computing requirements, edge deployment, and portfolio allocation frameworks.",
    cover_image_url: "/images/insights/cloud-ai-infrastructure-evolution-investment-2025.jpg",
    tags: "Cloud Infrastructure,AI Technology,Hyperscale Computing,Investment Strategy,Q1 2025"
  },
  {
    htmlFile: 'nvidia-earnings-q1-2025.html',
    slug: 'nvidia-q1-2025-earnings-analysis-ai-leadership-sustained',
    title: "NVIDIA Q1 2025 Earnings Analysis: AI Leadership Sustained",
    summary: "Comprehensive analysis of NVIDIA's Q1 2025 earnings results, examining data center revenue growth, competitive positioning, forward guidance, and investment thesis validation.",
    cover_image_url: "/images/insights/nvidia-q1-2025-earnings-analysis-ai-leadership.jpg",
    tags: "NVIDIA,Earnings Analysis,AI Semiconductors,Data Center,Q1 2025"
  },
  {
    htmlFile: 'energy-transition-q2-2025.html',
    slug: 'energy-transition-acceleration-q2-2025-investment-outlook',
    title: "Energy Transition Acceleration: Q2 2025 Investment Outlook",
    summary: "Strategic analysis of energy transition investment opportunities in Q2 2025, covering renewable capacity growth, cost competitiveness, grid modernization, and clean energy frameworks.",
    cover_image_url: "/images/insights/energy-transition-acceleration-investment-outlook-2025.jpg",
    tags: "Energy Transition,Renewable Energy,Clean Technology,Investment Strategy,Q2 2025"
  },
  {
    htmlFile: 'global-supply-chain-q2-2025.html',
    slug: 'global-supply-chain-resilience-q2-2025-investment-framework',
    title: "Global Supply Chain Resilience: Q2 2025 Investment Framework",
    summary: "Comprehensive framework for supply chain resilience investments in Q2 2025, analyzing vulnerability assessments, nearshoring trends, automation opportunities, and regional strategies.",
    cover_image_url: "/images/insights/global-supply-chain-resilience-investment-framework-2025.jpg",
    tags: "Supply Chain,Resilience Strategy,Nearshoring,Automation,Q2 2025"
  },
  {
    htmlFile: 'apple-intelligence-q2-2025.html',
    slug: 'apple-intelligence-revolution-q2-2025-investment-analysis',
    title: "Apple Intelligence Revolution: Q2 2025 Investment Analysis",
    summary: "Analysis of Apple Intelligence platform evolution and investment implications, covering AI capabilities rollout, device upgrade catalysts, services monetization, and competitive positioning.",
    cover_image_url: "/images/insights/apple-intelligence-revolution-investment-analysis-2025.jpg",
    tags: "Apple,AI Platform,Device Ecosystem,Investment Analysis,Q2 2025"
  },
  {
    htmlFile: 'healthcare-technology-q2-2025.html',
    slug: 'healthcare-technology-revolution-q2-2025-investment-landscape',
    title: "Healthcare Technology Revolution: Q2 2025 Investment Landscape",
    summary: "Comprehensive analysis of healthcare technology investment opportunities in Q2 2025, covering AI diagnostics, digital therapeutics, regulatory frameworks, and market dynamics.",
    cover_image_url: "/images/insights/healthcare-technology-revolution-investment-landscape-2025.jpg",
    tags: "Healthcare Technology,AI Diagnostics,Digital Health,Investment Strategy,Q2 2025"
  },
  {
    htmlFile: 'industrial-real-estate-q2-2025.html',
    slug: 'industrial-real-estate-evolution-q2-2025-market-dynamics',
    title: "Industrial Real Estate Evolution: Q2 2025 Market Dynamics",
    summary: "Strategic analysis of industrial real estate evolution in Q2 2025, examining e-commerce logistics, data center expansion, manufacturing reshoring, and investment frameworks.",
    cover_image_url: "/images/insights/industrial-real-estate-evolution-market-dynamics-2025.jpg",
    tags: "Industrial Real Estate,E-commerce Logistics,Data Centers,Manufacturing,Q2 2025"
  },
  {
    htmlFile: 'quantum-computing-enhanced.html',
    slug: 'quantum-computing-investment-acceleration-q2-2025-analysis',
    title: "Quantum Computing Investment Acceleration: Q2 2025 Analysis",
    summary: "Comprehensive analysis of quantum computing investment opportunities in Q2 2025, covering technology breakthroughs, enterprise adoption, market dynamics, and portfolio allocation strategies.",
    cover_image_url: "/images/insights/quantum-computing-investment-acceleration-analysis-2025.jpg",
    tags: "Quantum Computing,Technology Investment,Enterprise Adoption,Market Analysis,Q2 2025"
  }
];

async function updateCleanedInsights() {
  console.log('🔄 Updating enhanced insights with cleaned content...\n');
  
  for (const insight of ENHANCED_INSIGHTS) {
    try {
      console.log(`🔧 Updating: ${insight.title}`);
      
      // Read the cleaned HTML content
      const htmlContent = fs.readFileSync(insight.htmlFile, 'utf8');
      
      // Prepare complete update data
      const updateData = {
        slug: insight.slug,
        title: insight.title,
        summary: insight.summary,
        content: htmlContent,
        cover_image_url: insight.cover_image_url,
        tags: insight.tags,
        status: 'published',
        author: 'ZenCap Research Team'
      };

      console.log(`   🔄 Updating database for: ${insight.slug}`);
      
      const updateResponse = await fetch('http://localhost:3001/api/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`   ✅ Successfully updated! Database ID: ${result.id}`);
      } else {
        const errorText = await updateResponse.text();
        console.error(`   ❌ Update failed: ${updateResponse.status}`);
        console.error(`   Error details: ${errorText}`);
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error updating ${insight.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Content update completed!');
  console.log('✨ All enhanced insights have been updated with cleaned content');
  console.log('🔗 Check your admin panel to verify the improvements');
}

updateCleanedInsights(); 