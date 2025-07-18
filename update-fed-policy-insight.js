const fs = require('fs');

async function updateInsight() {
  try {
    // Read the enhanced HTML content
    const enhancedContent = fs.readFileSync('fed-policy-q1-2025.html', 'utf8');

    // Prepare the insight data for database insertion
    const insightData = {
      slug: 'federal-reserve-policy-shifts-march-2025',
      title: 'Federal Reserve Policy Shifts: March 2025 Analysis',
      summary: 'Strategic investment framework for transitioning monetary policy. Analysis indicates 180bp cumulative easing cycle through Q4 2025, creating opportunities in duration-sensitive assets while necessitating tactical credit allocation adjustments.',
      content: enhancedContent,
      author: 'Zenith Capital Research Team',
      cover_image_url: '/images/insights/federal-reserve-policy-shifts-march-2025.jpg',
      status: 'published',
      tags: 'monetary policy, federal reserve, fixed income, portfolio strategy, market analysis'
    };

    // Make API call to create/update the insight
    const response = await fetch('http://localhost:3000/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insightData)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Federal Reserve Policy insight updated successfully');
      console.log('Insight ID:', data.id || 'Created');
    } else {
      console.error('❌ Error updating insight:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error updating insight:', error.message);
  }
}

updateInsight(); 