const fs = require('fs');

// ORIGINAL 6 INSIGHTS THAT MUST BE PRESERVED (based on screenshot)
const ORIGINAL_INSIGHTS_TO_PRESERVE = [
  'q4-2024-tech-earnings-ai-revenue-acceleration-analysis',
  'fintech-disruption-reshaping-financial-services-landscape', 
  'cloud-infrastructure-boom-pricing-models-investment-implications',
  'esg-integration-building-sustainable-investment-portfolios',
  'ai-semiconductor-revolution-investment-opportunities-next-gen-computing',
  'multifamily-real-estate-investment-opportunities-2025-market-outlook'
];

// THE 12 NEW ENHANCED INSIGHTS WE WANT TO KEEP
const NEW_ENHANCED_INSIGHTS = [
  {
    title: "Federal Reserve Policy Shifts: Q1 2025 Investment Implications",
    slug: "federal-reserve-policy-shifts-q1-2025-investment-implications",
    summary: "Comprehensive analysis of Federal Reserve monetary policy transitions and their impact on investment strategies, covering interest rate dynamics, duration risk management, and sector rotation opportunities in Q1 2025.",
    htmlFile: "fed-policy-q1-2025.html",
    coverImage: "/images/insights/federal-reserve-policy-investment-implications-2025.jpg",
    category: "Market Analysis",
    readTime: 8,
    tags: ["Federal Reserve", "Monetary Policy", "Interest Rates", "Investment Strategy", "Q1 2025"]
  },
  {
    title: "Geopolitical Risk Assessment: Q1 2025 Investment Framework",
    slug: "geopolitical-risk-assessment-q1-2025-investment-framework", 
    summary: "Strategic framework for navigating geopolitical uncertainties in Q1 2025, including regional tension analysis, supply chain vulnerabilities, currency impacts, and portfolio hedging strategies.",
    htmlFile: "geopolitical-risks-q1-2025.html",
    coverImage: "/images/insights/geopolitical-risk-investment-framework-2025.jpg",
    category: "Risk Management",
    readTime: 9,
    tags: ["Geopolitical Risk", "Global Markets", "Risk Management", "Investment Strategy", "Q1 2025"]
  },
  {
    title: "Commercial Real Estate Investment Outlook: Q1 2025",
    slug: "commercial-real-estate-investment-outlook-q1-2025",
    summary: "Comprehensive analysis of commercial real estate investment opportunities in Q1 2025, covering market fundamentals, regional dynamics, industrial trends, and data center growth drivers.",
    htmlFile: "commercial-real-estate-q1-2025.html", 
    coverImage: "/images/insights/commercial-real-estate-investment-outlook-2025.jpg",
    category: "Real Estate",
    readTime: 10,
    tags: ["Commercial Real Estate", "Investment Outlook", "Market Analysis", "Industrial Properties", "Q1 2025"]
  },
  {
    title: "Biotech Investment Renaissance: Q1 2025 Opportunity Analysis",
    slug: "biotech-investment-renaissance-q1-2025-opportunity-analysis",
    summary: "Deep dive into biotech investment opportunities in Q1 2025, analyzing technology platforms, pipeline metrics, regulatory environment, and market dynamics driving the sector renaissance.",
    htmlFile: "biotech-investment-q1-2025.html",
    coverImage: "/images/insights/biotech-investment-renaissance-opportunities-2025.jpg", 
    category: "Healthcare",
    readTime: 9,
    tags: ["Biotech", "Healthcare Investment", "Technology Platforms", "Pipeline Analysis", "Q1 2025"]
  },
  {
    title: "Cloud AI Infrastructure Evolution: Investment Implications",
    slug: "cloud-ai-infrastructure-evolution-investment-implications",
    summary: "Analysis of cloud AI infrastructure evolution and investment opportunities, covering hyperscaler strategies, computing requirements, edge deployment, and portfolio allocation frameworks.",
    htmlFile: "cloud-ai-infrastructure-q1-2025.html",
    coverImage: "/images/insights/cloud-ai-infrastructure-evolution-investment-2025.jpg",
    category: "Technology", 
    readTime: 8,
    tags: ["Cloud Infrastructure", "AI Technology", "Hyperscale Computing", "Investment Strategy", "Q1 2025"]
  },
  {
    title: "NVIDIA Q1 2025 Earnings Analysis: AI Leadership Sustained",
    slug: "nvidia-q1-2025-earnings-analysis-ai-leadership-sustained",
    summary: "Comprehensive analysis of NVIDIA's Q1 2025 earnings results, examining data center revenue growth, competitive positioning, forward guidance, and investment thesis validation.",
    htmlFile: "nvidia-earnings-q1-2025.html",
    coverImage: "/images/insights/nvidia-q1-2025-earnings-analysis-ai-leadership.jpg",
    category: "Earnings Analysis",
    readTime: 7,
    tags: ["NVIDIA", "Earnings Analysis", "AI Semiconductors", "Data Center", "Q1 2025"]
  },
  {
    title: "Energy Transition Acceleration: Q2 2025 Investment Outlook",
    slug: "energy-transition-acceleration-q2-2025-investment-outlook", 
    summary: "Strategic analysis of energy transition investment opportunities in Q2 2025, covering renewable capacity growth, cost competitiveness, grid modernization, and clean energy frameworks.",
    htmlFile: "energy-transition-q2-2025.html",
    coverImage: "/images/insights/energy-transition-acceleration-investment-outlook-2025.jpg",
    category: "Energy",
    readTime: 9,
    tags: ["Energy Transition", "Renewable Energy", "Clean Technology", "Investment Strategy", "Q2 2025"]
  },
  {
    title: "Global Supply Chain Resilience: Q2 2025 Investment Framework",
    slug: "global-supply-chain-resilience-q2-2025-investment-framework",
    summary: "Comprehensive framework for supply chain resilience investments in Q2 2025, analyzing vulnerability assessments, nearshoring trends, automation opportunities, and regional strategies.",
    htmlFile: "global-supply-chain-q2-2025.html", 
    coverImage: "/images/insights/global-supply-chain-resilience-investment-framework-2025.jpg",
    category: "Supply Chain",
    readTime: 8,
    tags: ["Supply Chain", "Resilience Strategy", "Nearshoring", "Automation", "Q2 2025"]
  },
  {
    title: "Apple Intelligence Revolution: Q2 2025 Investment Analysis",
    slug: "apple-intelligence-revolution-q2-2025-investment-analysis",
    summary: "Analysis of Apple Intelligence platform evolution and investment implications, covering AI capabilities rollout, device upgrade catalysts, services monetization, and competitive positioning.",
    htmlFile: "apple-intelligence-q2-2025.html",
    coverImage: "/images/insights/apple-intelligence-revolution-investment-analysis-2025.jpg",
    category: "Technology",
    readTime: 7,
    tags: ["Apple", "AI Platform", "Device Ecosystem", "Investment Analysis", "Q2 2025"]
  },
  {
    title: "Healthcare Technology Revolution: Q2 2025 Investment Landscape",
    slug: "healthcare-technology-revolution-q2-2025-investment-landscape",
    summary: "Comprehensive analysis of healthcare technology investment opportunities in Q2 2025, covering AI diagnostics, digital therapeutics, regulatory frameworks, and market dynamics.",
    htmlFile: "healthcare-technology-q2-2025.html",
    coverImage: "/images/insights/healthcare-technology-revolution-investment-landscape-2025.jpg", 
    category: "Healthcare",
    readTime: 8,
    tags: ["Healthcare Technology", "AI Diagnostics", "Digital Health", "Investment Strategy", "Q2 2025"]
  },
  {
    title: "Industrial Real Estate Evolution: Q2 2025 Market Dynamics",
    slug: "industrial-real-estate-evolution-q2-2025-market-dynamics",
    summary: "Strategic analysis of industrial real estate evolution in Q2 2025, examining e-commerce logistics, data center expansion, manufacturing reshoring, and investment frameworks.",
    htmlFile: "industrial-real-estate-q2-2025.html",
    coverImage: "/images/insights/industrial-real-estate-evolution-market-dynamics-2025.jpg",
    category: "Real Estate", 
    readTime: 9,
    tags: ["Industrial Real Estate", "E-commerce Logistics", "Data Centers", "Manufacturing", "Q2 2025"]
  },
  {
    title: "Quantum Computing Investment Acceleration: Q2 2025 Analysis",
    slug: "quantum-computing-investment-acceleration-q2-2025-analysis",
    summary: "Comprehensive analysis of quantum computing investment opportunities in Q2 2025, covering technology breakthroughs, enterprise adoption, market dynamics, and portfolio allocation strategies.",
    htmlFile: "quantum-computing-enhanced.html",
    coverImage: "/images/insights/quantum-computing-investment-acceleration-analysis-2025.jpg",
    category: "Technology",
    readTime: 10,
    tags: ["Quantum Computing", "Technology Investment", "Enterprise Adoption", "Market Analysis", "Q2 2025"]
  }
];

