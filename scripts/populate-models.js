// Script to populate database with initial models

const PUBLIC_EQUITY_MODELS = [
  {
    id: 'applovin-3-statement-model',
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    description: 'Comprehensive financial model for AppLovin Corporation with integrated income statement, balance sheet, and cash flow projections.',
    category: 'Public Equity',
    price: 4985,
    tags: 'Detailed revenue breakdown by segment, Historical data and forward projections, Fully integrated 3-statement model, Operating metrics and KPIs dashboard, Sensitivity analysis on key drivers',
    status: 'active'
  },
  {
    id: 'nvidia-3-statement-model',
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    description: 'Integrated financial model for NVIDIA Corporation with segment analysis, growth projections, and valuation framework.',
    category: 'Public Equity',
    price: 4985,
    tags: 'Revenue modeling by business segment, AI/GPU market growth projections, R&D and capex investment modeling, Competitor performance benchmarking, Multiple valuation methodologies',
    status: 'active'
  },
  {
    id: 'tesla-3-statement-model',
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    description: 'Detailed financial model for Tesla, Inc. with vehicle delivery forecasts, energy business projections, and manufacturing expansion analysis.',
    category: 'Public Equity',
    price: 4985,
    tags: 'Vehicle production and delivery forecasts, Energy business revenue modeling, Manufacturing capacity expansion, Battery technology cost curves, Global market penetration analysis',
    status: 'active'
  },
  {
    id: 'uber-valuation-model',
    slug: 'uber-valuation-model',
    title: 'Uber Technologies Valuation Model',
    description: 'Multi-scenario valuation model for Uber with ride-sharing, delivery, and freight segment analysis.',
    category: 'Public Equity',
    price: 3985,
    tags: 'Segment revenue and margin analysis, Take rate and driver economics, Market share and TAM modeling, Unit economics by geography, DCF and multiples valuation',
    status: 'active'
  },
  {
    id: 'dcf-valuation-template',
    slug: 'dcf-valuation-template',
    title: 'Universal DCF Valuation Template',
    description: 'Flexible discounted cash flow valuation model adaptable to any public company with automated financial statement integration.',
    category: 'Public Equity',
    price: 2985,
    tags: 'Automated financial statement import, WACC calculation framework, Terminal value methodologies, Sensitivity and scenario analysis, Monte Carlo simulation capabilities',
    status: 'active'
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution & Analytics Model',
    description: 'Comprehensive portfolio performance attribution system with factor analysis and risk decomposition.',
    category: 'Public Equity',
    price: 3985,
    tags: 'Multi-factor attribution analysis, Risk decomposition framework, Performance benchmarking tools, Sector and style analysis, Custom factor modeling',
    status: 'active'
  },
  {
    id: 'merger-arbitrage-toolkit',
    slug: 'merger-arbitrage-toolkit',
    title: 'Merger Arbitrage Analysis Toolkit',
    description: 'Specialized model for analyzing merger arbitrage opportunities with deal timeline tracking and probability-weighted returns.',
    category: 'Public Equity',
    price: 3485,
    tags: 'Deal spread calculation, Timeline and milestone tracking, Regulatory approval probability, Financing risk assessment, Expected return analysis',
    status: 'active'
  },
  {
    id: 'options-strategy-analyzer',
    slug: 'options-strategy-analyzer',
    title: 'Options Strategy Analyzer',
    description: 'Advanced options pricing and strategy analysis tool with Greeks calculation and profit/loss visualization.',
    category: 'Public Equity',
    price: 2985,
    tags: 'Black-Scholes pricing model, Greeks calculation and visualization, Strategy builder and analyzer, Implied volatility analysis, P&L scenario modeling',
    status: 'active'
  }
];

