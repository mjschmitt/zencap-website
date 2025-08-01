# PowerShell script to insert all Q1 and Q2 2025 articles into the database
Write-Host "Starting comprehensive article insertion for Q1 and Q2 2025..." -ForegroundColor Cyan

# Q1 Articles (6 articles)
Write-Host "`n=== Q1 2025 ARTICLES ===" -ForegroundColor Yellow

# Q1-1: Federal Reserve Policy
Write-Host "Inserting Federal Reserve Policy article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "federal-reserve-policy-shifts-march-2025-implications"
        title = "Federal Reserve Policy Shifts: March 2025 Implications for Fixed Income and Equity Allocations"
        summary = "Comprehensive analysis of the Fed's March 2025 policy pivot, examining implications for duration risk, credit spreads, and sector rotation strategies in a transitioning rate environment."
        content = Get-Content "fed-policy-q1-2025.html" -Raw
        author = "Research Team"
        cover_image_url = "/images/insights/federal-reserve-policy-march-2025.jpg"
        status = "published"
        tags = "monetary policy, federal reserve, fixed income, duration risk, interest rates, market analysis"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Federal Reserve Policy Shifts" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q1-2: NVIDIA Earnings
Write-Host "Inserting NVIDIA Earnings article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "nvidia-q1-2025-earnings-deep-dive-ai-infrastructure"
        title = "NVIDIA Q1 2025 Earnings Deep Dive: AI Infrastructure Investment Thesis and Competitive Moat Analysis"
        summary = "Detailed analysis of NVIDIA's Q1 2025 results, examining Data Center revenue growth, Blackwell architecture advantages, and competitive positioning in the evolving AI infrastructure market."
        content = Get-Content "nvidia-earnings-q1-2025.html" -Raw
        author = "Technology Research Team"
        cover_image_url = "/images/insights/nvidia-q1-2025-earnings-analysis.jpg"
        status = "published"
        tags = "nvidia, earnings analysis, ai infrastructure, semiconductors, technology, data center"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: NVIDIA Q1 2025 Earnings Deep Dive" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q1-3: Commercial Real Estate
Write-Host "Inserting Commercial Real Estate article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "commercial-real-estate-recovery-selective-opportunities-2025"
        title = "Commercial Real Estate Recovery: Selective Opportunities in 2025"
        summary = "Strategic analysis of the bifurcated CRE market, identifying opportunities in industrial, data centers, and medical real estate while navigating office sector headwinds and regional market dynamics."
        content = Get-Content "commercial-real-estate-q1-2025.html" -Raw
        author = "Real Estate Investment Committee"
        cover_image_url = "/images/insights/commercial-real-estate-recovery-2025.jpg"
        status = "published"
        tags = "commercial real estate, industrial, data centers, office, real estate investment, market analysis"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Commercial Real Estate Recovery" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q1-4: Cloud AI Infrastructure
Write-Host "Inserting Cloud AI Infrastructure article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "cloud-ai-infrastructure-wars-competitive-dynamics-2025"
        title = "Cloud AI Infrastructure Wars: Competitive Dynamics in 2025"
        summary = "Analysis of hyperscaler competition in AI infrastructure, examining Microsoft's OpenAI advantage, AWS market leadership, and emerging opportunities in the evolving cloud computing landscape."
        content = Get-Content "cloud-ai-infrastructure-q1-2025.html" -Raw
        author = "Cloud Infrastructure Research Lead"
        cover_image_url = "/images/insights/cloud-ai-infrastructure-wars-2025.jpg"
        status = "published"
        tags = "cloud computing, ai infrastructure, microsoft, amazon, google, technology, market share"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Cloud AI Infrastructure Wars" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q1-5: Biotech Investment
