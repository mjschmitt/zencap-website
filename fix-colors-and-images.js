const fs = require('fs');

// Additional color fixes needed
const ADDITIONAL_COLOR_FIXES = {
  '#eab308': '#1e40af', // yellow to blue
  '#f59e0b': '#3b82f6', // orange to blue
  '#fbbf24': '#1e40af', // yellow to blue
  '#d97706': '#1e40af', // orange to blue
  '#amber-500': '#blue-600', // tailwind amber to blue
  '#yellow-500': '#blue-600', // tailwind yellow to blue
  '#orange-500': '#blue-600', // tailwind orange to blue
};

// Original 6 insights with their proper image paths
const ORIGINAL_INSIGHTS_IMAGE_FIXES = [
  {
    slug: 'q4-2024-tech-earnings-ai-revenue-acceleration-analysis',
    cover_image_url: '/images/insights/q4-2024-tech-earnings-analysis.jpg'
  },
  {
    slug: 'fintech-disruption-reshaping-financial-services-landscape',
    cover_image_url: '/images/insights/fintech-disruption-reshaping-financial-services-landscape.jpg'
  },
  {
    slug: 'cloud-infrastructure-boom-pricing-models-investment-implications',
    cover_image_url: '/images/insights/cloud-infrastructure-pricing-models-implications-margins.jpg'
  },
  {
    slug: 'esg-integration-building-sustainable-investment-portfolios',
    cover_image_url: '/images/insights/esg-integration-building-sustainable-investment-portfolios.jpg'
  },
  {
    slug: 'ai-semiconductor-revolution-investment-opportunities-next-gen-computing',
    cover_image_url: '/images/insights/ai-semiconductor-revolution-investment-opportunities.jpg'
  },
  {
    slug: 'multifamily-real-estate-investment-opportunities-2025-market-outlook',
    cover_image_url: '/images/insights/multifamily-real-estate-investment-opportunities-2025.jpg'
  }
];

// All 12 new enhanced insights
const NEW_ENHANCED_INSIGHTS = [
  'fed-policy-q1-2025.html',
  'geopolitical-risks-q1-2025.html',
  'commercial-real-estate-q1-2025.html',
  'biotech-investment-q1-2025.html',
  'cloud-ai-infrastructure-q1-2025.html',
  'nvidia-earnings-q1-2025.html',
  'energy-transition-q2-2025.html',
  'global-supply-chain-q2-2025.html',
  'apple-intelligence-q2-2025.html',
  'healthcare-technology-q2-2025.html',
  'industrial-real-estate-q2-2025.html',
  'quantum-computing-enhanced.html'
];

function fixColorsInHTML(htmlContent) {
  let fixedContent = htmlContent;
  
  for (const [oldColor, newColor] of Object.entries(ADDITIONAL_COLOR_FIXES)) {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    fixedContent = fixedContent.replace(regex, newColor);
  }
  
  return fixedContent;
}

async function fixColorsAndImages() {
  console.log('🎨 Starting color fixes and image re-linking...\n');
  
  // Step 1: Fix colors in all 12 new enhanced insights
  console.log('🔧 Fixing remaining color issues in enhanced insights...');
  for (const htmlFile of NEW_ENHANCED_INSIGHTS) {
    try {
      if (fs.existsSync(htmlFile)) {
        const originalContent = fs.readFileSync(htmlFile, 'utf8');
        const fixedContent = fixColorsInHTML(originalContent);
        
        if (fixedContent !== originalContent) {
          fs.writeFileSync(htmlFile, fixedContent, 'utf8');
          console.log(`   ✅ Fixed colors in: ${htmlFile}`);
        } else {
          console.log(`   ✅ No color issues found in: ${htmlFile}`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${htmlFile}:`, error.message);
    }
  }
  
  // Step 2: Re-link original 6 insights to their proper images
  console.log('\n🖼️ Re-linking original 6 insights to proper cover images...');
  for (const insight of ORIGINAL_INSIGHTS_IMAGE_FIXES) {
    try {
      console.log(`   🔄 Updating image for: ${insight.slug}`);
      
      const updateData = {
        slug: insight.slug,
        cover_image_url: insight.cover_image_url
      };

      const updateResponse = await fetch('http://localhost:3001/api/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        console.log(`   ✅ Successfully updated image for: ${insight.slug}`);
      } else {
        const errorText = await updateResponse.text();
        console.error(`   ❌ Failed to update image: ${updateResponse.status} ${errorText}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`   ❌ Error updating ${insight.slug}:`, error.message);
    }
  }
  
  // Step 3: Update database with fixed color content for enhanced insights
  console.log('\n🔄 Updating database with color-fixed content...');
  
  const INSIGHT_SLUG_MAPPING = {
    'fed-policy-q1-2025.html': 'federal-reserve-policy-shifts-q1-2025-investment-implications',
    'geopolitical-risks-q1-2025.html': 'geopolitical-risk-assessment-q1-2025-investment-framework',
    'commercial-real-estate-q1-2025.html': 'commercial-real-estate-investment-outlook-q1-2025',
    'biotech-investment-q1-2025.html': 'biotech-investment-renaissance-q1-2025-opportunity-analysis',
    'cloud-ai-infrastructure-q1-2025.html': 'cloud-ai-infrastructure-evolution-investment-implications',
    'nvidia-earnings-q1-2025.html': 'nvidia-q1-2025-earnings-analysis-ai-leadership-sustained',
    'energy-transition-q2-2025.html': 'energy-transition-acceleration-q2-2025-investment-outlook',
    'global-supply-chain-q2-2025.html': 'global-supply-chain-resilience-q2-2025-investment-framework',
    'apple-intelligence-q2-2025.html': 'apple-intelligence-revolution-q2-2025-investment-analysis',
    'healthcare-technology-q2-2025.html': 'healthcare-technology-revolution-q2-2025-investment-landscape',
    'industrial-real-estate-q2-2025.html': 'industrial-real-estate-evolution-q2-2025-market-dynamics',
    'quantum-computing-enhanced.html': 'quantum-computing-investment-acceleration-q2-2025-analysis'
  };
  
  for (const htmlFile of NEW_ENHANCED_INSIGHTS) {
    try {
      if (fs.existsSync(htmlFile)) {
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        const slug = INSIGHT_SLUG_MAPPING[htmlFile];
        
        if (slug) {
          console.log(`   🔄 Updating content for: ${slug}`);
          
          const updateData = {
            slug: slug,
            content: htmlContent
          };

          const updateResponse = await fetch('http://localhost:3001/api/insights', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });

          if (updateResponse.ok) {
            console.log(`   ✅ Successfully updated content for: ${slug}`);
          } else {
            const errorText = await updateResponse.text();
            console.error(`   ❌ Failed to update content: ${updateResponse.status} ${errorText}`);
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`   ❌ Error updating ${htmlFile}:`, error.message);
    }
  }
  
  console.log('\n🎉 Color fixes and image re-linking completed!');
  console.log('✨ All insights now have proper colors and correct image links');
  console.log('🔗 Check your admin panel to verify the improvements');
}

fixColorsAndImages(); 