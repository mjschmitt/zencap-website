const fs = require('fs');

// Original 6 insights with complete data for image updates
const ORIGINAL_INSIGHTS = [
  {
    slug: 'q4-2024-tech-earnings-ai-revenue-acceleration-analysis',
    title: 'Q4 2024 Tech Earnings: AI Revenue Acceleration Analysis',
    cover_image_url: '/images/insights/q4-2024-tech-earnings-analysis.jpg'
  },
  {
    slug: 'fintech-disruption-reshaping-financial-services-landscape',
    title: 'Fintech Disruption: Reshaping the Financial Services Landscape',
    cover_image_url: '/images/insights/fintech-disruption-reshaping-financial-services-landscape.jpg'
  },
  {
    slug: 'cloud-infrastructure-boom-pricing-models-investment-implications',
    title: 'Cloud Infrastructure Boom: Pricing Models and Investment Implications',
    cover_image_url: '/images/insights/cloud-infrastructure-pricing-models-implications-margins.jpg'
  },
  {
    slug: 'esg-integration-building-sustainable-investment-portfolios',
    title: 'ESG Integration: Building Sustainable Investment Portfolios',
    cover_image_url: '/images/insights/esg-integration-building-sustainable-investment-portfolios.jpg'
  },
  {
    slug: 'ai-semiconductor-revolution-investment-opportunities-next-gen-computing',
    title: 'AI Semiconductor Revolution: Investment Opportunities in Next-Gen Computing',
    cover_image_url: '/images/insights/ai-semiconductor-revolution-investment-opportunities.jpg'
  },
  {
    slug: 'multifamily-real-estate-investment-opportunities-2025-market-outlook',
    title: 'Multifamily Real Estate Investment Opportunities: 2025 Market Outlook',
    cover_image_url: '/images/insights/multifamily-real-estate-investment-opportunities-2025.jpg'
  }
];

async function getInsightBySlug(slug) {
  try {
    const response = await fetch(`http://localhost:3001/api/insights?slug=${slug}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error(`Error fetching insight ${slug}:`, error.message);
    return null;
  }
}

async function updateImageOnly() {
  console.log('🖼️ Updating cover images for original 6 insights...\n');
  
  for (const insight of ORIGINAL_INSIGHTS) {
    try {
      console.log(`🔄 Processing: ${insight.title}`);
      
      // Get the current insight data
      const currentInsight = await getInsightBySlug(insight.slug);
      
      if (currentInsight) {
        // Update with complete data but only change the cover image
        const updateData = {
          slug: insight.slug,
          title: currentInsight.title || insight.title,
          summary: currentInsight.summary || '',
          content: currentInsight.content || '',
          cover_image_url: insight.cover_image_url, // This is what we're updating
          tags: currentInsight.tags || '',
          status: currentInsight.status || 'published',
          author: currentInsight.author || 'ZenCap Research Team'
        };

        console.log(`   🔄 Updating cover image to: ${insight.cover_image_url}`);
        
        const updateResponse = await fetch('http://localhost:3001/api/insights', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log(`   ✅ Successfully updated! ID: ${result.id}`);
        } else {
          const errorText = await updateResponse.text();
          console.error(`   ❌ Update failed: ${updateResponse.status}`);
          console.error(`   Details: ${errorText}`);
        }
      } else {
        console.error(`   ❌ Could not find insight: ${insight.slug}`);
      }
      
      // Small delay between updates
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Error updating ${insight.title}:`, error.message);
    }
  }
  
  console.log('\n🎉 Image update process completed!');
  console.log('🔗 Check your admin panel to verify the image links');
}

updateImageOnly(); 