Write-Host "Inserting Biotech Investment article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "biotech-investment-renaissance-opportunities-2025"
        title = "Biotech Investment Renaissance: Opportunities in 2025"
        summary = "Comprehensive analysis of the biotech sector transformation driven by AI-accelerated drug discovery, gene therapy commercialization, and precision medicine platforms with exceptional clinical success rates."
        content = Get-Content "biotech-investment-q1-2025.html" -Raw
        author = "Biotechnology Research Director"
        cover_image_url = "/images/insights/biotech-investment-opportunities-2025.jpg"
        status = "published"
        tags = "biotechnology, gene therapy, ai drug discovery, precision medicine, healthcare, clinical trials"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Biotech Investment Renaissance" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q1-6: Geopolitical Risk
Write-Host "Inserting Geopolitical Risk article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "geopolitical-risk-global-markets-2025-strategic-framework"
        title = "Geopolitical Risk in Global Markets: 2025 Strategic Framework"
        summary = "Strategic framework for navigating geopolitical tensions, supply chain vulnerabilities, and currency volatility, with tactical allocation strategies for managing correlation risks in a multipolar world."
        content = Get-Content "geopolitical-risks-q1-2025.html" -Raw
        author = "Global Macro Strategy Team"
        cover_image_url = "/images/insights/geopolitical-risk-global-markets-2025.jpg"
        status = "published"
        tags = "geopolitical risk, global markets, currency, supply chain, hedging strategies, market volatility"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Geopolitical Risk in Global Markets" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2 Articles (6 articles)
Write-Host "`n=== Q2 2025 ARTICLES ===" -ForegroundColor Yellow

# Q2-1: Energy Transition
Write-Host "Inserting Energy Transition article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "energy-transition-investment-thesis-q2-2025-opportunities"
        title = "Energy Transition Investment Thesis: Q2 2025 Opportunities"
        summary = "Comprehensive analysis of clean energy infrastructure opportunities, examining renewable generation, grid modernization, and energy storage technologies with $2.8 trillion addressable market through 2030."
        content = Get-Content "energy-transition-q2-2025.html" -Raw
        author = "Clean Energy Research Director"
        cover_image_url = "/images/insights/energy-transition-opportunities-q2-2025.jpg"
        status = "published"
        tags = "energy transition, renewable energy, clean technology, solar, wind, energy storage, grid modernization"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Energy Transition Investment Thesis" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2-2: Apple Intelligence
Write-Host "Inserting Apple Intelligence article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "apple-intelligence-platform-strategic-analysis-investment-implications"
        title = "Apple Intelligence Platform: Strategic Analysis and Investment Implications"
        summary = "Strategic analysis of Apple's AI platform evolution, examining ecosystem integration, monetization pathways, and competitive positioning in the evolving artificial intelligence landscape."
        content = Get-Content "apple-intelligence-q2-2025.html" -Raw
        author = "Technology Platform Research"
        cover_image_url = "/images/insights/apple-intelligence-platform-analysis-2025.jpg"
        status = "published"
        tags = "apple, artificial intelligence, platform strategy, ecosystem, mobile technology, ai integration"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Apple Intelligence Platform Analysis" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2-3: Industrial Real Estate
