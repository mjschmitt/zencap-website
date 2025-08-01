# PowerShell script to upload models to database
Write-Host "Starting model upload to database..." -ForegroundColor Green

# Read and execute the upload script
node upload-models-to-database.js

Write-Host "Model upload completed!" -ForegroundColor Green
Write-Host "You can now update the [slug].js file to use the database." -ForegroundColor Yellow 