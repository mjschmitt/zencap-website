// src/pages/models/[slug].js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Motion from '@/components/ui/Motion';
import Card from '@/components/ui/Card';
import SEO from '@/components/SEO';

// Sample models data - in a real application, this would be fetched from an API or CMS
const MODELS = [
  // Private Equity Models
  {
    id: 'multifamily-development-model',
    slug: 'multifamily-development-model',
    title: 'Multifamily Development Model',
    excerpt: 'Comprehensive ground-up development modeling for multifamily projects with detailed construction budgeting and lease-up scenarios.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Development Preview',
    features: [
      'Detailed construction budget tracking',
      'Unit mix and lease-up modeling',
      'Financing scenarios with construction and permanent debt',
      'Investor waterfall distributions',
      'Sensitivity analysis on key variables'
    ],
    description: `
      <h2>Complete Multifamily Development Financial Model</h2>
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
      <p>This model is ideal for real estate developers, investment firms, private equity groups, and individual investors who need a sophisticated but user-friendly tool for evaluating multifamily development opportunities.</p>
    `,
    faq: [
      {
        question: "Can I customize the model for my specific needs?",
        answer: "Yes, the model is fully unlocked and customizable. You can modify formulas, add sheets, or adapt the model to your specific requirements."
      },
      {
        question: "Does the model include instructions?",
        answer: "Yes, the model includes extensive documentation, including a dedicated instructions sheet and cell-level notes explaining key calculations and inputs."
      },
      {
        question: "How detailed is the construction budget section?",
        answer: "The construction budget section allows for line-item level detail with the ability to track hard costs, soft costs, FF&E, land costs, and contingencies separately. It also includes monthly draw schedule forecasting and cost-to-complete analysis."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'multifamily-acquisition-model',
    slug: 'multifamily-acquisition-model',
    title: 'Multifamily Acquisition Model',
    excerpt: 'Comprehensive underwriting for apartment complexes with unit-level analysis, renovation scenarios, and financing options.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Multifamily Acquisition Preview',
    features: [
      'Unit-by-unit rental analysis',
      'Value-add renovation scenarios',
      'Detailed financing options with sensitivity analysis',
      'Investor waterfall and return calculations',
      'Dynamic charts and reporting'
    ],
    description: `
      <h2>Complete Multifamily Acquisition Financial Model</h2>
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
      <p>This model is ideal for real estate investment firms, private equity groups, asset managers, and individual investors who need a sophisticated but user-friendly tool for evaluating multifamily acquisition opportunities.</p>
    `,
    faq: [
      {
        question: "Can I customize the model for my specific needs?",
        answer: "Yes, the model is fully unlocked and customizable. You can modify formulas, add sheets, or adapt the model to your specific requirements."
      },
      {
        question: "Does the model include instructions?",
        answer: "Yes, the model includes extensive documentation, including a dedicated instructions sheet and cell-level notes explaining key calculations and inputs."
      },
      {
        question: "Can I use this model for commercial properties?",
        answer: "While this model is specifically designed for multifamily assets, many of the principles can be applied to commercial properties. For optimal results with commercial assets, we recommend our dedicated Office Property or Retail Property acquisition models."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'mixed-use-development-model',
    slug: 'mixed-use-development-model',
    title: 'Mixed-Use Development Model',
    excerpt: 'Ground-up development analysis for mixed-use projects combining retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Development Preview',
    features: [
      'Multi-component property type modeling',
      'Phased development scenarios',
      'Integrated construction budget tracking',
      'Component-specific lease-up assumptions',
      'Complex financing structures'
    ],
    description: `
      <h2>Comprehensive Mixed-Use Development Model</h2>
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
      <p>This model is designed for developers, investment firms, and real estate professionals who need a sophisticated tool to analyze complex mixed-use development opportunities with multiple property types and phasing considerations.</p>
    `,
    faq: [
      {
        question: "How many different property types can this model handle?",
        answer: "The model can accommodate up to 5 different property types within a single project, including retail, office, multifamily, condominiums, hotel, and other specialized uses."
      },
      {
        question: "Can I model phased development over multiple years?",
        answer: "Yes, the model allows you to schedule different phases of development with separate timelines for construction, lease-up, and stabilization for each component."
      },
      {
        question: "Does the model handle shared costs across components?",
        answer: "Absolutely. The model includes functionality for allocating shared infrastructure costs, common area expenses, and other project-wide costs across different components based on various allocation methodologies."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'mixed-use-acquisition-model',
    slug: 'mixed-use-acquisition-model',
    title: 'Mixed-Use Acquisition Model',
    excerpt: 'Acquisition analysis for properties with multiple components including retail, office, residential, and other property types.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Mixed-Use Acquisition Preview',
    features: [
      'Component-level cash flow analysis',
      'Multi-tenant rollover scheduling',
      'Property-specific renovation budgeting',
      'Cross-collateralized financing options',
      'Blended return metrics by component'
    ],
    description: `
      <h2>Comprehensive Mixed-Use Acquisition Model</h2>
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
      <p>This model is ideal for real estate investment firms, REITs, private equity groups, and asset managers focused on mixed-use property investments that require sophisticated analysis of multiple property types within a single asset.</p>
    `,
    faq: [
      {
        question: "How does the model handle different expense allocations across property types?",
        answer: "The model includes a flexible expense allocation system that allows you to designate expenses as direct to specific components or shared across multiple components using various allocation methodologies (square footage, revenue, custom percentages, etc.)."
      },
      {
        question: "Can I analyze the property both as a whole and by individual components?",
        answer: "Yes, the model provides both consolidated property-level analysis and component-specific metrics, allowing you to understand both the overall performance and the contribution of each property type to the investment returns."
      },
      {
        question: "Does the model support value-add and repositioning scenarios?",
        answer: "Absolutely. The model includes robust functionality for modeling renovation programs, tenant repositioning, and other value-add strategies specific to each component of the property."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'commercial-development-model',
    slug: 'commercial-development-model',
    title: 'Commercial Development Model',
    excerpt: 'Development underwriting for office, retail, industrial and other commercial property types with detailed construction tracking.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Development Preview',
    features: [
      'Customizable for different commercial property types',
      'Detailed construction draw schedules',
      'Pre-leasing scenarios and tenant improvements',
      'Development fee calculations',
      'Sponsor promote and waterfall structures'
    ],
    description: `
      <h2>Comprehensive Commercial Development Model</h2>
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
      <p>This model is designed for commercial developers, investment firms, private equity groups, and financial institutions involved in ground-up commercial real estate development projects of various types and scales.</p>
    `,
    faq: [
      {
        question: "Can I use this model for different types of commercial development?",
        answer: "Yes, the model is adaptable for various commercial property types including office, retail, industrial, medical office, life science, and other specialized commercial uses. The model structure accommodates the unique characteristics of each property type."
      },
      {
        question: "How does the model handle pre-leasing versus speculative development?",
        answer: "The model allows you to specify pre-leased tenants with negotiated terms, as well as model speculative space with assumptions for future lease-up. You can adjust vacancy periods, lease terms, and rental rates for each portion of the property."
      },
      {
        question: "Does the model include functionality for development fees and promotes?",
        answer: "Yes, the model includes detailed calculations for development fees, acquisition fees, leasing fees, and other fee structures. It also includes a comprehensive waterfall model with preferred returns, IRR hurdles, and promote structures."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'commercial-acquisition-model',
    slug: 'commercial-acquisition-model',
    title: 'Commercial Acquisition Model',
    excerpt: 'Detailed tenant rollover analysis, leasing assumptions, and capital expenditure planning for commercial property investments.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Commercial Acquisition Preview',
    features: [
      'Tenant-by-tenant lease analysis',
      'Renewal probability scenarios',
      'TI/LC and capital expenditure modeling',
      'Detailed debt and equity structures',
      'Sensitivity analysis dashboard'
    ],
    description: `
      <h2>Comprehensive Commercial Property Analysis</h2>
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
      <p>This model is designed for real estate investment firms, REITs, private equity groups, and asset managers focused on commercial property investments. It provides the analytical rigor needed for institutional-quality underwriting.</p>
    `,
    faq: [
      {
        question: "How many tenants can this model handle?",
        answer: "The standard version of the model supports up to 50 individual tenants. If you need to analyze properties with more tenants, please contact us for a customized version."
      },
      {
        question: "Can I model complex lease structures like percentage rent?",
        answer: "Yes, the model includes functionality for base rent, percentage rent, expense reimbursements (NNN, modified gross, etc.), and other common lease structures."
      },
      {
        question: "Does the model handle mixed-use properties?",
        answer: "The model can accommodate mixed-use properties with commercial components. You can designate different tenant types and apply appropriate assumptions to each. For more complex mixed-use properties, we recommend our dedicated Mixed-Use Acquisition Model."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'hospitality-development-model',
    slug: 'hospitality-development-model',
    title: 'Hospitality Development Model',
    excerpt: 'Ground-up development modeling for hotel and resort properties with ADR, occupancy, and departmental revenue/expense projections.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Development Preview',
    features: [
      'Hotel flag/brand assumptions',
      'ADR and occupancy ramp-up modeling',
      'Departmental revenue and expense tracking',
      'FF&E reserve and replacement scheduling',
      'Operator performance incentives'
    ],
    description: `
      <h2>Comprehensive Hospitality Development Model</h2>
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
      <p>This model is designed for hotel developers, investors, private equity groups, and hospitality companies involved in ground-up development or major repositioning of hotel and resort properties.</p>
    `,
    faq: [
      {
        question: "Can I model different hotel types and service levels?",
        answer: "Yes, the model is adaptable for various hospitality concepts including limited-service, select-service, full-service, extended stay, and luxury resort properties. The departmental structure adjusts based on the hotel type selected."
      },
      {
        question: "How does the model handle the ramp-up period for new hotels?",
        answer: "The model includes detailed monthly ramp-up projections for occupancy, ADR, and departmental performance during the stabilization period, typically spanning 24-36 months depending on property type and market."
      },
      {
        question: "Does the model account for FF&E reserves and replacement cycles?",
        answer: "Yes, the model includes comprehensive FF&E reserve modeling, including initial installation during development and ongoing replacement reserves throughout the holding period based on customizable replacement cycles for different asset categories."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'hospitality-acquisition-model',
    slug: 'hospitality-acquisition-model',
    title: 'Hospitality Acquisition Model',
    excerpt: 'Acquisition analysis for hotel and resort properties with RevPAR modeling, brand conversion scenarios, and renovation budgeting.',
    category: 'Private Equity',
    price: 4985,
    imagePlaceholder: 'Hospitality Acquisition Preview',
    features: [
      'Historical and projected RevPAR analysis',
      'Property improvement plan budgeting',
      'Brand conversion/flag change scenarios',
      'Management agreement modeling',
      'Seasonality and booking pattern analysis'
    ],
    description: `
      <h2>Comprehensive Hospitality Acquisition Model</h2>
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
      <p>This model is designed for hotel investors, private equity groups, family offices, and hospitality companies involved in the acquisition, repositioning, or refinancing of existing hotel and resort properties.</p>
    `,
    faq: [
      {
        question: "Can I model the impact of renovations on hotel performance?",
        answer: "Yes, the model includes functionality to project how capital improvements and renovations will impact ADR, occupancy, and departmental performance over time, including the temporary disruption during renovation periods."
      },
      {
        question: "Does the model account for different booking channels and their costs?",
        answer: "Absolutely. The model allows you to analyze revenue by booking channel (direct, OTA, group, wholesale, etc.) and account for the different commission structures and costs associated with each channel."
      },
      {
        question: "How does the model handle brand conversion scenarios?",
        answer: "The model includes specialized functionality for comparing the current operation to potential rebranding scenarios, including the upfront PIP costs, transitional performance changes, and long-term impact on ADR, occupancy, and NOI."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  
  // Public Equity Models
  {
    id: 'applovin-3-statement-model',
    slug: 'applovin-3-statement-model',
    title: 'AppLovin (APP) 3-Statement Model',
    excerpt: 'Comprehensive financial model for AppLovin Corporation with integrated income statement, balance sheet, and cash flow projections.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'AppLovin Model Preview',
    features: [
      'Detailed revenue breakdown by segment',
      'Historical data and forward projections',
      'Fully integrated 3-statement model',
      'Operating metrics and KPIs dashboard',
      'Sensitivity analysis on key drivers'
    ],
    description: `
      <h2>Comprehensive AppLovin (APP) Financial Model</h2>
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
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing AppLovin Corporation's financial performance and valuation.</p>
    `,
    faq: [
      {
        question: "How far back does the historical data go?",
        answer: "The model includes quarterly historical data going back to Q1 2021 when AppLovin became a public company, and annual historical data from 2018 forward, providing a comprehensive view of the company's performance over time."
      },
      {
        question: "How are the projections structured in the model?",
        answer: "The model includes quarterly projections for the next 8 quarters and annual projections for 5 years. You can adjust the key drivers and assumptions to create different scenarios based on your investment thesis."
      },
      {
        question: "Does the model account for AppLovin's acquisitions?",
        answer: "Yes, the model includes the impacts of major acquisitions and provides the flexibility to incorporate potential future M&A activity in your projections, including the associated effects on revenue, costs, and balance sheet items."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'nvidia-3-statement-model',
    slug: 'nvidia-3-statement-model',
    title: 'NVIDIA (NVDA) 3-Statement Model',
    excerpt: 'Integrated financial model for NVIDIA Corporation with segment analysis, growth projections, and valuation framework.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'NVIDIA Model Preview',
    features: [
      'Revenue modeling by business segment',
      'AI/GPU market growth projections',
      'R&D and capex investment modeling',
      'Competitor performance benchmarking',
      'Multiple valuation methodologies'
    ],
    description: `
      <h2>Comprehensive NVIDIA (NVDA) Financial Model</h2>
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
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing NVIDIA Corporation's financial performance and valuation.</p>
    `,
    faq: [
      {
        question: "How far back does the historical data go?",
        answer: "The model includes quarterly historical data going back to Q1 2018 and annual historical data from 2015 forward, providing a comprehensive view of NVIDIA's performance across different semiconductor and AI market cycles."
      },
      {
        question: "How does the model handle the rapidly evolving AI market?",
        answer: "The model includes multiple AI adoption scenarios that you can select or customize, each with different implications for Data Center revenue growth, margin evolution, and capital requirements, allowing you to model different AI market trajectories."
      },
      {
        question: "Does the model include competitor benchmarking?",
        answer: "Yes, the model includes comparative analysis with key competitors like AMD, Intel, and other semiconductor companies, allowing you to benchmark NVIDIA's growth rates, margins, and valuation multiples against its peers."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'tesla-3-statement-model',
    slug: 'tesla-3-statement-model',
    title: 'Tesla (TSLA) 3-Statement Model',
    excerpt: 'Detailed financial model for Tesla, Inc. with vehicle delivery forecasts, energy business projections, and manufacturing expansion analysis.',
    category: 'Public Equity',
    price: 4985,
    imagePlaceholder: 'Tesla Model Preview',
    features: [
      'Vehicle production and delivery forecasts',
      'Gross margin analysis by product line',
      'Energy generation and storage modeling',
      'Factory capacity and capital investments',
      'Cash flow and liquidity analysis'
    ],
    description: `
      <h2>Comprehensive Tesla (TSLA) Financial Model</h2>
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
      <p>This model is designed for equity research analysts, investment professionals, portfolio managers, and serious individual investors who need a sophisticated tool for analyzing Tesla's financial performance and valuation across its multiple business lines.</p>
    `,
    faq: [
      {
        question: "How does the model handle Tesla's vehicle mix evolution?",
        answer: "The model includes detailed forecasting for each vehicle model, allowing you to project the mix evolution as new models are introduced and existing models mature. You can adjust ASPs, production ramps, and regional sales mix for each vehicle type."
      },
      {
        question: "Does the model include Tesla's energy and services businesses?",
        answer: "Yes, the model provides dedicated sections for energy generation, energy storage, and services/other revenue streams. Each has its own growth drivers, margin assumptions, and contribution to overall company performance."
      },
      {
        question: "How does the model account for Tesla's factory expansion plans?",
        answer: "The model includes factory-by-factory capacity modeling, with the ability to add new production facilities, implement capacity expansions, and project the associated capital expenditures and production ramp timing."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'dcf-valuation-suite',
    slug: 'dcf-valuation-suite',
    title: 'DCF Valuation Suite',
    excerpt: 'Comprehensive discounted cash flow analysis for public companies with integrated financial statement projections.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'DCF Model Preview',
    features: [
      'Integrated 3-statement model with projections',
      'Multiple valuation methodologies (DCF, Multiples)',
      'Detailed WACC calculation',
      'Flexible scenario analysis',
      'Sensitivity tables and tornado charts'
    ],
    description: `
      <h2>Professional-Grade DCF Analysis</h2>
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
      <p>This model is designed for investment professionals, equity research analysts, corporate finance teams, and serious investors who need a comprehensive framework for valuing companies across industries.</p>
    `,
    faq: [
      {
        question: "How easy is it to incorporate historical financial data?",
        answer: "The model includes a structured input section where you can paste historical financial data. The model automatically calculates historical ratios and uses them as a reference for your projections."
      },
      {
        question: "Can I value companies in different industries?",
        answer: "Yes, the model is designed to be flexible across industries. It includes customizable projection methods for different business models and industry-specific metrics."
      },
      {
        question: "Does the model include industry-specific metrics?",
        answer: "The core model includes common metrics across industries. We also offer industry-specific add-ons for sectors like technology, healthcare, financial services, and consumer goods."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  },
  {
    id: 'portfolio-attribution-model',
    slug: 'portfolio-attribution-model',
    title: 'Portfolio Attribution Model',
    excerpt: 'Analyze performance drivers and attribution factors across investment positions.',
    category: 'Public Equity',
    price: 2985,
    imagePlaceholder: 'Portfolio Model Preview',
    features: [
      'Multi-factor attribution analysis',
      'Sector and style performance breakdown',
      'Risk analytics (beta, volatility, Sharpe ratio)',
      'Custom benchmark comparisons',
      'Interactive performance dashboards'
    ],
    description: `
      <h2>Sophisticated Performance Attribution</h2>
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
      <p>This model is designed for portfolio managers, investment analysts, wealth managers, and institutional investors who need a sophisticated tool for understanding the drivers of investment performance.</p>
    `,
    faq: [
      {
        question: "How many securities can this model analyze?",
        answer: "The standard version of the model supports up to 100 individual securities. If you need to analyze larger portfolios, please contact us for a customized version."
      },
      {
        question: "What time periods can be analyzed?",
        answer: "The model supports daily, weekly, monthly, quarterly, and annual data. You can analyze performance over any time period for which you have data available."
      },
      {
        question: "Can I import data from other sources?",
        answer: "Yes, the model includes a structured input section where you can paste data from other sources. We also offer add-ons for direct data feeds from major providers like Bloomberg, Refinitiv, and FactSet."
      },
      {
        question: "What support is included with the purchase?",
        answer: "Your purchase includes 30 days of email support to help with any questions about using the model. Extended support plans are available for purchase if needed."
      }
    ]
  }
];

// Function to find related models (same category but different model)
const getRelatedModels = (model) => {
  return MODELS.filter(p => 
    p.category === model.category && p.id !== model.id
  ).slice(0, 3);
};

export default function ModelDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  // Find the model based on the slug
  const model = MODELS.find(item => item.slug === slug);
  
  // If the page is still loading or model not found
  if (router.isFallback || !model) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-navy-700 rounded w-2/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-navy-700 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Get related models
  const relatedModels = getRelatedModels(model);
  
  // Structured data for rich search results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": model.title,
    "description": model.excerpt,
    "category": model.category,
    "offers": {
      "@type": "Offer",
      "price": model.price,
      "priceCurrency": "USD"
    }
  };

  return (
    <Layout>
      <SEO
        title={model.title}
        description={model.excerpt}
        structuredData={structuredData}
      />
      
      {/* Model Header */}
      <section className="bg-navy-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <Motion animation="fade" direction="right">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {model.category}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight mb-6 text-white">
                  {model.title}
                </h1>
                
                <p className="text-xl text-gray-200 mb-8">
                  {model.excerpt}
                </p>
                
                <div className="flex items-baseline mb-8">
                  <span className="text-3xl font-bold text-white">${model.price.toLocaleString()}</span>
                  <span className="ml-2 text-lg text-gray-300">USD</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <Button href="#" variant="accent" size="lg">
                    Purchase Now
                  </Button>
                  <Button href="#faq" variant="secondary" size="lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </Motion>
            
            <Motion animation="fade" direction="left">
              <div className="aspect-w-4 aspect-h-3 bg-gray-200 dark:bg-navy-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500">
                [{model.imagePlaceholder}]
              </div>
            </Motion>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Key Features
            </h2>
          </Motion>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {model.features.map((feature, index) => (
              <Motion key={index} animation="fade" direction="up" delay={index * 100} className="h-full">
                <Card className="h-full bg-white dark:bg-navy-800 p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </div>
                </Card>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* Model Description */}
      <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <Card className="bg-white dark:bg-navy-800 p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:text-navy-700 dark:prose-headings:text-white prose-a:text-teal-600 dark:prose-a:text-teal-400 prose-img:rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: model.description }} />
              </div>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Motion animation="fade" direction="up">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
          </Motion>
          
          <div className="space-y-6">
            {model.faq.map((item, index) => (
              <Motion key={index} animation="fade" direction="up" delay={index * 100}>
                <Card className="bg-white dark:bg-navy-800 p-6">
                  <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.answer}
                  </p>
                </Card>
              </Motion>
            ))}
          </div>
        </div>
      </section>
      
      {/* Related Models */}
      {relatedModels.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-navy-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Motion animation="fade" direction="up">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-8 text-center">
                Related Models
              </h2>
            </Motion>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedModels.map((related) => (
                <Motion key={related.id} animation="fade" direction="up" delay={200} className="h-full">
                  <Link href={`/models/${related.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-navy-800">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-navy-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                        [{related.imagePlaceholder}]
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-navy-700 dark:text-blue-300 rounded-full text-xs font-medium">
                            {related.category}
                          </span>
                          <span className="font-bold text-navy-700 dark:text-white">${related.price.toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-2">
                          {related.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {related.excerpt}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </Motion>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <Card className="bg-white dark:bg-navy-800 p-8">
              <h2 className="text-2xl font-bold text-navy-700 dark:text-white mb-4">
                Ready to elevate your investment analysis?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Purchase {model.title} today and start making better investment decisions.
              </p>
              <Button href="#" variant="accent" size="lg">
                Purchase for ${model.price.toLocaleString()}
              </Button>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                30-day satisfaction guarantee. Full support included.
              </p>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* Back to Models Button */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Motion animation="fade" direction="up">
            <Link href="/models">
              <Button variant="ghost" size="lg">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Models
              </Button>
            </Link>
          </Motion>
        </div>
      </section>
    </Layout>
  );
}

// This function gets called at build time
export async function getStaticPaths() {
  // In a real app, this would fetch data from an API or CMS
  const paths = MODELS.map((model) => ({
    params: { slug: model.slug },
  }));

  return { paths, fallback: true };
}

// This function gets called at build time
export async function getStaticProps({ params }) {
  // In a real app, this would fetch data from an API or CMS
  const model = MODELS.find((item) => item.slug === params.slug) || null;

  return {
    props: {
      model,
    },
    // Re-generate the page at most once per hour
    revalidate: 3600,
  };
}