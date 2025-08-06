@echo off
echo.
echo ========================================
echo   STRIPE WEBHOOK LISTENER
echo ========================================
echo.

:: Check if port is provided as argument
if "%1"=="" (
    set PORT=3001
) else (
    set PORT=%1
)

echo Starting webhook listener on port %PORT%...
echo.
echo Keep this window open while testing payments!
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

:: Start Stripe CLI listener
stripe listen --forward-to localhost:%PORT%/api/stripe/webhook

pause