// upload-models-to-database.js
// Script to upload example models to the database

const MODELS = [
  // Private Equity Models
  {
    slug: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    description: `<h2>Complete Multifamily Development Financial Model</h2>
      <p>This multifamily development model provides a comprehensive framework for analyzing ground-up apartment development projects. The model allows for detailed construction budgeting, unit mix configuration, and lease-up scenario planning to accurately model development opportunities.</p>
      
      <p>The financing module includes options for construction financing, permanent debt, mezzanine financing, and equity structures, with detailed waterfall calculations to project returns for different investor classes. Sensitivity analysis tools help you understand how changes in key assumptions impact your returns.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Construction Analysis:</strong> Detailed construction budget tracking, draw schedule projections, and construction timeline modeling</li>
        <li><strong>Unit Mix Configuration:</strong> Comprehensive unit type setup with rental rate projections, absorption assumptions, and concession modeling</li>
        <li><strong>Financial Projections:</strong> 10-year cash flow projections with customizable growth rates for income and expenses</li>
        <li><strong>Financing Structures:</strong> Model multiple debt tranches, interest-only periods, and refinancing scenarios</li>
        <li><strong>Return Analysis:</strong> IRR, equity multiple, cash-on-cash, and detailed investment metrics</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is ideal for real estate developers, investment firms, private equity groups, and individual investors who need a sophisticated but user-friendly tool for evaluating multifamily development opportunities.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/multifamily-development-thumb.jpg',
    file_url: '/models/files/multifamily-development-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'construction budget, lease-up modeling, financing scenarios, investor waterfall, sensitivity analysis'
  },
  {
    slug: 'multifamily-acquisition-model',
    title: 'Multifamily Acquisition Model',
    description: `<h2>Complete Multifamily Acquisition Financial Model</h2>
      <p>This multifamily acquisition model provides a comprehensive framework for analyzing apartment complex investments. The model allows for detailed unit-by-unit analysis, incorporating renovation scenarios and tenant turnover projections to accurately model value-add opportunities.</p>
      
      <p>The financing module includes options for senior debt, mezzanine financing, and equity structures, with detailed waterfall calculations to project returns for different investor classes. Sensitivity analysis tools help you understand how changes in key assumptions impact your returns.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Property Analysis:</strong> Detailed unit mix configuration, current rent roll input, market rent comparisons, and renovation planning</li>
        <li><strong>Financial Projections:</strong> 10-year cash flow projections with customizable growth rates for income and expenses</li>
        <li><strong>Financing Structures:</strong> Model multiple debt tranches, interest-only periods, and refinancing scenarios</li>
        <li><strong>Return Analysis:</strong> IRR, equity multiple, cash-on-cash, and detailed investment metrics</li>
        <li><strong>Reporting:</strong> Presentation-ready outputs and charts for investment committee and investor communications</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is ideal for real estate investment firms, private equity groups, asset managers, and individual investors who need a sophisticated but user-friendly tool for evaluating multifamily acquisition opportunities.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/multifamily-acquisition-thumb.jpg',
    file_url: '/models/files/multifamily-acquisition-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'unit analysis, renovation scenarios, financing options, investor waterfall, dynamic reporting'
  },
  {
    slug: 'mixed-use-development-model',
    title: 'Mixed-Use Development Model',
    description: `<h2>Comprehensive Mixed-Use Development Model</h2>
      <p>This mixed-use development model provides a robust framework for analyzing complex projects that combine multiple property types such as retail, office, residential, and hospitality. The model handles the unique challenges of mixed-use development including phasing, component-specific assumptions, and integrated pro forma analysis.</p>
      
      <p>Whether you're planning a vertical mixed-use tower or a horizontal mixed-use district, this model gives you the flexibility to accurately analyze the financial feasibility and returns of complex development projects.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Component Analysis:</strong> Separate modeling for each property type with component-specific metrics and assumptions</li>
        <li><strong>Phased Development:</strong> Model multi-phase development timelines with staging of construction and lease-up</li>
        <li><strong>Integrated Budget:</strong> Comprehensive construction budget with shared costs and component-specific expenses</li>
        <li><strong>Financing Structures:</strong> Model complex debt structures including construction financing, mini-perm loans, and permanent takeout options</li>
        <li><strong>Return Analysis:</strong> Component-level and project-level returns with detailed metrics for different investor classes</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for developers, investment firms, and real estate professionals who need a sophisticated tool to analyze complex mixed-use development opportunities with multiple property types and phasing considerations.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/mixed-use-development-thumb.jpg',
    file_url: '/models/files/mixed-use-development-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'multi-component modeling, phased development, construction budget, component lease-up, complex financing'
  },
  {
    slug: 'mixed-use-acquisition-model',
    title: 'Mixed-Use Acquisition Model',
    description: `<h2>Comprehensive Mixed-Use Acquisition Model</h2>
      <p>This mixed-use acquisition model provides a thorough framework for analyzing existing mixed-use properties with multiple components such as retail, office, multifamily, and other property types. The model handles the complexity of different lease structures, tenant rollover patterns, and operating expense allocations across diverse property types.</p>
      
      <p>The model allows for both property-wide analysis and component-specific underwriting, giving you visibility into the performance of each segment of your mixed-use asset.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Component Analysis:</strong> Separate pro forma for each property type with custom assumptions and metrics</li>
        <li><strong>Tenant Management:</strong> Detailed tenant rollover scheduling with renewal probabilities and market adjustment factors</li>
        <li><strong>Renovation Planning:</strong> Component-specific capital improvement and renovation budgeting</li>
        <li><strong>Financing Options:</strong> Modeling of cross-collateralized debt, component-specific financing, or hybrid approaches</li>
        <li><strong>Performance Metrics:</strong> Blended returns with the ability to track component-specific contribution to overall performance</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is ideal for real estate investment firms, REITs, private equity groups, and asset managers focused on mixed-use property investments that require sophisticated analysis of multiple property types within a single asset.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/mixed-use-acquisition-thumb.jpg',
    file_url: '/models/files/mixed-use-acquisition-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'component analysis, tenant rollover, renovation budgeting, cross-collateralized financing, blended returns'
  },
  {
    slug: 'commercial-development-model',
    title: 'Commercial Development Model',
    description: `<h2>Comprehensive Commercial Development Model</h2>
      <p>This commercial development model provides a robust framework for analyzing ground-up office, retail, industrial, and other commercial real estate development projects. The model handles the specific requirements of commercial development including tenant improvements, leasing commissions, and pre-leasing scenarios.</p>
      
      <p>From build-to-suit projects to speculative developments, this model gives you the tools to accurately project construction costs, lease-up timelines, financing requirements, and investment returns.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Flexible Property Types:</strong> Adaptable for office, retail, industrial, medical, and other commercial uses</li>
        <li><strong>Construction Tracking:</strong> Detailed construction budget and draw schedule with contingency management</li>
        <li><strong>Leasing Scenarios:</strong> Model pre-leasing, speculative development, and various absorption scenarios</li>
        <li><strong>Tenant Improvements:</strong> Detailed TI/LC modeling with timing tied to lease commencement</li>
        <li><strong>Development Economics:</strong> Comprehensive analysis of development yields, profit margins, and investor returns</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for commercial developers, investment firms, private equity groups, and financial institutions involved in ground-up commercial real estate development projects of various types and scales.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/commercial-development-thumb.jpg',
    file_url: '/models/files/commercial-development-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'commercial property types, construction draw schedules, pre-leasing scenarios, development fees, sponsor promote'
  },
  {
    slug: 'commercial-acquisition-model',
    title: 'Commercial Acquisition Model',
    description: `<h2>Comprehensive Commercial Property Analysis</h2>
      <p>This commercial property acquisition model provides a detailed framework for analyzing office, retail, industrial, and other commercial building investments. The model features tenant-by-tenant lease tracking, renewal probability modeling, and comprehensive capital expenditure planning to accurately project returns for commercial property investments.</p>
      
      <p>The financing module supports complex debt structures, including senior debt, mezzanine financing, and preferred equity. Detailed waterfall calculations allow you to model various profit-sharing arrangements with your investment partners.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Tenant Analysis:</strong> Detailed tenant-by-tenant lease tracking with customizable renewal probabilities and TI/LC assumptions</li>
        <li><strong>Vacancy Modeling:</strong> Sophisticated vacancy projections based on market conditions and property-specific factors</li>
        <li><strong>Capital Planning:</strong> Comprehensive CapEx modeling for building systems, tenant improvements, and property enhancements</li>
        <li><strong>Financial Projections:</strong> 10-year cash flow projections with detailed operating expense breakdowns</li>
        <li><strong>Investment Returns:</strong> IRR, equity multiple, cash-on-cash, and detailed investment metrics for various stakeholders</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for real estate investment firms, REITs, private equity groups, and asset managers focused on commercial property investments. It provides the analytical rigor needed for institutional-quality underwriting.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/commercial-acquisition-thumb.jpg',
    file_url: '/models/files/commercial-acquisition-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'tenant lease analysis, renewal probability, capital expenditure modeling, debt structures, sensitivity analysis'
  },
  {
    slug: 'hospitality-development-model',
    title: 'Hospitality Development Model',
    description: `<h2>Comprehensive Hospitality Development Model</h2>
      <p>This hospitality development model provides a specialized framework for analyzing hotel and resort development projects. The model incorporates the unique aspects of hotel development including brand selection, operator agreements, FF&E budgeting, and departmental revenue/expense projections.</p>
      
      <p>From select-service hotels to luxury resorts, this model gives you the tools to accurately assess development costs, operating performance, and investment returns for hospitality assets.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Brand Analysis:</strong> Compare different flag options and their impact on ADR, occupancy, and fee structures</li>
        <li><strong>Department Projections:</strong> Detailed revenue and expense modeling for rooms, F&B, spa, golf, and other revenue centers</li>
        <li><strong>Development Budget:</strong> Comprehensive construction budget with FF&E, OS&E, pre-opening, and technical service expenses</li>
        <li><strong>Management Structure:</strong> Model operator agreements including base fees, incentive fees, and performance tests</li>
        <li><strong>Financial Analysis:</strong> Property-level metrics (RevPAR, GOP, NOI) and investment returns (IRR, equity multiple)</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for hotel developers, investors, private equity groups, and hospitality companies involved in ground-up development or major repositioning of hotel and resort properties.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/hospitality-development-thumb.jpg',
    file_url: '/models/files/hospitality-development-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'hotel brand assumptions, ADR occupancy modeling, departmental revenue, FF&E reserves, operator incentives'
  },
  {
    slug: 'hospitality-acquisition-model',
    title: 'Hospitality Acquisition Model',
    description: `<h2>Comprehensive Hospitality Acquisition Model</h2>
      <p>This hospitality acquisition model provides a specialized framework for analyzing hotel and resort property investments. The model incorporates the unique aspects of hotel operations including seasonal patterns, departmental profitability, booking channels, and management structures.</p>
      
      <p>Whether you're evaluating a stabilized hotel acquisition or a value-add opportunity with rebranding potential, this model gives you the tools to accurately project operating performance and investment returns.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Performance Analysis:</strong> Detailed modeling of ADR, occupancy, RevPAR, and departmental revenues/expenses</li>
        <li><strong>Renovation Planning:</strong> Property improvement plan (PIP) budgeting with disruption impact analysis</li>
        <li><strong>Brand Scenarios:</strong> Compare the impact of different flags or independent operation on performance and value</li>
        <li><strong>Management Options:</strong> Model owner-operated, third-party management, and franchise scenarios</li>
        <li><strong>Seasonality Patterns:</strong> Monthly performance variations to account for high/shoulder/low season dynamics</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for hotel investors, private equity groups, family offices, and hospitality companies involved in the acquisition, repositioning, or refinancing of existing hotel and resort properties.</p>`,
    category: 'Private Equity',
    thumbnail_url: '/images/models/private-equity/hospitality-acquisition-thumb.jpg',
    file_url: '/models/files/hospitality-acquisition-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'RevPAR analysis, property improvement budgeting, brand conversion scenarios, management agreement, seasonality patterns'
  },

  // Public Equity Models
  {
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    description: `<h2>Comprehensive AppLovin (APP) Financial Model</h2>
      <p>This detailed 3-statement model for AppLovin Corporation provides a complete framework for analyzing the company's financial performance and projecting future results. The model breaks down revenue by segment, tracks key operating metrics, and includes fully integrated financial statements.</p>
      
      <p>Whether you're a professional analyst, institutional investor, or individual researching the mobile app and gaming technology sector, this model gives you the tools to develop an informed investment thesis on AppLovin.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Segment Analysis:</strong> Detailed modeling of Software Platform and Apps businesses with key growth drivers</li>
        <li><strong>Historical Data:</strong> Quarterly and annual historical figures with calculated growth rates and margins</li>
        <li><strong>Projection Flexibility:</strong> Multiple forecast methodologies with adjustable assumptions for key drivers</li>
        <li><strong>Operating Metrics:</strong> Software Platform EBITDA, DAUs, MAUs, ARPDAU and other critical KPIs</li>
        <li><strong>Valuation Framework:</strong> DCF, multiples-based valuation, and scenario analysis built into the model</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing AppLovin Corporation's financial performance and valuation.</p>`,
    category: 'Public Equity',
    thumbnail_url: '/images/models/public-equity/applovin-model-thumb.jpg',
    file_url: '/models/files/applovin-3-statement-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'revenue breakdown, historical data, integrated statements, operating metrics, sensitivity analysis'
  },
  {
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    description: `<h2>Comprehensive NVIDIA (NVDA) Financial Model</h2>
      <p>This detailed 3-statement model for NVIDIA Corporation provides a complete framework for analyzing the company's financial performance and projecting future results. The model breaks down revenue by segment, tracks key semiconductor and AI metrics, and includes fully integrated financial statements.</p>
      
      <p>With NVIDIA's position at the forefront of AI and accelerated computing, this model gives you the tools to develop sophisticated projections and valuation scenarios based on different AI adoption trajectories.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Segment Analysis:</strong> Detailed modeling of Data Center, Gaming, Professional Visualization, Automotive, and OEM segments</li>
        <li><strong>Historical Data:</strong> Quarterly and annual historical figures with calculated growth rates and margins</li>
        <li><strong>AI Market Modeling:</strong> Framework for projecting Data Center growth based on AI compute demand scenarios</li>
        <li><strong>R&D and Capex:</strong> Detailed investment modeling with return on investment analysis</li>
        <li><strong>Valuation Framework:</strong> DCF, multiples-based valuation, and scenario analysis built into the model</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing NVIDIA Corporation's financial performance and valuation.</p>`,
    category: 'Public Equity',
    thumbnail_url: '/images/models/public-equity/nvidia-model-thumb.jpg',
    file_url: '/models/files/nvidia-3-statement-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'segment modeling, AI market projections, R&D capex modeling, competitor benchmarking, multiple valuations'
  },
  {
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    description: `<h2>Comprehensive Tesla (TSLA) Financial Model</h2>
      <p>This detailed 3-statement model for Tesla, Inc. provides a complete framework for analyzing the company's financial performance and projecting future results. The model includes vehicle delivery forecasts by model, energy business projections, manufacturing capacity planning, and fully integrated financial statements.</p>
      
      <p>Whether you're focused on Tesla's automotive business, energy products, or new initiatives like AI and robotics, this model gives you the tools to develop sophisticated projections and valuation scenarios.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Vehicle Deliveries:</strong> Detailed forecasting by model (Model 3/Y/S/X/Cybertruck/future models) with ASP trends</li>
        <li><strong>Manufacturing Analysis:</strong> Factory-level production capacity modeling with utilization rates and expansion plans</li>
        <li><strong>Energy Business:</strong> Storage and generation revenue projections with margin progression</li>
        <li><strong>Gross Margin Drivers:</strong> Component-level cost modeling, manufacturing efficiency, and regulatory credit contribution</li>
        <li><strong>Valuation Framework:</strong> DCF, sum-of-the-parts, and multiples-based valuation methodologies</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing Tesla's financial performance and valuation across its multiple business lines.</p>`,
    category: 'Public Equity',
    thumbnail_url: '/images/models/public-equity/tesla-model-thumb.jpg',
    file_url: '/models/files/tesla-3-statement-model.xlsx',
    price: 4985,
    status: 'active',
    tags: 'vehicle delivery forecasts, gross margin analysis, energy business modeling, factory capacity, cash flow analysis'
  },
  {
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    description: `<h2>Professional-Grade DCF Analysis</h2>
      <p>This comprehensive DCF Valuation Suite provides a robust framework for valuing public and private companies. The model integrates a complete three-statement financial model with sophisticated valuation techniques to deliver institutional-quality analysis.</p>
      
      <p>The suite allows you to seamlessly flow historical financial data into your projection period, apply multiple valuation methodologies, and conduct comprehensive sensitivity analysis to understand the key drivers of value.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Financial Projections:</strong> Integrated income statement, balance sheet, and cash flow statement with up to 10 years of projections</li>
        <li><strong>Valuation Methods:</strong> DCF (terminal value via perpetuity or exit multiple), comparable company analysis, precedent transactions, and LBO analysis</li>
        <li><strong>Cost of Capital:</strong> Detailed WACC calculation with customizable risk-free rate, market risk premium, and beta estimation</li>
        <li><strong>Scenario Analysis:</strong> Create, compare, and blend multiple scenarios to reflect different possible outcomes</li>
        <li><strong>Sensitivity Tools:</strong> Dynamic sensitivity tables and tornado charts to identify key value drivers</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for investment professionals, equity research analysts, corporate finance teams, and serious investors who need a comprehensive framework for valuing companies across industries.</p>`,
    category: 'Public Equity',
    thumbnail_url: '/images/models/public-equity/dcf-valuation-thumb.jpg',
    file_url: '/models/files/dcf-valuation-suite.xlsx',
    price: 2985,
    status: 'active',
    tags: 'integrated 3-statement model, multiple valuation methods, WACC calculation, scenario analysis, sensitivity tables'
  },
  {
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    description: `<h2>Sophisticated Performance Attribution</h2>
      <p>This Portfolio Attribution Model provides a comprehensive framework for analyzing the sources of portfolio performance. The model helps you understand how asset allocation, security selection, factor exposures, and market timing contribute to your overall returns.</p>
      
      <p>Whether you're managing a diversified equity portfolio, a balanced fund, or an alternative investment strategy, this model gives you the analytical tools to identify what's working, what's not, and why.</p>
      
      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Attribution Analysis:</strong> Break down returns by asset allocation, security selection, factor exposures, and market timing</li>
        <li><strong>Factor Analysis:</strong> Analyze exposure and contribution from factors like size, value, momentum, quality, and volatility</li>
        <li><strong>Sector Analysis:</strong> Understand sector allocation decisions and their impact on performance</li>
        <li><strong>Risk Metrics:</strong> Calculate beta, volatility, Sharpe ratio, information ratio, and other key risk/return measures</li>
        <li><strong>Custom Benchmarks:</strong> Compare performance against standard indices or custom blended benchmarks</li>
      </ul>
      
      <h2>Who This Model is For</h2>
      <p>This model is designed for portfolio managers, investment analysts, wealth managers, and institutional investors who need a sophisticated tool for understanding the drivers of investment performance.</p>`,
    category: 'Public Equity',
    thumbnail_url: '/images/models/public-equity/portfolio-attribution-thumb.jpg',
    file_url: '/models/files/portfolio-attribution-model.xlsx',
    price: 2985,
    status: 'active',
    tags: 'performance attribution, sector analysis, risk analytics, custom benchmarks, interactive dashboards'
  }
];

async function uploadModels() {
  console.log('Starting model upload to database...');
  
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    
    try {
      console.log(`Uploading model ${i + 1}/${MODELS.length}: ${model.title}`);
      
      const response = await fetch('http://localhost:3000/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(model)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to upload ${model.title}:`, errorData);
      } else {
        const result = await response.json();
        console.log(`✅ Successfully uploaded: ${model.title}`);
      }
    } catch (error) {
      console.error(`Error uploading ${model.title}:`, error);
    }
  }
  
  console.log('Model upload complete!');
}

// Run the upload
uploadModels().catch(console.error); 