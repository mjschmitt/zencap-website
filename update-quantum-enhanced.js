const fs = require('fs');

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

async function updateQuantumInsight() {
  console.log('🚀 Updating Quantum Computing insight with fully enhanced content...\n');
  
  try {
    const slug = 'quantum-computing-investment-acceleration-q2-2025-analysis';
    
    // Read the fully enhanced HTML content
    const htmlContent = fs.readFileSync('quantum-computing-enhanced.html', 'utf8');
    
    console.log('📖 Reading current insight data...');
    const currentInsight = await getInsightBySlug(slug);
    
    if (currentInsight) {
      // Prepare the update with enhanced content and complete metadata
      const updateData = {
        slug: slug,
        title: currentInsight.title || "Quantum Computing Investment Acceleration: Q2 2025 Analysis",
        summary: "Comprehensive analysis of quantum computing investment opportunities in Q2 2025, covering technology breakthroughs, enterprise adoption milestones, market dynamics, and strategic portfolio allocation frameworks with $65B market potential.",
        content: htmlContent, // This is the enhanced content
        cover_image_url: currentInsight.cover_image_url || "/images/insights/quantum-computing-investment-acceleration-analysis-2025.jpg",
        tags: currentInsight.tags || "Quantum Computing,Technology Investment,Enterprise Adoption,Market Analysis,Q2 2025",
        status: currentInsight.status || 'published',
        author: currentInsight.author || 'ZenCap Research Team'
      };

      console.log('🔄 Updating database with enhanced content...');
      
      const updateResponse = await fetch('http://localhost:3001/api/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log('✅ Successfully updated Quantum Computing insight!');
        console.log(`   Database ID: ${result.id}`);
        console.log('🎉 Enhancement complete - now matches the sophisticated design of other insights');
      } else {
        const errorText = await updateResponse.text();
        console.error('❌ Update failed:', updateResponse.status);
        console.error('Error details:', errorText);
      }
    } else {
      console.error('❌ Could not find Quantum Computing insight in database');
    }
    
  } catch (error) {
    console.error('❌ Error updating Quantum Computing insight:', error.message);
  }
}

updateQuantumInsight(); 