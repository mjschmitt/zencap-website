# PowerShell script to insert Federal Reserve policy article
$content = Get-Content "fed-policy-q1-2025.html" -Raw

# Create the request body
$body = @{
    slug = "federal-reserve-policy-shifts-march-2025-implications"
    title = "Federal Reserve Policy Shifts: March 2025 Implications for Fixed Income and Equity Allocations"
    summary = "Comprehensive analysis of the Fed's March 2025 policy pivot, examining implications for duration risk, credit spreads, and sector rotation strategies in a transitioning rate environment."
    content = $content
    author = "Research Team"
    cover_image_url = "/images/insights/federal-reserve-policy-march-2025.jpg"
    status = "published"
    tags = "monetary policy, federal reserve, fixed income, duration risk, interest rates, market analysis"
} | ConvertTo-Json -Depth 10

# Make the API call
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Successfully created article: $($response.title)" -ForegroundColor Green
} catch {
    Write-Host "Error creating article: $($_.Exception.Message)" -ForegroundColor Red
} 