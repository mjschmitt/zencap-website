# Update Q4 Tech Earnings with optimized formatting
$headers = @{
    "Content-Type" = "application/json"
}

# Read the optimized HTML content
$optimizedContent = Get-Content "q4-tech-optimized.html" -Raw

$body = @{
    slug = "q4-2024-tech-earnings-analysis"
    title = "Q4 2024 Tech Earnings: Key Takeaways for Investors"
    summary = "Analysis of Q4 earnings reports from major technology companies, highlighting growth trends, margin expansion, and forward guidance implications."
    content = $optimizedContent
    author = "Max Schmitt"
    status = "published"
    tags = "Public Equity, Technology, Earnings Analysis, Cloud Computing"
    cover_image_url = "/images/insights/q4-2024-tech-earnings-analysis.jpg"
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/insights" -Method PUT -Headers $headers -Body $body
    Write-Host "Successfully updated Q4 Tech Earnings insight!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($optimizedContent.Length) characters" -ForegroundColor Cyan
} catch {
    Write-Host "Error updating insight: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Yellow
} 