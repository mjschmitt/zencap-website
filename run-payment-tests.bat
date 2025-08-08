@echo off
echo.
echo ================================
echo ZENITH CAPITAL PAYMENT TESTING
echo ================================
echo.

echo Starting comprehensive payment flow testing...
echo.

echo 1. Running core payment tests...
call npm run test:payment

echo.
echo 2. Running security tests...
call npm run test:payment:security

echo.
echo 3. Running webhook tests...
call npm run test:payment:webhooks

echo.
echo 4. Running end-to-end tests...
call npm run test:payment:e2e

echo.
echo ========================================
echo PAYMENT TESTING COMPLETE
echo ========================================
echo.
echo Check test-results/ directory for detailed reports
echo.

pause