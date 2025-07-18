# PowerShell script to insert all Q1 2025 articles into the database

# Article 1: Federal Reserve Policy
Write-Host "Inserting Federal Reserve Policy article..." -ForegroundColor Blue
$content1 = Get-Content "fed-policy-q1-2025.html" -Raw
$body1 = @{
    slug = "federal-reserve-policy-shifts-march-2025-implications"
    title = "Federal Reserve Policy Shifts: March 2025 Implications for Fixed Income and Equity Allocations"
    summary = "Comprehensive analysis of the Fed's March 2025 policy pivot, examining implications for duration risk, credit spreads, and sector rotation strategies in a transitioning rate environment."
    content = $content1
    author = "Research Team"
    cover_image_url = "/images/insights/federal-reserve-policy-march-2025.jpg"
    status = "published"
    tags = "monetary policy, federal reserve, fixed income, duration risk, interest rates, market analysis"
} | ConvertTo-Json -Depth 10

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "✓ Created: $($response1.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Article 2: NVIDIA Earnings
Write-Host "Inserting NVIDIA Earnings article..." -ForegroundColor Blue
$content2 = Get-Content "nvidia-earnings-q1-2025.html" -Raw
$body2 = @{
    slug = "nvidia-q1-2025-earnings-deep-dive-ai-infrastructure"
    title = "NVIDIA Q1 2025 Earnings Deep Dive: AI Infrastructure Investment Thesis and Competitive Moat Analysis"
    summary = "Detailed analysis of NVIDIA's Q1 2025 results, examining Data Center revenue growth, Blackwell architecture advantages, and competitive positioning in the evolving AI infrastructure market."
    content = $content2
    author = "Technology Research Team"
    cover_image_url = "/images/insights/nvidia-q1-2025-earnings-analysis.jpg"
    status = "published"
    tags = "nvidia, earnings analysis, ai infrastructure, semiconductors, technology, data center"
} | ConvertTo-Json -Depth 10

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "✓ Created: $($response2.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Article 3: Commercial Real Estate
Write-Host "Inserting Commercial Real Estate article..." -ForegroundColor Blue
$content3 = Get-Content "commercial-real-estate-q1-2025.html" -Raw
$body3 = @{
    slug = "commercial-real-estate-recovery-selective-opportunities-2025"
    title = "Commercial Real Estate Recovery: Selective Opportunities in 2025"
    summary = "Strategic analysis of the bifurcated CRE market, identifying opportunities in industrial, data centers, and medical real estate while navigating office sector headwinds and regional market dynamics."
    content = $content3
    author = "Real Estate Investment Committee"
    cover_image_url = "/images/insights/commercial-real-estate-recovery-2025.jpg"
    status = "published"
    tags = "commercial real estate, industrial, data centers, office, real estate investment, market analysis"
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body3 -ContentType "application/json"
    Write-Host "✓ Created: $($response3.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Article 4: Cloud AI Infrastructure
Write-Host "Inserting Cloud AI Infrastructure article..." -ForegroundColor Blue
$content4 = Get-Content "cloud-ai-infrastructure-q1-2025.html" -Raw
$body4 = @{
    slug = "cloud-ai-infrastructure-wars-competitive-dynamics-2025"
    title = "Cloud AI Infrastructure Wars: Competitive Dynamics in 2025"
    summary = "Analysis of hyperscaler competition in AI infrastructure, examining Microsoft's OpenAI advantage, AWS market leadership, and emerging opportunities in the evolving cloud computing landscape."
    content = $content4
    author = "Cloud Infrastructure Research Lead"
    cover_image_url = "/images/insights/cloud-ai-infrastructure-wars-2025.jpg"
    status = "published"
    tags = "cloud computing, ai infrastructure, microsoft, amazon, google, technology, market share"
} | ConvertTo-Json -Depth 10

try {
    $response4 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body4 -ContentType "application/json"
    Write-Host "✓ Created: $($response4.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Article 5: Biotech Investment
Write-Host "Inserting Biotech Investment article..." -ForegroundColor Blue
$content5 = Get-Content "biotech-investment-q1-2025.html" -Raw
$body5 = @{
    slug = "biotech-investment-renaissance-opportunities-2025"
    title = "Biotech Investment Renaissance: Opportunities in 2025"
    summary = "Comprehensive analysis of the biotech sector transformation driven by AI-accelerated drug discovery, gene therapy commercialization, and precision medicine platforms with exceptional clinical success rates."
    content = $content5
    author = "Biotechnology Research Director"
    cover_image_url = "/images/insights/biotech-investment-opportunities-2025.jpg"
    status = "published"
    tags = "biotechnology, gene therapy, ai drug discovery, precision medicine, healthcare, clinical trials"
} | ConvertTo-Json -Depth 10

try {
    $response5 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body5 -ContentType "application/json"
    Write-Host "✓ Created: $($response5.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Article 6: Geopolitical Risk
Write-Host "Inserting Geopolitical Risk article..." -ForegroundColor Blue
$content6 = Get-Content "geopolitical-risks-q1-2025.html" -Raw
$body6 = @{
    slug = "geopolitical-risk-global-markets-2025-strategic-framework"
    title = "Geopolitical Risk in Global Markets: 2025 Strategic Framework"
    summary = "Strategic framework for navigating geopolitical tensions, supply chain vulnerabilities, and currency volatility, with tactical allocation strategies for managing correlation risks in a multipolar world."
    content = $content6
    author = "Global Macro Strategy Team"
    cover_image_url = "/images/insights/geopolitical-risk-global-markets-2025.jpg"
    status = "published"
    tags = "geopolitical risk, global markets, currency, supply chain, hedging strategies, market volatility"
} | ConvertTo-Json -Depth 10

try {
    $response6 = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body6 -ContentType "application/json"
    Write-Host "✓ Created: $($response6.title)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nQ1 2025 Articles insertion completed!" -ForegroundColor Cyan
Write-Host "All 6 articles have been processed." -ForegroundColor Cyan 