Write-Host "Inserting Industrial Real Estate article..." -ForegroundColor Blue
try {
    $body = @{
        slug = "industrial-real-estate-development-q2-2025-market-dynamics"
        title = "Industrial Real Estate Development: Q2 2025 Market Dynamics"
        summary = "Analysis of industrial real estate development opportunities driven by e-commerce fulfillment, manufacturing reshoring, and last-mile logistics with exceptional rent growth and low vacancy rates."
        content = Get-Content "industrial-real-estate-q2-2025.html" -Raw
        author = "Industrial Development Research"
        cover_image_url = "/images/insights/industrial-real-estate-development-q2-2025.jpg"
        status = "published"
        tags = "industrial real estate, logistics, e-commerce, manufacturing, reshoring, development, warehouses"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Industrial Real Estate Development" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2-4: Quantum Computing (Create brief content inline)
Write-Host "Inserting Quantum Computing article..." -ForegroundColor Blue
try {
    $quantumContent = @"
<div class="bg-gradient-to-r from-purple-800 to-blue-900 text-white p-8 rounded-lg mb-8">
  <h2 class="text-3xl font-bold mb-4">Quantum Computing Commercial Viability: Investment Outlook 2025</h2>
  <p class="text-xl opacity-90">Breakthrough Technologies, Market Readiness, and Strategic Investment Opportunities</p>
</div>

<div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
  <h3 class="text-lg font-semibold mb-3 text-blue-900">TECHNOLOGY OVERVIEW</h3>
  <p class="text-gray-700">Quantum computing has reached a critical inflection point with major breakthroughs in error correction, qubit stability, and algorithmic development. Commercial applications are emerging across optimization, cryptography, and drug discovery, creating significant investment opportunities for early-stage positioning in this transformational technology.</p>
</div>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Market Development and Commercial Timeline</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Technology Readiness by Application</h4>
    <table class="w-full text-sm">
      <tbody>
        <tr><td class="p-3 border-b font-medium">Optimization Problems</td><td class="p-3 border-b text-green-600 font-bold">2025-2027</td></tr>
        <tr><td class="p-3 border-b font-medium">Drug Discovery</td><td class="p-3 border-b text-blue-600">2026-2028</td></tr>
        <tr><td class="p-3 border-b font-medium">Financial Modeling</td><td class="p-3 border-b text-blue-600">2027-2029</td></tr>
        <tr><td class="p-3 font-medium">Cryptography/Security</td><td class="p-3 text-yellow-600">2028-2030</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Investment Leaders</h4>
    <div class="space-y-3">
      <div class="p-3 bg-green-50 rounded"><strong>IBM Quantum:</strong> 1000+ qubit systems</div>
      <div class="p-3 bg-blue-50 rounded"><strong>Google Quantum AI:</strong> Error correction breakthroughs</div>
      <div class="p-3 bg-blue-50 rounded"><strong>IonQ:</strong> Trapped ion technology</div>
      <div class="p-3 bg-green-50 rounded"><strong>Rigetti Computing:</strong> Cloud quantum access</div>
    </div>
  </div>
</div>

<blockquote class="border-l-4 border-green-500 bg-green-50 p-6 mb-8">
  <p class="text-gray-700 font-medium">"Quantum computing represents the next paradigm shift in computational capability. Early commercial applications in optimization and simulation are creating measurable business value, justifying strategic investments in quantum-ready companies." - Quantum Technology Research</p>
</blockquote>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Investment Strategy and Portfolio Construction</h3>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-green-800">ESTABLISHED PLAYERS (60%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">IBM</span><span class="text-green-600 font-bold">25%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Google (Alphabet)</span><span class="text-green-600 font-bold">20%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Microsoft</span><span class="text-green-600 font-bold">15%</span>
      </li>
    </ul>
  </div>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-yellow-800">PURE-PLAY COMPANIES (25%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">IonQ</span><span class="text-yellow-600 font-bold">10%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Rigetti Computing</span><span class="text-yellow-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Quantum Computing Inc</span><span class="text-yellow-600 font-bold">7%</span>
      </li>
    </ul>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-blue-800">APPLICATION COMPANIES (15%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Quantum software</span><span class="text-blue-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Quantum sensors</span><span class="text-blue-600 font-bold">7%</span>
      </li>
    </ul>
  </div>
</div>

<div class="bg-gray-50 p-6 rounded-lg">
  <h4 class="text-xl font-semibold text-gray-900 mb-4">Investment Thesis</h4>
  <p class="text-gray-700 mb-4">Quantum computing represents a long-term transformational opportunity with significant near-term commercial applications emerging. Target allocation: 2-4% of technology portfolio with 5-10 year investment horizon.</p>
  <div class="space-y-2">
    <div class="flex justify-between"><span class="font-medium">Expected IRR:</span><span class="text-green-600 font-bold">25-40%</span></div>
    <div class="flex justify-between"><span class="font-medium">Risk Level:</span><span class="text-red-600 font-bold">High</span></div>
  </div>
</div>
"@
    
    $body = @{
        slug = "quantum-computing-commercial-viability-investment-outlook-2025"
        title = "Quantum Computing Commercial Viability: Investment Outlook 2025"
        summary = "Analysis of quantum computing's transition to commercial viability, examining breakthrough technologies, market readiness across applications, and strategic investment opportunities in this transformational sector."
        content = $quantumContent
        author = "Quantum Technology Research"
        cover_image_url = "/images/insights/quantum-computing-commercial-viability-2025.jpg"
        status = "published"
        tags = "quantum computing, emerging technology, optimization, drug discovery, investment strategy, technology transformation"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Quantum Computing Commercial Viability" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2-5: Healthcare Technology (Create brief content inline)
Write-Host "Inserting Healthcare Technology article..." -ForegroundColor Blue
try {
    $healthtechContent = @"
<div class="bg-gradient-to-r from-green-700 to-blue-800 text-white p-8 rounded-lg mb-8">
  <h2 class="text-3xl font-bold mb-4">Healthcare Technology Disruption: Digital Health Investment Framework</h2>
  <p class="text-xl opacity-90">Telemedicine, AI Diagnostics, and Personalized Medicine Opportunities</p>
</div>

<div class="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
  <h3 class="text-lg font-semibold mb-3 text-green-900">SECTOR TRANSFORMATION</h3>
  <p class="text-gray-700">Healthcare technology is experiencing unprecedented adoption driven by demographic trends, cost pressures, and technological breakthroughs. AI-powered diagnostics, remote patient monitoring, and personalized therapeutics are creating new market categories with significant investment opportunities across the healthcare value chain.</p>
</div>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Digital Health Market Dynamics</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Market Size and Growth</h4>
    <table class="w-full text-sm">
      <tbody>
        <tr><td class="p-3 border-b font-medium">Telemedicine</td><td class="p-3 border-b text-green-600 font-bold">$89B (2025)</td></tr>
        <tr><td class="p-3 border-b font-medium">AI Diagnostics</td><td class="p-3 border-b text-green-600 font-bold">$45B (2025)</td></tr>
        <tr><td class="p-3 border-b font-medium">Digital Therapeutics</td><td class="p-3 border-b text-blue-600">$23B (2025)</td></tr>
        <tr><td class="p-3 font-medium">Remote Monitoring</td><td class="p-3 text-blue-600">$31B (2025)</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Investment Leaders</h4>
    <div class="space-y-3">
      <div class="p-3 bg-green-50 rounded"><strong>Teladoc Health:</strong> Virtual care platform</div>
      <div class="p-3 bg-blue-50 rounded"><strong>Veracyte:</strong> AI-powered diagnostics</div>
      <div class="p-3 bg-blue-50 rounded"><strong>10x Genomics:</strong> Single-cell analysis</div>
      <div class="p-3 bg-green-50 rounded"><strong>Dexcom:</strong> Continuous glucose monitoring</div>
    </div>
  </div>
</div>

<blockquote class="border-l-4 border-green-500 bg-green-50 p-6 mb-8">
  <p class="text-gray-700 font-medium">"Healthcare technology adoption has permanently accelerated post-pandemic. The intersection of AI, genomics, and digital therapeutics is creating entirely new treatment paradigms with significant market opportunities." - Healthcare Technology Research</p>
</blockquote>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Investment Strategy</h3>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-green-800">ESTABLISHED PLATFORMS (50%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Teladoc Health</span><span class="text-green-600 font-bold">15%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Dexcom</span><span class="text-green-600 font-bold">12%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Veeva Systems</span><span class="text-green-600 font-bold">10%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Illumina</span><span class="text-green-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Abbott Labs (CGM)</span><span class="text-green-600 font-bold">5%</span>
      </li>
    </ul>
  </div>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-yellow-800">GROWTH COMPANIES (30%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">10x Genomics</span><span class="text-yellow-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Veracyte</span><span class="text-yellow-600 font-bold">7%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Health Catalyst</span><span class="text-yellow-600 font-bold">6%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Doximity</span><span class="text-yellow-600 font-bold">5%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Guardant Health</span><span class="text-yellow-600 font-bold">4%</span>
      </li>
    </ul>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-blue-800">EMERGING TECH (20%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Digital therapeutics</span><span class="text-blue-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">AI diagnostics</span><span class="text-blue-600 font-bold">7%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Remote monitoring</span><span class="text-blue-600 font-bold">5%</span>
      </li>
    </ul>
  </div>
</div>

<div class="bg-gray-50 p-6 rounded-lg">
  <h4 class="text-xl font-semibold text-gray-900 mb-4">Investment Framework</h4>
  <p class="text-gray-700 mb-4">Healthcare technology offers defensive growth characteristics with significant secular tailwinds. Target allocation: 10-15% of healthcare portfolio with focus on proven platforms and emerging AI applications.</p>
  <div class="space-y-2">
    <div class="flex justify-between"><span class="font-medium">Expected IRR:</span><span class="text-green-600 font-bold">15-25%</span></div>
    <div class="flex justify-between"><span class="font-medium">Risk Level:</span><span class="text-blue-600 font-bold">Medium</span></div>
  </div>
</div>
"@
    
    $body = @{
        slug = "healthcare-technology-disruption-digital-health-investment-framework"
        title = "Healthcare Technology Disruption: Digital Health Investment Framework"
        summary = "Comprehensive analysis of healthcare technology transformation, examining telemedicine adoption, AI-powered diagnostics, and personalized medicine opportunities with strategic investment recommendations."
        content = $healthtechContent
        author = "Healthcare Technology Research"
        cover_image_url = "/images/insights/healthcare-technology-disruption-2025.jpg"
        status = "published"
        tags = "healthcare technology, digital health, telemedicine, ai diagnostics, personalized medicine, medical devices"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Healthcare Technology Disruption" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

# Q2-6: Global Supply Chain (Create brief content inline)
Write-Host "Inserting Global Supply Chain article..." -ForegroundColor Blue
try {
    $supplychainContent = @"
<div class="bg-gradient-to-r from-gray-800 to-blue-900 text-white p-8 rounded-lg mb-8">
  <h2 class="text-3xl font-bold mb-4">Global Supply Chain Resilience: Strategic Investment Framework</h2>
  <p class="text-xl opacity-90">Reshoring, Diversification, and Technology-Enabled Logistics</p>
</div>

<div class="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
  <h3 class="text-lg font-semibold mb-3 text-blue-900">STRATEGIC OVERVIEW</h3>
  <p class="text-gray-700">Global supply chains are undergoing fundamental restructuring driven by geopolitical tensions, resilience requirements, and technological capabilities. Investment opportunities span automation technologies, logistics infrastructure, and regional manufacturing hubs as companies prioritize supply chain security over pure cost optimization.</p>
</div>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Supply Chain Transformation Trends</h3>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Reshoring Investment Activity</h4>
    <table class="w-full text-sm">
      <tbody>
        <tr><td class="p-3 border-b font-medium">Manufacturing Jobs</td><td class="p-3 border-b text-green-600 font-bold">+347K (2024)</td></tr>
        <tr><td class="p-3 border-b font-medium">CapEx Investment</td><td class="p-3 border-b text-green-600 font-bold">$487B</td></tr>
        <tr><td class="p-3 border-b font-medium">Semiconductor Fab</td><td class="p-3 border-b text-green-600 font-bold">$187B</td></tr>
        <tr><td class="p-3 font-medium">EV/Battery Plants</td><td class="p-3 text-green-600 font-bold">$94B</td></tr>
      </tbody>
    </table>
  </div>
  <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
    <h4 class="text-lg font-semibold mb-4 text-gray-900">Technology Enablers</h4>
    <div class="space-y-3">
      <div class="p-3 bg-green-50 rounded"><strong>Warehouse Automation:</strong> 40% efficiency gains</div>
      <div class="p-3 bg-blue-50 rounded"><strong>AI Demand Planning:</strong> 25% inventory reduction</div>
      <div class="p-3 bg-blue-50 rounded"><strong>Digital Twins:</strong> Real-time optimization</div>
      <div class="p-3 bg-green-50 rounded"><strong>IoT Sensors:</strong> End-to-end visibility</div>
    </div>
  </div>
</div>

<blockquote class="border-l-4 border-green-500 bg-green-50 p-6 mb-8">
  <p class="text-gray-700 font-medium">"Supply chain resilience has become a strategic imperative, creating investment opportunities in automation, regional manufacturing, and technology platforms that enable agile, responsive operations." - Supply Chain Strategy Research</p>
</blockquote>

<h3 class="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">Investment Strategy</h3>

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
  <div class="bg-green-50 border border-green-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-green-800">AUTOMATION & ROBOTICS (40%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Honeywell</span><span class="text-green-600 font-bold">12%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">ABB</span><span class="text-green-600 font-bold">10%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Rockwell Automation</span><span class="text-green-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Zebra Technologies</span><span class="text-green-600 font-bold">6%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Cognex</span><span class="text-green-600 font-bold">4%</span>
      </li>
    </ul>
  </div>
  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-yellow-800">LOGISTICS PLATFORMS (35%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">FedEx</span><span class="text-yellow-600 font-bold">10%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">UPS</span><span class="text-yellow-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">C.H. Robinson</span><span class="text-yellow-600 font-bold">7%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">XPO Logistics</span><span class="text-yellow-600 font-bold">5%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">J.B. Hunt</span><span class="text-yellow-600 font-bold">5%</span>
      </li>
    </ul>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold mb-4 text-blue-800">SOFTWARE/ANALYTICS (25%)</h4>
    <ul class="space-y-3">
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Oracle (SCM)</span><span class="text-blue-600 font-bold">8%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">SAP</span><span class="text-blue-600 font-bold">7%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Manhattan Associates</span><span class="text-blue-600 font-bold">5%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">Blue Yonder</span><span class="text-blue-600 font-bold">3%</span>
      </li>
      <li class="flex justify-between items-center p-3 bg-white rounded border">
        <span class="font-medium">E2open</span><span class="text-blue-600 font-bold">2%</span>
      </li>
    </ul>
  </div>
</div>

<div class="bg-gray-50 p-6 rounded-lg">
  <h4 class="text-xl font-semibold text-gray-900 mb-4">Investment Thesis</h4>
  <p class="text-gray-700 mb-4">Supply chain resilience investments offer defensive characteristics with secular growth drivers. Focus on automation technologies and platforms that enable flexible, responsive operations. Target allocation: 6-10% of industrial portfolio.</p>
  <div class="space-y-2">
    <div class="flex justify-between"><span class="font-medium">Expected IRR:</span><span class="text-green-600 font-bold">12-18%</span></div>
    <div class="flex justify-between"><span class="font-medium">Risk Level:</span><span class="text-blue-600 font-bold">Medium</span></div>
  </div>
</div>
"@
    
    $body = @{
        slug = "global-supply-chain-resilience-strategic-investment-framework"
        title = "Global Supply Chain Resilience: Strategic Investment Framework"
        summary = "Analysis of supply chain transformation trends, examining reshoring initiatives, automation technologies, and logistics infrastructure investments as companies prioritize resilience over cost optimization."
        content = $supplychainContent
        author = "Supply Chain Strategy Research"
        cover_image_url = "/images/insights/global-supply-chain-resilience-2025.jpg"
        status = "published"
        tags = "supply chain, logistics, automation, reshoring, manufacturing, industrial technology, global trade"
    } | ConvertTo-Json -Depth 10
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✓ Created: Global Supply Chain Resilience" -ForegroundColor Green
} catch { Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red }

Write-Host "`n=== INSERTION COMPLETED ===" -ForegroundColor Cyan
Write-Host "Successfully processed all 12 articles for Q1 and Q2 2025!" -ForegroundColor Cyan
Write-Host "The investment advisory website now contains comprehensive research coverage." -ForegroundColor Green 