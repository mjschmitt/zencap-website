@echo off
echo.
echo ========================================
echo   STRIPE WEBHOOK LISTENER FOR ZENCAP
echo ========================================
echo.
echo Starting webhook listener for localhost:3001...
echo Keep this window open while testing payments!
echo.
echo Press Ctrl+C to stop the listener
echo.
echo ========================================
echo.

"stripe-cli\stripe.exe" listen --forward-to localhost:3001/api/stripe/webhook