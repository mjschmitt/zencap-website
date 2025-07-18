const fs = require('fs');

// Color replacement mapping - replacing problematic colors with professional website colors
const COLOR_REPLACEMENTS = {
  // Red colors to professional grays/blues
  '#fee2e2': '#f3f4f6', // light red background to light gray
  '#fef2f2': '#f1f5f9', // very light red to slate gray
  '#fecaca': '#e2e8f0', // light red to gray
  '#dc2626': '#475569', // red text to slate
  '#991b1b': '#374151', // dark red to dark gray
  '#ef4444': '#64748b', // red border/accent to slate
  
  // Yellow/orange colors to professional alternatives
  '#fef3c7': '#f0f9ff', // light yellow background to light blue
  '#fde68a': '#dbeafe', // yellow background to light blue  
  '#92400e': '#1e40af', // orange/brown text to blue
  '#d97706': '#1e40af', // orange to blue
  '#f59e0b': '#3b82f6', // orange accent to blue
  
  // Specific gradient patterns
  'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)': 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)': 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)',
};

const INSIGHTS_TO_FIX = [
  'fed-policy-q1-2025.html'
];

function fixColorsInHTML(htmlContent) {
  let fixedContent = htmlContent;
  
  for (const [oldColor, newColor] of Object.entries(COLOR_REPLACEMENTS)) {
    // Use global replace for all instances
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    fixedContent = fixedContent.replace(regex, newColor);
  }
  
  return fixedContent;
}

async function fixInsightColors() {
  console.log('🎨 Starting color fix for enhanced insights...\n');
  
  for (const htmlFile of INSIGHTS_TO_FIX) {
    try {
      console.log(`🔧 Fixing colors in: ${htmlFile}`);
      
      // Read the HTML file
      const originalContent = fs.readFileSync(htmlFile, 'utf8');
      
      // Fix the colors
      const fixedContent = fixColorsInHTML(originalContent);
      
      // Write back to file
      fs.writeFileSync(htmlFile, fixedContent, 'utf8');
      
      console.log(`   ✅ Colors fixed and saved to ${htmlFile}`);
      
      // Now update the database with the fixed content
      const slug = htmlFile.replace('.html', '').replace('fed-policy-q1-2025', 'federal-reserve-policy-shifts-q1-2025-investment-implications');
      
      console.log(`   🔄 Updating database for slug: ${slug}`);
      
      const updateData = {
        slug: slug,
        title: "Federal Reserve Policy Shifts: Q1 2025 Investment Implications",
        summary: "Comprehensive analysis of Federal Reserve monetary policy transitions and their impact on investment strategies, covering interest rate dynamics, duration risk management, and sector rotation opportunities in Q1 2025.",
        content: fixedContent,
        cover_image_url: "/images/insights/federal-reserve-policy-investment-implications-2025.jpg",
        tags: "Federal Reserve,Monetary Policy,Interest Rates,Investment Strategy,Q1 2025",
        status: 'published',
        author: 'ZenCap Research Team'
      };

      const updateResponse = await fetch('http://localhost:3001/api/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`   ✅ Database updated successfully!`);
      } else {
        const errorText = await updateResponse.text();
        console.error(`   ❌ Database update failed: ${updateResponse.status} ${errorText}`);
      }
      
    } catch (error) {
      console.error(`❌ Error fixing colors in ${htmlFile}:`, error.message);
    }
  }
  
  console.log('\n🎉 Color fixes completed!');
  console.log('🎨 All red and yellow colors have been replaced with professional website colors');
  console.log('🔗 Check your insights to verify the color improvements');
}

fixInsightColors(); 