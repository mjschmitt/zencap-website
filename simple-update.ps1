# Simple update script for Q4 Tech Earnings (concise version)
$content = Get-Content "q4-tech-concise.html" -Raw

$jsonBody = @{
    slug = "q4-2024-tech-earnings-analysis"
    title = "Q4 2024 Tech Earnings: Key Takeaways for Investors"
    summary = "Analysis of Q4 earnings reports from major technology companies, highlighting growth trends, margin expansion, and forward guidance implications."
    content = $content
    author = "Max Schmitt"
    status = "published"
    tags = "Public Equity, Technology, Earnings Analysis, Cloud Computing"
    cover_image_url = "/images/insights/q4-2024-tech-earnings-analysis.jpg"
}

$json = $jsonBody | ConvertTo-Json -Depth 5

Write-Host "Updating Q4 Tech Earnings insight (concise version)..." -ForegroundColor Yellow
Write-Host "Content length: $($content.Length) characters" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/insights" -Method PUT -ContentType "application/json" -Body $json
    Write-Host "SUCCESS: Updated Q4 Tech Earnings insight!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
} 