const fs = require('fs');

async function createFedPolicyInsight() {
  try {
    // Read the enhanced Federal Reserve HTML content
    const htmlContent = fs.readFileSync('fed-policy-q1-2025.html', 'utf8');
    
    const insightData = {
      title: "Federal Reserve Policy Shifts: Q1 2025 Investment Implications",
      slug: "federal-reserve-policy-shifts-q1-2025-investment-implications",
      summary: "Comprehensive analysis of Federal Reserve monetary policy transitions and their impact on investment strategies, covering interest rate dynamics, duration risk management, and sector rotation opportunities in Q1 2025.",
      content: htmlContent,
      cover_image: "/images/insights/federal-reserve-policy-investment-implications-2025.jpg",
      category: "Market Analysis",
      read_time: 8,
      tags: ["Federal Reserve", "Monetary Policy", "Interest Rates", "Investment Strategy", "Q1 2025"],
      status: 'published',
      author: 'ZenCap Research Team',
      published_at: new Date().toISOString()
    };

    console.log('➕ Creating Federal Reserve insight as new entry...');
    
    const response = await fetch('http://localhost:3001/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(insightData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successfully created Federal Reserve insight!');
      console.log(`   Database ID: ${result.id}`);
      console.log('🎉 All 12 insights are now in the database!');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create Federal Reserve insight:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Error creating Federal Reserve insight:', error.message);
  }
}

createFedPolicyInsight(); 