const PRIVATE_EQUITY_MODELS = [
  {
    id: '111-sw-16th-ter',
    slug: '111-sw-16th-ter',
    title: '111 SW 16th Ter - Multifamily Development',
    description: 'Comprehensive acquisition model for a 45-unit multifamily development opportunity in Miami, FL with value-add potential through renovations.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Cash-on-cash return analysis, IRR and equity multiple projections, Debt financing scenarios, Sensitivity analysis on key variables, Monthly cash flow projections',
    status: 'active'
  },
  {
    id: 'willow-creek-apartments',
    slug: 'willow-creek-apartments',
    title: 'Willow Creek Apartments - Value-Add Multifamily',
    description: '150-unit garden-style apartment complex acquisition model with comprehensive renovation and repositioning strategy analysis.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Unit-by-unit renovation scheduling, Market rent comp analysis, Financing structure optimization, Waterfall distribution modeling, 10-year hold period analysis',
    status: 'active'
  },
  {
    id: 'downtown-mixed-use',
    slug: 'downtown-mixed-use',
    title: 'Downtown Mixed-Use Development',
    description: 'Ground-up development model for a 200,000 SF mixed-use project combining retail, office, and residential components.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Construction cost breakdown, Phased leasing assumptions, Multiple revenue stream modeling, Development timeline analysis, Equity partnership structures',
    status: 'active'
  },
  {
    id: 'gateway-industrial-portfolio',
    slug: 'gateway-industrial-portfolio',
    title: 'Gateway Industrial Portfolio',
    description: 'Three-property industrial portfolio acquisition model with tenant rollover analysis and market rent growth projections.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Tenant credit analysis, Lease rollover schedule, Market rent growth modeling, Portfolio debt structuring, Asset management strategy',
    status: 'active'
  },
  {
    id: 'boutique-hotel-conversion',
    slug: 'boutique-hotel-conversion',
    title: 'Boutique Hotel Conversion',
    description: 'Adaptive reuse model for converting a historic office building into a 120-room boutique hotel with F&B components.',
    category: 'Private Equity',
    price: 4985,
    tags: 'RevPAR and ADR projections, F&B revenue modeling, Renovation cost analysis, Stabilization timeline, Management agreement structuring',
    status: 'active'
  },
  {
    id: 'medical-office-portfolio',
    slug: 'medical-office-portfolio',
    title: 'Medical Office Building Portfolio',
    description: 'Specialized healthcare real estate model for acquiring and managing a portfolio of medical office buildings.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Healthcare tenant analysis, Triple-net lease modeling, Compliance cost projections, Cap rate compression analysis, REIT conversion optionality',
    status: 'active'
  },
  {
    id: 'student-housing-development',
    slug: 'student-housing-development',
    title: 'Student Housing Development',
    description: 'Purpose-built student housing development model for a 600-bed facility near a major university campus.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Bed lease-up projections, Academic year modeling, Amenity revenue streams, University partnership terms, Parent guarantee analysis',
    status: 'active'
  },
  {
    id: 'self-storage-acquisition',
    slug: 'self-storage-acquisition',
    title: 'Self-Storage Facility Acquisition',
    description: 'Value-add acquisition model for a 500-unit self-storage facility with expansion potential.',
    category: 'Private Equity',
    price: 4985,
    tags: 'Unit mix optimization, Occupancy ramp-up modeling, Ancillary revenue streams, Expansion feasibility analysis, Climate-controlled conversion ROI',
    status: 'active'
  }
];

async function populateModels() {
  const baseUrl = process.env.STAGING_URL || 'https://zencap-website-q0ay052st-mjschmitts-projects.vercel.app';
  
  const allModels = [...PUBLIC_EQUITY_MODELS, ...PRIVATE_EQUITY_MODELS];
  
  console.log(`Populating ${allModels.length} models to ${baseUrl}/api/models`);
  
  for (const model of allModels) {
    try {
      const response = await fetch(`${baseUrl}/api/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...model,
          thumbnail_url: null,
          file_url: null,
          excel_url: null
        })
      });
      
      if (response.ok) {
        console.log(`✓ Added: ${model.title}`);
      } else {
        const error = await response.text();
        console.log(`✗ Failed to add ${model.title}: ${error}`);
      }
    } catch (error) {
      console.log(`✗ Error adding ${model.title}: ${error.message}`);
    }
  }
  
  console.log('\nDone populating models!');
}

// Run if called directly
if (require.main === module) {
  populateModels();
}