function readHTMLFile(filename) {
  try {
    return fs.readFileSync(filename, 'utf8');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return null;
  }
}

async function cleanupInsights() {
  try {
    console.log('🧹 Starting insights database cleanup...\n');
    
    // Step 1: Get all current insights
    console.log('📋 Fetching all current insights...');
    const response = await fetch('http://localhost:3001/api/insights');
    const allInsights = await response.json();
    console.log(`Found ${allInsights.length} total insights in database\n`);
    
    // Step 2: Identify insights to preserve vs delete
    const toPreserve = [];
    const toDelete = [];
    
    for (const insight of allInsights) {
      if (ORIGINAL_INSIGHTS_TO_PRESERVE.includes(insight.slug)) {
        toPreserve.push(insight);
        console.log(`✅ PRESERVE: ${insight.title} (ID: ${insight.id})`);
      } else {
        toDelete.push(insight);
        console.log(`❌ DELETE: ${insight.title} (ID: ${insight.id})`);
      }
    }
    
    console.log(`\n📊 Summary: Preserving ${toPreserve.length} original insights, deleting ${toDelete.length} duplicates/extras\n`);
    
    // Step 3: Delete duplicates and extras
    console.log('🗑️ Deleting duplicate and extra insights...');
    for (const insight of toDelete) {
      try {
        const deleteResponse = await fetch(`http://localhost:3001/api/insights/${insight.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log(`   ✅ Deleted: ${insight.title}`);
        } else {
          console.log(`   ❌ Failed to delete: ${insight.title}`);
        }
        
        // Small delay between deletes
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`   ❌ Error deleting ${insight.title}:`, error.message);
      }
    }
    
    console.log('\n✨ Adding the 12 new enhanced insights...');
    
    // Step 4: Add the 12 new enhanced insights
    for (const insight of NEW_ENHANCED_INSIGHTS) {
      try {
        const htmlContent = readHTMLFile(insight.htmlFile);
        if (!htmlContent) {
          console.error(`❌ Skipping ${insight.title} - HTML file not found`);
          continue;
        }

        const insightData = {
          title: insight.title,
          slug: insight.slug,
          summary: insight.summary,
          content: htmlContent,
          cover_image: insight.coverImage,
          category: insight.category,
          read_time: insight.readTime,
          tags: insight.tags,
          status: 'published',
          author: 'ZenCap Research Team',
          published_at: new Date().toISOString()
        };

        console.log(`➕ Adding: ${insight.title}`);
        
        const createResponse = await fetch('http://localhost:3001/api/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insightData)
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          console.log(`   ✅ Success! Database ID: ${result.id}`);
        } else {
          const errorText = await createResponse.text();
          console.error(`   ❌ Failed: ${createResponse.status} ${errorText}`);
        }
        
        // Small delay between creates
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`❌ Error adding ${insight.title}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database cleanup completed!');
    console.log('📊 Final database should contain:');
    console.log('   • 6 original insights (preserved)');
    console.log('   • 12 new enhanced insights (added)');
    console.log('   • Total: 18 insights');
    console.log('\n🔗 Check your admin panel: http://localhost:3001/admin');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  }
}

cleanupInsights(); 