const fs = require('fs');

const ENHANCED_INSIGHTS = [
  {
    htmlFile: 'fed-policy-q1-2025.html',
    slug: 'federal-reserve-policy-shifts-q1-2025-investment-implications',
    title: "Federal Reserve Policy Shifts: Q1 2025 Investment Implications"
  },
  {
    htmlFile: 'geopolitical-risks-q1-2025.html',
    slug: 'geopolitical-risk-assessment-q1-2025-investment-framework',
    title: "Geopolitical Risk Assessment: Q1 2025 Investment Framework"
  },
  {
    htmlFile: 'commercial-real-estate-q1-2025.html',
    slug: 'commercial-real-estate-investment-outlook-q1-2025',
    title: "Commercial Real Estate Investment Outlook: Q1 2025"
  },
  {
    htmlFile: 'biotech-investment-q1-2025.html',
    slug: 'biotech-investment-renaissance-q1-2025-opportunity-analysis',
    title: "Biotech Investment Renaissance: Q1 2025 Opportunity Analysis"
  },
  {
    htmlFile: 'cloud-ai-infrastructure-q1-2025.html',
    slug: 'cloud-ai-infrastructure-evolution-investment-implications',
    title: "Cloud AI Infrastructure Evolution: Investment Implications"
  },
  {
    htmlFile: 'nvidia-earnings-q1-2025.html',
    slug: 'nvidia-q1-2025-earnings-analysis-ai-leadership-sustained',
    title: "NVIDIA Q1 2025 Earnings Analysis: AI Leadership Sustained"
  },
  {
    htmlFile: 'energy-transition-q2-2025.html',
    slug: 'energy-transition-acceleration-q2-2025-investment-outlook',
    title: "Energy Transition Acceleration: Q2 2025 Investment Outlook"
  },
  {
    htmlFile: 'global-supply-chain-q2-2025.html',
    slug: 'global-supply-chain-resilience-q2-2025-investment-framework',
    title: "Global Supply Chain Resilience: Q2 2025 Investment Framework"
  },
  {
    htmlFile: 'apple-intelligence-q2-2025.html',
    slug: 'apple-intelligence-revolution-q2-2025-investment-analysis',
    title: "Apple Intelligence Revolution: Q2 2025 Investment Analysis"
  },
  {
    htmlFile: 'healthcare-technology-q2-2025.html',
    slug: 'healthcare-technology-revolution-q2-2025-investment-landscape',
    title: "Healthcare Technology Revolution: Q2 2025 Investment Landscape"
  },
  {
    htmlFile: 'industrial-real-estate-q2-2025.html',
    slug: 'industrial-real-estate-evolution-q2-2025-market-dynamics',
    title: "Industrial Real Estate Evolution: Q2 2025 Market Dynamics"
  },
  {
    htmlFile: 'quantum-computing-enhanced.html',
    slug: 'quantum-computing-investment-acceleration-q2-2025-analysis',
    title: "Quantum Computing Investment Acceleration: Q2 2025 Analysis"
  }
];

function removeRedundantHeader(htmlContent) {
  // Pattern to match the redundant header div at the beginning
  // Looks for a div with gradient background containing an h2 with title and a p with subtitle
  const headerPattern = /<div style="background: linear-gradient\(135deg[^>]*>\s*<h2[^>]*>.*?<\/h2>\s*<p[^>]*>.*?<\/p>\s*<\/div>\s*/s;
  
  // Remove the first occurrence (the redundant header)
  const cleanedContent = htmlContent.replace(headerPattern, '');
  
  return cleanedContent;
}

async function removeRedundantHeaders() {
  console.log('🧹 Removing redundant headers from enhanced insights...\n');
  
  for (const insight of ENHANCED_INSIGHTS) {
    try {
      console.log(`🔧 Processing: ${insight.title}`);
      
      // Read the HTML file
      const originalContent = fs.readFileSync(insight.htmlFile, 'utf8');
      
      // Remove the redundant header
      const cleanedContent = removeRedundantHeader(originalContent);
      
      // Check if any changes were made
      if (cleanedContent.length === originalContent.length) {
        console.log(`   ⚠️ No redundant header found in ${insight.htmlFile}`);
      } else {
        console.log(`   ✅ Removed redundant header (${originalContent.length - cleanedContent.length} characters removed)`);
        
        // Save the cleaned content back to file
        fs.writeFileSync(insight.htmlFile, cleanedContent, 'utf8');
        
        // Update the database with cleaned content
        console.log(`   🔄 Updating database for: ${insight.slug}`);
        
        const updateData = {
          slug: insight.slug,
          content: cleanedContent
        };

        const updateResponse = await fetch('http://localhost:3001/api/insights', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          console.log(`   ✅ Database updated successfully!`);
        } else {
          const errorText = await updateResponse.text();
          console.error(`   ❌ Database update failed: ${updateResponse.status} ${errorText}`);
        }
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ Error processing ${insight.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Redundant header removal completed!');
  console.log('✨ All insights now have clean content without duplicate titles');
  console.log('🔗 Check your admin panel to verify the improvements');
}

removeRedundantHeaders(); 