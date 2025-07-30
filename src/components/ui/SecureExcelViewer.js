/**
 * @fileoverview Secure Excel viewer component with XSS prevention and content sanitization
 * @module components/ui/SecureExcelViewer
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'isomorphic-dompurify';
import { sanitizeCellContent, validateFormula } from '../../middleware/excel-security.js';
import { createAuditLog } from '../../utils/audit.js';
import { useRouter } from 'next/router';

// Dynamically import the original Excel viewer
const ExcelJSViewer = dynamic(() => import('./ExcelJSViewer'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
  </div>
});

/**
 * Secure Excel Viewer Component
 * @param {Object} props - Component props
 */
const SecureExcelViewer = ({
  fileId,
  file,
  title = "Secure Model Viewer",
  height = "600px",
  onSuccess,
  onError,
  darkMode = false,
  showSearch = true,
  showPrintButton = true,
  enableKeyboardShortcuts = true,
  accessibilityMode = false,
  requireAuth = true,
  allowDownload = false,
  watermark = true,
  auditAccess = true
}) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [secureFileUrl, setSecureFileUrl] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const viewerRef = useRef(null);
  const router = useRouter();

  // Initialize secure session
  useEffect(() => {
    const initializeSecureSession = async () => {
      try {
        if (!fileId && !file) {
          throw new Error('No file specified');
        }

        // Check authorization if required
        if (requireAuth) {
          const authResponse = await fetch('/api/auth/verify', {
            credentials: 'include'
          });

          if (!authResponse.ok) {
            router.push('/login');
            return;
          }

          const authData = await authResponse.json();
          if (!authData.authenticated) {
            router.push('/login');
            return;
          }
        }

        // Request secure file access
        if (fileId) {
          const accessResponse = await fetch(`/api/excel/secure-access/${fileId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              purpose: 'view',
              auditAccess
            })
          });

          if (!accessResponse.ok) {
            const errorData = await accessResponse.json();
            throw new Error(errorData.error || 'Access denied');
          }

          const accessData = await accessResponse.json();
          setSecureFileUrl(accessData.secureUrl);
          setSessionToken(accessData.sessionToken);
        } else {
          setSecureFileUrl(file);
        }

        setIsAuthorized(true);
        setIsLoading(false);

      } catch (err) {
        console.error('Secure session initialization failed:', err);
        setError(err.message);
        setIsLoading(false);
        onError?.(err);
      }
    };

    initializeSecureSession();
  }, [fileId, file, requireAuth, router, onError, auditAccess]);

  // Security event handlers
  const handleSecurityViolation = useCallback(async (violation) => {
    console.error('Security violation detected:', violation);

    // Log security incident
    if (auditAccess) {
      try {
        await createAuditLog({
          event: 'EXCEL_SECURITY_VIOLATION',
          severity: 'warning',
          metadata: {
            fileId,
            violation: violation.type,
            details: violation.details
          }
        });
      } catch (err) {
        console.error('Failed to log security violation:', err);
      }
    }

    // Handle specific violations
    switch (violation.type) {
      case 'xss_attempt':
      case 'formula_injection':
        alert('Security violation detected. This incident has been logged.');
        break;
      case 'unauthorized_download':
        alert('Download is not permitted for this file.');
        break;
      default:
        alert('A security issue was detected. Please contact support.');
    }
  }, [fileId, auditAccess]);

  // Intercept and sanitize cell rendering
  const secureCellRenderer = useCallback((cellData) => {
    if (!cellData || !cellData.value) return cellData;

    // Sanitize cell content
    const sanitizedValue = sanitizeCellContent(cellData.value);

    // Validate formulas
    if (cellData.formula) {
      const formulaValidation = validateFormula(cellData.formula);
      
      if (!formulaValidation.valid) {
        handleSecurityViolation({
          type: 'formula_injection',
          details: formulaValidation.issues
        });

        // Replace with safe formula
        return {
          ...cellData,
          value: '#BLOCKED!',
          formula: formulaValidation.sanitized,
          style: {
            ...cellData.style,
            fill: { color: 'FF0000' },
            font: { color: 'FFFFFF' }
          }
        };
      }
    }

    // Additional HTML sanitization for display
    if (typeof sanitizedValue === 'string') {
      const purified = DOMPurify.sanitize(sanitizedValue, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });

      return {
        ...cellData,
        value: purified
      };
    }

    return {
      ...cellData,
      value: sanitizedValue
    };
  }, [handleSecurityViolation]);

  // Prevent right-click context menu
  const handleContextMenu = useCallback((e) => {
    if (!allowDownload) {
      e.preventDefault();
      handleSecurityViolation({
        type: 'context_menu_blocked',
        details: { timestamp: new Date() }
      });
    }
  }, [allowDownload, handleSecurityViolation]);

  // Prevent print if not allowed
  const handlePrint = useCallback((e) => {
    if (!showPrintButton) {
      e.preventDefault();
      handleSecurityViolation({
        type: 'print_blocked',
        details: { timestamp: new Date() }
      });
    }
  }, [showPrintButton, handleSecurityViolation]);

  // Monitor for dev tools (basic detection)
  useEffect(() => {
    if (!allowDownload) {
      const detectDevTools = () => {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
          handleSecurityViolation({
            type: 'devtools_detected',
            details: { timestamp: new Date() }
          });
        }
      };

      const interval = setInterval(detectDevTools, 1000);
      return () => clearInterval(interval);
    }
  }, [allowDownload, handleSecurityViolation]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing secure viewer...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">{error || 'You are not authorized to view this file.'}</p>
        </div>
      </div>
    );
  }

  // Render secure viewer
  return (
    <div 
      ref={viewerRef}
      className="secure-excel-viewer relative"
      onContextMenu={handleContextMenu}
    >
      {/* Watermark overlay */}
      {watermark && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="transform rotate-45 text-6xl font-bold text-gray-800">
              CONFIDENTIAL
            </div>
          </div>
        </div>
      )}

      {/* CSP meta tag for additional protection */}
      <meta 
        httpEquiv="Content-Security-Policy" 
        content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" 
      />

      {/* Excel viewer with security wrappers */}
      <div className="relative">
        <ExcelJSViewer
          file={secureFileUrl}
          title={title}
          height={height}
          onSuccess={(data) => {
            // Log successful access
            if (auditAccess) {
              createAuditLog({
                event: 'FILE_ACCESS',
                resourceType: 'excel_file',
                resourceId: fileId,
                action: 'view',
                result: 'success'
              });
            }
            onSuccess?.(data);
          }}
          onError={(err) => {
            // Log error access
            if (auditAccess) {
              createAuditLog({
                event: 'FILE_ACCESS',
                resourceType: 'excel_file',
                resourceId: fileId,
                action: 'view',
                result: 'failure',
                errorDetails: { message: err.message }
              });
            }
            onError?.(err);
          }}
          darkMode={darkMode}
          showSearch={showSearch}
          showPrintButton={showPrintButton}
          enableKeyboardShortcuts={enableKeyboardShortcuts}
          accessibilityMode={accessibilityMode}
          // Override cell renderer for security
          cellRenderer={secureCellRenderer}
          // Disable export functionality if download not allowed
          showExportButton={allowDownload}
          // Add session token for secure access
          headers={{
            'X-Session-Token': sessionToken
          }}
        />
      </div>

      {/* Security notice */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              This file contains confidential information. 
              {!allowDownload && ' Downloading or copying is prohibited.'}
              {auditAccess && ' All access is logged for security purposes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Print protection */}
      {!showPrintButton && (
        <style jsx global>{`
          @media print {
            .secure-excel-viewer {
              display: none !important;
            }
            body::before {
              content: "Printing is not allowed for this document.";
              display: block;
              text-align: center;
              font-size: 24px;
              margin-top: 50%;
            }
          }
        `}</style>
      )}

      {/* Copy protection */}
      {!allowDownload && (
        <style jsx global>{`
          .secure-excel-viewer {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          .secure-excel-viewer * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
        `}</style>
      )}
    </div>
  );
};

export default SecureExcelViewer;